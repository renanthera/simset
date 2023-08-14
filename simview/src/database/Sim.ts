import prisma from '~/database/Database'

const headers = {
  'authorization': 'asdf',
  'content-type': 'application/json'
}

export async function createSim(content: string) {
  const sim = await prisma.sim.create({
    data: {
      status: 'initialized',
      content: content
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

export async function updateSim(id: number, status: string, content?: string,) {
  if (content) {
    return await prisma.sim.update({
      where: {
        id: id
      },
      data: {
        status: status,
        content: content
      }
    })
  }
  return await prisma.sim.update({
    where: {
      id: id
    },
    data: {
      status: status
    }
  })
}

export async function querySim(id: number) {
  return await prisma.sim.findUnique({
    where: {
      id: id
    }
  })
}

export async function allSims() {
  return await prisma.sim.findMany()
}
