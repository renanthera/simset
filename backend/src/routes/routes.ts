import fs from 'fs'
import { FastifyInstance,
         FastifyPluginOptions,
         FastifyRequest
       } from 'fastify'

import run_sim from './../sims/runSim.ts'

type UpdateAPIKeyRequest = FastifyRequest<{Body: { new_key: string }}>
type CreateNewSimRequest = FastifyRequest<{Body: string}>

// I understand this implementation is ridiculous, but it was novel to me when it was
// written, so it's fine and stuff.
// -1 line of code, +19 lines of code. woo
class RequestValidation {
  private key: string;

  constructor() {
    this.key = 'asdf'
  }

  validateRequest( req: FastifyRequest ) {
    const { authorization } = req.headers
    if ( authorization === this.key ) {
      return true
    }
    return false
  }

  updateKey( new_key: string ) {
    this.key = new_key
    return true
  }
}

export async function routes(app: FastifyInstance, opts: FastifyPluginOptions) {
  const validator = new RequestValidation()

  app.post('/api/keys', async (req: UpdateAPIKeyRequest, res) => {
    const candidate_key = req.body.new_key
    validator.updateKey( candidate_key )
    return { new_key: candidate_key }
  })

  app.post('/api/create_sim', async (req: CreateNewSimRequest, res) => {
    const { body } = req
    const out = await run_sim( body )
    res.code( 200 )
  })

  app.addHook('onRequest', (req, res, done) => {
    if ( validator.validateRequest( req ) ) {
      done()
    } else {
      res.code( 403 )
      done(new Error('Unauthorized API access'))
    }
  })

}
