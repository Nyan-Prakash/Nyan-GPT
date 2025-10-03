import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  // same-origin in dev, so baseURL can be omitted
  baseURL: 'https://whoisyou-sable.vercel.app',
})
export const { signUp, signIn, signOut, useSession, getSession } = authClient
