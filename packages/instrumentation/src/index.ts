import { createSDK } from "./setup.ts";

const otlpEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://otel:4317";
const serviceName = process.env.OTEL_SERVICE_NAME ?? "unknown-service";
const enabled = process.env.OTEL_ENABLED !== "false";

if (enabled) {
  const sdk = createSDK({
    serviceName,
    otlpEndpoint,
  });

  sdk.start();

  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => console.log("OpenTelemetry SDK shut down"))
      .catch((error) =>
        console.error("Error shutting down OpenTelemetry SDK", error)
      )
      .finally(() => process.exit(0));
  });

  console.log(`OpenTelemetry initialized for ${serviceName}`);
}
