import { Session } from "next-auth";
import { NextRequest } from "next/server";

export const authConfig = {
  providers: [],
  callbacks: {
    async authorized({
      auth,
      request,
    }: {
      auth: Session | null;
      request: NextRequest;
    }) {
      const user = auth?.user;
      const isVisitingChatPage = request.nextUrl.pathname.startsWith("/dashboard");
      const isVisitingAuthPage =
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/signup") ||
        request.nextUrl.pathname.startsWith("/auth");

      if (!user && isVisitingChatPage) {
        return false;
      }

      if (user && isVisitingAuthPage) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      return true;
    },
  },
};
