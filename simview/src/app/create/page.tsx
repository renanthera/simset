import React from 'react'

import { MarkdownWrapper } from '~/components/MarkdownWrapper'
import Collapsible from '~/components/Collapsible'

const one = `
# asdf
`

export default function Page() {
  return (
    <>
      <Collapsible Bar={(
        <div className="w-full h-12 bg-woodsmoke-900">Hello World</div>
      )}>
        <MarkdownWrapper contents={one} />
      <div className="w-full max-w-xs">
        <form className="bg-transparent shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <textarea className="bg-woodsmoke-900 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username"/>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <textarea className="bg-woodsmoke-900 shadow appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************"/>
            <p className="text-xs italic">Please choose a password.</p>
          </div>
          <div className="flex items-center justify-between">
            <button className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
              Sign In
            </button>
            <a className="inline-block align-baseline font-bold text-sm" href="#">
              Forgot Password?
            </a>
          </div>
        </form>
        <p className="text-center text-xs">
          &copy;2020 Acme Corp. All rights reserved.
        </p>
      </div>
      </Collapsible>
    </>
  )
}
