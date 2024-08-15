import { useSocket } from "@/components/providers/socketr-provider";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

type MesssageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) => {
  // Initialize socket connection
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
        console.log("did not find socket")
      return;
    }
    console.log("found socket")
    console.log(updateKey)
    socket.on(updateKey, (message: MesssageWithMemberWithProfile) => {
        console.log("1",message)
      queryClient.setQueryData([queryKey], (oldData: any) => {
        console.log("2",oldData)
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }
        const newData = oldData.pages.map((page: any) => {
          return {
            ...page,
            items: page.items.map((item: any) => {
              if (item.id === message.id) {
                return message;
              }
              return item;
            }),
          };
        });
        return { ...oldData, pages: newData };
      });
    });
    socket.on(addKey, (message: MesssageWithMemberWithProfile) => {
        console.log("add1",message)
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                items: [message],
              },
            ],
          };
        }
        const newData = [...oldData.pages];
        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0].items],
        };
        return { ...oldData, pages: newData };
      });
    });

    return () => {
      socket.off(updateKey);
      socket.off(addKey);
    };
  }, [queryClient, addKey, updateKey, queryKey, socket, updateKey]);
};
