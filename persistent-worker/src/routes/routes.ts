import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply
} from 'fastify'

import run_sim from '~/sims/runSim.ts'

type UpdateAPIKeyRequest = FastifyRequest<{ Body: { new_key: string } }>
type CreateNewSimRequest = FastifyRequest<{ Body: string }>

// -1 line, +19 lines.
class RequestValidation {
  private key: string;
  private keyfile: string;

  constructor() {
    // TODO: load from persistent keyfile
    this.key = 'asdf'
  }

  validateRequest(req: FastifyRequest) {
    const { authorization } = req.headers
    if (authorization === this.key) {
      return true
    }
    return false
  }

  updateKey(new_key: string) {
    // TODO: update keyfile
    this.key = new_key
    return true
  }
}

export async function routes(app: FastifyInstance, _: FastifyPluginOptions) {
  const validator = new RequestValidation()

  app.post('/api/keys', (req: UpdateAPIKeyRequest, _: FastifyReply) => {
    const candidate_key = req.body.new_key
    validator.updateKey(candidate_key)
    return { new_key: candidate_key }
  })

  app.post('/api/create_sim', async (req: CreateNewSimRequest, res: FastifyReply) => {
    const { body } = req
    // TODO: Replace this with sim results, not stdout from run_sim
    const resp = await run_sim(body)
    res.code(200)
    res.send(resp)
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
