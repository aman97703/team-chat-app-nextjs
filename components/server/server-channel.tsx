"use client";

import { cn } from "@/lib/utils";
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { Edit, Hash, Lock, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ActionTooltip from "@/components/action-tooltip";
import { ModalType, useModalStore } from "@/hooks/use-modal-store";

interface ServerChannelProps {
  channel: Channel;
  server: Server;
  role?: MemberRole;
}

const iconMap = {
  [ChannelType.TEXT]: Hash,
};

const ServerChannel = ({ channel, server, role }: ServerChannelProps) => {
  const params = useParams();
  const router = useRouter();
  const { onOpen } = useModalStore();

  const Icon = iconMap[channel.type];

  const handleClick = () => {
    router.push(`/server/${params?.serverid}/channels/${channel.id}`);
  };

  const handleAction = (action: ModalType) => {
    onOpen(action, { channel, server });
  };

  return (
    <button
      className={cn(
        "group p-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params?.channelid === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
      )}
      onClick={handleClick}
    >
      <Icon className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
      <p
        className={cn(
          "line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
          params?.channelid === channel.id &&
            "text-primary dark:text-zinc-200 dark:group-hover:text-white"
        )}
      >
        {channel.name}
      </p>
      {channel.name !== "general" && role !== MemberRole.GUEST && (
        <div
          className="ml-auto flex items-center gap-x-2"
          onClick={(e) => e.stopPropagation()}
        >
          <ActionTooltip label="Edit" side="top">
            <Edit
              className="hidden group-hover:block w-4 h-4 text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition"
              onClick={(e) => {
                e.stopPropagation();
                handleAction("editChannel");
              }}
            />
          </ActionTooltip>
          <ActionTooltip label="Delete" side="top">
            <Trash
              className="hidden group-hover:block w-4 h-4 text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition"
              onClick={(e) => {
                e.stopPropagation();
                handleAction("deleteChannel");
              }}
            />
          </ActionTooltip>
        </div>
      )}
      {channel.name === "general" && (
        <Lock
          onClick={(e) => e.stopPropagation()}
          className="ml-auto w-4 h-4 text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition"
        />
      )}
    </button>
  );
};

export default ServerChannel;
