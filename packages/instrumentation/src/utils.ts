import { metrics, trace } from "@opentelemetry/api";
import type { Meter, Tracer } from "@opentelemetry/api";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import type { LogAttributes } from "@opentelemetry/api-logs";

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

function formatAttributes(attributes?: LogAttributes): string {
	if (!attributes || Object.keys(attributes).length === 0) return "";
	return ` ${JSON.stringify(attributes)}`;
}

export function createLogger(name: string): Logger {
	const otelLogger = logs.getLogger(name);

	const emit = (
		severityNumber: SeverityNumber,
		consoleMethod: "debug" | "info" | "warn" | "error",
		message: string,
		attributes?: LogAttributes
	) => {
		console[consoleMethod](`[${name}] ${message}${formatAttributes(attributes)}`);

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

export { metrics, trace } from "@opentelemetry/api";
export type {
	Counter,
	Histogram,
	Meter,
	Span,
	Tracer,
} from "@opentelemetry/api";
export { SpanStatusCode } from "@opentelemetry/api";
