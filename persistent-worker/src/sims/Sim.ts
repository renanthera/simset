import { ofetch } from 'ofetch'
import { spawn } from 'child_process'
import { readFile, unlink } from 'node:fs'

const url_base = 'http://localhost:3000'

export class Sim {
  id: number
  index: number
  filename: string
  parameters: Array<string>
  stdout: string
  stderr: string
  content: string

  constructor(
    id: number,
    index: number,
    parameters: Array<string>
  ) {
    this.id = id
    this.index = index
    this.filename = id + '-' + index + '.json'
    this.parameters = parameters
    this.parameters.unshift('json2=' + this.filename)

    this.stdout = ''
    this.stderr = ''
    this.content = ''

    // return this.runSim()
  }

  runSim() {
    return new Promise((resolve, reject) => {
      console.log('running: ' + this.id + '-' + this.index)

      const process = spawn('./simc', this.parameters)

      process.stdout.on('data', chunk => {
        const stdout = chunk.toString()
        if (stdout) {
          const body = {
            stdout: stdout,
            status: 'processing'
          }
          this.submitChunk(body, '/api/worker/processing')
          this.stdout += stdout
        }
      })

      process.stderr.on('data', chunk => {
        const stderr = chunk.toString()
        if (stderr) {
          const body = {
            stderr: stderr,
            status: 'processing'
          }
          console.error('simc error:', stderr)
          this.submitChunk(body, '/api/worker/processing')
        }
      })

      process.on('close', (...args) => {
        console.log('finishing: ' + this.id + '-' + this.index + ' with ', args)
        const body = {
          id: this.id,
          index: this.index,
          stdout: this.stdout,
          stderr: this.stderr,
          status: 'completed'
        }
        readFile(
          this.filename,
          'utf8',
          async (err: Error, data: JSON) => {
            if (err) {
              console.error(err)
            } else {
              body.content = data
              unlink(this.filename, (err: Error) => {
                if (err) {
                  console.error(err)
                }
                else console.log('cleaned up ' + this.filename + ' successfully')
              })
              resolve(body)
            }
          })
      })
    })
  }

  async submitChunk(content, endpoint: string) {
    const output = content.toString()

    if (output) {
      const body = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: {
          id: this.id,
          ...content
        }
      }
      return (
        await ofetch(
          url_base + endpoint,
          body
        ).catch(err => console.error(err)))
    }
    return
  }
}
