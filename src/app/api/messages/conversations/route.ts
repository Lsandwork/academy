import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  canUsersMessage,
  conversationTitle,
  getAdminUsers,
  getOrCreateDirectConversation
} from "@/lib/messaging";

export async function GET() {
  try {
    const user = await requireUser();

    const memberships = await prisma.conversationParticipant.findMany({
      where: { userId: user.id },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: { select: { id: true, name: true, email: true, role: true } }
              }
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { body: true, createdAt: true, senderId: true }
            },
            contract: {
              select: { id: true, dogName: true, status: true }
            }
          }
        }
      },
      orderBy: { conversation: { updatedAt: "desc" } }
    });

    const conversations = await Promise.all(
      memberships.map(async (m) => {
        const conv = m.conversation;
        const last = conv.messages[0];
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: user.id },
            ...(m.lastReadAt ? { createdAt: { gt: m.lastReadAt } } : {})
          }
        });

        return {
          id: conv.id,
          title: conv.contract?.dogName
            ? `${conv.contract.dogName} · ${conversationTitle(conv.participants, user.id)}`
            : conversationTitle(conv.participants, user.id),
          subject: conv.subject,
          contractId: conv.contractId,
          contractStatus: conv.contract?.status ?? null,
          lastMessage: last?.body ?? null,
          lastMessageAt: last?.createdAt ?? conv.updatedAt,
          unreadCount,
          participants: conv.participants.map((p) => ({
            id: p.user.id,
            name: p.user.name,
            email: p.user.email,
            role: p.user.role
          }))
        };
      })
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not load conversations." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const messageAdmin = Boolean(body.messageAdmin);

    const recipientId = body.recipientId as string | undefined;
    let recipientUser = recipientId
      ? await prisma.user.findUnique({ where: { id: recipientId } })
      : null;

    if (messageAdmin && !recipientUser) {
      const admins = await getAdminUsers(prisma);
      recipientUser = admins[0] ? await prisma.user.findUnique({ where: { id: admins[0].id } }) : null;
    }

    if (!recipientUser) {
      return NextResponse.json({ error: "Recipient not found." }, { status: 404 });
    }

    const allowed = await canUsersMessage(prisma, user, recipientUser);
    if (!allowed) {
      return NextResponse.json(
        { error: "You can message Fitdog admin anytime. Trainer messaging opens after admin approves your assignment." },
        { status: 403 }
      );
    }

    const conversation = await getOrCreateDirectConversation(
      prisma,
      user.id,
      recipientUser.id,
      body.subject as string | undefined
    );

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not start conversation." }, { status: 500 });
  }
}
