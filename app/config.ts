import process from "node:process";
import dotenv from "dotenv";
import { cleanEnv, str } from "envalid";

dotenv.config();

const config = cleanEnv(process.env, {
  DATABASE_URL: str(),
  SESSION_SECRET: str(),
});

export default config;
