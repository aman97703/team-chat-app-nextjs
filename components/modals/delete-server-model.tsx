"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components//ui/button";
import { useState } from "react";
import { useModalStore } from "@/hooks/use-modal-store";
import { useRouter } from "next/navigation";
import { deleteServerAction } from "@/lib/actions/actions";

const DeleteServerModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  const { server } = data;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isModalOpen = isOpen && type === "deleteServer";

  const handleDeleteServer = async () => {
    try {
      setLoading(true);
      if (server) {
        await deleteServerAction(server.id);
        onClose();
        router.refresh();
      }
    } catch (error) {
      console.error("Error leaving server:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to do this ? <br />
            <span className="font-semibold text-indigo-500">
              {server?.name}
            </span>{" "}
            will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={loading}
              onClick={() => onClose()}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              onClick={() => handleDeleteServer()}
              variant="destructive"
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteServerModal;
