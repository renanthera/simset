import CompositeScatterChartContainer from '~/components/CompositeScatterChartContainer'
import { MarkdownWrapper } from '~/components/MarkdownWrapper'

const text = `
# hello world


\`\`\`
test
\`\`\`

* [test](#hello-world)
* this is a sample
* this is also a [sample](https://github.com/renanthera/simview)
`

export default function Home() {
  const id = 5
  return (
    <>
      <MarkdownWrapper filename={'../README.md'} />
      <CompositeScatterChartContainer id={id} />
    </>
  )
}
