import { migrate } from "drizzle-orm/node-postgres/migrator";
import db, { client } from "~/db/db.server";

await migrate(db, { migrationsFolder: "migrations" });
await client.end();
