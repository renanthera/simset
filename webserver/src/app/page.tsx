'use client'
import Image from 'next/image';
import useSWR from 'swr';
import { useEffect } from 'react';
import CompositeScatterChart from './../components/CompositeScatterChart.tsx'
import { fetchJSON } from './../utils/FetchData.ts'
import { ExtractChartDataFromJSON } from './../utils/ReshapeData.tsx'

const PrettyPrintJson = ({data}) => (<div><pre>{
    JSON.stringify(data, null, 2) }</pre></div>)

export default function Home() {
  const { data, error, isLoading } = useSWR('/api/sample/1/output.json', fetchJSON)

  if (isLoading) return (<div>Loading...</div>)
  if (error) return (<div>Failed to load</div>)
  if (data) {
    const sim_data = ExtractChartDataFromJSON(data)

    return (
      <>
        <CompositeScatterChart data={sim_data}/>
        <PrettyPrintJson data={sim_data}/>
      </>
    )
  }
}
