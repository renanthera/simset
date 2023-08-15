import { spawn } from 'child_process'
import { readFile, unlink } from 'node:fs'

import ofetch_wrapper from '~/utils/PostToWebserver'

type Body = {
  id: number,
  content: string
}

export default class Sim {
  id: number
  content: Array<string>
  stdout: string
  stderr: string

  constructor(body: Body) {
    this.id = body.id
    this.content = body.content.split(' ')
    // temporary until this is done by webserver.
    // no transformation of input allowed on workers
    this.content.unshift('json2=' + this.id + '.json')
    this.stdout = ''
    this.stderr = ''
  }

  runSim() {
    return new Promise(resolve => {
      console.log('running: ', this.id)
      const proc = spawn('./simc', this.content)

      proc.stdout.on('data', chunk => {
        const stdout = chunk.toString()
        if (stdout) {
          console.log(stdout)
          const body = {
            id: this.id,
            stdout: stdout,
            status: 'processing'
          }
          ofetch_wrapper('/api/worker/processing', body)
          this.stdout += stdout
        }
      })

      proc.stderr.on('data', chunk => {
        const stderr = chunk.toString()
        if (stderr) {
          console.error(stderr)
          const body = {
            id: this.id,
            stderr: stderr,
            status: 'processing'
          }
          ofetch_wrapper('/api/worker/processing', body)
          this.stderr += stderr
        }
      })

      proc.on('close', () => {
        const body = {
          id: this.id,
          stdout: this.stdout,
          stderr: this.stderr,
          status: 'success'
        }
        readFile(this.id + '.json', 'utf8', async (err: Error, data: JSON) => {
          if (err) {
            console.error(err)
          } else {
            body.content = data
          }
          const res = await ofetch_wrapper('/api/worker/success', body)
          if (!err && res === 'OK') {
            unlink(this.id + '.json', (err: Error) => {
              if (err) throw err
              console.log('cleaned up ' + this.id + '.json successfully')
            })
          }
        })
        resolve(body)
      })
    })
  }
}
