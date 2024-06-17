import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;

import config from "~/config";
import * as schema from "~/db/schema";

export const pool = new Pool({
	connectionString: config.DATABASE_URL,
	max: 5,
});

const db = drizzle(pool, { schema });
export default db;
