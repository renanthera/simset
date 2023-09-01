import {
  useCanvas
} from '~/components/Canvas'

export const MapTalentChart = (limit: number) => ({ combinations }) => {
  if (!combinations) return
  return (
    <div className="grid grid-cols-[repeat(auto-fill,_300px)] gap-4">
      {combinations
        .map((e, i: number) => {
          if (i < limit) return (
            <>
              <div>
                {e.name}
                <TalentChart key={e.name} combination={e} />
              </div>
            </>
          )
        })
      }
    </div>
  )
}

function TalentChart({ combination }) {
  const talent_string = combination.r_combination.split('=')[1]
  const url =
    'https://www.raidbots.com/simbot/render/talents/'
    + talent_string
    + '?width=300&mini=1&level=60&bgcolor=330000'
  return (
    <iframe className="h-[200px] overflow-y-hidden" src={url} />
  )
}

const draw_tree = (context) => {
}

export function TalentTree({ oh_god_oh_fuck }) {
  const canvas = useCanvas(draw_tree)

  return (
    <canvas ref={canvas}/>
  )
}
