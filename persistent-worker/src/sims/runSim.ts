import { spawn } from 'child_process'
import { readFile, unlink } from 'node:fs'

import ofetch_wrapper from '~/utils/PostToWebserver'

export const isPresent =
  <T>(x: T | null | undefined): x is T => x !== null && x !== undefined;

type Parameters = {
  apl: Array<Array<string>>
  characterConfiguration: Array<Array<string>>
  fixedCombination: Array<Array<string>>
  reducibleCombination: Array<Array<string>>
}

type Body = {
  id: number,
  parameters: Parameters
}

const cartesian =
  (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

const nameGenerator = (t: string) => (e, i) => {
  return { name: t + i, value: e }
}

const reduceFR = (t, u) => {
  return { name: t.name + u.name, value: [].concat(t.value, u.value) }
}

const reduceCombinations = (name: string) => (t, u) => {
  return t + ' ' + name + u
}

const formatStrings = ({ name, value }) => {
  const label = 'profileset.' + name + '+='
  return label + value.reduce(reduceCombinations(label))
}

export default class Sim {
  id: number
  parameters: Parameters
  f_combination: Array<Array<string>>
  r_combination: Array<Array<string>>
  fr_combination: Array<Array<string>>
  content: Array<string>
  stdout: string
  stderr: string

  // generate all combinations within a type
  // generate name for each combination
  // generate all combination across all types
  // merge names
  // format into strings used in simc input
  constructor(body: Body) {
    this.id = body.id
    this.parameters = body.parameters
    if (this.parameters.fixedCombination) {
    }
    this.f_combination =
      (cartesian(...this.parameters.fixedCombination) || [])
        .map(nameGenerator('f'))
    this.r_combination =
      (cartesian(...this.parameters.reducibleCombination) || [])
        .map(nameGenerator('r'))

    this.fr_combination = []
    if (this.f_combination.length > 0 && this.r_combination.length > 0) {
      this.fr_combination =
        cartesian(this.f_combination, this.r_combination)
          .map(e => e.reduce(reduceFR))
          .map(formatStrings)
    } else if (this.f_combination.length > 0) {
      this.fr_combination =
        this.f_combination
          .map(({ name, value }) => 'profileset.' + name + '+=' + value)
    } else if (this.r_combination.length > 0) {
      this.fr_combination =
        this.r_combination
          .map(({ name, value }) => 'profileset.' + name + '+=' + value)
    }
    this.content = [].concat(
      ...this.parameters.characterConfiguration,
      ...this.parameters.apl,
      ...this.fr_combination
    )
    this.content.unshift('json2=' + this.id + '.json')
    this.content.unshift('target_error=5')
    this.content.unshift('threads=48')
    this.content.unshift('profileset_work_threads=1')
    this.content.unshift('single_actor_batch=1')
    this.content.unshift('output=/dev/null')
    this.content = this.content.filter(isPresent)
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
          // console.log(stdout)
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
