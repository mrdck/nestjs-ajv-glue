import Ajv, { JSONSchemaType } from 'ajv'
import { ArgumentMetadata, BadRequestException } from '@nestjs/common'

import { AjvValidationPipe, MissingSchemaError } from '../src'

interface ValidationSchema {
  foo: string
  bar: string
}

const valid = {
  foo: 'test',
  bar: 'test2',
}

const invalid = {
  baz: 'invalid',
}

const schema: JSONSchemaType<ValidationSchema> = {
  type:                 'object',
  additionalProperties: false,

  properties: {
    foo: {
      type: 'string',
    },
    bar: {
      type: 'string',
    },
  },

  required: ['foo', 'bar'],
}

const metadata = {
  data:     schema,
  metatype: undefined,
  type:     'body',
} as unknown as ArgumentMetadata

describe('Validation', () => {
  let validator: AjvValidationPipe

  test('validation success test', () => {
    validator = new AjvValidationPipe()

    expect(() => validator.transform(valid, metadata)).not.toThrow()
  })

  test('validation failure test', () => {
    validator = new AjvValidationPipe()

    expect(() => validator.transform(invalid, metadata)).toThrow(BadRequestException)
  })

  test('passing Ajv instance', () => {
    const ajv = new Ajv()
    const compileFn = jest.spyOn(ajv, 'compile')

    validator = new AjvValidationPipe(ajv)

    expect(() => validator.transform(invalid, metadata)).toThrow(BadRequestException)
    expect(compileFn).toHaveBeenCalledWith(metadata.data)
  })

  test('missing schema', () => {
    validator = new AjvValidationPipe()

    expect(() => validator.transform(invalid, { ...metadata, data: undefined })).toThrow(MissingSchemaError)
  })
})
