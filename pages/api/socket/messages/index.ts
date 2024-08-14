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
    const { channelid, serverid,userid } = req.query;
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
    if (!serverid) {
      return res.status(400).json({ message: "Invalid server ID" });
    }
    if (!channelid) {
      return res.status(400).json({ message: "Invalid channel ID" });
    }
    if (!content) {
      return res.status(400).json({ message: "Invalid message" });
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

    const message = await db.message.create({
      data: {
        content: content,
        fileUrl: fileUrl,
        channelId: channelid as string,
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

    const channelKey = `chat:${channelid}:messages`;
    res?.socket?.server?.io?.emit(channelKey, message);
    return res.status(200).json({ message: message });
  } catch (error) {
    console.log("[MESSAGES_POST] Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
