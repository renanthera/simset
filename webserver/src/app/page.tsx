'use client'
import Image from 'next/image';
import { useState, useEffect } from 'react';
import CompositeScatterChart, {generateNumbers} from './../components/CompositeScatterChart.tsx'
import { GenerateNumbers } from './../utils/GenerateData.tsx'
import { getLocalData } from './../utils/ReshapeData.tsx'

const PrettyPrintJson = ({data}) => (<div><pre>{
    JSON.stringify(data, null, 2) }</pre></div>);
/*
 * async function Home.getInitialProps() {
 *   const localData = await getLocalData()
 *
 *   return {
 *     props: { localData }
 *   }
 * } */

/* Home.getInitialProps = async (ctx: NextPageContext) => {
 *   const data = await getLocalData()
 *   return { data: data }
 * } */


/* const PrettyPrintJson = React.memo(({data}) => (<div><pre>{
 *     JSON.stringify(data, null, 2) }</pre></div>)); */

export default function Home() {
  /* const { data, error } = useSWR('/api/profile-data', getLocalData) */
  const error = true

  if (error) return (<div>Failed to load</div>)
  /* if (!data) return (<div>Loading...</div>) */

  /* return (
   *   <>
   *     <PrettyPrintJson data={data}/>
   *     <CompositeScatterChart data={data}/>
   *   </>
   * ) */
}

/*
 * const fetcher = (...args) => fetch(...args).then((res) => res.json())
 *
 * function Profile() {
 *   const { data, error } = useSWR('/api/profile-data', fetcher)
 *
 *   if (error) return <div>Failed to load</div>
 *   if (!data) return <div>Loading...</div>
 *
 *   return (
 *     <div>
 *       <h1>{data.name}</h1>
 *       <p>{data.bio}</p>
 *     </div>
 *   )
 * } */
