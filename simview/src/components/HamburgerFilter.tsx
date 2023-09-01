import {
  useState
} from 'react'

import {
  Collapsible
} from '~/components/Collapsible'

function Button({ callback }) {
  return (
    <button
      type="button"
      onClick={callback}
      className="border border-woodsmoke-100 rounded font-bold"
    >
      <svg className="fill-woodsmoke-100" width="36" height="36" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m21 15.75c0-.414-.336-.75-.75-.75h-16.5c-.414 0-.75.336-.75.75s.336.75.75.75h16.5c.414 0 .75-.336.75-.75zm0-4c0-.414-.336-.75-.75-.75h-16.5c-.414 0-.75.336-.75.75s.336.75.75.75h16.5c.414 0 .75-.336.75-.75zm0-4c0-.414-.336-.75-.75-.75h-16.5c-.414 0-.75.336-.75.75s.336.75.75.75h16.5c.414 0 .75-.336.75-.75z" fillRule="nonzero" /></svg>
    </button>
  )
}

export function HamburgerChild({ children, label }) {
  return (
    <Collapsible hidden={false} Bar={(
      <div className="w-full h-12 bg-woodsmoke-900 font-bold">{label}</div>
    )}>
      {children}
    </Collapsible>
  )
}

export function HamburgerMenu({ children }) {
  const [visible, setVisible] = useState(false)

  const toggleMenu = () => {
    setVisible(!visible)
  }

  if (visible) {
    return (
      <>
        <Button callback={toggleMenu} />
        <div className="absolute top-[5svh] left-[5%] h-[90svh] max-h-[90svh] w-[90%] max-w-[90%] bg-woodsmoke-950 border border-woodsmoke-300 rounded-lg z-10 p-4 overflow-scroll flex flex-col space-y-4">
          {children}
        </div>
      </>
    )
  }
  return (
    <>
      <Button callback={toggleMenu} />
    </>
  )
}
