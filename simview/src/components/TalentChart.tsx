import {
  talentData
} from '~/utils/talentData'

import {
  compute_scalar,
  rescale_point,
  compute_input_bounds,
  generate_lines,
  generate_points,
  min_length,

  TalentString,
  View,
} from '~/utils/talents'

interface TalentTreeConnectorProps {
  nodes: any
  width: number
  height: number
  padding: {
    x: number
    y: number
  }
}

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

const TalentIcon = ({ spell, scalar }) => {
  const offset = { x: 28, y: 28 }
  const dim = scalar * 56
  const margin = Math.max(dim / 8, 1)
  return (
      <a
        href={'https://www.wowhead.com/spell=' + spell.id}
      >
        <rect
          x={Math.round(spell.x - offset.x * scalar) - Math.round(margin / 2)}
          y={Math.round(spell.y - offset.x * scalar) - Math.round(margin / 2)}
          width={Math.round(dim) + Math.round(margin)}
          height={Math.round(dim) + Math.round(margin)}
          fill="red"
        />
        <image
          href={'https://www.wowhead.com/images/wow/icons/large/' + spell.icon + '.jpg'}
          x={Math.round(spell.x - offset.x * scalar)}
          y={Math.round(spell.y - offset.x * scalar)}
          width={Math.round(dim)}
          height={Math.round(dim)}
        />
      </a>
  )
}

function TalentTreeConnectors({ nodes, width, height, padding = { x: 50, y: 50 } }: TalentTreeConnectorProps) {
  const view_dims = { x: width, y: height }
  const input_bounds = compute_input_bounds(nodes)
  const scalar = compute_scalar(input_bounds, view_dims, padding)
  const lines = generate_lines(nodes, input_bounds, padding, scalar)
  const points = generate_points(nodes, input_bounds, padding, scalar)
  const point_scalar = min_length(lines) / 3
  const line_scalar = point_scalar / 6
  const img_scalar = (point_scalar * 2 ** 0.5) / 56       // 56 is side length of large icon

  return (
    <>
      <svg width={width} height={height}>
        {lines.map((e, i) => (<line key={i} stroke="blue" strokeWidth={line_scalar} {...e} />))}
        {points.map((e, i) => (<circle key={2 * i} fill="blue" r={line_scalar / 2} cx={e.cx} cy={e.cy} />))}
        {points.map((e, i) => (<circle key={3 * i} fill="yellow" r={point_scalar} cx={e.cx} cy={e.cy} />))}
        {/* {points.map((e, i) => (<TalentIcon spell={e} scalar={img_scalar} key={e.name} />))} */}
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
      {/* <TalentTreeConnectors nodes={n2} width={640} height={740} /> */}
    </>
  )
}

export function TalentTreeFromData({ width=640, height=740, padding={x:50,y:50}, ...rest}) {
  const { nodes, allocated_talents } = new TalentString(rest)

  const view_dims = { x: width, y: height }
  const tmp = new View(nodes, view_dims, padding)
  console.log(tmp)

  return  (
    <svg width={width} height={height}>
    </svg>
  )
}

// 1. (talent string / allocation object) -> (chart marked with talent string)
// 2. (spec id) -> (clickable chart to mandate/ban talents) -> (list of mandated/banned talents)
