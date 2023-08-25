import Queue from 'queue'

const queue_config = {
  concurrency: 1,
  autostart: true
}

const sim_queue = new Queue(queue_config)

sim_queue.addEventListener('start', () => {
  console.log('starting job')
})

sim_queue.addEventListener('success', e => {
  console.log('finished job: ', e)
})

sim_queue.addEventListener('end', () => {
  console.log('queue clear')
})

sim_queue.addEventListener('timeout', e => {
  console.log('timeout: ', e)
})

export default sim_queue
