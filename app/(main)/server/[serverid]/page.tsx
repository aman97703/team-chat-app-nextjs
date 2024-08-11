import { db } from "@/lib/db";
import { getUser } from "@/lib/getUser";
import { redirectToSignIn } from "@/lib/redirectToSignIn";
import { redirect } from "next/navigation";
import React from "react";

interface ServerPageProps {
  params: {
    serverid: string;
  };
}

const ServerPage = async ({ params }: ServerPageProps) => {
  const profile = await getUser();
  if (!profile) {
    return redirectToSignIn();
  }
  const { serverid } = params;
  const server = await db.server.findUnique({
    where: {
      id: serverid,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        where: {
          name: "general",
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  const initialChannel = server?.channels[0];
  if (initialChannel?.name !== "general") {
    return null;
  }
  return redirect(`/server/${params.serverid}/channels/${initialChannel.id}`);
};

export default ServerPage;
