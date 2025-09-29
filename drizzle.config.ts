import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './app/db/auth-schema.ts',
  out: './drizzle',
  dbCredentials: { url: "postgresql://postgres:1234@db.zyicmjhmbfbucypjqpch.supabase.co:5432/postgres" },
})
