import type { NodeSDK } from "@opentelemetry/sdk-node";
import { createSDK } from "./setup.ts";

const otlpEndpoint =
	process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://otel:4317";
const serviceName = process.env.OTEL_SERVICE_NAME ?? "unknown-service";
const enabled = process.env.OTEL_ENABLED !== "false";

let sdk: NodeSDK | null = null;

if (enabled) {
	sdk = createSDK({
		serviceName,
		otlpEndpoint,
	});

	sdk.start();

	process.on("SIGTERM", () => {
		let exitCode = 0;
		sdk
			?.shutdown()
			.then(() => console.log("OpenTelemetry SDK shut down"))
			.catch((error: unknown) => {
				console.error("Error shutting down OpenTelemetry SDK", error);
				exitCode = 1;
			})
			.finally(() => process.exit(exitCode));
	});

	console.log(`OpenTelemetry initialized for ${serviceName}`);
}

export async function shutdown(): Promise<void> {
	if (sdk) {
		await sdk.shutdown();
	}
}
