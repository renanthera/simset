import {
  talentData
} from '~/utils/talentData'

export const compute_scalar = (input_bounds, view_dims, padding) => {
  return Math.min(
    (view_dims.x - 2 * padding.x) / (input_bounds.x.max - input_bounds.x.min),
    (view_dims.y - 2 * padding.y) / (input_bounds.y.max - input_bounds.y.min)
  )
}

export const rescale_point = (pos, input_bounds, padding, scalar) => {
  return {
    x: (pos.x - input_bounds.x.min) * scalar + padding.x,
    y: (pos.y - input_bounds.y.min) * scalar + padding.y
  }
}

export const compute_input_bounds = (nodes) => {
  const posX = nodes.map(e => e.posX)
  const posY = nodes.map(e => e.posY)
  return {
    x: {
      min: Math.min(...posX),
      max: Math.max(...posX)
    },
    y: {
      min: Math.min(...posY),
      max: Math.max(...posY)
    }
  }
}

export const generate_lines = (nodes, input_bounds, padding, scalar) => {
  return nodes.map(
    parent => {
      const parent_pos = rescale_point(
        { x: parent.posX, y: parent.posY },
        input_bounds,
        padding,
        scalar
      )
      const children = parent.next.map(
        (child_id: number) => {
          const full_child = nodes.find(q => q.id === child_id)
          return rescale_point(
            { x: full_child.posX, y: full_child.posY },
            input_bounds,
            padding,
            scalar
          )
        }
      )
      return children.map(e => ({ x1: parent_pos.x, y1: parent_pos.y, x2: e.x, y2: e.y }))
    }
  ).flat(Infinity)
}

export const generate_points = (nodes, input_bounds, padding, scalar) => {
  return nodes.map(
    p => {
      const point = rescale_point(
        { x: p.posX, y: p.posY },
        input_bounds,
        padding,
        scalar
      )
      return {
        cx: point.x,
        cy: point.y,
        icon: p.entries[0].icon,
        name: p.name,
        id: p.entries[0].spellId,
        x: point.x,
        y: point.y
      }
    }
  )
}

export const min_length = (lines) => {
  return lines.reduce(
    (min, current) => {
      const length = Math.sqrt((current.x2 - current.x1) ** 2 + (current.y2 - current.y1) ** 2)
      if (length < min) return length
      return min
    }, Infinity
  )
}

interface TalentStringConstructor {
  talent_str: string
  allocated_talents: Array<any>
}

const range = (count: number) => {
  return Array.from({ length: count }, (x, i) => i)
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
  allocated_talents

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

  constructor({ talent_str, allocated_talents }: TalentStringConstructor) {
    this.version_id = 0
    this.spec_id = 0
    this.tree = 0

    this.head = 0
    this.byte = 0
    this.node_order = [0]
    this.talents = []

    this.talent_str = talent_str
    this.allocated_talents = allocated_talents

    if (talent_str) this.allocated_talents = this.decode_talent_str()
    if (allocated_talents) this.talent_str = this.encode_talent_str()
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
        data[trait.id] = { ...trait, ranks: rank }
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

type Dims<T> = {
  x: T,
  y: T
}

type Start = Dims<number>
type End = Dims<number>
export type LineSegment = { start: Start, end: End, id: string }

type Bounds = {
  min: number,
  max: number
}

type Node = {
  id: number,
  maxRanks: number,
  name: string,
  posX: number,
  posY: number,
  type: string,
  entries: Array<Child>,
  next: Array<number>,
  prev: Array<number>
}

type Child = {
  id: number,
  definitionId: number,
  icon: string,
  index: number,
  maxRanks: number,
  name: string,
  spellId: number,
  type: string
}

type MappedNodes = Record<number, Node>

export type DimsWithID<T, U> = Dims<T> & { id: U}

export class View {
  nodes: MappedNodes
  view_dims: Dims<number>
  padding: Dims<number>

  input_dims: Dims<Bounds>
  view_scalar: number
  connectors: FlatArray<LineSegment, 1>
  points: Array<DimsWithID<number, string>>
  point_scalar: number
  line_scalar: number
  img_scalar: number

  constructor(nodes: MappedNodes, view_dims: Dims<number>, padding: Dims<number>) {
    this.nodes     = nodes
    this.view_dims = view_dims
    this.padding   = padding

    this.input_dims   = this.compute_input_dims()
    this.view_scalar  = this.compute_view_scalar()
    this.connectors   = this.generate_connectors()
    this.points       = this.generate_points()
    this.point_scalar = this.min_length() / 3
    this.line_scalar  = this.point_scalar / 6
    this.img_scalar   = this.point_scalar * 2 ** 0.5 / 56
  }

  rescale_point(pos: Dims<number>): Dims<number> {
    return {
      x: (pos.x - this.input_dims.x.min) * this.view_scalar + this.padding.x,
      y: (pos.y - this.input_dims.y.min) * this.view_scalar + this.padding.y,
    }
  }

  compute_input_dims(): Dims<Bounds> {
    const init: Dims<Bounds> = {
      x: {
        min: Infinity,
        max: -Infinity
      },
      y: {
        min: Infinity,
        max: -Infinity
      }
    }
    return Object.values(this.nodes).reduce(
      (previous: Dims<Bounds>, current: Node): Dims<Bounds> => {
        return {
          x: {
            min: previous.x.min < current.posX ? previous.x.min : current.posX,
            max: previous.x.max > current.posX ? previous.x.max : current.posX
          },
          y: {
            min: previous.y.min < current.posY ? previous.y.min : current.posY,
            max: previous.y.max > current.posY ? previous.y.max : current.posY
          },
        }
      }, init)
  }

  compute_view_scalar(): number {
    return Math.min(
      (this.view_dims.x - 2 * this.padding.x) / (this.input_dims.x.max - this.input_dims.x.min),
      (this.view_dims.y - 2 * this.padding.y) / (this.input_dims.y.max - this.input_dims.y.min)
    )
  }

  generate_connectors(): FlatArray<LineSegment, 1> {
    const findNode = (child_id: number) => (q: Node) => q.id === child_id
    const rescaleChildren = (parent_pos: DimsWithID<number, string>) => (child_id: number) => {
      const child = Object.values(this.nodes).find(findNode(child_id))
      if (child) {
        return {
          start: { x: parent_pos.x, y: parent_pos.y },
          end: { ...this.rescale_point({ x: child.posX, y: child.posY }) },
          id: parent_pos.id + '-' + child.id.toString()
        }
      }
    }
    return Object.values(this.nodes).map(
      (parent: Node) => {
        const parent_pos = { ...this.rescale_point({ x: parent.posX, y: parent.posY }), id: parent.id.toString() }
        return parent.next.map(rescaleChildren(parent_pos))
      }
    ).flat(1)
  }

  generate_points() {
    return Object.values(this.nodes).map(
      (parent: Node) => {
        return { ...this.rescale_point({ x: parent.posX, y: parent.posY }), id: parent.id.toString() }
      }
    )
  }

  min_length() {
    return this.connectors.reduce(
      (min: number, segment: LineSegment) => {
        const length = ((segment.start.x - segment.end.x)**2 + (segment.start.y - segment.end.y) ** 2) ** 0.5
        return min < length ? min : length
      }, Infinity)
  }
}
