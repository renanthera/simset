'use client'
import useSWR from 'swr';
import CompositeScatterChart from './../components/CompositeScatterChart.tsx'
import WorkerStatus from './../components/WorkerStatus.tsx'

import { fetchJSON } from './../utils/FetchData.ts'
import { ExtractChartDataFromJSON } from './../utils/ReshapeData.tsx'


export default function Home() {
  const { data, error, isLoading } = useSWR('/api/sample/1/output.json', fetchJSON)

  if (isLoading) return (<div>Loading...</div>)
  if (error) return (<div>Failed to load</div>)
  if (data) {
    const sim_data = ExtractChartDataFromJSON(data)

    return (
      <>
        <CompositeScatterChart data={sim_data}/>
        <WorkerStatus/>
        {/* <PrettyPrintJson data={sim_data}/> */}
      </>
    )
  }
}
