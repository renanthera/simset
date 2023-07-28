'use client'
import React, { useRef } from 'react'
import { render } from 'react-dom';
import Highcharts from 'highcharts'
import HighchartsBoost from "highcharts/modules/boost";
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'

if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts);
  HighchartsBoost(Highcharts);
}

export default function ScatterChart({data, refs, id}) {
  let chartOptions = {
    chart: {
      type: 'scatter',
      zoomType: 'xy',
      width: 600,
      height: 600
    },
    title: {
      text: 'id: ' + id
    },
    boost: {
      useGPUTranslations: true,
      usePreAllocated: true
    },
    series: [{data: data}],
    plotOptions: {
      scatter: {
        marker: {
          radius: 2
        }
      }
    },
    exporting: {
      scale: 3
    }
    /* xAxis: {
     *   categories: x,
     * },
     * series: [
     *   { data: y }
     * ], */
  }
  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        ref={refs}
      />
    </div>
  )
}
