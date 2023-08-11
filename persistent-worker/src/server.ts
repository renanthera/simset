import Fastify from 'fastify'
import { routes } from '~/routes/routes'

const fastify = Fastify({
  logger: true
})

fastify.register(routes)

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
