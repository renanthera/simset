import prisma from '~/database/Database'

const headers = {
  'authorization': 'asdf',
  'content-type': 'application/json'
}

export async function createSim(content: string) {
  const sim = await prisma.sim.create({
    data: {
      status: 'initialized',
      parameters: content
    }
  })
  const body = {
    id: sim.id,
    content: content
  }
  const fetch_configuration = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: headers
  }
  const send_to_worker = await fetch('http://localhost:3001/worker/create', fetch_configuration)

  return sim
}

export async function updateSim(update_payload) {
  const { id } = update_payload
  return await prisma.sim.update({
    where: {
      id: id
    },
    data: update_payload
  })
}

export async function querySim(id: number) {
  try {
    return await prisma.sim.findUnique({
      where: {
        id: id
      }
    })
  }
  catch (err) {
    return { err: err }
  }
}

export async function allSims() {
  return await prisma.sim.findMany()
}
