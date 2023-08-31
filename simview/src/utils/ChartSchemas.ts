import resolveConfig from 'tailwindcss/resolveConfig'

import tailwindConfig from '~/../tailwind.config.js'
import { mergeObjects } from '~/utils/mergeObjects'

const colors = resolveConfig(tailwindConfig).theme.colors

export function all_sims(data) {
  return scatter_base('All Sims', data)
}

export function selected_sims(data) {
  let schema = mergeObjects(
    scatter_base('Selected Sims', data),
    {
      encoding: {
        size: {
          condition: {
            param: 'mouseover',
            value: 400,
            empty: false
          },
          value: 32
        }
      }
    }
  )

  schema.layer[0].params.push({
    name: 'mouseover',
    select: {
      type: 'point',
      on: 'mouseover',
      nearest: true,
      clear: 'mouseout'
    }
  })

  return schema
}

export function scatter_base(key, data) {
  const x_values = [0, 0.25, 0.5, 0.75, 1]

  return {
    ...theming(),
    ...base(),
    title: {
      text: key
    },
    layer: [{
      params: [{
        name: 'brush',
        select: {
          type: 'interval',
          encodings: ['y']
        }
      }],
      mark: {
        type: 'circle',
        color: colors.bittersweet[500],
        size: key === 'All Sims' ? 4 : 32,
        tooltip: key === 'All Sims' ? false : { 'content': 'data' }
      },
    }
    ],
    encoding: {
      x: {
        field: 'x',
        title: '',
        type: 'quantitative',
        scale: {
          domain: calculateExtrema(x_values)
        },
        axis: {
          values: [0, 0.25, 0.5, 0.75, 1]
        }
      },
      y: {
        field: 'y',
        title: 'mean dps',
        type: 'quantitative',
        scale: {
          domain: calculateExtrema(data ? data.map(({ y }) => y) : x_values)
        }
      }
    }
  }
}

function calculateExtrema(d) {
  const min = Math.min(...d)
  const max = Math.max(...d)
  return [min - 0.1 * (max - min), max + 0.1 * (max - min)]
}

function theming() {
  return {
    autosize: {
      type: 'fit',
      resize: 'true',
      contains: 'padding'
    },
    padding: 1,
    width: 'container',
    height: 'container',
    config: {
      background: colors.transparent,
      title: {
        color: colors.woodsmoke[100],
        subtitleColor: colors.woodsmoke[100]
      },
      axis: {
        domainColor: colors.woodsmoke[800],
        gridColor: colors.woodsmoke[800],
        tickColor: colors.transparent
      },
      style: {
        'guide-label': {
          fill: colors.woodsmoke[100]
        },
        'guide-title': {
          fill: colors.woodsmoke[100]
        }
      }
    }
  }
}

function base() {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: {
      name: 'data'
    }
  }
}
