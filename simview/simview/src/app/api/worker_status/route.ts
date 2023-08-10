import { NextResponse } from "next/server"
import { worker } from './../../../utils/CacheWorkerStatus.ts'

export async function POST( req: Request ) {
  const data = await req.text()
  worker.updateStatus(data)
  console.log('=========================================')
  console.log(data)
  console.log('=========================================')

  return new Response('hello world')
}
