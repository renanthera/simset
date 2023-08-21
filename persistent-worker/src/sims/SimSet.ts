import { Sim } from '~/sims/Sim'

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

export class SimSet {
  id: number
  count?: number
  sim: Array<Sim>
  result: Array<JSON>
  parameters: Parameters

  f_combination
  r_combination
  fr_combination

  constructor(body: Body, count?: number) {
    this.id = body.id
    this.parameters = body.parameters
    this.sim = []
    this.result = []
    this.fr_combination = []
    this.count = count ? count : 1

    this.f_combination =
      cartesian(...this.parameters.fixedCombination)
        .map(nameGenerator('f'))
    this.r_combination =
      cartesian(...this.parameters.reducibleCombination)
        .map(nameGenerator('r'))

    if (this.f_combination.length && this.r_combination.length) {
      this.fr_combination =
        cartesian(this.f_combination, this.r_combination)
          .map(e => e.reduce(reduceFR))
          .map(formatStringFR)
    } else if (this.f_combination.length || this.r_combination.length) {
      this.fr_combination =
        [...this.f_combination, ...this.r_combination]
          .map(formatStringF)
    }
    // console.log(this.fr_combination)
  }

  async runSims() {
    for (var index = 0; index < this.count; index++) {
      const parameters = this.produceParameters()
      const sim = new Sim(this.id, index, parameters)
      const body = await sim.runSim()
      // doesnt work if either fixed or reducible combinations are missing
      // if reducible is missing, run all again
      // if fixed is missing, reduce as per normal (slightly modified splitJSON is required)
      if (body.content) {
        const values = JSON.parse(body.content).sim.profilesets.results
        const filter_combination =
          objectMap(
            objectMap(
              values.reduce(splitJSON, {}),
              (_, v) => {
                v.entries.sort(sortMeans)
                return v
              }),
            (_, v) => {
              const idx = v.entries.findIndex(e => e.mean < v.extrema.m_max - 2 * v.extrema.e_max)
              console.log(v.entries.length, idx)
              // if more than a quarter, run top quarter
              // else run top 3 max mean_error's of sims again
              if (idx > v.entries.length / 4 || idx === -1) {
                v.entries = v.entries.slice(0, Math.ceil(v.entries.length / 4))
              }
              else v.entries = v.entries.slice(0, idx)
              return v
            })
        // regen fr based on filter_combination
        // run next sim
        console.log(filter_combination)
      }
      // console.log(body)
      this.sim.push(body)
    }

    return this.id
  }

  produceParameters() {
    let content = [
      ...this.parameters.characterConfiguration,
      ...this.parameters.apl,
      ...this.fr_combination.map(({ value }) => value)
    ].flat(Infinity)
    content.unshift('target_error=5')
    content.unshift('threads=48')
    content.unshift('profileset_work_threads=1')
    content.unshift('single_actor_batch=1')
    content.unshift('output=/dev/null')
    content = content.filter(isPresent)

    return content
  }
}

const cartesian =
  (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat()))) || [];

const nameGenerator = (t: string) => (e, i) => {
  return { name: t + i, value: e }
}

const reduceFR = (t, u) => {
  return { name: t.name + '-' + u.name, value: [].concat(t.value, u.value) }
}

const reduceCombinations = (name: string) => (t, u) => {
  return t + ' ' + name + u
}

const formatStringFR = ({ name, value }) => {
  const label = 'profileset.' + name + '+='
  return { name: name, value: label + value.reduce(reduceCombinations(label)) }
}

const formatStringF = ({ name, value }) => {
  const label = 'profileset.' + name + '+='
  return { name: name, value: label + value }
}

export const isPresent =
  <T>(x: T | null | undefined): x is T => x !== null && x !== undefined;

export const objectMap = (obj, fn) => {
  return Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => {
        return [k, fn(k, v, i)]
      }
    )
  )
}

const splitJSON = (a, c) => {
  const f_name = c.name.split('-')[0]
  if (!a[f_name]) {
    a[f_name] = {
      entries: [c],
      extrema: {
        e_max: c.mean_error,
        m_max: c.mean
      }
    }
  }
  else {
    a[f_name].entries.push(c)
    a[f_name].extrema = {
      e_max: Math.max(a[f_name].extrema.e_max, c.mean_error),
      m_max: Math.max(a[f_name].extrema.m_max, c.mean)
    }
  }
  return a
}

const sortMeans = ({ mean: a }, { mean: b }) => {
  if (a < b) return 1
  else if (a > b) return -1
  else return 0
}
