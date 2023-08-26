import {
  createSet,
  createSim,
  createResult,
  updateSet,
  updateSim,
  query
} from '~/database/Sim'

import {
  objectMap,
  pipe
} from '~/utils/SimFilters'

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const opts = {
  headers: {
    'content-type': 'application/json'
  }
}

// export async function GET(
//   req: Request,
//   { params : { method } }: { params: { method: Array<string> } }
// ) {
//   const { searchParams } = new URL(req.url)
//   const event = method[0]

//   switch (event) {
//     case 'query':
//       const q = {
//         id: searchParams.get('id'),
//         select: searchParams.get('select')
//       }
//       const body = await query(q)
//       return new Response(JSON.stringify(body), opts)
//   }
//   return new Response('No such API endpoint', { status: 404 })
// }

export async function POST(
  req: Request,
  { params: { method } }: { params: { method: Array<string> } }
) {
  const data = await req.json()
  const event = method[0]

  if (!data || !method) return new Response('Invalid Request', { status: 500 })

  // TODO: Return relevant Set/Sim/Result features [id] to caller
  // p/api/database
  switch (event) {
    case 'create':
      // p/api/database/create
      const createType = method[1]
      switch (createType) {
        case 'set':
          // p/api/database/create/set
          const set = await createSet(data)
          if (set) return new Response()
          else return new Response(null, { status: 500 })
        case 'sim':
          // p/api/database/create/sim
          const sim = await createSim(data)
          if (sim) return new Response(JSON.stringify(sim), opts)
          else return new Response(null, { status: 500 })
        case 'result':
          // p/api/database/create/result
          const result = await createResult(data)
          if (result) return new Response()
          else return new Response(null, { status: 500 })
      }
      break
    case 'update':
      // p/api/database/update
      const updateType = method[1]
      switch (updateType) {
        case 'set':
          // p/api/database/update/set
          const set = await updateSet(data)
          if (set) return new Response()
          else return new Response(null, { status: 500 })
        case 'sim':
          // p/api/database/update/sim
          const sim = await updateSim(data)
          if (sim) return new Response()
          else return new Response(null, { status: 500 })
        case 'result':
          return new Response('UNIMPLEMENTED, SORRY FOR BAD CODE')
      }
      break
    case 'query':
      const u = pipe(
        (await query(data))
          .map(e => {
            return objectMap(e, (k, v) => {
              try {
                return JSON.parse(v)
              } catch (e) {
                return v
              }
            })
          }),
        [
          JSON.stringify
        ]
      )
      return new Response(u, opts)
  }
  return new Response('No such API endpoint', { status: 404 })
}
