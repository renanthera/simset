import { spawn } from 'child_process'
import ofetch_wrapper from '~/utils/PostToWebserver'

function parse_body(body: string) {
  return body.split(' ')
}

type Body = {
  id: string,
  content: string
}

export default class Sim {
  id: number
  content: Array<string>
  response: string

  constructor(body: Body) {
    this.id = body.id
    this.content = body.content.split(' ')
    this.response = ''
  }

  runSim() {
    return new Promise( resolve => {
      const proc = spawn('./simc', this.content)

      proc.stdout.on('data', chunk => {
        const content = chunk.toString()
        if (content) {
          const body = {
            id: this.id,
            content: content
          }
          ofetch_wrapper('/api/worker/processing', body)
          this.response += content
        }
      })

      proc.on('close', () => {
        const body = {
          id: this.id,
          content: this.response
        }
        resolve(body)
      })
    })
  }
}
