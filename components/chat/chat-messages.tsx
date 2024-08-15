"use client";

import { Member, Message, Profile } from "@prisma/client";
import ChatWelcome from "./chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";
import { Loader2, ServerCrash } from "lucide-react";
import { Fragment, useRef, ElementRef } from "react";
import ChatItem from "./chat-item";
import { format } from "date-fns";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";

interface ChatMessagesProps {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: "channelid" | "conversationid";
  paramValue: string;
  type: "channel" | "conversation";
}

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

const dateFormatter = "d MMMM yyyy HH:mm";

const ChatMessages = ({
  apiUrl,
  chatId,
  member,
  name,
  paramKey,
  type,
  socketQuery,
  socketUrl,
  paramValue,
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;

  const chatRef = useRef<ElementRef<"div">>(null);
  const bottomRef = useRef<ElementRef<"div">>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue: paramValue,
    });

  useChatSocket({
    addKey,
    queryKey,
    updateKey,
  });

  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0,
  });

  if (status === "pending") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xl text-zinc-500 dark:text-zinc-400">
          Loading Messages...
        </p>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xl text-zinc-500 dark:text-zinc-400">
          Something went wrong.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col py-0 overflow-y-auto" ref={chatRef}>
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome type={type} name={name} />}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300"
              onClick={() => fetchNextPage()}
            >
              Load More Messages
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages?.map((group, i) => {
          return (
            <Fragment key={i}>
              {group.items.map((message: MessageWithMemberWithProfile) => {
                return (
                  <ChatItem
                    key={message.id}
                    currentMember={member}
                    member={message.member}
                    content={message.content}
                    deleted={message.deleted}
                    fileUrl={message.fileUrl}
                    id={message.id}
                    timestamp={format(
                      new Date(message.createdAt),
                      dateFormatter
                    )}
                    isUpdate={message.updatedAt !== message.createdAt}
                    socketQuery={socketQuery}
                    socketUrl={socketUrl}
                  />
                );
              })}
            </Fragment>
          );
        })}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
