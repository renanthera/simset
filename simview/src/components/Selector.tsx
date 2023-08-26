'use client'
import { useState, useEffect, useRef } from 'react'

// Array<Array<string>> items => n array of [id, disp] (id, display text)
// callback => triggers on update to selection
// init => initial selection [id, disp]

export function Selector(
  { callback,
    items,
    state
  }
) {
  const updateSelect = (e) => {
    callback(items.find(u => parseInt(u[0]) === parseInt(e.target.value)))
  }

  useEffect(() => {
    if (!state) {
      callback(items[0])
    }
  }, [items])

  if (state) {
    return (
      <select value={state[0]} className="bg-woodsmoke-950 text-woodsmoke-300" onChange={updateSelect}>
        {items.map(([k, v]) => <option value={k} key={k}>{v}</option>)}
      </select>
    )
  }
}
