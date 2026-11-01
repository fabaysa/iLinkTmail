import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import { hashToken } from "@/lib/security";
import { supabaseRest } from "@/lib/supabase-rest";

type InboxRow = { id: string; expires_at: string };
type MessageRow = { id:string; sender:string; recipients:string[]; subject:string; snippet:string; text_body:string|null; html_body:string|null; received_at:string };

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = new URL(request.url).searchParams.get("token");
    if (!token) return NextResponse.json({ error: "Token diperlukan." }, { status: 401 });
    const { id } = await params;
    const inboxes = await supabaseRest<InboxRow[]>(`inboxes?access_token_hash=eq.${hashToken(token)}&deleted_at=is.null&select=id,expires_at&limit=1`);
    const inbox = inboxes[0];
    if (!inbox) return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    if (new Date(inbox.expires_at).getTime() <= Date.now()) return NextResponse.json({ error: "Inbox sudah kedaluwarsa." }, { status: 410 });
    const messages = await supabaseRest<MessageRow[]>(`messages?id=eq.${encodeURIComponent(id)}&inbox_id=eq.${inbox.id}&select=id,sender,recipients,subject,snippet,text_body,html_body,received_at&limit=1`);
    const message = messages[0];
    if (!message) return NextResponse.json({ error: "Pesan tidak ditemukan." }, { status: 404 });
    const cleanHtml = message.html_body ? sanitizeHtml(message.html_body, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["table", "thead", "tbody", "tfoot", "tr", "th", "td"]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        table: ["border", "cellpadding", "cellspacing", "width"],
        td: ["colspan", "rowspan", "width", "align"],
        th: ["colspan", "rowspan", "width", "align"],
      },
      allowedSchemes: ["http", "https", "mailto"],
      transformTags: { a: sanitizeHtml.simpleTransform("a", { target:"_blank", rel:"noopener noreferrer nofollow" }) },
    }) : null;
    return NextResponse.json({ id:message.id, sender:message.sender, recipients:message.recipients || [], subject:message.subject, snippet:message.snippet, textBody:message.text_body || "", htmlBody:cleanHtml, receivedAt:message.received_at });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memuat pesan." }, { status: 500 });
  }
}
