import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  // same-origin in dev, so baseURL can be omitted
  baseURL: process.env.BETTER_AUTH_URL,
})
export const { signUp, signIn, signOut, useSession, getSession } = authClient
