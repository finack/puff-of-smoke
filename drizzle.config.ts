import type { Config } from "drizzle-kit";
import config from "~/config";

export default {
  out: './migrations',
  schema: './app/db/schema.ts',
  driver: "pg",
  dbCredentials: {
    connectionString: config.DATABASE_URL
  },
  breakpoints: true,
  verbose: true,
} satisfies Config
