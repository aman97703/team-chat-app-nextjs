"use server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/getUser";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function createServerAction(name: string, imageUrl: string) {
  console.log("hiiii");
  try {
    const user = await getUser();
    console.log(user);
    if (!user) return null;
    const server = await db.server.create({
      data: {
        name: name,
        imageUrl: imageUrl,
        profileId: user.id as string,
        inviteCode: uuidv4(),
        channels: {
          create: [{ name: "general", profileId: user.id as string }],
        },
        members: {
          create: [
            {
              profileId: user.id as string,
              role: MemberRole.ADMIN,
            },
          ],
        },
      },
    });
    return {
      success: true,
      server: server,
    };
  } catch (error) {
    return {
      success: true,
      server: "Server error",
    };
  }
}
