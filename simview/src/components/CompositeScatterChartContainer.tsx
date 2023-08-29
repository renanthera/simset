'use client'
import useSWR from 'swr'
import { useRef, useEffect, useState } from 'react'

import {
  objectMapToArray,
  pipe
} from '~/utils/SimFilters'

import CompositeScatterChart from '~/components/CompositeScatterChart'
import { Selector } from '~/components/Selector'
import { fetcher } from '~/utils/FetchData'

function SetSelector({ callback, state }) {
  const { data, error } = useSWR(['/api/database/query', { select: { id: true, status: true } }], fetcher)
  if (error) return (<div>Failed to load</div>)
  if (data) {
    const processedData =
      data
        .sort((u, v) => {
          if (u.id < v.id) return -1
          if (u.id > v.id) return 1
          return 0
        })
        .map(e => [e.id, e.id + ' ' + e.status])
    return (
      <div>
        <div>Set Selection</div>
        <Selector callback={callback} items={processedData} state={state} />
      </div>
    )
  }
}

function SimSelector({ callback, set, state }) {
  const { data, error } = useSWR(set ? ['/api/database/query', { where: { id: set[0] }, include: { sims: true } }] : [null, null], fetcher)
  if (error) return (<div>Failed to load</div>)
  if (data) {
    const processedData =
      data[0]
        .sims
        .sort((u, v) => {
          if (u.id < v.id) return -1
          if (u.id > v.id) return 1
          return 0
        })
        .map(e => [e.id, e.id + ' ' + e.status])
    return (
      <div>
        <div>Sim Selection</div>
        <Selector callback={callback} items={processedData} state={state} />
      </div>
    )
  }
}

function FSelector({ callback, set, state }) {
  const { data, error } = useSWR(set ? ['/api/database/query', { where: { id: set[0] } }] : [null, null], fetcher)
  if (error) return (<div>Failed to load</div>)
  if (data) {
    const processedData =
      pipe(
        data[0]
          .f_combination,
        [
          objectMapToArray((k, v) => {
            return [v, k.reduce((a, c) => a + ' ' + c)]
          })
        ]
      )
    return (
      <div>
        <div>F-Combination Selection</div>
        <Selector callback={callback} items={processedData} state={state} />
      </div>
    )
  }
}

function CSC({ set, sim, f }) {
  const { data, error, isLoading } = useSWR(
    set && sim && f ?
      [
        '/api/database/query',
        {
          where: {
            id: set[0]
          },
          include: {
            sims: {
              where: {
                id: sim[0]
              },
              include: {
                results: true
              }
            }
          }
        }] : [null, null], fetcher)
  if (isLoading) return (<div>Loading...</div>)
  if (data) {
    const simData =
      data[0]
        .sims[0]
        .results
        .filter(e => e.name.split('-')[0] === 'f' + f[0])
        .map(e => ({
          ...e,
          x: Math.random(),
          y: e.mean,
          f_combination: data[0].f_combination[e.name.split('-')[0]],
          r_combination: data[0].r_combination[e.name.split('-')[1]]
        }))
    return (<CompositeScatterChart data={simData} />)
  }
}

export default function CompositeScatterChartContainer() {
  const [set, setSet] = useState(null)
  const [sim, setSim] = useState(null)
  const [f, setF] = useState(null)
  const setSelectCallback = (e) => {
    setSet(e)
    setSim(null)
    setF(null)
  }
  const simSelectCallback = (e) => setSim(e)
  const fSelectCallback = (e) => setF(e)

  return (
    <>
      <div className="flex flex-row w-1/3 justify-between">
        <SetSelector callback={setSelectCallback} state={set} />
        <SimSelector callback={simSelectCallback} set={set} state={sim} />
        <FSelector callback={fSelectCallback} set={set} state={f} />
      </div>
      <CSC set={set} sim={sim} f={f} />
    </>
  )
}
