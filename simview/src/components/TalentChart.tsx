import React, { memo, useState } from 'react'

import {
  TalentString,
  Point,
  MappedNodes,
  TalentTreeStringView,
  TalentTreeSelectorView
} from '~/utils/talents'

import tailwindConfig from '~/../tailwind.config'
import resolveConfig from 'tailwindcss/resolveConfig'

const colors = resolveConfig(tailwindConfig).theme.colors

export const MapTalentChart = (limit: number) => ({ combinations }) => {
  if (!combinations) return

  const view_dims = { x: 300, y: 200 }
  const padding = { x: 10, y: 10 }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,_300px)] gap-4">
      {combinations
        .map((e, i: number) => {
          if (i < limit) {
            const talent_str = e.r_combination.split('=')[1]
            return (
              <div key={e.name + 'div'}>
                {e.name}
                <TalentTreeFromString key={e.name + '-tstring'} talent_str={talent_str} view_dims={view_dims} padding={padding} />
              </div>
            )
          }
        })
      }
    </div>
  )
}

export type TalentTreeFromStringProps = {
  view_dims: Point<number>
  padding: Point<number>
  talent_str: string
}

export function TalentTreeFromString({ view_dims, padding, talent_str }: TalentTreeFromStringProps) {
  type TreeProps = {
    nodes: MappedNodes,
    allocated: MappedNodes,
    view_dims: Point<number>,
    padding: Point<number>
  }
  const Tree = ({ nodes, allocated, view_dims, padding }: TreeProps) => {
    const {
      lines,
      small_circles,
      big_circles
    } = new TalentTreeStringView(nodes, view_dims, padding, allocated)

    return (
      <svg width={view_dims.x} height={view_dims.y}>
        {lines.map(e => <line key={e.id} {...e} />)}
        {small_circles.map(e => <circle key={e.id} {...e} />)}
        {big_circles.map(e => <circle key={e.id} {...e} />)}
      </svg>
    )
  }

  const MemoTree = memo(Tree)

  const {
    talent_data: {
      classNodes: class_nodes,
      specNodes: spec_nodes
    },
    allocated_data: {
      allocated_class,
      allocated_spec
    }
  } = new TalentString({ talent_str: talent_str })

  const split_view_dims = { x: view_dims.x / 2, y: view_dims.y }

  return (
    <>
      <div className="flex flex-row">
        <MemoTree nodes={class_nodes} allocated={allocated_class} view_dims={split_view_dims} padding={padding} />
        <MemoTree nodes={spec_nodes} allocated={allocated_spec} view_dims={split_view_dims} padding={padding} />
      </div>
    </>
  )
}

export type TalentTreeFilterProps = {
  view_dims: Point<number>
  padding: Point<number>
  spec_id: number
  updateFilter: (n: Record<number, number>) => Record<number, number>
}

// TODO: fix this shit, it's horrible and slow and doesn't work until u open it twice
// also data filtering is currently way too slow, needs a new way to do that...
export function TalentTreeFilter({ view_dims, padding, spec_id, updateFilter }: TalentTreeFilterProps) {
  type TreeProps = {
    nodes: MappedNodes
    view_dims: Point<number>
    padding: Point<number>
    updateFilter: (n: Record<number, number>) => Record<number, number>
  }
  const Tree = ({ nodes, view_dims, padding, updateFilter }: TreeProps) => {

    if (!updateFilter()) {
      updateFilter(Object.values(nodes).reduce((a, c) => ({ ...a, [c.id]: 0 }), {}))
    }

    const [coloring, setColoring] = useState(updateFilter())

    // add point keys to coloring ref if uninitialized
    if (!updateFilter().hasOwnProperty(Object.keys(nodes)[0])) {
      updateFilter(Object.values(nodes).reduce((a, c) => ({...a, [c.id]: 0}), {}))
    }

    const updateColoring = (n: Record<number, number>): void => {
      setColoring({ ...coloring, ...n })
      updateFilter(n)
      return
    }

    const {
      lines,
      small_circles,
      big_circles
    } = new TalentTreeSelectorView(nodes, view_dims, padding, coloring, updateColoring)


    return (
      <svg width={view_dims.x} height={view_dims.y}>
        {lines.map(e => <line key={e.id} {...e} />)}
        {small_circles.map(e => <circle key={e.id} {...e} />)}
        {big_circles.map(e => <circle key={e.id} {...e} />)}
      </svg>
    )
  }

  const {
    talent_data: {
      classNodes: class_nodes,
      specNodes: spec_nodes
    }
  } = new TalentString({ spec_id: spec_id })

  const split_view_dims: Point<number> = { x: view_dims.x / 2, y: view_dims.y, id: view_dims.id }

  return (
    <>
      <div className="flex flex-row">
        <Tree nodes={class_nodes} view_dims={split_view_dims} padding={padding} updateFilter={updateFilter} />
        <Tree nodes={spec_nodes} view_dims={split_view_dims} padding={padding} updateFilter={updateFilter} />
      </div>
    </>
  )
}

// 1. (talent string / allocation object) -> (chart marked with talent string)
// 2. (spec id) -> (clickable chart to mandate/ban talents) -> (list of mandated/banned talents)


/* const TalentIcon = ({ spell, scalar }) => {
*   const offset = { x: 28, y: 28 }
*   const dim = scalar * 56
*   const margin = Math.max(dim / 8, 1)
*   return (
*     <a
*       href={'https://www.wowhead.com/spell=' + spell.id}
*     >
*       <rect
*         x={Math.round(spell.x - offset.x * scalar) - Math.round(margin / 2)}
*         y={Math.round(spell.y - offset.x * scalar) - Math.round(margin / 2)}
*         width={Math.round(dim) + Math.round(margin)}
*         height={Math.round(dim) + Math.round(margin)}
*         fill="red"
*       />
*       <image
*         href={'https://www.wowhead.com/images/wow/icons/large/' + spell.icon + '.jpg'}
*         x={Math.round(spell.x - offset.x * scalar)}
*         y={Math.round(spell.y - offset.x * scalar)}
*         width={Math.round(dim)}
*         height={Math.round(dim)}
*       />
*     </a>
*   )
* } */
