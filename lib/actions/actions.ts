"use server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/getUser";
import { ChannelType, MemberRole } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export async function createServerAction(name: string, imageUrl: string) {
  try {
    const user = await getUser();

    if (!user) return null;
    const server = await db.server.create({
      data: {
        name: name,
        imageUrl: imageUrl,
        profileId: user.id as string,
        inviteCode: uuidv4(),
        channels: {
          create: [{ name: "general", profileId: user.id as string }],
        },
        members: {
          create: [
            {
              profileId: user.id as string,
              role: MemberRole.ADMIN,
            },
          ],
        },
      },
    });
    return {
      success: true,
      server: server,
    };
  } catch (error) {
    return {
      success: false,
      message: "Server error",
    };
  }
}

export async function updateServerAction(
  name: string,
  imageUrl: string,
  serverid: string
) {
  try {
    const user = await getUser();

    if (!user) return null;
    const server = await db.server.update({
      where: {
        id: serverid,
        profileId: user.id,
      },
      data: {
        name: name,
        imageUrl: imageUrl,
      },
    });
    return {
      success: true,
      server: server,
    };
  } catch (error) {
    return {
      success: false,
      message: "Server error",
    };
  }
}

export async function updateMemberRole(
  serverid: string,
  memberid: string,
  role: MemberRole
) {
  try {
    const user = await getUser();
    if (!user) return null;
    const server = await db.server.update({
      where: {
        id: serverid,
        profileId: user.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: memberid,
              profileId: {
                not: user.id,
              },
            },
            data: {
              role: role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });
    return {
      success: true,
      server: server,
    };
  } catch (error) {
    return {
      success: false,
      message: "Server error",
    };
  }
}

export async function generateNewInviteCode(serverId: string) {
  try {
    const user = await getUser();
    if (!user) return null;
    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: user.id,
      },
      data: {
        inviteCode: uuidv4(),
      },
    });
    return {
      success: true,
      server: server,
    };
  } catch (error) {
    return {
      success: false,
      message: "Server error",
    };
  }
}

export async function handleKickUserAction(serverid: string, memberid: string) {
  try {
    const user = await getUser();
    if (!user) return null;
    const server = await db.server.update({
      where: {
        id: serverid,
        profileId: user.id,
      },
      data: {
        members: {
          deleteMany: {
            id: memberid,
            profileId: {
              not: user.id,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });
    return {
      success: true,
      server: server,
    };
  } catch (error) {
    return {
      success: false,
      message: "Server error",
    };
  }
}

export async function createChannelAction(
  serverid: string,
  name: string,
  type: ChannelType
) {
  try {
    const user = await getUser();
    if (!user) return null;
    if (name === "general") {
      return {
        success: false,
        message: "Name can not general",
      };
    }
    const server = await db.server.update({
      where: {
        id: serverid,
        members: {
          some: {
            profileId: user.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            name: name,
            type: type,
            profileId: user.id,
          },
        },
      },
    });
    return {
      success: true,
      server: server,
    };
  } catch (error) {
    return {
      success: false,
      message: "Server error",
    };
  }
}
export async function leaveChannelAction(serverid: string) {
  try {
    const user = await getUser();
    if (!user) return null;

    const server = await db.server.update({
      where: {
        id: serverid,
        profileId: {
          not: user.id,
        },
        members: {
          some: {
            profileId: user.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: user.id,
          },
        },
      },
    });
    return {
      success: true,
      server: server,
    };
  } catch (error) {
    return {
      success: false,
      message: "Server error",
    };
  }
}
export async function deleteServerAction(serverid: string) {
  try {
    const user = await getUser();
    if (!user) return null;

    const server = await db.server.delete({
      where: {
        id: serverid,
        profileId: user.id,
      },
    });
    return {
      success: true,
      server: server,
    };
  } catch (error) {
    return {
      success: false,
      message: "Server error",
    };
  }
}
