'use client'
import useSWR from 'swr'
import { useState, useEffect } from 'react'

import { fetchJSON } from '~/utils/FetchData'
import { ExtractChartDataFromJSON } from '~/utils/ReshapeData'
import CompositeScatterChart from '~/components/CompositeScatterChart'

const fetcher = (...args) => fetch(...args).then(res => res.json())

function Selector({ updateCallback, initialID }) {
  const path = '/api/database/search?id=all&select=id,status,createdAt,updatedAt'
  const { data, error, isLoading } = useSWR(path, fetcher)
  const [selection, setSelection] = useState(initialID)

  const updateSelection = (e) => {
    updateCallback(e.target.value)
    setSelection(e.target.value)
  }

  useEffect(() => {
    if (data) {
      updateCallback(data[0].id)
      setSelection(data[0].id)
    }
  }, [data])

  if (data) {
    return (
      <select value={selection} className="bg-woodsmoke-950 text-woodsmoke-300" onChange={updateSelection}>
        {data.map(({ id, status }) => <option value={id} key={id}>{id}, {status}</option>)}
      </select>
    )
  }
  return (<></>)
}

export default function CompositeScatterChartContainer() {
  const [id, setID] = useState(null)
  const updateSelection = (e) => { setID(e) }

  const path = '/api/database/search?id=' + id + '&select=id,content'
  const { data, error, isLoading } = useSWR(id ? path : null, fetchJSON)

  if (id) {
    if (isLoading) return (
      <>
        <Selector updateCallback={updateSelection} initialID={id} />
        <div>Loading...</div>
      </>
    )
    if (error) return (
      <>
        <Selector updateCallback={updateSelection} initialID={id} />
        <div>Failed to load</div>
      </>
    )
    if (data) {
      const sim_data = data[0].content.f1.map(e => {
        return { ...e, x: Math.random(), y: e.mean }
      })
      console.log(sim_data)
      return (
        <>
          <Selector updateCallback={updateSelection} initialID={id} />
          <CompositeScatterChart data={sim_data} />
        </>
      )
    }
    return (
      <>
        <Selector updateCallback={updateSelection} initialID={id} />
      </>
    )
  }
  return (<Selector updateCallback={updateSelection} />)
}
