import { migrate } from "drizzle-orm/node-postgres/migrator";
import db, { pool } from "~/db/db.server";

await migrate(db, { migrationsFolder: "migrations" });
await pool.end();
