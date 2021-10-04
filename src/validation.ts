import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'

import Ajv from 'ajv'

import { MissingSchemaError } from './errors'

@Injectable()
export class AjvValidationPipe implements PipeTransform {
  private ajv: Ajv

  constructor(ajv?: Ajv) {
    if (!ajv) {
      ajv = new Ajv()
    }

    this.ajv = ajv
  }

  transform<T>(input: T, metadata: ArgumentMetadata): T {
    if (!metadata.data) {
      throw new MissingSchemaError()
    }

    const isValid = this.ajv.validate(metadata.data, input)

    if (!isValid) {
      throw new BadRequestException(this.ajv.errors)
    }

    return input
  }
}
