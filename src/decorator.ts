import { createParamDecorator, ExecutionContext } from '@nestjs/common'

interface Request {
  body: unknown
  params: unknown
  query: unknown
}

/**
 * Decorate body with AJV Schema
 */
export const AjvBody = createParamDecorator((schema: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>()

  return request.body
})

/**
 * Decorate query with AJV Schema
 */
export const AjvQuery = createParamDecorator((schema: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>()

  return request.query
})

/**
 * Decorate params with AJV Schema
 */
export const AjvParams = createParamDecorator((schema: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>()

  return request.params
})
