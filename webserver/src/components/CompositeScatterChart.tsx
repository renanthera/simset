import ScatterChart from './../components/ScatterChart.tsx'
import {ReshapeData} from './../utils/ReshapeData.tsx'
import React from 'react'

export default function CompositeScatterChart({data}) {
  return (
    <>
      <ScatterChart data={ReshapeData(data)}/>
      <ScatterChart data={data}/>
    </>
  )
}
