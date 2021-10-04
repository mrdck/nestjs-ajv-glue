import supertest from 'supertest'

import { JSONSchemaType } from 'ajv'
import { Controller, Delete, Get, INestApplication, Module, Post } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { AjvBody, AjvParams, AjvQuery, AjvValidationPipe } from '../src'

interface CreateFooRequest {
  bar: string
}

interface FilterFooRequest {
  bar: string
}

interface DeleteFooRequest {
  id: string
}

const createFooSchema: JSONSchemaType<CreateFooRequest> = {
  type:                 'object',
  additionalProperties: false,

  properties: {
    bar: {
      type:      'string',
      minLength: 1,
      maxLength: 3,
    },
  },

  required: ['bar'],
}

const filterFooSchema: JSONSchemaType<CreateFooRequest> = {
  type:                 'object',
  additionalProperties: false,

  properties: {
    bar: {
      type: 'string',
    },
  },

  required: ['bar'],
}

const deleteFooSchema: JSONSchemaType<DeleteFooRequest> = {
  type:                 'object',
  additionalProperties: false,

  properties: {
    id: {
      type:      'string',
      minLength: 36,
      maxLength: 36,
      pattern:   '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    },
  },

  required: ['id'],
}

@Controller('/foo')
class FooController {

  @Get()
  filter(@AjvQuery(filterFooSchema) query: FilterFooRequest): FilterFooRequest {
    return query
  }

  @Post()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(@AjvBody(createFooSchema) body: CreateFooRequest): string {
    return 'ok'
  }

  @Delete(':id')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete(@AjvParams(deleteFooSchema) params: DeleteFooRequest): string {
    return 'ok'
  }
}

@Module({
  controllers: [FooController],
})
class AppModule {}

const setup = async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = module.createNestApplication()
  app.useGlobalPipes(new AjvValidationPipe())

  await app.init()

  return app
}

describe('Decorators', () => {
  let app: INestApplication
  let api: supertest.SuperTest<supertest.Test>

  beforeAll(async () => {
    app = await setup()
    api = supertest(app.getHttpServer())
  })

  afterAll(() => app.close())

  describe('@AjvBody()', () => {
    test('invalid request', async () => {
      const response = await api.post('/foo').send({ baz: 'invalid' })

      expect(response.status).toEqual(400)
      expect(response.body).toEqual({
        error:   'Bad Request',
        message: [
          {
            instancePath: '',
            keyword:      'required',
            message:      "must have required property 'bar'",
            params:       {
              missingProperty: 'bar',
            },
            schemaPath: '#/required',
          },
        ],
        statusCode: 400,
      })
    })

    test('valid request', async () => {
      const response = await api.post('/foo').send({ bar: 'foo' })

      expect(response.status).toEqual(201)
    })
  })

  describe('@AjvParams()', () => {
    test('invalid request', async () => {
      const response = await api.delete('/foo/invalid').send()

      expect(response.status).toEqual(400)
      expect(response.body).toEqual({
        error:   'Bad Request',
        message: [
          {
            instancePath: '/id',
            keyword:      'minLength',
            message:      'must NOT have fewer than 36 characters',
            params:       {
              limit: 36,
            },
            schemaPath: '#/properties/id/minLength',
          },
        ],
        statusCode: 400,
      })
    })

    test('valid request', async () => {
      const response = await api.delete('/foo/7d328d82-c786-48c8-80da-9d59122dfaae').send()

      expect(response.status).toEqual(200)
    })
  })

  describe('@AjvQuery()', () => {
    test('invalid request', async () => {
      const response = await api.get('/foo?invalid=1234').send()

      expect(response.status).toEqual(400)
      expect(response.body).toEqual({
        error:   'Bad Request',
        message: [
          {
            instancePath: '',
            keyword:      'required',
            message:      "must have required property 'bar'",
            params:       {
              missingProperty: 'bar',
            },
            schemaPath: '#/required',
          },
        ],
        statusCode: 400,
      })
    })

    test('valid request', async () => {
      const response = await api.get('/foo?bar=valid').send()

      expect(response.status).toEqual(200)
    })
  })
})
