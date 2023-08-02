import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from './../../tailwind.config.js'

export function all_sims(data) {
  return {
    ...scatter_base({"key": "All Sims", "data": data})
  }
}

export function selected_sims(data) {
  let schema = {
    ...scatter_base({"key": "Selected Sims", "data": data}),
  }

  schema.encoding.size = {
    "condition": {
      "param": "mouseover",
      "value": 400,
      "empty": false
    },
    "value": 32
  }

  schema.layer[0].params.push({
    "name": "mouseover",
    "select": {
      "type": "point",
      "on": "mouseover",
      "nearest": true,
      "clear": "mouseout"
    }
  })

  return schema
}

export function scatter_base({key, data}) {
  return {
    ...theming(),
    ...base(),
    "title": {
      "text": key
    },
    "layer": [{
      "params": [{
        "name": "brush",
        "select": {
          "type": "interval",
          "encodings": ["y"]
        }
      }],
      "mark": {
        "type": "circle",
        "color": "#ff0000",
        "size": key === "All Sims" ? 4 : 32,
        "tooltip": key === "All Sims" ? false : {"content": "data"}
      },
    }
             ],
    "encoding": {
      "x": {
        "field": "x",
        "title": "",
        "type": "quantitative",
        "scale": {
          "domain": [-0.1, 1.1]
        },
        "axis": {
          "values": [0, 0.25, 0.5, 0.75, 1]
        }
      },
      "y": {
        "field": "y",
        "title": "mean dps",
        "type": "quantitative",
        "scale": {
          "domain": calculateExtrema(data)
        }
      }
    }
  }
}

function calculateExtrema(d) {
  if (d) {
    const min = Math.min(...d.map(({y}) => y))
    const max = Math.max(...d.map(({y}) => y))
    return [ min - 0.1 * (max - min), max + 0.1 * (max - min)]
  }
  return [0, 1]
}


const colors = resolveConfig(tailwindConfig).theme.colors
const transparent = colors.transparent
const lightColor = colors.chart.lightColor
const darkColor = colors.chart.darkColor
const accent = colors.chart.accent

function theming() {
  return {
    "width": "container",
    "height": "container",
    "config": {
      "background": transparent,
      "title": {
        "color": lightColor,
        "subtitleColor": lightColor
      },
      "axis": {
        "domainColor": darkColor,
        "gridColor": darkColor,
        "tickColor": transparent
      },
      "style": {
        "guide-label": {
          "fill": lightColor
        },
        "guide-title": {
          "fill": lightColor
        }
      }
    }
  }
}

function base() {
  return {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {
      "name": "data"
    }
  }
}
