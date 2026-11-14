"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Plus, RefreshCw, ShieldCheck, X } from "lucide-react";
import { EmptyInbox, HelpSections, Hero, PrivacyNote, SiteFooter, SiteHeader } from "./mail-shell";

const TTL_OPTIONS = [{ value: 10, label: "10 menit" }, { value: 60, label: "1 jam" }, { value: 360, label: "6 jam" }, { value: 1440, label: "24 jam" }];

export function MailApp({ domains }: { domains: string[] }) {
  const [availableDomains, setAvailableDomains] = useState(domains);
  const [localPart, setLocalPart] = useState("");
  const [domain, setDomain] = useState(domains[0] || "");
  const [ttlMinutes, setTtlMinutes] = useState(() => {
    const configured = Number(process.env.NEXT_PUBLIC_DEFAULT_TTL_MINUTES || 60);
    return TTL_OPTIONS.some(option => option.value === configured) ? configured : 60;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [domainError, setDomainError] = useState("");
  const [toast, setToast] = useState("");
  const domainInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showAddDomain) domainInputRef.current?.focus();
  }, [showAddDomain]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  }

  async function createInbox(random = false) {
    if (loading || addingDomain) return;
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

  async function handleAddDomain(event: React.FormEvent) {
    event.preventDefault();
    if (addingDomain) return;
    const trimmed = newDomain.trim().toLowerCase().replace(/^@+/, "");
    if (!trimmed) {
      setDomainError("Masukkan nama domain terlebih dahulu.");
      return;
    }

    setAddingDomain(true);
    setDomainError("");
    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmed }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          const listRes = await fetch("/api/domains", { cache: "no-store" }).catch(() => null);
          const listData = listRes?.ok ? await listRes.json().catch(() => null) : null;
          if (Array.isArray(listData?.domains) && listData.domains.length) {
            setAvailableDomains(listData.domains);
            if (listData.domains.includes(trimmed)) setDomain(trimmed);
          }
        }
        throw new Error(data.error || "Gagal menambahkan domain.");
      }

      if (Array.isArray(data.domains) && data.domains.length) setAvailableDomains(data.domains);
      if (data.domain) setDomain(data.domain);
      setNewDomain("");
      setShowAddDomain(false);
      setError("");
      showToast(`Domain @${data.domain || trimmed} berhasil ditambahkan.`);
    } catch (err) {
      setDomainError(err instanceof Error ? err.message : "Gagal menambahkan domain.");
    } finally {
      setAddingDomain(false);
    }
  }

  return <main className="site-shell"><div className="container"><SiteHeader /><Hero />
    <section className="address-card generator-card" aria-labelledby="generator-title" aria-busy={loading || addingDomain}>
      <div className="address-caption"><h2 className="eyebrow" id="generator-title">01 / Buat alamat email kamu</h2><span className="secure-caption"><ShieldCheck size={14} /> Tautan inbox privat</span></div>
      <form onSubmit={event => { event.preventDefault(); void createInbox(); }}>
        <div className="form-grid">
          <label className="field"><span>Nama email</span><input className="control" value={localPart} onChange={event => setLocalPart(event.target.value.toLowerCase())} maxLength={40} placeholder="Nama sendiri atau biarkan acak" autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={loading} /></label>
          <div className="field">
            <div className="field-head">
              <label htmlFor="domain-select">Domain</label>
              <button
                className="field-action"
                type="button"
                onClick={() => { setShowAddDomain(prev => !prev); setDomainError(""); }}
                disabled={loading || addingDomain}
                aria-expanded={showAddDomain}
              >
                {showAddDomain ? <><X size={12} /> Tutup</> : <><Plus size={12} /> Tambah domain</>}
              </button>
            </div>
            <select id="domain-select" className="control" value={domain} onChange={event => setDomain(event.target.value)} disabled={loading || addingDomain || !availableDomains.length}>
              {availableDomains.map(item => <option key={item} value={item}>@{item}</option>)}
            </select>
          </div>
          <label className="field"><span>Masa aktif</span><select className="control" value={ttlMinutes} onChange={event => setTtlMinutes(Number(event.target.value))} disabled={loading}>{TTL_OPTIONS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <button className="primary-btn" type="submit" disabled={loading || addingDomain || !domain}>{loading ? <RefreshCw size={17} className="spin" /> : <ArrowRight size={18} />}{loading ? "Membuat alamat…" : "Buat email"}</button>
        </div>
        {error && <p className="error-box" role="alert">{error}</p>}
      </form>
      {showAddDomain && (
        <form
          className="domain-panel"
          onSubmit={handleAddDomain}
          onKeyDown={event => { if (event.key === "Escape") { setShowAddDomain(false); setDomainError(""); } }}
        >
          <div className="domain-panel-row">
            <label className="field">
              <span>Domain baru</span>
              <input
                ref={domainInputRef}
                className="control"
                value={newDomain}
                onChange={event => setNewDomain(event.target.value.toLowerCase())}
                maxLength={120}
                placeholder="contoh: mail.domainbaru.com"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                disabled={addingDomain}
              />
            </label>
            <button className="compact-btn compact-primary" type="submit" disabled={addingDomain}>
              {addingDomain ? <><RefreshCw size={14} className="spin" /> Menyimpan…</> : "Simpan domain"}
            </button>
            <button className="compact-btn compact-ghost" type="button" onClick={() => { setShowAddDomain(false); setDomainError(""); }} disabled={addingDomain}>
              Batal
            </button>
          </div>
          {domainError && <p className="domain-error" role="alert">{domainError}</p>}
          <p className="domain-hint">Pastikan Cloudflare Email Routing (Catch-all ke Worker) sudah aktif pada domain ini agar email dapat masuk.</p>
        </form>
      )}
      <div className="address-bottom"><button className="text-btn" type="button" onClick={() => createInbox(true)} disabled={loading || addingDomain || !domain}><RefreshCw size={14} /> Gunakan nama acak</button><p>Alamat sementara. Gunakan selama kamu membutuhkannya.</p></div>
    </section>
    <section className="workspace"><div className="mail-list"><div className="panel-head"><h2>Kotak masuk <span className="count">0</span></h2><span className="panel-hint">Menunggu alamat</span></div><EmptyInbox pending /></div><PrivacyNote /></section>
    <HelpSections /><SiteFooter /></div>{toast && <div className="toast" role="status"><Check size={16} />{toast}</div>}</main>;
}
