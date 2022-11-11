import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from "~/server/prisma";
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
    session: {
      strategy: 'jwt'
    },
    jwt: {
      maxAge: 60 * 60 * 24
    },
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
              email: { label: "Email", type: "text", placeholder: "john@smith.com" },
              password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
              if (!credentials) return null
              const { email, password } = credentials
              
              const user = await prisma.user.findUnique({
                where: {
                  email
                }
              })

              if (!user || !user.password) return null

              const verified = await bcrypt.compare(password, user.password)

              if (!verified) return null
              
              return {
                id: String(user.id),
                email,
                name: user.name
              }
            },
        }),
    ],
    callbacks: {
      async signIn({ user, account, profile, email, credentials }) {
        // whether or not the user is allowed to log in
        if (user.id) return true
        return false
      },
      async jwt({ token, user, account, profile}) {
        return token
      },
      async redirect({ url, baseUrl }) {
        // Allows relative callback URLs
        if (url.startsWith("/")) return `${baseUrl}${url}`
        // Allows callback URLs on the same origin
        else if (new URL(url).origin === baseUrl) return url
        return baseUrl
      }
    }
    
}

export default (req, res) => NextAuth(req, res, authOptions)