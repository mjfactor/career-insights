import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma/prisma"
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: '/', // Using homepage with the auth modal
    error: '/?error=AuthenticationError', // Error page
    verifyRequest: '/?verifyRequest=true', // Email verification sent page
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>, request: Request) {
        // Check if credentials are provided
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Look up user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        // Return null if user doesn't exist or password field is missing
        if (!user || !user.password) {
          return null;
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // Compare provided password with stored hashed password
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        // Return user if password matches, null otherwise
        return passwordMatch ? user : null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For credentials provider, email verification is checked in authorize function
      if (account?.provider === "credentials") {
        return true;
      }

      // For Google OAuth sign-ins
      if (account?.provider === "google" && profile) {
        // Find existing user with the same email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email ?? "" }
        });

        // If user exists, update their profile with Google data
        if (existingUser) {
          // Update user profile
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: profile.name || user.name,
              image: profile.picture || user.image,
              // For OAuth logins, we verify the email automatically if not already verified
              emailVerified: existingUser.emailVerified || new Date(),
            },
          });
          return true;
        } else {
          // For new users via Google OAuth, email is automatically verified
          // We'll let the linkAccount event handle setting emailVerified
          return true;
        }
      }

      // For all other cases, check if the email is verified
      if (user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        return !!(dbUser?.emailVerified);
      }

      return false;
    },
    async session({ session, token }) {
      // Copy the token sub to the user id
      if (session?.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      // If user is provided, it's a sign-in event
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  events: {
    async linkAccount({ user }) {
      // When an OAuth account is linked, mark email as verified
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });
    }
  }
})