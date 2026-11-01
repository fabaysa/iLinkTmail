"use client";

import { useState } from "react";
import { ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";
import { EmptyInbox, HelpSections, Hero, PrivacyNote, SiteFooter, SiteHeader } from "./mail-shell";

const TTL_OPTIONS = [{ value: 10, label: "10 menit" }, { value: 60, label: "1 jam" }, { value: 360, label: "6 jam" }, { value: 1440, label: "24 jam" }];

export function MailApp({ domains }: { domains: string[] }) {
  const [localPart, setLocalPart] = useState("");
  const [domain, setDomain] = useState(domains[0] || "");
  const [ttlMinutes, setTtlMinutes] = useState(() => {
    const configured = Number(process.env.NEXT_PUBLIC_DEFAULT_TTL_MINUTES || 60);
    return TTL_OPTIONS.some(option => option.value === configured) ? configured : 60;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createInbox(random = false) {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/inboxes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ localPart: random ? "" : localPart, domain, ttlMinutes }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal membuat inbox.");
      window.location.href = data.inboxUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setLoading(false);
    }
  }

  return <main className="site-shell"><div className="container"><SiteHeader /><Hero />
    <section className="address-card generator-card" aria-labelledby="generator-title" aria-busy={loading}>
      <div className="address-caption"><h2 className="eyebrow" id="generator-title">01 / Buat alamat email kamu</h2><span className="secure-caption"><ShieldCheck size={14} /> Tautan inbox privat</span></div>
      <form onSubmit={event => { event.preventDefault(); void createInbox(); }}>
        <div className="form-grid"><label className="field"><span>Nama email</span><input className="control" value={localPart} onChange={event => setLocalPart(event.target.value.toLowerCase())} maxLength={40} placeholder="Nama sendiri atau biarkan acak" autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={loading} /></label>
        <label className="field"><span>Domain</span><select className="control" value={domain} onChange={event => setDomain(event.target.value)} disabled={loading || !domains.length}>{domains.map(item => <option key={item} value={item}>@{item}</option>)}</select></label>
        <label className="field"><span>Masa aktif</span><select className="control" value={ttlMinutes} onChange={event => setTtlMinutes(Number(event.target.value))} disabled={loading}>{TTL_OPTIONS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <button className="primary-btn" type="submit" disabled={loading || !domain}>{loading ? <RefreshCw size={17} className="spin" /> : <ArrowRight size={18} />}{loading ? "Membuat alamat…" : "Buat email"}</button></div>
        {error && <p className="error-box" role="alert">{error}</p>}
        <div className="address-bottom"><button className="text-btn" type="button" onClick={() => createInbox(true)} disabled={loading || !domain}><RefreshCw size={14} /> Gunakan nama acak</button><p>Alamat sementara. Gunakan selama kamu membutuhkannya.</p></div>
      </form>
    </section>
    <section className="workspace"><div className="mail-list"><div className="panel-head"><h2>Kotak masuk <span className="count">0</span></h2><span className="panel-hint">Menunggu alamat</span></div><EmptyInbox pending /></div><PrivacyNote /></section>
    <HelpSections /><SiteFooter /></div></main>;
}
