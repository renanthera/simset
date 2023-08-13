import Queue from 'queue'

import ofetch_wrapper from '~/utils/PostToWebserver'

const queue_config = {
  concurrency: 1,
  autostart: true
}

const sim_queue = new Queue(queue_config)

sim_queue.addEventListener('success', e => {
  const result = e.detail.result[0]
  const { name } = result
  const { contents } = result
  const body = {
    name: name,
    contents: contents
  }
  ofetch_wrapper('/api/worker/success', body)
})

sim_queue.addEventListener('start', e => {
  console.log('starting', e.detail)
})

sim_queue.addEventListener('end', e => {
  console.log('end', e)
})

sim_queue.addEventListener('timeout', e => {
  console.log('timeout: ', e)
})


export default sim_queue
