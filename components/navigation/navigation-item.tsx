"use client";
import React from "react";
import ActionTooltip from "../action-tooltip";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface NatigationItemProps {
  id: string;
  imageUrl: string;
  name: string;
}

const NatigationItem = ({ id, imageUrl, name }: NatigationItemProps) => {
  const params = useParams<{ serverid: string }>();
  const router = useRouter();
  const onClick = () => {
    router.push(`/server/${id}`);
    window.scrollTo(0, 0);
  };
  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button onClick={onClick} className="group relative flex items-center ">
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition w-[4px]",
            params?.serverid !== id && "group-hover:h-[20px]",
            params?.serverid === id ? "h-[36px]" : "h-2"
          )}
        />
        <div
          className={cn(
            "relative group mx-3 flex h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            params?.serverid === id &&
              "bg-primary/10 text-primary rounded-[16px]"
          )}
        >
          <Image fill src={imageUrl} alt="Channel" className="bg-white" />
        </div>
      </button>
    </ActionTooltip>
  );
};

export default NatigationItem;
