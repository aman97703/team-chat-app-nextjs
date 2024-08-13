"use client";

import { useEffect, useState } from "react";
import CreateServerModal from "@/components/modals/create-server-model";
import InviteModel from "@/components/modals/invite-modal";
import EditServerModel from "@/components/modals/edit-server-modal";
import MembersModal from "@/components/modals/members-modal";
import CreateChannelModel from "@/components/modals/create-channel-model";
import LeaveServerModal from "@/components/modals/leaver-server-model";
import DeleteServerModal from "@/components/modals/delete-server-model";
import DeleteChannelModal from "@/components/modals/delete-channel-model";
import EditChannelModel from "@/components/modals/edit-channel-model";
import MessageFileModal from "@/components/modals/message-file";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <CreateServerModal />
      <InviteModel />
      <EditServerModel />
      <MembersModal />
      <CreateChannelModel />
      <LeaveServerModal />
      <DeleteServerModal />
      <DeleteChannelModal />
      <EditChannelModel />
      <MessageFileModal />
    </>
  );
};
