"use server";
import { getUser } from "@/lib/getUser";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserDropDown from "./user-dropdown";

const UserToggle = async () => {
  const user = await getUser();
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Image
            //   fill
            height={48}
            width={48}
            src={user.imageUrl}
            alt="user"
            className="rounded-full h-12 w-12 cursor-pointer"
          />
        </DropdownMenuTrigger>
        <UserDropDown />
      </DropdownMenu>
    );
  }
  return null;
};

export default UserToggle;
