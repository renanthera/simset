import { spawn } from 'child_process'
import { ofetch } from 'ofetch'

function ofetch_parameters( body: string ) {
  return {
    method: 'POST',
    body: body,
    headers: {'content-type': 'text/plain'}
  }
}

function parse_body( body: string ) {
  return body.split(' ')
}

export default async function run_sim( sim_body: string ) {
  return new Promise( resolve => {
    let response = ''

    const proc = spawn('./simc', parse_body(sim_body))

    proc.stdout.on('data', ( chunk ) => {
      const contents = chunk.toString()
      const post_to_webserver = ofetch('http://localhost:3000/api/worker_status', ofetch_parameters( contents )).catch( (err) => console.error(err) )
      response += contents
    })

    proc.on('close', () => {
      resolve(response)
    })
  })
}
