import {
  filterParameters,
  findTemplates,
  filterTemplates,
  mapTemplates,
  stripWhitespaceAndComments,
  Template
} from '~/utils/SimFilters'

const isPresent = <T>(x: T | null | undefined): x is T => x !== null && x !== undefined;

export type FormData = {
  characterConfiguration: Array<string>
  apl: Array<string>
  fixedCombination: Array<string>
  reducibleCombination: Array<string>
}

const blacklistParameters = [
  'threads',
  'profileset_work_threads',
  'target_error',
  'single_actor_batch',
  'output',
  'xml',
  'json',
  'json2',
  'report_details',
  'report_precision',
  'hosted_html',
  'save_profiles',
  'iterations',
  'debug',
  'maximize_reporting',
  'dps_plot_stat',
  'dps_plot_points',
  'dps_plot_step',
  'dps_plot_iterations',
]

class SimConfiguration {
  content: string
  templates: Array<Template>
  characterConfiguration: Array<string>

  constructor() {
    this.content = ''
    this.templates = []
    this.characterConfiguration = []
  }
}

export function createSimParameters(content: FormData, id: number) {
  let simConfig = new SimConfiguration()

  const { characterConfiguration } = content

  // simConfig.templates = [
  //   ...characterConfiguration[0]
  //   .split('\n')
  //   .map(stripWhitespaceAndComments)
  //   // .filter(isPresent)
  //   // .map(findTemplates)
  //   // .filter(isPresent)
  //   undefined,
  //   ...simConfig.templates]
  console.log(simConfig.templates)

  const filtered = characterConfiguration[0]
    .split('\n')
    .map(stripWhitespaceAndComments)
    .filter(isPresent)
    .filter(filterTemplates)
    .map(mapTemplates(simConfig.templates))
    .filter(filterParameters(blacklistParameters))
  console.log(simConfig)
  // generate names and combinations for combinations
  // return [sim] parameters and combinations for future mapping

  return simConfig
}
