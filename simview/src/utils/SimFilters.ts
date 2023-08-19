export const isPresent =
  <T>(x: T | null | undefined): x is T => x !== null && x !== undefined;

export const filterParameters = (blacklist: Array<string>) => (line: string) => {
  const match = [...line.matchAll(/^([^=]*)=.*$/mg)][0]
  if (match) {
    if (!blacklist.includes(match[1])) {
      return line
    }
  }
}

const findTemplates = (line: string) => {
  const match = [...line.matchAll(/^\$\((.*)\)=(.*)$/mg)][0]
  if (match) {
    return { template: match[1], replacement: match[2] }
  }
}

export const filterTemplates = (line: string) => {
  const match = !line.match(/^\$\(.*$/mg)
  return match
}

export type Template = {
  template: string
  replacement: string
}

export const mapTemplates = (templates: Array<Template>) => (line: string) => {
  const match = [...line.matchAll(/.*\$\((.*)\).*$/mg)][0]
  if (match) {
    const template = templates.find(e => e.template === match[1])
    return line.replace('\$\(' + template.template + '\)', template.replacement)
  }
  return line
}

export const stripWhitespaceAndComments = (line: string) => {
  const match = [...line.matchAll(/^\s*([^\n#]+)$/mg)][0]
  if (match) {
    return match[1]
  }
}

export const findTemplatesRaw = (entry: string) => {
  if (!entry) return
  return entry.split('\n')
    .map(stripWhitespaceAndComments)
    .filter(isPresent)
    .map(findTemplates)
    .filter(isPresent)
}

export const filterStrings =
  (templates: Array<Template>, blacklistParameters: Array<string>) =>
    (entry: string) => {
      if (!entry) return
      return entry
        .split('\n')
        .map(stripWhitespaceAndComments)
        .filter(isPresent)
        .filter(filterParameters(blacklistParameters))
        .filter(filterTemplates)
        .map(mapTemplates(templates))
    }

export const objectMap = (obj, fn) => {
  return Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => {
        return [k, fn(k, v, i)]
      }
    )
  )
}
