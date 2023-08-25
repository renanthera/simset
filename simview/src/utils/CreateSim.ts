import {
  findTemplatesRaw,
  isPresent,
  filterStrings,
  objectMap
} from '~/utils/SimFilters'

const blacklistParameters = [
  'threads',
  'profileset_work_threads',
  'target_error',
  'single_actor_batch',
  'output',
  'html',
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

export type FormData = {
  characterConfiguration: Array<Array<string>>
  apl: Array<Array<string>>
  fixedCombination: Array<Array<string>>
  reducibleCombination: Array<Array<string>>
}

// templates may operate in unexpected ways.
// avoid defining them multiple times
export function parseSimParameters(content: FormData) {
  // gather all templates from all input
  // flatten as input has dim >= 2
  // remove undefined/nulls
  const templates = Object.entries(content).map( ([k, v], i) => {
    return v.map(findTemplatesRaw)
  }).flat(Infinity).filter(isPresent)

  // for all entries in entries in content...
  // split on newlines
  // strip whitespace and comments
  // remove undefined/nulls
  // strip all blacklisted parameters
  // remove template definitions
  // resolve template uses as per defined in templates
  const body = objectMap(content, (_, v) => {
    return v
        .map(filterStrings(templates, blacklistParameters))
  })

  return body
}
