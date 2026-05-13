import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      balance?: {
        availableBalance: number;
        holdingBalance: number;
        withdrawBalance: number;
      };
    };
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingBalance = await prisma.balance.findUnique({
          where: { userId: user.id }
        });
        
        if (!existingBalance) {
          await prisma.balance.create({
            data: {
              userId: user.id,
              holdingBalance: 0,
              availableBalance: 0,
              withdrawBalance: 0,
            }
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { balances: true }
        });
        session.user.id = token.sub;
        session.user.role = user?.role || "USER";
        session.user.balance = user?.balances[0];
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari 
  },
  secret: process.env.NEXTAUTH_SECRET,
};
