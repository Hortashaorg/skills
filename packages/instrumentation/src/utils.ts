import { metrics, trace } from "@opentelemetry/api";
import type { Meter, Tracer } from "@opentelemetry/api";

export function getTracer(name: string): Tracer {
	return trace.getTracer(name);
}

export function getMeter(name: string): Meter {
	return metrics.getMeter(name);
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
