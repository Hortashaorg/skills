import { decodeJwt } from "jose";
import { z } from "zod";

export const authDataSchema = z.object({
	sub: z.string().nullable(),
});

export type AuthData = z.infer<typeof authDataSchema>;

export function decodeAuthData(jwt: string | undefined): AuthData | undefined {
	if (!jwt) {
		return undefined;
	}
	return authDataSchema.parse(decodeJwt(jwt));
}
