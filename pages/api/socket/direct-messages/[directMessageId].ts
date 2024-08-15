import { db } from "@/lib/db";
import { NextApiResponseServerIO } from "@/types";
import { MemberRole } from "@prisma/client";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const { userid, directMessageId, conversationid } = req.query;
    const { content } = req.body;
    if (!userid) {
      return res.status(401).json({ message: "User id not found" });
    }
    const profile = await db.profile.findUnique({
      where: {
        id: userid as string,
      },
    });
    if (!directMessageId) {
      return res.status(401).json({ message: "Invalid message id" });
    }
    if (!conversationid) {
      return res.status(401).json({ message: "Invalid Conversation id" });
    }
    if (!profile) {
      return res.status(401).json({ message: "Unauthorized" });
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
    if(!conversation){
      return res.status(404).json({ message: "Conversation not found" });
    }

    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;
    if (!member) {
      return res.status(403).json({ message: "Forbidden" });
    }

    let message = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationid as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });
    if (!message || message.deleted) {
      return res.status(404).json({ message: "Forbidden" });
    }

    const isMessageOwner = message.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;

    const canMessageModify = isMessageOwner || isAdmin || isModerator;

    if (!canMessageModify) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.method === "DELETE") {
      message = await db.directMessage.update({
        where: {
          id: directMessageId as string,
        },
        data: {
          fileUrl: null,
          content: "This message has been deleted.",
          deleted: true,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }
    if (req.method === "PATCH") {
      if (!isMessageOwner) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      message = await db.directMessage.update({
        where: {
          id: directMessageId as string,
        },
        data: {
          content: content,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    const updateKey = `chat:${conversationid}:messages:update`;

    res?.socket?.server?.io?.emit(updateKey, message);
    return res.status(200).json({ message: message });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
