import React, { useEffect } from 'react'

import { worker } from './../utils/CacheWorkerStatus.ts'

export default function WorkerStatus() {
  let status = worker.getStatus()
  console.log(status)

  return (
    <>
      {status ? status : 'asdf'}
    </>
  )
}
