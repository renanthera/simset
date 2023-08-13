import { spawn } from 'child_process'
import ofetch_wrapper from '~/utils/PostToWebserver'


function parse_body(body: string) {
  return body.split(' ')
}

type SimBody = {
  name: string,
  contents: string
}

export default function run_sim(sim_body: SimBody) {
  const { name } = sim_body
  return new Promise(resolve => {
    let response = ''

    const proc = spawn('./simc', parse_body(sim_body.contents))

    proc.stdout.on('data', (chunk) => {
      const contents = chunk.toString()
      if (contents) {
        const body = {
          name: name,
          contents: contents
        }
        ofetch_wrapper('/api/worker/status', body)
      }
      response += contents
    })

    proc.on('close', () => {
      const resp = {
        contents: response,
        name: sim_body.name
      }
      resolve(resp)
    })
  })
}
