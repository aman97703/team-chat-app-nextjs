import { db } from "@/lib/db";
import { getUser } from "@/lib/getUser";
import { ChannelType, MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";
import ServerHeader from "./server-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ServerSearch from "./server-serach";
import { Hash, ShieldAlert, ShieldCheck } from "lucide-react";
import ServerSection from "./server-section";
import ServerChannel from "./server-channel";
import ServerMember from "./server-member";

interface ServerSidebarProps {
  serverid: string;
}

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />,
};

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

  const members = server.members.filter(
    (member) => member.profileId !== user.id
  );

  const role = server.members.find(
    (member) => member.profileId === user.id
  )?.role;

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2b2d31] bg-[#f2f3f5]">
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Channels",
                type: "channel",
                data: textChanels.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members.map((member) => ({
                  id: member.id,
                  name: member.profile.name,
                  icon: roleIconMap[member.role],
                })),
              },
            ]}
          />
        </div>
        <Separator className="bg-zinc-500 dark:bg-zinc-700 rounded-md my-2" />
        {!!textChanels.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channel"
              channelType={ChannelType.TEXT}
              role={role}
              label="Channels"
              server={server}
            />
            <div className="space-y-[2px]">
              {textChanels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  role={role}
                  channel={channel}
                  server={server}
                />
              ))}
            </div>
          </div>
        )}

        {!!members.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="member"
              channelType={ChannelType.TEXT}
              role={role}
              label="Members"
              server={server}
            />
            <div className="space-y-[2px]">
              {members.map((member) => (
                <ServerMember key={member.id} server={server} member={member} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ServerSidebar;
