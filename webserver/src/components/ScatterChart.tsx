'use client'
import React from 'react'
import Highcharts from 'highcharts'
import HighchartsBoost from "highcharts/modules/boost";
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'
import { ReshapeData_Options } from './../utils/ReshapeData.tsx'

if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts);
  HighchartsBoost(Highcharts);
}

export default function ScatterChart({data, refs, id}) {
  let chartOptions = {
    chart: {
      type: 'scatter',
      zoomType: 'xy',
      width: 400,
      height: 400
    },
    title: {
      text: 'id: ' + id
    },
    boost: {
      useGPUTranslations: true,
      usePreAllocated: true
    },
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
  chartOptions.series = [{data: ReshapeData_Options(data, chartOptions)}]
  console.log(chartOptions)
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
