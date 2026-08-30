import { StandardSchemaValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new StandardSchemaValidationPipe({ transform: true }));

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>("PORT");

  const config = new DocumentBuilder().build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("", app, documentFactory, {
    ui: false,
    jsonDocumentUrl: "openapi.json",
    yamlDocumentUrl: "openapi.yaml",
  });

  app.use("/docs", apiReference({ url: "/openapi.json" }));

  await app.listen(port);
}

await bootstrap();
