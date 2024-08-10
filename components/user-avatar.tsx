import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  className?: string;
  name?: string;
}
const UserAvatar = ({ src, className, name }: UserAvatarProps) => {
  return (
    <Avatar className={cn("h-7 w-7 md:h-10 md:w-10 bg-white", className)}>
      <AvatarImage className="" src={src} alt="@shadcn" />
      {name && (
        <AvatarFallback className="bg-white border-gray-500 border">
          {name.at(0)?.toUpperCase()}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
