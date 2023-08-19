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

  switch (event) {
    case 'search':
      const query = {
        id: searchParams.get('id'),
        select: searchParams.get('select')
      }
      const body = await querySims(query)
      return new Response(
        JSON.stringify(body),
        { headers: { 'content-type': 'application/json' } }
      )
      break
    default:
      return new Response('No such API endpoint', { status: 404 })
  }
}
