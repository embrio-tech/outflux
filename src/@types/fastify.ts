// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type fastify from 'fastify'
import type { Model } from 'mongoose'
import type { IEntity, IFrame, ISource } from '../models'

declare module 'fastify' {
  export interface FastifyInstance {
    mongoose: typeof import('mongoose')
    models: {
      Entity: Model<IEntity>
      Frame: Model<IFrame>
      Source: Model<ISource>
    }
    verifyApiKey: (request: FastifyRequest) => Promise<void>
    verifyJw3t: (request: FastifyRequest) => Promise<void>
  }

  export interface FastifyRequest {
    jw3tPayload: unknown
  }
}