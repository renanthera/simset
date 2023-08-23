import { ofetch } from 'ofetch'

import { Sim } from '~/sims/Sim'

import {
  cartesian,
  nameGenerator,
  reduceFR,
  formatStringFR,
  formatStringF,
  isPresent,
  objectMap,
  splitJSON,
  pipe,
  sortEntries,
  filterEntries,
  objectMapToArray,
  splitNames,
  regroupObjects,
  valuesToFR,
  replaceWithHigherPrecision,
  pipeLog
} from '~/sims/utils'

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
    this.count = count ? count : 4

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

    this.f_combination =
      this.f_combination
        .reduce((a, c) => {
          return { ...a, [c.name]: c.value }
        }, {})
    this.r_combination =
      this.r_combination
        .reduce((a, c) => {
          return { ...a, [c.name]: c.value }
        }, {})
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
        this.sim.push(body)
        // console.log(this.fr_combination)
        // pipe(a, [t, u, v]) === v(u(t(a)))
        // from previously run sim:
        //   gather profileset results
        //   convert it into { f_name: { entries: [r_name_full] } }
        //   remove entries that are:
        //     not in top quarter OR
        //     more than 2 maximum errors below max mean
        //   transform to { f_name: { entries: [...r_names] } }
        //   transform to [ [f_name, r_name], ...]
        //   populate with combination information
        //   transform to fr_combination shape
        this.fr_combination =
          pipe(
            JSON.parse(body.content)
              .sim
              .profilesets
              .results
              .reduce(splitJSON, {}),
            [
              objectMap(sortEntries),
              objectMap(filterEntries),
              objectMap(splitNames),
              objectMap(regroupObjects),
              objectMapToArray(v => v[1])
            ]
          ).flat(1)
            .map(u => u.reduce(valuesToFR(this.f_combination, this.r_combination), {}))
            .map(formatStringFR)
      }
    }
    const payload =
      pipe(
        this.sim
          .reduce(replaceWithHigherPrecision, {}),
        [
          Object.values
        ])
        .reduce((a, c) => {
          const name = c.name.split('-')
          const f_name = name[0]
          const r_name = name[1]
          a[f_name] = [].concat(a[f_name], [{...c, combination: [].concat(this.f_combination[f_name], this.r_combination[r_name])}]).filter(isPresent)
          // console.log(a[f_name])
          return a
        }, {})
    console.log(payload)
    const body = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: {
        id: this.id,
        status: 'success',
        f_combination: JSON.stringify(this.f_combination),
        r_combination: JSON.stringify(this.r_combination),
        content: JSON.stringify(payload)
      }
    }
    ofetch('http://localhost:3000/api/database/update', body)

    return this.id
  }

  produceParameters() {
    let content = [
      ...this.parameters.characterConfiguration,
      ...this.parameters.apl,
      ...this.fr_combination.map(({ value }) => value)
    ].flat(Infinity)
    // content.unshift('target_error=5')
    content.unshift('threads=48')
    content.unshift('profileset_work_threads=1')
    content.unshift('single_actor_batch=1')
    content.unshift('output=/dev/null')
    content = content.filter(isPresent)

    return content
  }
}
