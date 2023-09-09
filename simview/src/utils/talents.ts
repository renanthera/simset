import {
  talentData
} from '~/utils/talentData'

import tailwindConfig from '~/../tailwind.config'
import resolveConfig from 'tailwindcss/resolveConfig'

const colors = resolveConfig(tailwindConfig).theme.colors

interface TalentStringConstructor {
  talent_str?: string
  allocated_talents?: Array<any>
  spec_id?: number
}

const range = (count: number) => {
  return Array.from({ length: count }, (_, i) => i)
}

const reduceNodes = (accumulator, current) => {
  const new_current = {
    ...current,
    // entries: current.entries.sort(
    //   (a, b) => {
    //     if (a.index < b.index) return 1
    //     if (a.index > b.index) return -1
    //     return 0
    //   }
    // )
  }
  return {
    ...accumulator,
    [current.id]: new_current
  }
}

const transformTalentData = (talentData) => {
  return talentData.reduce(
    (accumulator, current) => {
      const new_current = {
        ...current,
        classNodes: current.classNodes.reduce(reduceNodes, {}),
        specNodes: current.specNodes.reduce(reduceNodes, {})
      }
      return { ...accumulator, [current.specId]: new_current }
    }, {})
}

export class TalentString {
  // consts
  static base64_char: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  static loadout_serialization_version: number = 1
  static version_bits: number = 8
  static spec_bits: number = 16
  static tree_bits: number = 128
  static rank_bits: number = 6
  static choice_bits: number = 2
  static byte_size: number = 6

  static talentData = transformTalentData(talentData)

  // input
  talent_str: string
  allocated_talents: any
  allocated_data: any

  // traits
  version_id: number
  spec_id: number
  tree: number

  // internal
  head: number
  byte: number
  talent_data: any
  nodes: any
  node_order: Array<number>

  constructor({ talent_str, allocated_talents, spec_id }: TalentStringConstructor) {
    this.version_id = 0
    this.spec_id = 0
    this.tree = 0

    this.head = 0
    this.byte = 0
    this.node_order = [0]

    this.talent_str = talent_str || ''
    this.allocated_talents = allocated_talents
    this.spec_id = spec_id || 0

    if (talent_str) {
      this.allocated_talents = this.decode_talent_str()
      this.allocated_data = {
        allocated_class: this.filter_allocated(this.talent_data.classNodes),
        allocated_spec: this.filter_allocated(this.talent_data.specNodes)
      }
    }
    if (allocated_talents) this.talent_str = this.encode_talent_str()
    if (spec_id) this.talent_data = TalentString.talentData[spec_id]
  }

  filter_allocated(filter) {
    return Object.values(this.allocated_talents).reduce(
      (a, b) => {
        const c = Object.values(filter).reduce(
          (d, e) => {
            return d ? d : !!e.entries.find(g => g.id === b.id)
          }, false)
        return c ? { ...a, [b.nodeId]: b } : a
      }, {})
  }

  encode_talent_str() {
    return ''
  }

  decode_talent_str() {
    let data = {}

    this.byte = TalentString.base64_char.indexOf(this.talent_str[0])
    this.version_id = this.get_bits(TalentString.version_bits)
    this.spec_id = this.get_bits(TalentString.spec_bits)
    this.tree = this.get_bits(TalentString.tree_bits)
    this.get_talents()

    for (let node of this.node_order) {
      if (this.get_bits(1)) {
        let trait = this.nodes[node].entries[0]
        let rank = trait.maxRanks
        if (this.get_bits(1)) rank = this.get_bits(TalentString.rank_bits)
        if (this.get_bits(1)) {
          const index = this.get_bits(TalentString.choice_bits)
          trait = this.nodes[node].entries[index]
        }
        data[node] = { ...trait, ranks: rank, nodeId: node }
      }
    }
    return data
  }

  get_bits(bits: number) {
    let val = 0
    let bit
    for (let i of range(bits)) {
      bit = this.head % TalentString.byte_size
      this.head += 1
      val += (this.byte >> bit & 0b1) << Math.min(i, 63)
      if (bit === TalentString.byte_size - 1) {
        const byte_position = Math.floor(this.head / TalentString.byte_size)
        if (byte_position >= this.talent_str.length) {
          this.byte = 0
        } else {
          this.byte = TalentString.base64_char.indexOf(this.talent_str[byte_position])
        }
      }
    }
    return val
  }

  get_talents() {
    this.talent_data = TalentString.talentData[this.spec_id]
    this.nodes = { ...this.talent_data.classNodes, ...this.talent_data.specNodes }
    this.node_order = this.talent_data.fullNodeOrder
  }
}

export type Point<T> = {
  x: T
  y: T
  id: number
}

export type LineSegment = {
  start: Point<number>
  end: Point<number>
}

export type Bounds = {
  min: number
  max: number
}

export type Node = {
  id: number
  maxRanks: number
  name: string
  posX: number
  posY: number
  type: string
  entries: Array<Child>
  next: Array<number>
  prev: Array<number>
}

export type MappedNodes = Record<number, Node>

export type Child = {
  id: number
  definitionId: number
  icon: string
  index: number
  maxRanks: number
  name: string
  spellId: number
  type: string
}

export class View {
  nodes: MappedNodes
  view_dims: Point<number>
  padding: Point<number>

  input_dims: Point<Bounds>
  view_scalar: number
  connectors: Array<LineSegment>
  points: Array<Point<number>>
  point_scalar: number
  line_scalar: number
  img_scalar: number

  constructor(
    nodes: MappedNodes,
    view_dims: Point<number>,
    padding: Point<number>
  ) {
    this.nodes = nodes
    this.view_dims = view_dims
    this.padding = padding

    this.input_dims = this.compute_input_dims()
    this.view_scalar = this.compute_view_scalar()
    this.connectors = this.generate_connectors()
    this.points = this.generate_points()
    this.point_scalar = this.min_length() / 3
    this.line_scalar = this.point_scalar / 6
    this.img_scalar = this.point_scalar * 2 ** 0.5 / 56
  }

  rescale_point(node: Node): Point<number> {
    return {
      x: (node.posX - this.input_dims.x.min) * this.view_scalar + this.padding.x,
      y: (node.posY - this.input_dims.y.min) * this.view_scalar + this.padding.y,
      id: node.id
    }
  }

  compute_input_dims(): Point<Bounds> {
    const init: Point<Bounds> = {
      x: {
        min: Infinity,
        max: -Infinity
      },
      y: {
        min: Infinity,
        max: -Infinity
      },
      id: 0
    }
    return Object.values(this.nodes).reduce(
      (previous: Point<Bounds>, current: Node): Point<Bounds> => {
        return {
          x: {
            min: previous.x.min < current.posX ? previous.x.min : current.posX,
            max: previous.x.max > current.posX ? previous.x.max : current.posX
          },
          y: {
            min: previous.y.min < current.posY ? previous.y.min : current.posY,
            max: previous.y.max > current.posY ? previous.y.max : current.posY
          },
          id: current.id
        }
      }, init)
  }

  compute_view_scalar(): number {
    return Math.min(
      (this.view_dims.x - 2 * this.padding.x) / (this.input_dims.x.max - this.input_dims.x.min),
      (this.view_dims.y - 2 * this.padding.y) / (this.input_dims.y.max - this.input_dims.y.min)
    )
  }

  generate_connectors(): Array<LineSegment> {
    const findNode = (child_id: number) => (q: Node) => q.id === child_id
    const rescaleChildren = (parent_pos: Point<number>) => (child_id: number): LineSegment => {
      const child: Node | undefined = Object.values(this.nodes).find(findNode(child_id))
      if (child) {
        return {
          start: { x: parent_pos.x, y: parent_pos.y, id: parent_pos.id },
          end: { ...this.rescale_point(child) }
        }
      }
      return {
        start: { x: parent_pos.x, y: parent_pos.y, id: parent_pos.id },
        end: { x: parent_pos.x, y: parent_pos.y, id: parent_pos.id },
      }
    }
    return Object.values(this.nodes).map(
      (parent: Node) => {
        const parent_pos: Point<number> = { ...this.rescale_point(parent) }
        return parent.next.map(rescaleChildren(parent_pos))
      }
    ).reduce(
      (a, v) => {
        v.map(q => a.push(q))
        return a
      }, [])
  }

  generate_points(): Array<Point<number>> {
    return Object.values(this.nodes).map(
      (parent: Node) => {
        return { ...this.rescale_point(parent) }
      }
    )
  }

  min_length(): number {
    return this.connectors.reduce(
      (min: number, segment: LineSegment) => {
        const length = ((segment.start.x - segment.end.x) ** 2 + (segment.start.y - segment.end.y) ** 2) ** 0.5
        return min < length ? min : length
      }, Infinity)
  }

  connector_elements(id: number) {
    const connectorID = (e: LineSegment) => e.start.id.toString() + '-' + e.end.id.toString()
    return this.connectors.map(
      (e: LineSegment) => {
        return {
          key: connectorID(e) + '-' + id.toString(),
          strokeWidth: this.line_scalar,
          x1: e.start.x,
          x2: e.end.x,
          y1: e.start.y,
          y2: e.end.y,
          endpointIDs: [e.start.id, e.end.id]
        }
      }
    )
  }
}

export type Line = {
  id: string
  x1: number
  x2: number
  y1: number
  y2: number
  strokeWidth: number
  stroke: string
}

export type Circle = {
  id: string
  cx: number
  cy: number
  r: number
  fill: string
  onClick: (e: any) => void
  onContextMenu: (e: any) => void
}

export class TalentTreeStringView extends View {
  allocated: MappedNodes
  lines: Array<Line>
  small_circles: Array<Circle>
  big_circles: Array<Circle>

  constructor(
    nodes: MappedNodes,
    view_dims: Point<number>,
    padding: Point<number>,
    allocated: MappedNodes
  ) {
    super(nodes, view_dims, padding)
    this.allocated = allocated

    this.lines = this.line_elements(1)
    this.small_circles = this.circle_elements(2, this.line_scalar / 2)
    this.big_circles = this.circle_elements(3, this.point_scalar)
  }

  point_in_allocated(point: Point<number>) {
    return point.id in this.allocated
  }

  segment_in_allocated(segment: LineSegment) {
    return this.point_in_allocated(segment.start) && this.point_in_allocated(segment.end)
  }

  line_elements(id: number) {
    const connectorID = (e: LineSegment) => e.start.id.toString() + '-' + e.end.id.toString()
    return this.connectors.map(
      (e: LineSegment): Line => {
        return {
          id: connectorID(e) + '-' + id.toString(),
          x1: e.start.x,
          x2: e.end.x,
          y1: e.start.y,
          y2: e.end.y,
          strokeWidth: this.line_scalar,
          stroke: this.segment_in_allocated(e) ? colors.bittersweet[600] : colors.woodsmoke[600]
        }
      }
    )
  }

  circle_elements(id: number, radius: number) {
    const pointID = (e: Point<number>) => e.id.toString() + '-' + id.toString()
    return this.points.map(
      (e: Point<number>): Circle => {
        return {
          id: pointID(e),
          cx: e.x,
          cy: e.y,
          r: radius,
          fill: this.point_in_allocated(e) ? colors.bittersweet[600] : colors.woodsmoke[600]
        }
      }
    )
  }
}

export class TalentTreeSelectorView extends View {
  lines: Array<Line>
  small_circles: Array<Circle>
  big_circles: Array<Circle>
  update_coloring: (n: Record<number, number>) => void
  coloring: Record<number, number>

  constructor(
    nodes: MappedNodes,
    view_dims: Point<number>,
    padding: Point<number>,
    coloring: Record<number, boolean>,
    update_coloring: (n: Record<number, boolean>) => void
  ) {
    super(nodes, view_dims, padding)

    this.coloring = coloring
    this.update_coloring = update_coloring
    this.lines = this.line_elements(1)
    this.small_circles = this.circle_elements(2, this.line_scalar / 2)
    this.big_circles = this.circle_elements(3, this.point_scalar)
  }

  line_elements(id: number) {
    const connectorID = (e: LineSegment) => e.start.id.toString() + '-' + e.end.id.toString()
    const color = (e: LineSegment) => this.coloring[e.start.id] && this.coloring[e.end.id]
    return this.connectors.map(
      (e: LineSegment): Line => {
        return {
          id: connectorID(e) + '-' + id.toString(),
          x1: e.start.x,
          x2: e.end.x,
          y1: e.start.y,
          y2: e.end.y,
          strokeWidth: this.line_scalar,
          stroke: color(e) ? colors.woodsmoke[600] : colors.woodsmoke[600]
        }
      }
    )
  }

  circle_elements(id: number, radius: number) {
    const color_map: Record<number, string> = {
      [1]: colors.viking[600],
      [0]: colors.woodsmoke[600],
      [-1]: colors.bittersweet[600]
    }
    const color = (e: Point<number>): string => color_map[this.coloring[e.id]]

    const pointID = (e: Point<number>) => e.id.toString() + '-' + id.toString()
    const onClick = (e) => {
      const index = Number(e.target.id.split('-')[0])
      if (this.coloring[index] < 1) {
        this.update_coloring({ [index]: this.coloring[index] + 1 })
      }
    }
    const onRightClick = (e) => {
      e.preventDefault()
      const index = Number(e.target.id.split('-')[0])
      if (this.coloring[index] > -1) {
        this.update_coloring({ [index]: this.coloring[index] - 1 })
      }
    }
    return this.points.map(
      (e: Point<number>): Circle => {
        return {
          id: pointID(e),
          cx: e.x,
          cy: e.y,
          r: radius,
          // fill: this.coloring[e.id] ? colors.bittersweet[600] : colors.woodsmoke[600],
          fill: color(e) || colors.woodsmoke[100],
          onClick: onClick,
          onContextMenu: onRightClick
        }
      }
    )
  }
}
