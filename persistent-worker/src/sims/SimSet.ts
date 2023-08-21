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

  constructor(body: Body, count?: number) {
    this.id = body.id
    this.parameters = body.parameters
    this.sim = []
    this.result = []

    if (count) this.count = count
  }

  processSim() {
    const parameters = this.produceParameters()
    const sim = new Sim(this.id, this.sim.length, parameters)
    this.sim.push(sim)
    return
  }

  produceParameters() {
    const f_combination =
      (cartesian(...this.parameters.fixedCombination) || [])
        .map(nameGenerator('f'))
    const r_combination =
      (cartesian(...this.parameters.reducibleCombination) || [])
        .map(nameGenerator('r'))

    let fr_combination = []
    if (f_combination.length > 0 && r_combination.length > 0) {
      fr_combination =
        cartesian(f_combination, r_combination)
          .map(e => e.reduce(reduceFR))
          .map(formatStrings)
    } else if (f_combination.length > 0) {
      fr_combination =
        f_combination
          .map(({ name, value }) => 'profileset.' + name + '+=' + value)
    } else if (r_combination.length > 0) {
      fr_combination =
        r_combination
          .map(({ name, value }) => 'profileset.' + name + '+=' + value)
    }
    let content = [].concat(
      ...this.parameters.characterConfiguration,
      ...this.parameters.apl,
      ...fr_combination
    )
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

export const isPresent =
  <T>(x: T | null | undefined): x is T => x !== null && x !== undefined;
