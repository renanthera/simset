import ScatterChart from './../components/ScatterChart.tsx'
import {ReshapeData} from './../utils/ReshapeData.tsx'
import {GenerateNumbers} from './../utils/GenerateData.tsx'
import React, {useRef, createRef, useEffect} from 'react'

export default function CompositeScatterChart({data}) {
  const count = 2;
  let refs = useRef([]);

  if (refs.length !== count) {
    refs = Array(count).fill().map( (_, i) => refs[i] || {current: null});
  }

  useEffect( () => {
    console.log(refs)
    for (var i in refs) {
      if (refs[i].current) {
        setTimeout( () => {
          const d = GenerateNumbers( 100 );
          console.log(refs[i], d);
          refs[i].current.chart.series[0].setData(d);
        }, 2000)
      }
    }
  })

  return (
    <>
      {refs.map( (_, i) => (
        <ScatterChart data={data} key={i} refs={refs[i]} id={i}/>
      ))}
    </>
  )
}
