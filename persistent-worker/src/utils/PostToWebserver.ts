import { ofetch } from 'ofetch'

const url_base = 'http://localhost:3000'

export default async function ofetch_wrapper(endpoint, contents) {
  const ofetch_params = {
    method: 'POST',
    body: contents,
    headers: { 'content-type': 'application/json' }
  }
  return await ofetch(url_base + endpoint, ofetch_params).catch( err => console.error(err))
}
