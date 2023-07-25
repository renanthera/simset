'use client'
import React, { Component } from 'react'
import { render } from 'react-dom';
import Highcharts from 'highcharts'
import HighchartsBoost from "highcharts/modules/boost";
/* import HighchartsExporting from 'highcharts/modules/exporting' */
import HighchartsReact from 'highcharts-react-official'

if (typeof Highcharts === 'object') {
  /* HighchartsExporting(Highcharts) */
  HighchartsBoost(Highcharts)
}

/* interface DataElement {
 *   x: number[];
 *   y: number[];
 *   full: object[];
 * };
 *
 * const default_data: DataShape = {x: [1], y: [1], full: [[]]} */

export default function ScatterChart({data}) {
  /* const {x, y} = data */
  let chartOptions = {
    chart: {
      type: 'scatter',
      zoomType: 'xy',
      width: 800,
      height: 800
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
