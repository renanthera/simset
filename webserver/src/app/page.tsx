'use client'
import Image from 'next/image';
import CompositeScatterChart, {generateNumbers} from './../components/CompositeScatterChart.tsx'
import { GenerateNumbers } from './../utils/GenerateData.tsx'

export default function Home() {
  let test = GenerateNumbers( 100 );

  return (
    <>
      <CompositeScatterChart data={test}/>
    </>
  )
}
