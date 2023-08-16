import { MarkdownWrapper } from '~/components/MarkdownWrapper'

export default function Home() {
  const id = 5
  return (
    <>
      <MarkdownWrapper filename={'../README.md'} />
    </>
  )
}
