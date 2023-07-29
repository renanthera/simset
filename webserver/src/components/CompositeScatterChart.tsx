'use client'
import ScatterChart from './../components/ScatterChart.tsx'
import {ReshapeData} from './../utils/ReshapeData.tsx'
import {GenerateNumbers} from './../utils/GenerateData.tsx'
import React, {useRef, useEffect} from 'react'

const views = ["view1", "view2"];

interface Props {
  data: any;
}
export default function CompositeScatterChart({data}: Props) {
  const refs = useRef([]);

  useEffect( () => {
    const timeoutId = setTimeout(() => {
      console.log(refs.current)
      for (const ref of refs.current) {
        const d = GenerateNumbers( 100 );
        console.log(ref, d);
        ref.chart.series[0].setData(d);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {views.map( (view, idx) => (
        <ScatterChart key={view} data={data} refs={el => refs.current[idx] = el} id={`composite-scatter-chart-${view}`}/>
      ))}
    </>
  )
}
