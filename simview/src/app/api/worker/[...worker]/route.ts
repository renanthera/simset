import {
  createSim,
  updateSim,
} from '~/database/Sim'

export async function POST(
  request: Request,
  { params }: { params: { worker: Array<string> } }
) {
  const data = await request.json()
  const { content } = data
  const { id } = data
  const event = params.worker[0]
  let sim

  if (id && content) {
    switch (event) {
      case 'success':
        sim = await updateSim(data)
        break
      case 'create':
        sim = await createSim(content)
        break
      case 'processing':
        sim = await updateSim(data)
        break
      default:
        sim = await updateSim(data)
    }
  }
  return new Response('OK')
}
