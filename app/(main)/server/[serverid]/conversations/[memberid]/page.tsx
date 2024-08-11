import ChatHeader from "@/components/chat/chat-header";
import { getOrCreateConversation } from "@/lib/actions/conversation";
import { db } from "@/lib/db";
import { getUser } from "@/lib/getUser";
import { redirectToSignIn } from "@/lib/redirectToSignIn";
import { redirect } from "next/navigation";

interface ConversationPageProps {
  params: {
    memberid: string;
    serverid: string;
  };
}

const ConversationPage = async ({ params }: ConversationPageProps) => {
  const { memberid, serverid } = params;
  const user = await getUser();
  if (!user) {
    return redirectToSignIn();
  }

  const currentMember = await db.member.findFirst({
    where: {
      serverId: serverid,
      profileId: user.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) {
    return redirect("/");
  }

  const conversation = await getOrCreateConversation(
    currentMember.id,
    memberid
  );

  if (!conversation) {
    return redirect(`/server/${serverid}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember = memberOne.profileId === user.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={otherMember.profile.name}
        serverid={serverid}
        type="conversation"
        imageUrl={otherMember.profile.imageUrl}
      />
    </div>
  );
};

export default ConversationPage;
