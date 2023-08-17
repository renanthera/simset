import {
  querySims
} from '~/database/Sim'

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function GET(
  req: Request,
  { params }: { params: { method: Array<string> } }
) {
  const { searchParams } = new URL(req.url)
  const event = params.method[0]
  console.log(searchParams)

  switch (event) {
    case 'search':
      const id = searchParams.get('id')
      const select = searchParams.get('select')
      let query = {
      }
      if (id !== 'all') {
        query = {
          id: id ? id.split(',') : undefined,
          ...query
        }
      }
      if (select && select !== 'all') {
        for (var element of select.split(',')) {
          query.select[element] = true
        }
      }
      const body = await querySims(query)
      return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } })
      break
    default:
      return new Response('No such API endpoint', { status: 404 })
  }
}
