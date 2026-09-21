import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      providers: [],
      useFactory: async (configService: ConfigService) => {
        const isDevelopment = configService.getOrThrow<string>("NODE_ENV") === "development";

        let prettyStream;

        if (isDevelopment) {
          const { default: pinoPretty } = await import("pino-pretty");
          prettyStream = pinoPretty({
            colorize: true,
            singleLine: true,
            translateTime: "SYS:standard",
          });
        }

        return {
          pinoHttp: {
            level: configService.getOrThrow<string>("LOG_LEVEL"),
            stream: prettyStream,
            serializers: {
              req: (request) => ({
                id: request.id,
                method: request.method,
                url: request.url,
                remoteAddress: request.remoteAddress,
              }),
              res: (response) => ({ statusCode: response.statusCode }),
            },
            customLogLevel: (_request, response, error) => {
              if (error || response.statusCode >= 500) return "error";
              if (response.statusCode >= 400) return "warn";
              return "silent";
            },
          },
        };
      },
    }),
  ],
})
export class AppLoggerModule {}
