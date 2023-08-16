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

type Select = {
  id: boolean
  createdAt?: boolean
  updatedAt?: boolean
  status?: boolean
  parameters?: boolean
  stdout?: boolean
  stderr?: boolean
  content?: boolean
}

export type Query = {
  id?: Array<number>
  select?: Select
}

export async function querySims(param) {
  const { id } = param
  const { select } = param
  let id_selector = {}
  if (id) {
    id_selector = { where: { id: { in: id } } }
  }
  const query = {...id_selector, select}
  const body = await prisma.sim.findMany(query)

  // reparse content as JSON
  for (var element of body) {
    element.content = JSON.parse(element.content)
  }
  return body
}
