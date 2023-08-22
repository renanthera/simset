export const cartesian =
  (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat()))) || [];

export const nameGenerator = (t: string) => (e, i) => {
  return { name: t + i, value: e }
}

export const reduceFR = (t, u) => {
  return { name: t.name + '-' + u.name, value: [].concat(t.value, u.value) }
}

export const reduceCombinations = (name: string) => (t, u) => {
  return t + ' ' + name + u
}

export const formatStringFR = ({ name, value }) => {
  const label = 'profileset.' + name + '+='
  return { name: name, value: label + value.reduce(reduceCombinations(label)) }
}

export const formatStringF = ({ name, value }) => {
  const label = 'profileset.' + name + '+='
  return { name: name, value: label + value }
}

export const isPresent =
  <T>(x: T | null | undefined): x is T => x !== null && x !== undefined;

export const splitJSON = (a, c) => {
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

export const sortMeans = ({ mean: a }, { mean: b }) => {
  if (a < b) return 1
  else if (a > b) return -1
  else return 0
}

export const objectMap = (fn) => (obj) => {
  return Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => {
        return [k, fn(k, v, i)]
      }
    )
  )
}

export const pipe = (operand, fns) => {
  return fns.reduce((a, r) => r(a), operand)
}

export const pipeLog = (obj) => {
  console.log(obj)
  return obj
}

export const sortEntries = (_, v) => {
  v.entries.sort(sortMeans)
  return v
}

export const filterEntries = (_, v) => {
  const idx = v.entries.findIndex(e => e.mean < v.extrema.m_max - 2 * v.extrema.e_max)
  if (idx > v.entries.length / 4 || idx === -1) {
    v.entries = v.entries.slice(0, Math.ceil(v.entries.length / 4))
  } else {
    v.entries = v.entries.slice(0, idx)
  }
  return v
}
