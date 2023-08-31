export const MapTalentChart = (limit: number) => ({combinations}) => {
  console.log(combinations)
  if (!combinations) return
  return (
    <>
      {combinations
        .map(filter_talents)
        .map((e: string, i: number) => {
          if (i < limit) return (<TalentChart key={i} talent_string={e} />)
        })
      }
    </>
  )
}

const filter_talents = ({ r_combination: e }) => e.split('=')[1]

function TalentChart({ talent_string }: { talent_string: string }) {
  const url =
    'https://www.raidbots.com/simbot/render/talents/'
    + talent_string
    + '?width=300&mini=1&level=60&bgcolor=330000'
  console.log(url)
  return (
    <iframe src={url}/>
  )
}
