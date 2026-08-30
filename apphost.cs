#:sdk Aspire.AppHost.Sdk@13.5.3
#:package Aspire.Hosting.AppHost@13.5.3
#:package Aspire.Hosting.JavaScript@13.5.3
#:package Aspire.Hosting.Redis@13.5.3
#:package Aspire.Hosting.PostgreSQL@13.5.3
#:property AspireUseCliBundle=true

using Aspire.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

var redis = builder.AddRedis("redis")
  .WithImageTag("alpine");

var postgres = builder.AddPostgres("postgres")
  .WithDataVolume()
  .WithPgWeb();

var database = postgres.AddDatabase("zenith");

builder.AddExecutable("api", "moon", ".", "run", "api:dev")
  .WithHttpEndpoint(targetPort: 3000, env: "PORT")
  .WithHttpHealthCheck("/")
  .WithExternalHttpEndpoints()
  .WithReference(redis)
  .WithReference(database);

builder.Build().Run();
