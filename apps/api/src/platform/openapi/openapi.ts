import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";

export function setupApiDocumentation(app: INestApplication, nodeEnv: string): void {
  if (nodeEnv !== "development") {
    return;
  }

  const config = new DocumentBuilder().build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("", app, documentFactory, {
    ui: false,
    jsonDocumentUrl: "openapi.json",
    yamlDocumentUrl: "openapi.yaml",
  });

  app.use("/docs", apiReference({ url: "/openapi.json" }));
}
