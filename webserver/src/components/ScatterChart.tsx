'use client'
import React, { Component } from 'react'
import { render } from 'react-dom';
import Highcharts from 'highcharts'
import HighchartsBoost from "highcharts/modules/boost";
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'

if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts);
  HighchartsBoost(Highcharts);
}

export default function ScatterChart({data}) {
  let chartOptions = {
    chart: {
      type: 'scatter',
      zoomType: 'xy',
      width: 600,
      height: 600
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
      />
    </div>
  )
}
