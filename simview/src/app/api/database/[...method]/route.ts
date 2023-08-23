import {
  createSet,
  updateSet,
  querySet
} from '~/database/Sim'

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const opts = {
  headers: {
    'content-type': 'application/json'
  }
}

export async function GET(
  req: Request,
  { params }: { params: { method: Array<string> } }
) {
  const { searchParams } = new URL(req.url)
  const event = params.method[0]

  switch (event) {
    case 'query':
      const query = {
        id: searchParams.get('id'),
        select: searchParams.get('select')
      }
      const body = await querySet(query)
      return new Response(
        JSON.stringify(body),
        opts
      )
      break
    default:
      return new Response('No such API endpoint', { status: 404 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { method: Array<string> } }
) {
  const data = await req.json()
  const event = params.method[0]

  if (!data) return new Response('Invalid Request', { status: 500 })

  switch (event) {
    case 'create':
      const set = await createSet(data)
      if (set) return new Response()
      else return new Response(null, { status: 500 })
      break
    case 'update':
      const set = await updateSet(data)
      if (set) return new Response()
      else return new Response(null, { status: 500 })
      break
    default:
      return new Response('No such API endpoint', { status: 404 })
  }
}
