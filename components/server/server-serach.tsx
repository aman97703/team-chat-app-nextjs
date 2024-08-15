"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useParams, useRouter } from "next/navigation";

type datatype = "channel" | "member";

interface ServerSearchProps {
  data: {
    label: string;
    type: datatype;
    data:
      | {
          icon: React.ReactNode;
          name: string;
          id: string;
        }[]
      | undefined;
  }[];
}

const ServerSearch = ({ data }: ServerSearchProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams<{ serverid: string }>();

  const handleClick = (id: string, type: datatype) => {
    setOpen(false);
    if (type === "member") {
      return router.push(`/server/${params?.serverid}/conversations/${id}`);
    }
    if (type === "channel") {
      return router.push(`/server/${params?.serverid}/channels/${id}`);
    }
  };
  //   useEffect(() => {
  //     const down = (e: KeyboardEvent) => {
  //       if (e.ctrlKey && e.key === "k") {
  //         console.log("ioejakhsdkfjhakjs")
  //         e.preventDefault();
  //         setOpen(!open);
  //       }
  //     };

  //     document.addEventListener("keydown", down);
  //     return () => document.removeEventListener("keydown", down);
  //   }, []);
  return (
    <>
      <button
        className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        <p className=" font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
          Search
        </p>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search all channels" />
        <CommandList>
          <CommandEmpty>No Result found</CommandEmpty>
          {data.map(({ data, label, type }) => {
            if (!data?.length) return null;
            return (
              <CommandGroup key={label} heading={label}>
                {data.map(({ icon, id, name }) => {
                  return (
                    <CommandItem
                      key={id}
                      onSelect={() => handleClick(id, type)}
                    >
                      {icon}
                      <span>{name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default ServerSearch;
