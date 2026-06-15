import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { findUserById } from "@/lib/authProfile";
import { prisma } from "@/lib/db";
import {
  canUsersMessage,
  conversationTitle,
  getAdminUsers,
  getMessageableRecipients,
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
    const recipientQuery = (body.recipientQuery as string | undefined)?.trim().toLowerCase();

    let recipientUser = recipientId ? await findUserById(recipientId) : null;

    if (!recipientUser && recipientQuery) {
      const matches = await getMessageableRecipients(prisma, user, recipientQuery);
      const match =
        matches.find((m) => m.email.toLowerCase() === recipientQuery) ??
        matches.find((m) => m.name?.toLowerCase() === recipientQuery) ??
        (matches.length === 1 ? matches[0] : null);

      if (!match && matches.length > 1) {
        return NextResponse.json(
          {
            error: "Multiple users match that name. Pick one from the list.",
            matches: matches.map((m) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              role: m.role
            }))
          },
          { status: 409 }
        );
      }

      recipientUser = match ? await findUserById(match.id) : null;
    }

    if (messageAdmin && !recipientUser) {
      const admins = await getAdminUsers(prisma);
      recipientUser = admins[0] ? await findUserById(admins[0].id) : null;
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

    const initialBody = (body.body as string | undefined)?.trim();
    if (initialBody) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          body: initialBody
        }
      });
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });
    }

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not start conversation." }, { status: 500 });
  }
}
