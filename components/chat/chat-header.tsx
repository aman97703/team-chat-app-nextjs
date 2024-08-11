import { Hash } from "lucide-react";
import MobileToggle from "@/components/mobile-toggle";
import UserAvatar from "../user-avatar";

interface ChatHeaderProps {
  serverid: string;
  name: string;
  type: "channel" | "conversation";
  imageUrl?: string;
}

const ChatHeader = ({ name, serverid, type, imageUrl }: ChatHeaderProps) => {
  return (
    <div className="text-base font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2">
      <MobileToggle serverid={serverid} />
      {type === "channel" && (
        <Hash className="h-5 w-5 text-zinc-500 dark:text-zinc-400 mr-2" />
      )}
      {type === "conversation" && (
        <UserAvatar
          src={imageUrl}
          name={name}
          className="h-8 w-8 md:w-8 md:h-8 mr-2"
        />
      )}
      <p className="font-semibold text-base text-black dark:text-white">
        {name}
      </p>
    </div>
  );
};

export default ChatHeader;
