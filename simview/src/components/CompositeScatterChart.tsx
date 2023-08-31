'use client'
import {VegaLite} from 'react-vega'
import React, {useState} from 'react'

import {all_sims, selected_sims} from '~/utils/ChartSchemas'
import {PrettyPrintJSON} from '~/components/PrettyPrintJSON'
import {useResizeObserver} from '~/components/useResizeObserver'


export default function CompositeScatterChart({data}) {
  const actions = false

  const [all_sims_state, set_all_sims_state] = useState(null)
  const [selected_sims_state, set_selected_sims_state] = useState(null)
  const {ref, width, height} = useResizeObserver()

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

  const style_1 = {
    width: width,
    height: height,
  }

  return (
    <>
      <div className="grid grid-cols-[minmax(0,_1fr)_minmax(0,_2fr)] gap-4 h-[90%] max-h-[90%]">
        {/* <div className="gap-4 h-[90%] [grid-template:_minmax(0,_1fr)_minmax(0,_2fr)_/_repeat(8,_1fr)]"> */}
        <VegaLite className="w-full" spec={all_sims(data, style_1)} data={{'data': data}}
                  signalListeners={signalListeners} actions={actions}/>
        <div className="min-h-0 min-w-0 max-h-96 overflow-auto">
          <PrettyPrintJSON data={selected_sims_state !== null ? selected_sims_state : all_sims_state}/>
        </div>
        <VegaLite className="w-full" spec={selected_sims(all_sims_state)} data={{'data': all_sims_state}}
                  signalListeners={signalListeners_2} actions={actions}/>
      </div>
    </>
  )
}
