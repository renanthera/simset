'use client'
import useSWR from 'swr';
import CompositeScatterChart from '~/components/CompositeScatterChart'
import WorkerStatus from '~/components/WorkerStatus'

import { fetchJSON } from '~/utils/FetchData'
import { ExtractChartDataFromJSON } from '~/utils/ReshapeData'


export default function Home() {
  const { data, error, isLoading } = useSWR('/api/worker/get/5', fetchJSON)

  if (isLoading) return (<div>Loading...</div>)
  if (error) return (<div>Failed to load</div>)
  if (data) {
    const sim_data = ExtractChartDataFromJSON(data)

    return (
      <>
        <WorkerStatus />
        <pre>
        {'\n\n\n\n'}
        </pre>
        <CompositeScatterChart data={sim_data} />
        {/* <PrettyPrintJson data={sim_data}/> */}
      </>
    )
  }
}
