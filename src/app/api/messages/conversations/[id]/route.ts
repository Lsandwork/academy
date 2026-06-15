import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { conversationTitle } from "@/lib/messaging";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const membership = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: user.id } },
      include: {
        conversation: {
          include: {
            participants: {
              include: { user: { select: { id: true, name: true, email: true, role: true } } }
            },
            contract: {
              select: {
                id: true,
                dogName: true,
                dogBreed: true,
                dogAge: true,
                dogNotes: true,
                status: true,
                reportSummary: true
              }
            },
            messages: {
              orderBy: { createdAt: "asc" },
              take: 200,
              include: { sender: { select: { id: true, name: true, email: true } } }
            }
          }
        }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: id, userId: user.id } },
      data: { lastReadAt: new Date() }
    });

    const conv = membership.conversation;

    return NextResponse.json({
      id: conv.id,
      title: conv.contract?.dogName
        ? `${conv.contract.dogName} · ${conversationTitle(conv.participants, user.id)}`
        : conversationTitle(conv.participants, user.id),
      contract: conv.contract,
      participants: conv.participants.map((p) => ({
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
        role: p.user.role
      })),
      messages: conv.messages.map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt,
        senderId: m.senderId,
        senderName: m.sender.name || m.sender.email.split("@")[0],
        mine: m.senderId === user.id
      }))
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not load messages." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const text = (body.body as string | undefined)?.trim();

    if (!text) {
      return NextResponse.json({ error: "Message body is required." }, { status: 400 });
    }

    const membership = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: user.id } }
    });

    if (!membership) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        body: text
      }
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      message: {
        id: message.id,
        body: message.body,
        createdAt: message.createdAt,
        senderId: message.senderId,
        senderName: user.name || user.email.split("@")[0],
        mine: true
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }
}
