import { NextResponse } from "next/server";
import { Webhook } from "svix";
import prisma from "@/lib/prisma";
import type { WebhookEvent } from "@clerk/nextjs/server";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    const wh = new Webhook(webhookSecret);
    const evt = wh.verify(payload, headers) as WebhookEvent;

    if (evt.type === "user.created") {
      const user = evt.data;
      await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.email_addresses[0]?.email_address ?? "",
          name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
        },
      });
    }

    if (evt.type === "user.updated") {
      const user = evt.data;
      await prisma.user.update({
        where: { clerkId: user.id },
        data: {
          email: user.email_addresses[0]?.email_address ?? "",
          name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
        },
      });
    }

    if (evt.type === "user.deleted") {
      const user = evt.data;
      if (user.id) {
        await prisma.user.delete({
          where: { clerkId: user.id },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Clerk webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
