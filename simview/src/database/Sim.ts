import { Prisma } from '~/../generated/client'
import prisma from '~/database/Database'

import {
  FormData,
  parseSimParameters
} from '~/utils/CreateSim'

(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

export type Query = {
  id: string
  select: string
}

const headers = {
  'authorization': 'asdf',
  'content-type': 'application/json'
}

export async function createSet(formContent: FormData) {
  const parsedParameters = parseSimParameters(formContent)
  const set = await prisma.set.create({
    data: {
      parameters: JSON.stringify(parsedParameters)
    }
  })
  const body = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      id: set.id,
      parameters: parsedParameters
    })
  }
  return await fetch('http://localhost:3001/worker/create', body)
}

export async function createSim({ setID: id, count } : { setID: number, count: number }) {
  const setExists = await prisma.set.findUnique({
    where: {
      id: id
    }
  })
  // send just the simID back to requester if set exists
  // else return null
  if (setExists) {
    await prisma.sim.createMany({
      data: Array(count).fill({setID: id}),
      skipDuplicates: true
    })
    const sim = await prisma.sim.findMany({
      orderBy: [
        {
          id: 'desc'
        }
      ],
      take: count,
      where: {
        setID: id
      },
      select: {
        id: true
      }
    })
    return sim.map( e => e.id ).reverse()
  } else {
    return null
  }
}

export async function createResult(result: Array<Prisma.ResultCreateManyInput>) {
  const simExists = await prisma.sim.findUnique({
    where: {
      id: result[0].simID
    }
  })
  if (simExists) {
    return await prisma.result.createMany({
      data: result,
      skipDuplicates: true
    })
  } else {
    return null
  }
}

export async function updateSet(update: Prisma.SetUpdateInput) {
  const { id } : { id: number } = update
  return await prisma.set.update({
    where: {
      id: id
    },
    data: update
  })
}

export async function updateSim(update: Prisma.SimUpdateInput) {
  const { id } : { id: number } = update
  return await prisma.sim.update({
    where: {
      id: id
    },
    data: update
  })
}

export async function updateResult() {
  return
}

// TODO: Rethink this abomination to make it a bit more ergonomic.
export async function query(param: Query) {
  const { id, select } = param
  const query = {
    ...(
      id && id !== 'all' ?
        {
          where: {
            id: {
              in: id.split(',')
            }
          }
        }
        : {}
    ),
    // ...(
    //   select && select !== 'all' ?
    //     {
    //       select:
    //         select.split(',')
    //           .map(v => ({ [v]: true }))
    //           .reduce((k, v) => Object.assign(k, v))
    //     }
    //     : {}
    // ),
    include: {
      sims: {
        include: {
          results: true
        }
      }
    }
  }
  console.log(query)
  const body = await prisma.set.findMany(query)

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
