import NavigationSidebar from "@/components/navigation/navigation-sidebar";
import React from "react";

const ServerLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar/>
      </div>
      <div className="md:pl-[72px] h-full">{children}</div>
    </div>
  );
};

export default ServerLayout;
