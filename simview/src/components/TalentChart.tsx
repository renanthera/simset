import { memo } from 'react'

import {
  TalentString,
  View,
  LineSegment,
  DimsWithID
} from '~/utils/talents'

import tailwindConfig from '~/../tailwind.config'
import resolveConfig from 'tailwindcss/resolveConfig'

const colors = resolveConfig(tailwindConfig).theme.colors

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
  return (
    <TalentTreeFromData talent_str={talent_string} width={260} height={170} padding={{ x: 10, y: 10 }} />
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

const Tree = ({ nodes, view_dims, padding, allocated_talents }) => {
  const {
    connectors,
    points,
    line_scalar,
    point_scalar
  } = new View(nodes, view_dims, padding)

  const red = (a, c) => {
    return a ? a : c.id in allocated_talents
  }

  const two = (e, i) => {
    const exists = nodes[e.id].entries.reduce(red, false)
    return exists
  }

  return (
    <>
      {connectors.map(
        (e: LineSegment) => (
          <line
            key={e.id + '-1'}
            strokeWidth={line_scalar}
            stroke={false ? colors.bittersweet[600] : colors.woodsmoke[600]}
            x1={e.start.x}
            x2={e.end.x}
            y1={e.start.y}
            y2={e.end.y}
          />))}
      {points.map(
        (e: DimsWithID<number, string>) => (
          <circle
            key={e.id + '-2'}
            fill={colors.woodsmoke[600]}
            r={line_scalar / 2}
            cx={e.x} cy={e.y} />
        ))}
      {points.map(
        (e: DimsWithID<number, string>, i) => (
          <circle
            key={e.id + '-3'}
            fill={two(e) ? colors.bittersweet[600] : colors.woodsmoke[600]}
            r={point_scalar}
            cx={e.x}
            cy={e.y}
          />
        ))}
    </>
  )
}

const filter_allocated = (nodes, allocated) => {
  return Object.values(allocated).reduce(
    (a, b) => {
      const c = Object.values(nodes).reduce(
        (d, e) => {
          return d ? d : !!e.entries.find(g => g.id === b.id)
        }, false)
      return c ? { ...a, [b.id]: b } : a
    }, {})
}

const MemoTree = memo(Tree)

export function TalentTreeFromData({ width = 640, height = 740, padding = { x: 50, y: 50 }, talent_str }) {
  const {
    talent_data: {
      classNodes,
      specNodes
    },
    nodes,
    allocated_talents
  } = new TalentString({ talent_str: talent_str })

  const allocated_class = filter_allocated(classNodes, allocated_talents)
  const allocated_spec = filter_allocated(specNodes, allocated_talents)

  const view_dims = { x: width / 2, y: height }

  return (
    <div className="flex flex-row">
      <svg width={width / 2} height={height}>
        <MemoTree nodes={classNodes} view_dims={view_dims} padding={padding} allocated_talents={allocated_class} />
      </svg>
      <svg width={width / 2} height={height}>
        <MemoTree nodes={specNodes} view_dims={view_dims} padding={padding} allocated_talents={allocated_spec} />
      </svg>
    </div>
  )
}

// 1. (talent string / allocation object) -> (chart marked with talent string)
// 2. (spec id) -> (clickable chart to mandate/ban talents) -> (list of mandated/banned talents)
