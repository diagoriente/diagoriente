import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AppConfigModule } from "./platform/config/config.module.js";
import { AppHealthModule } from "./platform/health/health.module.js";
import { AppLoggerModule } from "./platform/logging/logger.module.js";

@Module({
  imports: [AppConfigModule, AppLoggerModule, AppHealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
