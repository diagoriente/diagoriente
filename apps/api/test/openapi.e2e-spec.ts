import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types.js";
import { AppModule } from "../src/app.module.js";
import { setupApiDocumentation } from "../src/platform/openapi/openapi.js";

const apps = new Map<string, INestApplication<App>>();

beforeAll(async () => {
  const initializedApps = await Promise.all(
    ["development", "test", "production"].map(async (nodeEnv) => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      const app: INestApplication<App> = moduleRef.createNestApplication();
      setupApiDocumentation(app, nodeEnv);
      await app.init();

      return [nodeEnv, app] as const;
    }),
  );

  for (const [nodeEnv, app] of initializedApps) {
    apps.set(nodeEnv, app);
  }
});

afterAll(async () => {
  await Promise.all([...apps.values()].map((app) => app.close()));
});

describe("API documentation (e2e)", () => {
  it("serves OpenAPI and Scalar routes in development", async () => {
    const app = apps.get("development");
    if (!app) throw new Error("Development test app was not initialized");

    await request(app.getHttpServer()).get("/openapi.json").expect(200);
    await request(app.getHttpServer()).get("/openapi.yaml").expect(200);
    await request(app.getHttpServer()).get("/docs").expect(200);
  });

  it.each(["test", "production"])("does not serve documentation routes in %s", async (nodeEnv) => {
    const app = apps.get(nodeEnv);
    if (!app) throw new Error(`${nodeEnv} test app was not initialized`);

    await request(app.getHttpServer()).get("/openapi.json").expect(404);
    await request(app.getHttpServer()).get("/openapi.yaml").expect(404);
    await request(app.getHttpServer()).get("/docs").expect(404);
  });
});
