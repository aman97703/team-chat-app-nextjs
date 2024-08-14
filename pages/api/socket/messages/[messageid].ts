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
    const { channelid, serverid, userid, messageid } = req.query;
    const { content } = req.body;
    if (!userid) {
      return res.status(401).json({ message: "User id not found" });
    }
    const profile = await db.profile.findUnique({
      where: {
        id: userid as string,
      },
    });
    if (!messageid) {
      return res.status(401).json({ message: "Invalid message id" });
    }
    if (!profile) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!serverid) {
      return res.status(400).json({ message: "Invalid server ID" });
    }
    if (!channelid) {
      return res.status(400).json({ message: "Invalid channel ID" });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverid as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelid as string,
        serverId: serverid as string,
      },
    });
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    const member = server.members.find((mbr) => mbr.profileId === profile.id);
    if (!member) {
      return res.status(403).json({ message: "Forbidden" });
    }
    let message = await db.message.findFirst({
      where: {
        channelId: channelid as string,
        id: messageid as string,
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
      message = await db.message.update({
        where: {
          id: messageid as string,
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
      message = await db.message.update({
        where: {
          id: messageid as string,
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

    const updateKey = `chat:${channelid}_nessages:update`;

    res?.socket?.server?.io?.emit(updateKey, message);
    return res.status(200).json({ message: message });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
