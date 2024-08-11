"use server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/getUser";

export async function getOrCreateConversation(
  memberOneId: string,
  memberTwoId: string
) {
  try {
    let conversation =
      (await findConversation(memberOneId, memberTwoId)) ||
      (await findConversation(memberTwoId, memberOneId));
    if (!conversation) {
      conversation = await createNewConversation(memberOneId, memberTwoId);
    }

    return conversation;
  } catch (error) {
    return null;
  }
}

export async function findConversation(
  memberOneId: string,
  memberTwoId: string
) {
  try {
    const user = await getUser();

    if (!user) return null;
    const conversation = await db.conversation.findFirst({
      where: {
        AND: [{ memberOneId: memberOneId }, { memberTwoId: memberTwoId }],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });
    return conversation;
  } catch (error) {
    return null;
  }
}

export async function createNewConversation(
  memberOneId: string,
  memberTwoId: string
) {
  try {
    const user = await getUser();

    if (!user) return null;
    const conversation = await db.conversation.create({
      data: {
        memberOneId: memberOneId,
        memberTwoId: memberTwoId,
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });
    return conversation;
  } catch (error) {
    return null;
  }
}
