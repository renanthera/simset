import Queue from 'queue'

import ofetch_wrapper from '~/utils/PostToWebserver'

const queue_config = {
  concurrency: 1,
  autostart: true
}

const sim_queue = new Queue(queue_config)

sim_queue.addEventListener('start', () => {
  console.log('starting job')
})

sim_queue.addEventListener('success', e => {
  const result = e.detail.result[0]
  const body = {
    id: result.id,
    content: result.content
  }
  ofetch_wrapper('/api/worker/success', body)
  console.log('finishing job')
})

sim_queue.addEventListener('end', () => {
  console.log('ended queue')
})

sim_queue.addEventListener('timeout', e => {
  console.log('timeout: ', e)
})


export default sim_queue
