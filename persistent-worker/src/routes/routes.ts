import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply
} from 'fastify'

import run_sim from '~/sims/runSim'
import validator from '~/utils/RequestValidation'
import sim_queue from '~/sims/SimQueue'

type UpdateAPIKey = FastifyRequest<{ Body: { new_key: string } }>
type EnqueueSim = FastifyRequest<{ Body: { name: string, contents: string } }>
type CheckSimPosition    = FastifyRequest<{ Body: { name: string, contents: string } }>

export async function routes(app: FastifyInstance) {

  app.post('/api/keys', (req: UpdateAPIKey) => {
    const { new_key } = req.body
    validator.updateKey(new_key)
    return { new_key: new_key }
  })

  app.post('/api/create_sim', (req: EnqueueSim, res: FastifyReply) => {
    const { body } = req
    sim_queue.push(_ => {
      return run_sim(body)
    })
    res.code(202)
    res.send('OK')
  })

  app.get('/api/queue/length', () => {
    return { queue_length: sim_queue.length}
  })

  app.get('/api/queue/position', (req: CheckSimPosition) => {
    const { body } = req
    return { queue_position: sim_queue.indexOf(body) }
  })

  app.addHook('onRequest', (req: FastifyRequest, res: FastifyReply, done: (err?: Error) => void) => {
    if (validator.validateRequest(req)) {
      done()
    } else {
      res.code(403)
      done(new Error('Unauthorized API access'))
    }
  })
}
