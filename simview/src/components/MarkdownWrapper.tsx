`use server`
import fs from 'fs'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import reactGfm from 'remark-gfm'
import { generateSlug } from '~/utils/IDSlugGenerator'

async function readData(filename) {
  `use server`
  return fs.readFileSync(filename, 'utf8')
}

const prose_config = [
  'prose',
  'dark:prose-invert',
  'prose-headings:text-woodsmoke-400',
  'prose-a:text-current',
  'prose-a:no-underline'
]

function replace_headings(props) {
  const { level } = props
  const Tag = 'h' + level
  const text = props.children[0]
  return (<Tag id={generateSlug(text)}><a href={'#'+generateSlug(text)} {...props}/></Tag>)
}

const component_overrides = {
  h1: ({ ...props }) => replace_headings(props),
  h2: ({ ...props }) => replace_headings(props),
  h3: ({ ...props }) => replace_headings(props),
  h4: ({ ...props }) => replace_headings(props),
  h5: ({ ...props }) => replace_headings(props),
  h6: ({ ...props }) => replace_headings(props),
}

export async function MarkdownWrapper({ contents, filename }) {
  let data = 'MarkdownWrapper component is empty.'
  if (contents) {
    data = contents
  } else if (filename) {
    data = await readData(filename)
  }
  return (
    <div className={prose_config.join(' ')}>
      <ReactMarkdown children={data} remarkPlugins={[reactGfm]} components={component_overrides} />
    </div>
  )
}
