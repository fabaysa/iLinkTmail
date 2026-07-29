"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Clock3, Copy, Inbox, Mail, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";

type MessageListItem = {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  receivedAt: string;
};
type InboxData = { address: string; expiresAt: string; messages: MessageListItem[] };
type MessageDetail = MessageListItem & { recipients: string[]; textBody: string; htmlBody: string | null };

export function InboxClient({ token }: { token: string }) {
  const [data, setData] = useState<InboxData | null>(null);
  const [selected, setSelected] = useState<MessageDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [bodyMode, setBodyMode] = useState<"html" | "text">("html");
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "iLink TempMail";

  const loadInbox = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch(`/api/inboxes/${encodeURIComponent(token)}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Inbox tidak dapat dibuka.");
      setData(payload);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inbox tidak dapat dibuka.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadInbox();
    const timer = window.setInterval(() => loadInbox(true), 8000);
    return () => window.clearInterval(timer);
  }, [loadInbox]);

  async function openMessage(id: string) {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/messages/${id}?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Pesan gagal dibuka.");
      setSelected(payload);
      setBodyMode(payload.htmlBody ? "html" : "text");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Pesan gagal dibuka.");
    } finally {
      setDetailLoading(false);
    }
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2300);
  }

  async function copyAddress() {
    if (!data) return;
    await navigator.clipboard.writeText(data.address);
    showToast("Alamat email disalin.");
  }

  async function deleteInbox() {
    if (!window.confirm("Hapus inbox beserta seluruh pesannya? Tindakan ini tidak dapat dibatalkan.")) return;
    const response = await fetch(`/api/inboxes/${encodeURIComponent(token)}`, { method: "DELETE" });
    if (response.ok) window.location.href = "/";
    else showToast("Inbox gagal dihapus.");
  }

  const expiresLabel = useMemo(() => {
    if (!data) return "";
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.expiresAt));
  }, [data]);

  return (
    <main className="site-shell inbox-shell">
      <header className="inbox-top">
        <div className="container inbox-top-row">
          <a className="brand" href="/"><span className="brand-mark"><Mail size={21} /></span><span>{appName}<small>Private temporary inbox</small></span></a>
          <a className="back-link" href="/"><ArrowLeft size={16} /> Buat inbox baru</a>
        </div>
      </header>
      {loading && <div className="loading-line" />}
      <div className="container inbox-main">
        {error ? (
          <section className="mail-view empty-state"><div><span className="empty-icon"><ShieldCheck /></span><h3>Inbox tidak tersedia</h3><p>{error}</p><br/><a className="secondary-btn" href="/">Kembali ke beranda</a></div></section>
        ) : data ? (
          <>
            <section className="address-card">
              <div><small>Alamat email sementara Anda</small><div className="address">{data.address}</div><div className="status-row"><span className="status-chip live"><span className="pulse" /> Aktif</span><span className="status-chip"><Clock3 size={13} /> Kedaluwarsa {expiresLabel}</span><span className="status-chip"><RefreshCw size={13} /> Auto refresh 8 detik</span></div></div>
              <div className="address-actions"><button className="secondary-btn" onClick={copyAddress}><Copy size={16} /> Salin</button><button className="danger-btn" onClick={deleteInbox}><Trash2 size={16} /> Hapus</button></div>
            </section>
            <section className="inbox-layout">
              <div className="mail-list">
                <div className="panel-head"><h2>Pesan Masuk</h2><span>{data.messages.length} email</span></div>
                <div className="messages">
                  {data.messages.length ? data.messages.map((message) => (
                    <button key={message.id} className={`message-item ${selectedId === message.id ? "active" : ""}`} onClick={() => openMessage(message.id)}>
                      <div className="message-from"><strong>{message.sender}</strong><time>{new Intl.DateTimeFormat("id-ID", { hour:"2-digit", minute:"2-digit" }).format(new Date(message.receivedAt))}</time></div>
                      <div className="message-subject">{message.subject || "Tanpa subjek"}</div>
                      <div className="message-snippet">{message.snippet || "Buka pesan untuk melihat isinya."}</div>
                    </button>
                  )) : <div className="empty-state"><div><span className="empty-icon"><Inbox /></span><h3>Menunggu email masuk</h3><p>Gunakan alamat di atas. Pesan baru akan muncul otomatis tanpa perlu memuat ulang halaman.</p></div></div>}
                </div>
              </div>
              <div className="mail-view">
                <div className="panel-head"><h2>Isi Email</h2><span>{detailLoading ? "Memuat..." : selected ? "Pesan terbuka" : "Pilih salah satu pesan"}</span></div>
                {selected ? <div className="mail-content"><div className="mail-meta"><h1>{selected.subject || "Tanpa subjek"}</h1><div className="meta-line"><strong>Dari</strong><span>{selected.sender}</span></div><div className="meta-line"><strong>Kepada</strong><span>{selected.recipients.join(", ")}</span></div><div className="meta-line"><strong>Waktu</strong><span>{new Intl.DateTimeFormat("id-ID", { dateStyle:"full", timeStyle:"medium" }).format(new Date(selected.receivedAt))}</span></div>{selected.htmlBody && <div className="body-switch"><button className={bodyMode === "html" ? "active" : ""} onClick={() => setBodyMode("html")}>Tampilan email</button><button className={bodyMode === "text" ? "active" : ""} onClick={() => setBodyMode("text")}>Teks aman</button></div>}</div><div className="mail-body">{bodyMode === "html" && selected.htmlBody ? <iframe className="mail-frame" sandbox="" referrerPolicy="no-referrer" srcDoc={selected.htmlBody} title="Isi email" /> : <pre className="mail-text">{selected.textBody || "Pesan ini tidak memiliki isi teks."}</pre>}</div></div> : <div className="empty-state"><div><span className="empty-icon"><Mail /></span><h3>Belum ada pesan dipilih</h3><p>Pilih email dari daftar sebelah kiri untuk membaca isi pesan dengan aman.</p></div></div>}
              </div>
            </section>
          </>
        ) : null}
      </div>
      {toast && <div className="toast"><Check size={15} style={{verticalAlign:"-3px", marginRight:7}} />{toast}</div>}
    </main>
  );
}
