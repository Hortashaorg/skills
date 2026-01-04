import { Match, Switch } from "solid-js";
import { Badge } from "@/components/ui/badge";

export type ConnectionStatusProps = {
	state:
		| "connected"
		| "connecting"
		| "disconnected"
		| "needs-auth"
		| "error"
		| "closed";
};

export const ConnectionStatus = (props: ConnectionStatusProps) => {
	return (
		<Switch>
			<Match when={props.state === "connecting"}>
				<Badge variant="info" size="sm">
					Connecting...
				</Badge>
			</Match>
			<Match when={props.state === "disconnected"}>
				<Badge variant="warning" size="sm">
					Offline
				</Badge>
			</Match>
			<Match when={props.state === "needs-auth"}>
				<Badge variant="info" size="sm">
					Refreshing...
				</Badge>
			</Match>
			<Match when={props.state === "error"}>
				<Badge variant="danger" size="sm">
					Connection Error
				</Badge>
			</Match>
		</Switch>
	);
};
