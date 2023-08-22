import { Sim } from '~/sims/Sim'

import {
  cartesian,
  nameGenerator,
  reduceFR,
  // reduceCombinations,
  formatStringFR,
  formatStringF,
  isPresent,
  objectMap,
  splitJSON,
  // sortMeans,
  pipe,
  sortEntries,
  filterEntries
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
        // pipe(a, [t, u, v]) === v(u(t(a)))
        const filterCombination =
          pipe(
            JSON.parse(body.content)
              .sim
              .profilesets
              .results
              .reduce(splitJSON, {}),
            [ objectMap(sortEntries),
              objectMap(filterEntries)
            ]
          )
        // regen fr based on filter_combination
        // run next sim
        console.log(filterCombination)
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
