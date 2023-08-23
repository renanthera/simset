import prisma from '~/database/Database'

import {
  FormData,
  parseSimParameters
} from '~/utils/CreateSim'

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

type Sim = {
  id?: number
  setID?: number
  status?: string
  stdout?: string
  stderr?: string
  content?: string
}

type Set = {
  id?: number
  createdAt?: string
  updatedAt?: string
  status?: string
  parameters?: string
  f_combination?: string
  r_combination?: string
}

const headers = {
  'authorization': 'asdf',
  'content-type': 'application/json'
}

export async function createSet(content: FormData) {
  const parsedParameters = parseSimParameters(content)
  const set = await prisma.set.create({
    data: {
      parameters: JSON.stringify(parsedParameters)
    }
  })
  const body = {
    id: set.id,
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

  return set
}

export async function updateSet({ set, sim}: { set: Set, sim: Sim }) {
  const { id } = set
  return await prisma.set.update({
    where: {
      id: id
    },
    data: set
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

  // console.log(id, select)

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
    if (element.f_combination) element.f_combination = JSON.parse(element.f_combination)
    if (element.r_combination) element.r_combination = JSON.parse(element.r_combination)
    if (element.parameters) {
      element.parameters = JSON.parse(element.parameters)
    }
  }
  return body
}
