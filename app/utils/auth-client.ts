import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: "https://whoisyou-sable.vercel.app/"
})
export const { signUp, signIn, signOut, useSession, getSession } = authClient
