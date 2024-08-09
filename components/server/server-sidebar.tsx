import { db } from "@/lib/db";
import { getUser } from "@/lib/getUser";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";
import ServerHeader from "./server-header";

interface ServerSidebarProps {
  serverid: string;
}

const ServerSidebar = async ({ serverid }: ServerSidebarProps) => {
  const user = await getUser();

  const server = await db.server.findUnique({
    where: {
      id: serverid,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: "asc",
        },
      },
    },
  });

  if (!server) {
    return redirect("/");
  }

  const textChanels = server.channels.filter(
    (channel) => channel.type === ChannelType.TEXT
  );

  const audioChanels = server.channels.filter(
    (channel) => channel.type === ChannelType.AUDIO
  );

  const videoChanels = server.channels.filter(
    (channel) => channel.type === ChannelType.VIDEO
  );

  const members = server.members.filter(
    (member) => member.profileId !== user.id
  );

  const role = server.members.find(
    (member) => member.profileId === user.id
  )?.role;

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2b2d31] bg-[#f2f3f5]">
      <ServerHeader server={server} role={role} />
    </div>
  );
};

export default ServerSidebar;
