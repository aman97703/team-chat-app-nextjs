import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";

export const NEXT_AUTH = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.NEXT_GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session }: { session: any }) {
      try {
        if (session.user) {
          const user = await db.profile.findUnique({
            where: {
              email: session.user.email!,
            },
          });
          if (user) {
            session.user = user;
            return session;
          } else {
            throw new Error("User not found");
          }
        } else {
          throw new Error("Invalid session");
        }
      } catch (error) {
        console.log(error);
        throw new Error("Invalid session");
      }
    },
    async signIn({ profile }: { profile: any }) {
      try {
        const user = await db.profile.findUnique({
          where: {
            email: profile?.email,
          },
        });

        if (!user && profile) {
          await db.profile.create({
            data: {
              name: profile.name,
              email: profile.email,
              imageUrl: profile.picture,
              userId: profile.sub,
            },
          });
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
