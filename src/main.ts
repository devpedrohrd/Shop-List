import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipUndefinedProperties: false,
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('Shop List API')
    .setVersion('1.0')
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/', app, documentFactory)

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
