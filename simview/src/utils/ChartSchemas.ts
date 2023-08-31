import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '~/../tailwind.config.js'

const colors = resolveConfig(tailwindConfig).theme.colors

export function all_sims(data, dims) {
  return {
    ...scatter_base({ "key": "All Sims", "data": data, ...dims })
  }
}

export function selected_sims(data, dims) {
  let schema = {
    ...scatter_base({ "key": "Selected Sims", "data": data, ...dims }),
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

export function scatter_base({ key, data, height, width }) {
  return {
    ...theming(height, width),
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
        "color": colors.bittersweet[500],
        "size": key === "All Sims" ? 4 : 32,
        "tooltip": key === "All Sims" ? false : { "content": "data" }
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
    const min = Math.min(...d.map(({ y }) => y))
    const max = Math.max(...d.map(({ y }) => y))
    return [min - 0.1 * (max - min), max + 0.1 * (max - min)]
  }
  return [0, 1]
}

function theming(height: number, width: number) {
  return {
    "autosize": {
      "type": "fit",
      "resize": "true",
      "contains": "padding"
    },
    "padding": 1,
    // "width": width-40,
    // "height": height - 160,
    // "width": 200,
    // "height": 200,
    "width": "container",
    "height": "container",
    // "signals": [
    //   {
    //     "name": "width",
    //     "init": "isFinite(containerSize()[0]) ? containerSize()[0] : 500",
    //     "on": [
    //       {
    //         "update": "isFinite(containerSize()[0]) ? containerSize()[0] : 500",
    //         "events": "window:resize"
    //       }
    //     ]
    //   },
    //   {
    //     "name": "height",
    //     "init": "isFinite(containerSize()[1]) ? containerSize()[1] : 500",
    //     "on": [
    //       {
    //         "update": "isFinite(containerSize()[1]) ? containerSize()[1] : 500",
    //         "events": "window:resize"
    //       }
    //     ]
    //   }
    // ],
    "config": {
      "background": colors.transparent,
      "title": {
        "color": colors.woodsmoke[100],
        "subtitleColor": colors.woodsmoke[100]
      },
      "axis": {
        "domainColor": colors.woodsmoke[800],
        "gridColor": colors.woodsmoke[800],
        "tickColor": colors.transparent
      },
      "style": {
        "guide-label": {
          "fill": colors.woodsmoke[100]
        },
        "guide-title": {
          "fill": colors.woodsmoke[100]
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
