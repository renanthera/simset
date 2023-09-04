import React from 'react'

import CompositeScatterChartContainer from '~/components/CompositeScatterChartContainer'

export default function Page() {
  const whTooltips = {
    "colorlinks": true,
    "iconizelinks": true,
    'iconSize': 'large',
    "renamelinks": true,
    "hide": {
      "droppedby": true,
      "dropchance": true
    }
  }
  /* const wowhead_tooltips = { colorLinks: true, iconizeLinks: true, renameLinks: true } */
  return (
    <>
      <CompositeScatterChartContainer />
    </>
  )
}
