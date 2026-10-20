import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { getPool, databaseConfigured } from "./db";
function createAuth() {
  return betterAuth({
    database: getPool(),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 50 },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    plugins: [nextCookies()],
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  if (!databaseConfigured()) throw new Error("Account setup is pending.");
  if (instance) return instance;
  return (instance = createAuth());
}
