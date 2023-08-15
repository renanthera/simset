'use client'
import useSWR from 'swr'

import { fetchJSON} from '~/utils/FetchData'
import { ExtractChartDataFromJSON } from '~/utils/ReshapeData'

import CompositeScatterChart from '~/components/CompositeScatterChart'

export default function CompositeScatterChartContainer({ id }) {
  const path = '/api/worker/get/' + id

  const { data, error, isLoading } = useSWR(path, fetchJSON)

  if (isLoading) return (<div>Loading...</div>)
  if (error) return (<div>Failed to load</div>)
  if (data) {
    const sim_data = ExtractChartDataFromJSON(data)
    return (
      <CompositeScatterChart data={sim_data}/>
    )
  }

}
