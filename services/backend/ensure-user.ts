import { throwError } from "@package/common";
import { sql } from "./util.ts";

export const ensureUser = async (email: string) => {
	const account = await sql.begin(async (tx) => {
		// Check if user exists
		const [existing] = await tx<
			Array<{ id: string; email: string; name: string | null }>
		>`
			SELECT id, email, name
			FROM account
			WHERE email = ${email}
		`;

		if (existing) {
			return existing;
		}

		// Create new user
		const id = crypto.randomUUID();
		const now = new Date();

		const [inserted] = await tx<
			Array<{ id: string; email: string; name: string | null }>
		>`
			INSERT INTO account (id, email, created_at, updated_at)
			VALUES (${id}, ${email}, ${now}, ${now})
			RETURNING id, email, name
		`;

		return inserted ?? throwError("Failed to create account");
	});

	return account;
};
