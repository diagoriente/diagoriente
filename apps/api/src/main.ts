import { StandardSchemaValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module.js";
import { setupApiDocumentation } from "./platform/openapi/openapi.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new StandardSchemaValidationPipe({ transform: true }));

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>("PORT");

  setupApiDocumentation(app, configService.getOrThrow<string>("NODE_ENV"));

  await app.listen(port);
}

await bootstrap();
