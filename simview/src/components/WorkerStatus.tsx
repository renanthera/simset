import React, { useState, useEffect } from 'react'

import { worker } from '~/utils/CacheWorkerStatus'

export default function WorkerStatus() {
  // const [state, setState] = useState(worker)
  const ref = {worker: worker}
  const [state, setState] = useState(ref.worker.getStatus())

  useEffect( () => {
    console.log('updating?')
    setState(ref.worker.getStatus())
  }, [ref.worker.status])

  // useEffect( () => {
  //   const cb = () => {
  //     console.log('attempted to trigger status update via callback')
  //     setState(worker.getStatus())
  //   }
  //   worker.addCallback( cb )
  // }, [])

  return (
    <>
      {state}
    </>
  )
}
