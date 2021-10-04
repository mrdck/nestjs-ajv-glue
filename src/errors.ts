export class MissingSchemaError extends Error {
  constructor() {
    super('AJV schema is missing')
  }
}
