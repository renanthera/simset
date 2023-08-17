import prisma from '~/database/Database'

import {
  FormData,
  createSimParameters
} from '~/utils/CreateSim'

const headers = {
  'authorization': 'asdf',
  'content-type': 'application/json'
}

export async function createSim(content: FormData) {
  // console.log(content)
  const sim = await prisma.sim.create({
    data: {
      status: 'initialized',
      parameters: JSON.stringify(content)
    }
  })
  const { parameters, combinations } = createSimParameters(content, sim.id)
  console.log(parameters)
  console.log(combinations)
  // const body = {
  //   id: sim.id,
  //   content: content
  // }
  // const fetch_configuration = {
  //   method: 'POST',
  //   body: JSON.stringify(body),
  //   headers: headers
  // }
  // const send_to_worker = await fetch('http://localhost:3001/worker/create', fetch_configuration)

  // return sim
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
  const query = {
    select: select,
    id: id ? { where: { id: { in: id } } } : undefined
  }
  const body = await prisma.sim.findMany(query)

  // reparse content and parameters as JSON
  for (var element of body) {
    if (element.content) {
      element.content = JSON.parse(element.content)
    }
    if (element.parameters) {
      element.parameters = JSON.parse(element.parameters)
    }
  }
  return body
}
