import React, { memo } from 'react'

import {
  TalentString,
  View,
  LineSegment,
  Point,
  MappedNodes,
  Child
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

const filter_allocated = (nodes, allocated) => {
  return Object.values(allocated).reduce(
    (a, b) => {
      const c = Object.values(nodes).reduce(
        (d, e) => {
          return d ? d : !!e.entries.find(g => g.id === b.id)
        }, false)
      return c ? { ...a, [b.nodeId]: b } : a
    }, {})
}

interface TreeProps {
  nodes: MappedNodes
  view_dims: Point<number>
  padding: Point<number>
  allocated_talents: Record<number, Child>
  style_fns: any
}

type Connector = {
  key: string
  strokeWidth: number
  x: number
  x2: number
  y1: number
  y2: number
  endpointIDs: Array<number>
}

const Tree = ({ nodes, view_dims, padding, allocated_talents, style_fns }: TreeProps) => {
  const view = new View(nodes, view_dims, padding)
  const {
    points,
    line_scalar,
    point_scalar
  } = view

  const connectors = view.connector_elements(1)

  const {
    in_allocated,
    ends_in_allocated
  } = style_fns

  const connectorID = (e: LineSegment) => e.start.id.toString() + '-' + e.end.id.toString()
  const pointID = (e: Point<number>) => e.id.toString()

  const t = (e: Array<number>) => e.every((u: number) => u in allocated_talents) ? colors.bittersweet[600] : colors.woodsmoke[600]
  const q = (e: Connector) => {
    const {endpointIDs, key, ...props} = e
    return (<line key={key} stroke={t(endpointIDs)} {...props}/>)
  }

  return (
    <>
      {connectors.map(q)}
      {points.map(
        (e: Point<number>) => (
          <circle
            key={pointID(e) + '-2'}
            fill={colors.woodsmoke[600]}
            r={line_scalar / 2}
            cx={e.x} cy={e.y} />
        ))}
      {points.map(
        (e: Point<number>, i) => (
          <circle
            key={pointID(e) + '-3'}
            fill={in_allocated(e, allocated_talents) ? colors.bittersweet[600] : colors.woodsmoke[600]}
            r={point_scalar}
            cx={e.x}
            cy={e.y}
          />
        ))}
    </>
  )
}

/* {connectors.map(
*   (e: LineSegment) => (
*     <line
*       key={connectorID(e) + '-1'}
*       strokeWidth={line_scalar}
*       stroke={ends_in_allocated(e, allocated_talents) ? colors.bittersweet[600] : colors.woodsmoke[600]}
*       x1={e.start.x}
*       x2={e.end.x}
*       y1={e.start.y}
*       y2={e.end.y}
*     />))} */


const MemoTree = memo(Tree)

export function TalentTreeFromData({ width = 640, height = 740, padding = { x: 50, y: 50 }, talent_str }) {
  const {
    talent_data: {
      classNodes,
      specNodes
    },
    allocated_talents
  } = new TalentString({ talent_str: talent_str })

  const view_dims = { x: width / 2, y: height }
  const allocated_class = filter_allocated(classNodes, allocated_talents)
  const allocated_spec = filter_allocated(specNodes, allocated_talents)

  const style_fns = {
    in_allocated: (e: Point<number>, allocated_talents: MappedNodes) => e.id in allocated_talents,
    ends_in_allocated: (e: LineSegment, allocated_talents: MappedNodes) => style_fns.in_allocated(e.start, allocated_talents) && style_fns.in_allocated(e.end, allocated_talents)
  }

  return (
    <div className="flex flex-row">
      <TalentTree nodes={classNodes} view_dims={view_dims} padding={padding} allocated_talents={allocated_class} style_fns={style_fns} />
      <TalentTree nodes={specNodes} view_dims={view_dims} padding={padding} allocated_talents={allocated_spec} style_fns={style_fns} />
    </div>
  )
}

export function TalentTree({ nodes, view_dims, padding, allocated_talents, style_fns}) {
  return (
    <svg width={view_dims.x} height={view_dims.y}>
        <MemoTree nodes={nodes} view_dims={view_dims} padding={padding} allocated_talents={allocated_talents} style_fns={style_fns} />
    </svg>
  )
}

// 1. (talent string / allocation object) -> (chart marked with talent string)
// 2. (spec id) -> (clickable chart to mandate/ban talents) -> (list of mandated/banned talents)
