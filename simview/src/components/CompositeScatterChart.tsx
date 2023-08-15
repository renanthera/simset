'use client'
import { VegaLite } from 'react-vega'
import React, { useState } from 'react'

import {
  all_sims,
  selected_sims
} from '~/utils/ChartSchemas'
import { PrettyPrintJSON } from '~/components/PrettyPrintJSON'

export default function CompositeScatterChart({ data }) {
  const actions = false

  const [all_sims_state, set_all_sims_state] = useState(null)
  const [selected_sims_state, set_selected_sims_state] = useState(null)

  const signalListeners = {
    brush: (...args) => {
      if (args[1].y) {
        console.log("k")
        const min = args[1].y[0]
        const max = args[1].y[1]
        set_all_sims_state(data.filter((e) => e.y >= min && e.y <= max))
        set_selected_sims_state(null)
        return
      }
      set_all_sims_state(null)
      set_selected_sims_state(null)
    }
  }

  const signalListeners_2 = {
    brush: (...args) => {
      if (args[1].y) {
        console.log("s")
        const min = args[1].y[0]
        const max = args[1].y[1]
        set_selected_sims_state(data.filter((e) => e.y >= min && e.y <= max))
        return
      }
      set_selected_sims_state(null)
    }
  }

  return (
    <>
      <div className="grid grid-rows-3 grid-cols-3">
        <div>
          <VegaLite spec={all_sims(data)} data={{ 'data': data }} signalListeners={signalListeners} actions={actions} className="w-full h-[33vh]" />
        </div>
        <div className="row-span-3 col-span-2 h-screen" style={{ overflow: 'auto' }}>
          <PrettyPrintJSON data={selected_sims_state !== null ? selected_sims_state : all_sims_state} />
        </div>
        <div>
          <VegaLite spec={selected_sims(all_sims_state)} data={{ 'data': all_sims_state }} signalListeners={signalListeners_2} actions={actions} className="w-full h-[33vh]" />
        </div>
      </div>
      <PrettyPrintJSON data={selected_sims(all_sims_state)} />
    </>
  )
}
