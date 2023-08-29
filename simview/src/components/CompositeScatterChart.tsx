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
      {/* <div className="flex w-full h-full grid grid-rows-3 grid-cols-3"> */}
      <div className="flex flex-wrap h-full">
        <div className="flex flex-col w-1/3 justify-stretch">
          <div className="grow">asdf</div>
          <div className="grow bg-viking-200">zxc</div>
        </div>
        <div className="flex w-2/3 h-full">jkl</div>
        {/* <div className="w-full h-full" >
          <VegaLite spec={all_sims(data)} data={{ 'data': data }} signalListeners={signalListeners} actions={actions} />
        </div>
        <div className="row-span-2 w-full overflow-auto">
          <PrettyPrintJSON data={selected_sims_state !== null ? selected_sims_state : all_sims_state} />
        </div>
        <div className="w-full h-full" >
          <VegaLite spec={selected_sims(all_sims_state)} data={{ 'data': all_sims_state }} signalListeners={signalListeners_2} actions={actions} />
        </div> */}
      </div>
    </>
  )
}
