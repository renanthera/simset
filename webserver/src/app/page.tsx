'use client'
import Image from 'next/image';
import Chart from './../components/Highcharts.tsx';
import Test from './../components/Test.tsx';

export default function Home() {
  const count = 50000
  /* const test = {x: [...Array(count)].map(x=>Math.random()), y: [...Array(count)].map(x=>Math.random()), full: [[]]} */
  const test = [...Array(count)].map(x=>[Math.random(),Math.random() ** 7 * 600])
  var arr = [];
  while(arr.length < 8){
      var r = Math.floor(Math.random() * 100) + 1;
      if(arr.indexOf(r) === -1) arr.push(r);
  }
  return (
    <>
      {/* <Chart/> */}
      <Test data={test}/>
    </>
  )
}
