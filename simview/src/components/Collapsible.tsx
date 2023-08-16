'use client'
import { useState, cloneElement } from 'react'

function FullBar({ className, children, callback, notState, ...props }) {
  const rotation = notState ? 'rotate(180)' : 'rotate(90)'
  return (
    <div className={className + ' px-3 flex items-center rounded-md justify-between select-none'} onClick={callback} {...props}>
      <div>
        {children}
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
        <polygon points="0,0 10,5, 0,10" transform-origin="center" transform={rotation}/>
      </svg>
    </div>
  )
}

// has to be the opposite to not be a truthy nightmare
// produces some yummy double negatives
export default function Collapsible({children, Bar, hidden, className}) {
  const collapse_styling = ' border-solid rounded-lg border-2 border-woodsmoke-700'
  const [notVisible, toggleVisibility] = useState(hidden)

  const cb = () => {
    toggleVisibility( notVisible ? false : true )
  }

  if (!notVisible) {
    return (
      <div className={className + collapse_styling}>
        <FullBar notState={notVisible} callback={cb} {...Bar.props}/>
        <div className="m-4">
          {children}
        </div>
      </div>
    )
  }
  return (
    <div className={className + collapse_styling}>
      <FullBar notState={notVisible} callback={cb} {...Bar.props}/>
    </div>
  )
}
