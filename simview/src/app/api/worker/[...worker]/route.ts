import { worker } from '~/utils/CacheWorkerStatus'

export async function POST(
  request: Request,
  { params }: { params: { worker: Array<string> }}) {

  const data = await request.json()
  const { contents } = data

  console.log(params)
  switch (params.worker.join()) {
    case ('success'):
      // console.log(contents)
      break
    case ('status'):
      worker.updateStatus(contents)
      console.log('worker status updated: ', worker.status)
      break
    default:
      console.log('worker endpoint fell through')
  }

  return new Response('OK')
}
