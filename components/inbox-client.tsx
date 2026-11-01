"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Clock3, Copy, Mail, RefreshCw, ShieldCheck, Trash2, X } from "lucide-react";
import { EmptyInbox, Hero, PrivacyNote, SiteFooter, SiteHeader } from "./mail-shell";

type MessageListItem = { id: string; sender: string; subject: string; snippet: string; receivedAt: string };
type InboxData = { address: string; expiresAt: string; messages: MessageListItem[] };
type MessageDetail = MessageListItem & { recipients: string[]; textBody: string; htmlBody: string | null };

export function InboxClient({ token }: { token: string }) {
  const [data, setData] = useState<InboxData | null>(null);
  const [selected, setSelected] = useState<MessageDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [bodyMode, setBodyMode] = useState<"html" | "text">("html");
  const detailRequest = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);

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
    void loadInbox();
    const timer = window.setInterval(() => void loadInbox(true), 8000);
    return () => { window.clearInterval(timer); if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, [loadInbox]);

  useEffect(() => { if (selectedId) detailHeading.current?.focus(); }, [selectedId]);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  }

  async function openMessage(id: string) {
    const request = ++detailRequest.current;
    setSelectedId(id);
    setSelected(null);
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/messages/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Pesan gagal dibuka.");
      if (request !== detailRequest.current) return;
      setSelected(payload);
      setBodyMode(payload.htmlBody ? "html" : "text");
    } catch (err) {
      if (request === detailRequest.current) showToast(err instanceof Error ? err.message : "Pesan gagal dibuka.");
    } finally {
      if (request === detailRequest.current) setDetailLoading(false);
    }
  }

  async function copyAddress() {
    if (!data) return;
    try { await navigator.clipboard.writeText(data.address); showToast("Alamat email disalin."); }
    catch { showToast("Tidak dapat menyalin. Pilih dan salin alamat secara manual."); }
  }

  async function deleteInbox() {
    if (!window.confirm("Hapus inbox beserta seluruh pesannya? Tindakan ini tidak dapat dibatalkan.")) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/inboxes/${encodeURIComponent(token)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Inbox gagal dihapus. Coba lagi.");
      window.location.href = "/";
    } catch (err) { showToast(err instanceof Error ? err.message : "Inbox gagal dihapus."); setDeleting(false); }
  }

  const expiresLabel = useMemo(() => data ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.expiresAt)) : "", [data]);
  const closeMessage = () => { ++detailRequest.current; setSelectedId(null); setSelected(null); setDetailLoading(false); };

  return <main className="site-shell"><div className="container"><SiteHeader /><Hero />
    {loading && !data && <section className="loading-state" role="status"><RefreshCw className="spin" size={22} /> Membuka inbox privatmu…</section>}
    {error && <section className="error-box" role="alert"><ShieldCheck size={20} /><div><strong>{data ? "Pesan belum dapat diperbarui" : "Inbox tidak tersedia"}</strong><p>{error}</p><button className="text-btn" onClick={() => loadInbox()}>Coba lagi</button><a className="text-btn" href="/">Buat alamat baru <ArrowLeft size={14} /></a></div></section>}
    {data && <>
      <section className="address-card" aria-labelledby="address-label"><div className="address-caption"><h2 className="eyebrow" id="address-label">01 / Alamat email kamu</h2><span className="live-label"><span className="status-dot" />{error ? "Koneksi terputus" : "Siap menerima"}</span></div><div className="address-main"><div className="address">{data.address}</div><button className="primary-btn" onClick={copyAddress}><Copy size={19} /> Salin alamat</button></div><div className="address-bottom"><div className="address-tools"><a className="text-btn" href="/"><RefreshCw size={14} /> Ganti alamat</a><button className="text-btn muted" disabled={deleting} onClick={deleteInbox}><Trash2 size={14} />{deleting ? "Menghapus…" : "Hapus alamat"}</button></div><p><Clock3 size={13} /> Aktif hingga {expiresLabel}</p></div></section>
      <section className={`workspace ${selectedId ? "has-message" : ""}`}><div className="mail-list"><div className="panel-head"><h2>Kotak masuk <span className="count">{data.messages.length}</span></h2><button className="text-btn refresh-btn" onClick={() => loadInbox()} disabled={loading} aria-label="Segarkan kotak masuk"><RefreshCw size={14} className={loading ? "spin" : ""} /><span>Segarkan</span></button></div><div className="messages" aria-busy={loading}>{data.messages.length ? data.messages.map(message => <button key={message.id} className={`message-item ${selectedId === message.id ? "active" : ""}`} onClick={() => openMessage(message.id)} aria-pressed={selectedId === message.id}><div className="message-from"><strong>{message.sender}</strong><time dateTime={message.receivedAt}>{new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.receivedAt))}</time></div><div className="message-subject">{message.subject || "Tanpa subjek"}</div><div className="message-snippet">{message.snippet || "Buka pesan untuk melihat isinya."}</div></button>) : <EmptyInbox />}</div></div>
      {selectedId ? <section className="mail-view" aria-busy={detailLoading}><div className="panel-head"><h2 ref={detailHeading} tabIndex={-1}>Isi email</h2><button className="icon-btn" aria-label="Tutup pesan" onClick={closeMessage}><X size={19} /></button></div>{detailLoading ? <div className="loading-state" role="status"><RefreshCw className="spin" size={20} /> Memuat pesan…</div> : selected ? <div className="mail-content"><div className="mail-meta"><h3>{selected.subject || "Tanpa subjek"}</h3><div className="meta-line"><strong>Dari</strong><span>{selected.sender}</span></div><div className="meta-line"><strong>Kepada</strong><span>{selected.recipients.join(", ")}</span></div><div className="meta-line"><strong>Waktu</strong><span>{new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "medium" }).format(new Date(selected.receivedAt))}</span></div>{selected.htmlBody && <div className="body-switch" aria-label="Format isi email"><button aria-pressed={bodyMode === "html"} onClick={() => setBodyMode("html")}>Tampilan email</button><button aria-pressed={bodyMode === "text"} onClick={() => setBodyMode("text")}>Teks aman</button></div>}</div><div className="mail-body">{bodyMode === "html" && selected.htmlBody ? <iframe className="mail-frame" sandbox="" referrerPolicy="no-referrer" srcDoc={selected.htmlBody} title="Isi email" /> : <pre className="mail-text">{selected.textBody || "Pesan ini tidak memiliki isi teks."}</pre>}</div></div> : <div className="empty-state"><Mail size={44} strokeWidth={1} /><h3>Pesan belum dapat dibuka.</h3><button className="text-btn" onClick={() => openMessage(selectedId)}>Coba lagi</button></div>}</section> : <PrivacyNote />}</section>
    </>}
    <SiteFooter /></div>{toast && <div className="toast" role="status"><Check size={16} />{toast}</div>}</main>;
}
