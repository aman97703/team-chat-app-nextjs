import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "./auth";

export async function getUser() {
  const session = await getServerSession(NEXT_AUTH);
  if (session && session.user) {
    return session.user;
  }
  return null;
}
