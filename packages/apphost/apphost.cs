#:package Aspire.Hosting.PostgreSQL@13.4.6
#:sdk Aspire.AppHost.Sdk@13.4.6

var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("pgsql").WithDataVolume(isReadOnly: false).WithPgAdmin();
var db = postgres.AddDatabase("diagoriente");

builder.Build().Run();
