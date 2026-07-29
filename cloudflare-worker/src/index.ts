import PostalMime from "postal-mime";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

function headers(env: Env) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const recipient = message.to.trim().toLowerCase();
    if (!recipient || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      message.setReject("Temporary mail service is not configured");
      return;
    }

    const inboxResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/inboxes?address=eq.${encodeURIComponent(recipient)}&deleted_at=is.null&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=id&limit=1`,
      { headers: headers(env) },
    );
    if (!inboxResponse.ok) throw new Error(`Inbox lookup failed: ${inboxResponse.status}`);
    const inboxes = await inboxResponse.json<Array<{ id: string }>>();
    if (!inboxes.length) {
      message.setReject("Inbox not found or expired");
      return;
    }

    const raw = await new Response(message.raw).arrayBuffer();
    if (raw.byteLength > 10 * 1024 * 1024) {
      message.setReject("Message is too large");
      return;
    }

    const parsed = await PostalMime.parse(raw);
    const sender = parsed.from?.address || message.from || "";
    const recipients = [
      ...(parsed.to || []).map((item) => item.address),
      ...(parsed.cc || []).map((item) => item.address),
    ].filter(Boolean);
    const text = parsed.text || "";
    const html = parsed.html || "";
    const snippet = text.replace(/\s+/g, " ").trim().slice(0, 180) || parsed.subject || "Email baru";
    const externalId = parsed.messageId || crypto.randomUUID();

    const insertResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers: headers(env),
      body: JSON.stringify({
        inbox_id: inboxes[0].id,
        external_message_id: externalId,
        sender,
        recipients,
        subject: parsed.subject || "",
        snippet,
        text_body: text,
        html_body: html,
        headers: Object.fromEntries(parsed.headers.map((item) => [item.key, item.value])),
        size_bytes: raw.byteLength,
        received_at: parsed.date ? new Date(parsed.date).toISOString() : new Date().toISOString(),
      }),
    });

    if (!insertResponse.ok && insertResponse.status !== 409) {
      const details = await insertResponse.text();
      throw new Error(`Message insert failed: ${insertResponse.status} ${details}`);
    }
  },
} satisfies ExportedHandler<Env>;
