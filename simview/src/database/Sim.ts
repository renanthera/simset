import prisma from '~/database/Database'

import {
  FormData,
  parseSimParameters
} from '~/utils/CreateSim'

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const headers = {
  'authorization': 'asdf',
  'content-type': 'application/json'
}

export async function createSim(content: FormData) {
  const parsedParameters = parseSimParameters(content)
  const sim = await prisma.sim.create({
    data: {
      status: 'initialized',
      parameters: JSON.stringify(parsedParameters)
    }
  })
  const body = {
    id: sim.id,
    parameters: parsedParameters
  }
  const fetch_configuration = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: headers
  }
  const send_to_worker = await fetch(
    'http://localhost:3001/worker/create',
    fetch_configuration
  )

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
  id: Array<string>
  select: Array<string>
}

export async function querySims(param: Query) {
  const { id } = param
  const { select } = param

  let idQuery = {}
  let selectQuery = {}
  if (id) {
    if (id !== 'all') {
      idQuery = { where: { id: { in: id.split(',') } } }
    }
  }
  if (select) {
    if (select !== 'all') {
      selectQuery = {select: select.split(',').map(v => { return { [v]: true } }).reduce( (k, v) => Object.assign(k,v)) }
    }
  }
  const query = {
    ...idQuery,
    ...selectQuery
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
