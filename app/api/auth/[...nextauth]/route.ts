import { NEXT_AUTH } from "@/lib/auth";
import NextAuth, { NextAuthOptions } from "next-auth";

const handler = NextAuth(NEXT_AUTH as NextAuthOptions)

export { handler as GET, handler as POST };
