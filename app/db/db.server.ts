import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from 'pg';

import config from '~/config';
import * as schema from '~/db/schema';

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 5
});

const db = drizzle(pool, { schema });
export default db;
