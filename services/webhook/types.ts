export type ZitadelEvent = {
	aggregateID: string;
	aggregateType: string;
	resourceOwner: string;
	instanceID: string;
	event_type: string;
	event_payload?: {
		idpConfigId?: string;
		userId?: string;
		displayName?: string;
		email?: string;
	};
};

export type ActionsV2Payload = {
	fullMethod: string;
	instanceID: string;
	orgID: string;
	userID: string;
	request: Record<string, unknown>;
	response: {
		idpInformation?: {
			oauth?: {
				accessToken: string;
				idToken?: string;
			};
			idpId?: string;
			userId?: string;
			userName?: string;
			rawInformation?: {
				User?: Record<string, unknown>;
			} & Record<string, unknown>;
		};
	};
};
