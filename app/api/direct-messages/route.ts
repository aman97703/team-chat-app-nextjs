import { db } from "@/lib/db";
import { getUser } from "@/lib/getUser";
import { DirectMessage } from "@prisma/client";
import { NextResponse } from "next/server";

const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
  try {
    const profile = await getUser();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const conversationid = searchParams.get("conversationid");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!conversationid) {
      return new NextResponse("Invalid Conversation id", { status: 403 });
    }
    let messages: DirectMessage[] = [];
    if (cursor) {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          conversationId: conversationid,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        where: {
          conversationId: conversationid,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    let nextCursor = null;
    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    }
    return NextResponse.json({
      items: messages,
      nextCursor,
    });
  } catch (error) {
    console.log("[Direct_Messages_get]" + error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
