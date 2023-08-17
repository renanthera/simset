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

  switch (event) {
    case 'success':
      if (id && content) await updateSim(data)
      break
    case 'create':
      if (data) await createSim(data)
      break
    case 'processing':
      if (id && content) await updateSim(data)
      break
    default:
  }
  return new Response('OK')
}
