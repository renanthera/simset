'use client'
import Image from 'next/image';
import CompositeScatterChart from './../components/CompositeScatterChart.tsx'

export default function Home() {
  const count = Math.round(Math.random() * 15000 + 15000);
  var d : {x: number; y: number} = (k) => {
    return {x: Math.random(), y: Math.random()}
  };
  const test = [...Array(count)].map(d)
  return (
    <>
      <CompositeScatterChart data={test}/>
    </>
  )
}
