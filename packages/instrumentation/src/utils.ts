import type { Meter, Tracer } from "@opentelemetry/api";
import { metrics, trace } from "@opentelemetry/api";
import type { LogAttributes } from "@opentelemetry/api-logs";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import pino from "pino";

export function getTracer(name: string): Tracer {
	return trace.getTracer(name);
}

export function getMeter(name: string): Meter {
	return metrics.getMeter(name);
}

export interface Logger {
	debug(message: string, attributes?: LogAttributes): void;
	info(message: string, attributes?: LogAttributes): void;
	warn(message: string, attributes?: LogAttributes): void;
	error(message: string, attributes?: LogAttributes): void;
}

const pinoLogger = pino({
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
		},
	},
});

export function createLogger(name: string): Logger {
	const otelLogger = logs.getLogger(name);
	const child = pinoLogger.child({ name });

	const emit = (
		severityNumber: SeverityNumber,
		level: "debug" | "info" | "warn" | "error",
		message: string,
		attributes?: LogAttributes,
	) => {
		child[level](attributes ?? {}, message);

		otelLogger.emit({
			severityNumber,
			body: message,
			attributes,
		});
	};

	return {
		debug: (message, attributes) =>
			emit(SeverityNumber.DEBUG, "debug", message, attributes),
		info: (message, attributes) =>
			emit(SeverityNumber.INFO, "info", message, attributes),
		warn: (message, attributes) =>
			emit(SeverityNumber.WARN, "warn", message, attributes),
		error: (message, attributes) =>
			emit(SeverityNumber.ERROR, "error", message, attributes),
	};
}

export type {
	Counter,
	Histogram,
	Meter,
	Span,
	Tracer,
} from "@opentelemetry/api";
export { metrics, SpanStatusCode, trace } from "@opentelemetry/api";
