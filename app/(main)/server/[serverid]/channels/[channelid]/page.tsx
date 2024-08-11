import ChatHeader from "@/components/chat/chat-header";
import { db } from "@/lib/db";
import { getUser } from "@/lib/getUser";
import { redirectToSignIn } from "@/lib/redirectToSignIn";
import { redirect } from "next/navigation";

interface ChannelPageProps {
  params: {
    serverid: string;
    channelid: string;
  };
}

const ChannelPage = async ({ params }: ChannelPageProps) => {
  const { serverid, channelid } = params;
  const profile = await getUser();

  if (!profile) {
    return redirectToSignIn();
  }

  const channel = await db.channel.findUnique({
    where: {
      id: channelid,
    },
  });

  const member = await db.member.findFirst({
    where: {
      serverId: serverid,
      profileId: profile.id,
    },
  });

  if (!channel || !member) {
    return redirect("/");
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader name={channel.name} serverid={serverid} type="channel" />
    </div>
  );
};

export default ChannelPage;
