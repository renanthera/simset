import Script from 'next/script'

import {
  talentData
} from '~/utils/talentData'

export const MapTalentChart = (limit: number) => ({ combinations }) => {
  if (!combinations) return
  return (
    <div className="grid grid-cols-[repeat(auto-fill,_300px)] gap-4">
      {combinations
        .map((e, i: number) => {
          if (i < limit) return (
            <div key={e.name + 'div'}>
              {e.name}
              <TalentChart key={e.name + 'iframe'} combination={e} />
            </div>
          )
        })
      }
    </div>
  )
}

function TalentChart({ combination }) {
  const talent_string = combination.r_combination.split('=')[1]
  const url =
    'https://www.raidbots.com/simbot/render/talents/'
    + talent_string
    + '?width=300&mini=1&level=60&bgcolor=330000'
  return (
    <iframe className="h-[200px] overflow-y-hidden" src={url} />
  )
}

const compute_scalar = (input_bounds, view_dims, padding) => {
  const scalars = {
    x: (view_dims.x - 2 * padding.x) / (input_bounds.x.max - input_bounds.x.min),
    y: (view_dims.y - 2 * padding.y) / (input_bounds.y.max - input_bounds.y.min)
  }
  return Math.min(scalars.x, scalars.y)
}

const rescale_point = (pos, input_bounds, padding, scalar) => {
  return {
    x: (pos.x - input_bounds.x.min) * scalar + padding.x,
    y: (pos.y - input_bounds.y.min) * scalar + padding.y
  }
}

const drawConnectors = (context, nodes) => {
  const posX = nodes.map(e => e.posX)
  const posY = nodes.map(e => e.posY)
  const input_bounds = {
    x: {
      min: Math.min(...posX),
      max: Math.max(...posX)
    },
    y: {
      min: Math.min(...posY),
      max: Math.max(...posY)
    }
  }
  const view_dims = {
    x: context.canvas.clientWidth,
    y: context.canvas.clientHeight
  }
  const padding = { x: 10, y: 10 }
  const scalar = compute_scalar(input_bounds, view_dims, padding)
  console.log(input_bounds, scalar)

  context.lineWidth = 3
  nodes.map(
    parent => {
      const parent_pos = rescale_point(
        { x: parent.posX, y: parent.posY },
        input_bounds,
        padding,
        scalar
      )
      context.beginPath()
      context.strokeStyle = 'blue'
      context.moveTo(parent_pos.x, parent_pos.y)
      parent.next.map(
        (child_id: number) => {
          const full_child = nodes.find(q => q.id === child_id)
          const child_pos = rescale_point(
            { x: full_child.posX, y: full_child.posY },
            input_bounds,
            padding,
            scalar
          )
          // to fix this well, i would need to compute the direction and add the
          // appropriate amount for that direction, instead of just shifting
          // in a constant direction
          context.translate(0.5, 0.5)
          context.lineTo(child_pos.x, child_pos.y)
          context.stroke()
          context.translate(-0.5, -0.5)
          context.moveTo(parent_pos.x, parent_pos.y)
        }
      )
    }
  )
}

const compute_input_bounds = (nodes) => {
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

const generate_lines = (nodes, input_bounds, padding, scalar) => {
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

const generate_points = (nodes, input_bounds, padding, scalar) => {
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

const min_length = (lines) => {
  return lines.reduce(
    (min, current) => {
      const length = Math.sqrt((current.x2 - current.x1) ** 2 + (current.y2 - current.y1) ** 2)
      if (length < min) return length
      return min
    }, Infinity
  )
}

const TalentIcon = ({ spell, scalar }) => {
  // TODO: make pixel perfect by preventing scalar from getting non-integer
  // positions for drawing icons and shit, round dims to nearest int

  // make colors easier to adapt based on specific conditions
  const size = 'large'
  const offset = { x: 28, y: 28 }
  const dim = scalar * 56
  const margin = Math.max(dim / 8, 1)
  return (
    <a
      href={'https://www.wowhead.com/spell=' + spell.id}
      rel="noopener"
      target="_blank"
    >
      <rect
        x={spell.x - offset.x * scalar - margin / 2}
        y={spell.y - offset.x * scalar - margin / 2}
        width={dim + margin}
        height={dim + margin}
        fill="red"
      />
      <image
        href={'https://www.wowhead.com/images/wow/icons/' + size + '/' + spell.icon + '.jpg'}
        x={(spell.x) / scalar - offset.x}
        y={(spell.y) / scalar - offset.y}
        transform={'scale(' + scalar + ')'}
      />
    </a>
  )
}

interface TalentTreeConnectorProps {
  nodes: any
  width: number
  height: number
  padding: {
    x: number
    y: number
  }
}

export function TalentTreeConnectors({ nodes, width, height, padding = { x: 50, y: 50 } }: TalentTreeConnectorProps) {
  const view_dims = { x: width, y: height }
  const input_bounds = compute_input_bounds(nodes)
  const scalar = compute_scalar(input_bounds, view_dims, padding)
  const lines = generate_lines(nodes, input_bounds, padding, scalar)
  const points = generate_points(nodes, input_bounds, padding, scalar)
  const point_scalar = min_length(lines) / 3
  const line_scalar = point_scalar / 6
  const img_scalar = (point_scalar * 2 ** 0.5) / 56       // 56 is side length of large icon
  console.log(point_scalar)
  const whTooltips = {
    "colorlinks": true,
    "iconizelinks": true,
    'iconSize': 'large',
    "renamelinks": true,
    "hide": {
      "droppedby": true,
      "dropchance": true
    }
  }

  return (
    <>
      <Script src="https://wow.zamimg.com/js/tooltips.js" />
      <svg width={width} height={height}>
        {lines.map((e, i) => (<line key={i} stroke="blue" strokeWidth={line_scalar} {...e} />))}
        {points.map((e, i) => (<circle key={2 * i} fill="blue" r={line_scalar / 2} cx={e.cx} cy={e.cy} />))}
        {/* {points.map((e, i) => (<circle key={3 * i} fill="yellow" r={point_scalar} cx={e.cx} cy={e.cy} />))} */}
        {points.map((e, i) => (<TalentIcon spell={e} scalar={img_scalar} key={e.name} />))}
      </svg>
    </>
  )
}

const tmp = (spec_index) => {
  const input_bounds = {
    x: { min: 2400, max: 13800 },
    y: { min: 1500, max: 6900 }
  }
  const scalar = 0.054385964912280704
  const padding = { x: 10, y: 10 }
  const nodes = talentData[spec_index].classNodes
  const t = nodes.map(
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
      return children.map(e => ({ start: parent_pos, end: e }))
    }
  ).flat(Infinity)
  return t
}

export function TTSVG({ spec_index, ...rest }) {
  return (
    <>
      <svg viewBox="0 0 640 740" width={640} height={740}>
        {tmp(spec_index).map((e, i) => (<line key={i} stroke="blue" x1={e.start.x} y1={e.start.y} x2={e.end.x} y2={e.end.y} />))}
      </svg>
    </>
  )
}

export function TalentTree({ spec_index, ...rest }) {
  const n1 = talentData[spec_index].classNodes
  const n2 = [...talentData[spec_index].classNodes, ...talentData[spec_index].specNodes]

  return (
    <>
      <TalentTreeConnectors nodes={n1} width={"640"} height={740} />
      <TalentTreeConnectors nodes={n2} width={640} height={740} />
    </>
  )
}
