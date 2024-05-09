import { drizzle } from "drizzle-orm/node-postgres";
import pg from 'pg';

const { Client } = pg;

import config from '~/config';
import * as schema from '~/db/schema';

export const client = new Client({
  connectionString: config.DATABASE_URL
});

await client.connect();
const db = drizzle(client, { schema });
export default db;
