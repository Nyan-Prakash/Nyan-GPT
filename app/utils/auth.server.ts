import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { db } from "../db/client";              // your drizzle client
import * as schema from "../db/auth-schema";    // 👈 import the generated tables

export const auth = betterAuth({
  basePath: "/api/auth",
  database: drizzleAdapter(db as PostgresJsDatabase, {
    provider: "pg",
    schema,              // 👈 give BetterAuth your tables
    usePlural: true,     // 👈 schema exports are `users`, `sessions`, etc.
  }),
  emailAndPassword: { enabled: true },
  trustedOrigins: ["http://localhost:5173"],
  cookies: {
    sessionToken: { name: "better-auth.session", sameSite: "lax", secure: false },
  },
});
