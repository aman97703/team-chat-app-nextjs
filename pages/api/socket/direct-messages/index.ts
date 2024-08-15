"use server";
import { db } from "@/lib/db";
// import { getUser } from "@/lib/getUser";
import { NextApiResponseServerIO } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    // const profile = await getUser();
    const { content, fileUrl } = req.body;
    const { userid, conversationid } = req.query;
    if (!userid) {
      return res.status(401).json({ message: "User id not found" });
    }
    const profile = await db.profile.findUnique({
      where: {
        id: userid as string,
      },
    });
    if (!profile) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!conversationid) {
      return res.status(400).json({ message: "Invalid Conversation ID" });
    }

    if (!content) {
      return res.status(400).json({ message: "Invalid message" });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationid as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;
    if (!member) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const message = await db.directMessage.create({
      data: {
        content: content,
        fileUrl: fileUrl,
        conversationId: conversationid as string,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${conversationid}:messages`;
    res?.socket?.server?.io?.emit(channelKey, message);
    return res.status(200).json({ message: message });
  } catch (error) {
    console.log("[DIRECT_MESSAGES_POST] Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
