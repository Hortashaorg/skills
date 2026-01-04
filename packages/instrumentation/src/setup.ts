import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-grpc";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

export interface InstrumentationConfig {
	serviceName: string;
	serviceVersion?: string;
	otlpEndpoint: string;
}

export function createSDK(config: InstrumentationConfig): NodeSDK {
	const resource = resourceFromAttributes({
		[ATTR_SERVICE_NAME]: config.serviceName,
		[ATTR_SERVICE_VERSION]: config.serviceVersion ?? "1.0.0",
	});

	const traceExporter = new OTLPTraceExporter({
		url: config.otlpEndpoint,
	});

	const metricExporter = new OTLPMetricExporter({
		url: config.otlpEndpoint,
	});

	const metricReader = new PeriodicExportingMetricReader({
		exporter: metricExporter,
		exportIntervalMillis: 30_000,
	});

	const logExporter = new OTLPLogExporter({
		url: config.otlpEndpoint,
	});

	const logRecordProcessor = new BatchLogRecordProcessor(logExporter);

	return new NodeSDK({
		resource,
		traceExporter,
		metricReader,
		logRecordProcessor,
		instrumentations: [new HttpInstrumentation(), new UndiciInstrumentation()],
	});
}
