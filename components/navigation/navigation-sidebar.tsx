import React from "react";
import { db } from "@/lib/db";
import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";
import NavigationAction from "./navigation-action";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import NatigationItem from "./navigation-item";
import { ModeToggle } from "../mode-toggle";
import UserToggle from "../user-toggle";

const NavigationSidebar = async () => {
  const user = await getUser();
  if (!user) redirect("/");
  const servers = await db.server.findMany({
    where: {
      members: {
        some: {
          profileId: user.id,
        },
      },
    },
  });
  return (
    <div className="space-y-4 flex flex-col items-center h-full  text-primary w-full dark:bg-[#1e1f22] py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full gap-4">
        {servers.map((server) => (
          <div key={server.id}>
            <NatigationItem
              id={server.id}
              imageUrl={server.imageUrl}
              name={server.name}
            />
          </div>
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
        <UserToggle/>
      </div>
    </div>
  );
};

export default NavigationSidebar;
