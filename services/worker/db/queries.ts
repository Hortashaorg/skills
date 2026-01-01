import { type dbProvider, type Registry, zql } from "@package/database/server";

type Transaction = Parameters<Parameters<typeof dbProvider.transaction>[0]>[0];

/** Find a package by name and registry */
export async function findPackage(
	tx: Transaction,
	name: string,
	registry: Registry,
) {
	return tx.run(
		zql.packages.where("name", name).where("registry", registry).one(),
	);
}
