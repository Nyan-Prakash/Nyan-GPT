import 'dotenv/config'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',       // honors sslmode=require
  prepare: false,       // important for Supabase pooler
})
export const db = drizzle(sql)
