import { redirect } from "next/navigation";

export async function redirectToSignIn() {
  redirect("/api/auth/signin");
}
