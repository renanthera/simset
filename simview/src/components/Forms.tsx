'use client'
import { useState, cloneElement, isValidElement } from 'react'
import { useForm } from 'react-hook-form'

import { generateSlug } from '~/utils/IDSlugGenerator'
import { Collapsible } from '~/components/Collapsible'

export function Form({ action, method }) {
  const { register, handleSubmit } = useForm()
  const onSubmit = (data) => {
    const body = {
      apl: Object.entries(data)
        .filter((it) => it[0].includes("apl") && it[1] !== '')
        .map((it) => it[1]),
      characterConfiguration: Object.entries(data)
        .filter((it) => it[0].includes("character-configuration") && it[1] !== '')
        .map((it) => it[1]),
      fixedCombination: Object.entries(data)
        .filter((it) => it[0].includes("fixed-combinations") && it[1] !== '')
        .map((it) => it[1]),
      reducibleCombination: Object.entries(data)
        .filter((it) => it[0].includes("reducible-combinations") && it[1] !== '')
        .map((it) => it[1]),
    }
    const fetch_config = {
      method: method,
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' }
    }
    fetch(action, fetch_config)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Entry label="Character Configuration" register={register}>
        <TextInput />
      </Entry>
      <Entry label="APL" register={register}>
        <TextInput />
      </Entry>
      <MultiEntry label="Fixed Combinations" register={register} />
      <MultiEntry label="Reducible Combinations" register={register} />
      <input type="submit" value="Run Sim" />
    </form>
  )
}

export function Entry({ label, children, register }) {
  const slug = 'id-' + generateSlug(label) + '-'
  let count: number
  if (children) {
    count = children.length
  }
  return (
    <div>
      <label className="block text-sm font-bold mb-2">
        {label}
      </label>
      {count ? children.map((child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child, { id: slug + index, register: register(slug + index) })
        }
        return child
      }) : children ? cloneElement(children, { id: slug + 0, register: register(slug + 0) }) : children
      }
    </div>
  )
}

export function MultiEntry({ label, default_count, register }) {
  const [count, setCount] = useState(default_count ? default_count : 1)
  const slug = 'id-' + generateSlug(label) + '-'
  const incr = () => {
    setCount(count + 1)
  }
  const decr = () => {
    if (count > 1) {
      setCount(count - 1)
    }
  }
  return (
    <Collapsible hidden={true} className="mb-4" Bar={(<div className="w-full h-12 bg-woodsmoke-900 font-bold">{label}</div>)}>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-bold">
          {label}
        </label>
        <EntryCountButtons onIncrement={incr} onDecrement={decr} />
      </div>
      {Array.from({ length: count }, (v, k) => <TextInput id={slug + k} key={k} register={register(slug + k)} />)}
    </Collapsible>
  )
}

export function TextInput({ id, register, ...props }) {
  return (
    <textarea {...register} {...props} className="h-60 mb-4 bg-woodsmoke-900 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" id={id} type="text" />
  )
}

function Button({ children, onClick }) {
  return (
    <button className="bg-medium-purple-600 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={onClick}>
      {children}
    </button>
  )
}

function EntryCountButtons({ onIncrement, onDecrement }) {
  return (
    <div className="flex justify-end align-middle space-x-1">
      <Button onClick={onIncrement}>+</Button>
      <Button onClick={onDecrement}>-</Button>
    </div>
  )
}
