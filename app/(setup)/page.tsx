import InitialModal from "@/components/modals/initial-modal";
import { db } from "@/lib/db";
import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";

const SetupPage = async () => {
  const user = await getUser();
  if(!user) return redirect('/api/auth/login');

  const server = await db.server.findFirst({
    where:{
      members: {
        some: {
          profileId: user.id
        }
      }
    }
  })

  if(server){
    return redirect(`/server/${server.id}`);
  }

  return <InitialModal />;
};

export default SetupPage;
