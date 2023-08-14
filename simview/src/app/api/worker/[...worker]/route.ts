import {
  createSim,
  updateSim,
  allSims
} from '~/database/Sim'

export async function POST(
  request: Request,
  { params }: { params: { worker: Array<string> } }
) {

  const data = await request.json()
  const { content } = data
  const { id } = data
  const event = params.worker.join()
  let sim

  if (id && content) {
    switch (event) {
      case 'success':
        sim = await updateSim(id, event, content)
        break
      case 'create':
        sim = await createSim(content)
        break
      default:
        sim = await updateSim(id, event)
    }
  }
  console.log(sim.id, sim.createdAt, sim.updatedAt, sim.status)

  return new Response('OK')
}

export async function GET(
  request: Request,
  { params }: { params: { worker: Array<string> } }
) {
  return new Response({ data: await allSims() })
}
