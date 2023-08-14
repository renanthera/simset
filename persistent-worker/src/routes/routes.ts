import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply
} from 'fastify'

import Sim from '~/sims/runSim'
import validator from '~/utils/RequestValidation'
import sim_queue from '~/sims/SimQueue'

type UpdateAPIKey = FastifyRequest<{ Body: { new_key: string } }>
type EnqueueSim = FastifyRequest<{ Body: { id: string, content: string } }>

export async function routes(app: FastifyInstance) {
  // API
  // pUPDATE: UPDATE API KEY
  app.post('/keys/update', (req: UpdateAPIKey) => {
    const { new_key } = req.body
    validator.updateKey(new_key)
    return { new_key: new_key }
  })

  // WORKER:
  // pCREATE: ENQUEUE JOB
  app.post('/worker/create', (req: EnqueueSim, res: FastifyReply) => {
    const { body } = req
    const sim = new Sim(body)

    sim_queue.push(() => sim.runSim())

    res.code(202)
    res.send('OK')
  })

  // TODO: gSTATUS: ID OF CURRENT JOB BEING PROCESSED
  // do not believe this is presently possible
  app.post('/worker/status', () => {
    return { UNIMPLEMENTED: null }
  })

  // gQUEUE LENGTH: NUMBER OF JOBS IN QUEUE
  app.post('/worker/queue', () => {
    return { length: sim_queue.length }
  })

  // Validate all requests contain API key in header 'authorization'
  app.addHook('onRequest', (req: FastifyRequest, res: FastifyReply, done: (err?: Error) => void) => {
    if (validator.validateRequest(req)) {
      done()
    } else {
      res.code(403)
      done(new Error('Unauthorized API access'))
    }
  })
}
