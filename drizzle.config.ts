import type { Config } from "drizzle-kit";
import config from "~/config";

export default {
  out: './migrations',
  schema: './app/db/schema.ts',
  dialect: "postgresql",
  dbCredentials: {
    url: config.DATABASE_URL
  },
  breakpoints: true,
  verbose: true,
} satisfies Config
