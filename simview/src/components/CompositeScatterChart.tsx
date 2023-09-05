'use client'
import { VegaLite } from 'react-vega'
import { useState } from 'react'

import { all_sims, selected_sims } from '~/utils/ChartSchemas'
import { PrettyPrintJSON } from '~/components/PrettyPrintJSON'
import { MapTalentChart } from '~/components/TalentChart'

const filter = (min: number, max: number) => ({ y }: { y: number }) => (y >= min && y <= max)

type Brush_Bounds = {
  y: Array<number>
}

export default function CompositeScatterChart({ data }) {
  const [all_sims_state, set_all_sims_state] = useState(null)
  const [selected_sims_state, set_selected_sims_state] = useState(null)

  const signalListenersAllSims = {
    brush: (_, brush_bounds: Brush_Bounds) => {
      if (brush_bounds.y) {
        const min = brush_bounds.y[0]
        const max = brush_bounds.y[1]
        set_all_sims_state(
          data
            .filter(filter(min, max))
        )
        set_selected_sims_state(null)
        return
      }
      set_all_sims_state(null)
      set_selected_sims_state(null)
    }
  }

  const signalListenersSelectedSims = {
    brush: (_, brush_bounds: Brush_Bounds) => {
      if (brush_bounds.y) {
        const min = brush_bounds.y[0]
        const max = brush_bounds.y[1]
        set_selected_sims_state(
          data
            .filter(filter(min, max))
            .sort(({ y: a }, { y: b }) => {
              if (a < b) return 1
              if (a > b) return -1
              return 0
            })
        )
        return
      }
      set_selected_sims_state(null)
    }
  }

  // TODO: Better system for this.
  // Works ok at 1080p@100% zoom, but needs a more general solution.
  // Font sizes based on breakpoints and a slightly smaller version should be
  // workable.
  const height = 'h-[80vh]'

  // Hide the 'Actions' button at top right of charts, easy to turn off.
  const actions = false

  const TalentChart = MapTalentChart(12)

  return (
    <div className="grid grid-cols-[minmax(0,_1fr)_minmax(0,_2fr)] gap-4 h-[90%] max-h-[90%]">
      <div className={"flex flex-col " + height}>
        <VegaLite className="h-1/2" spec={all_sims(data)} data={{ 'data': data }} signalListeners={signalListenersAllSims} actions={actions} />
        <VegaLite className="h-1/2" spec={selected_sims(all_sims_state)} data={{ 'data': all_sims_state }} signalListeners={signalListenersSelectedSims} actions={actions} />
      </div>
      <div className={"min-h-0 min-w-0 overflow-auto " + height}>
        <TalentChart combinations={selected_sims_state} />
        <PrettyPrintJSON data={selected_sims_state ? selected_sims_state : all_sims_state} />
      </div>
    </div>
  )
}
