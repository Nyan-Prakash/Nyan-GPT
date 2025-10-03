import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { db } from "../db/client";            
import * as schema from "../db/auth-schema";    

export const auth = betterAuth({
  basePath: "/api/auth",
  database: drizzleAdapter(db as PostgresJsDatabase, {
    provider: "pg",
    schema,             
    usePlural: true,    
  }),
  emailAndPassword: { enabled: true },
  trustedOrigins: ["https://whoisyou-git-whoisyou-nyan-prakashs-projects.vercel.app"],
  cookies: {
    sessionToken: { name: "better-auth.session", sameSite: "lax", secure: false },
  },
  socialProviders: {
      google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }, 
      github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
        discord: { 
            clientId: process.env.DISCORD_CLIENT_ID as string, 
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string, 
        }, 
  }
});
