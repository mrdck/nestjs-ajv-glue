# nestjs-ajv-glue
> This project contains glue code for connecting nestjs pipe validation with AJV

## Installation
```bash
$ npm i --save nestjs-ajv-glue
```

## Usage
Setup validation pipe
```typescript
import { NestFactory } from '@nestjs/core'
import { AjvValidationPipe } from 'nestjs-ajv-glue'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    app.useGlobalPipes(new ValidationPipe())

    await app.listen(port)
}
```

Create AJV schema
```typescript
const schema: JSONSchemaType<Foo> = {
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
```

Decorate handler params with schema

```typescript
import { AjvBody, AjvQuery, AjvParams } from 'nestjs-ajv-glue'

@Controller('/foo')
class FooController {

  @Get()
  filter(@AjvQuery(schema) query: FilterFooRequest): FilterFooRequest {
    return query
  }

  @Post()
  create(@AjvBody(schema) body: CreateFooRequest): string {
    return 'ok'
  }

  @Delete(':id')
  delete(@AjvParams(schema) params: DeleteFooRequest): string {
    return 'ok'
  }
}
```

## Decorators

The following decorators are available:
- `@AjvBody` for validating request body
- `@AjvParams` for validating request params
- `@AjvQuery` for validating request query

## Contributing
Feel free to submit issues and enhancement requests.

## License
MIT
