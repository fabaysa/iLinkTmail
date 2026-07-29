import { NextResponse } from "next/server";
import { hashToken } from "@/lib/security";
import { supabaseRest } from "@/lib/supabase-rest";

type InboxRow = { id: string; address: string; expires_at: string };
type MessageRow = { id: string; sender: string; subject: string; snippet: string; received_at: string };

async function getInbox(token: string) {
  const rows = await supabaseRest<InboxRow[]>(`inboxes?access_token_hash=eq.${hashToken(token)}&deleted_at=is.null&select=id,address,expires_at&limit=1`);
  return rows[0] || null;
}

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const inbox = await getInbox(token);
    if (!inbox) return NextResponse.json({ error: "Token inbox tidak valid." }, { status: 404 });
    if (new Date(inbox.expires_at).getTime() <= Date.now()) return NextResponse.json({ error: "Inbox ini sudah kedaluwarsa." }, { status: 410 });

    const messages = await supabaseRest<MessageRow[]>(`messages?inbox_id=eq.${inbox.id}&select=id,sender,subject,snippet,received_at&order=received_at.desc&limit=100`);
    await supabaseRest(`inboxes?id=eq.${inbox.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ last_access_at: new Date().toISOString() }),
    });
    return NextResponse.json({
      address: inbox.address,
      expiresAt: inbox.expires_at,
      messages: messages.map((item) => ({ id:item.id, sender:item.sender, subject:item.subject, snippet:item.snippet, receivedAt:item.received_at })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memuat inbox." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const inbox = await getInbox(token);
    if (!inbox) return NextResponse.json({ error: "Inbox tidak ditemukan." }, { status: 404 });
    await supabaseRest(`inboxes?id=eq.${inbox.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ deleted_at: new Date().toISOString() }),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menghapus inbox." }, { status: 500 });
  }
}
