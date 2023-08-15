import {
  createSim,
  updateSim,
  allSims,
  querySim
} from '~/database/Sim'

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

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

export async function GET(
  _: Request,
  { params }: { params: { worker: Array<string> } }
) {
  const event = params.worker[0]

  switch (event) {
    case 'getall':
      const sims = await allSims()
      for (var i = 0; i < sims.length; i++) {
        sims[i].content = JSON.parse(sims[i].content)
      }
      return new Response(JSON.stringify(sims), { headers: { "content-type": 'application/json' } })
      break
    case 'get':
      const id = params.worker[1]
      const sim = await querySim(id)
      sim.content = JSON.parse(sim.content)
      return new Response(JSON.stringify(sim), { headers: { 'content-type': 'application/json' } })
    default:
      return new Response('path not found', { status: 404 })
  }
}
