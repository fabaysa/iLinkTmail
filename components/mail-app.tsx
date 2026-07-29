"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Clock3, Copy, Inbox, LockKeyhole, Mail, RefreshCw, ShieldCheck, Sparkles, Trash2, Zap } from "lucide-react";

const TTL_OPTIONS = [
  { value: 10, label: "10 menit" },
  { value: 60, label: "1 jam" },
  { value: 360, label: "6 jam" },
  { value: 1440, label: "24 jam" },
];

type Props = { domains: string[] };

export function MailApp({ domains }: Props) {
  const [localPart, setLocalPart] = useState("");
  const [domain, setDomain] = useState(domains[0] || "mail.domainanda.com");
  const [ttlMinutes, setTtlMinutes] = useState(Number(process.env.NEXT_PUBLIC_DEFAULT_TTL_MINUTES || 60));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "iLink TempMail";
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  async function createInbox(random = false) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/inboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localPart: random ? "" : localPart, domain, ttlMinutes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal membuat inbox.");
      window.location.href = data.inboxUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="site-shell">
      <div className="container">
        <nav className="nav">
          <a className="brand" href="#top" aria-label={appName}>
            <span className="brand-mark"><Mail size={21} /></span>
            <span>{appName}<small>Private temporary inbox</small></span>
          </a>
          <span className="nav-pill">Tanpa registrasi · Auto refresh</span>
        </nav>

        <section className="hero" id="top">
          <span className="eyebrow"><span className="pulse" /> Inbox sementara siap digunakan</span>
          <h1><span className="gradient-text">Email sementara.</span><br />Privasi tetap utama.</h1>
          <p>Buat alamat email sekali pakai untuk menerima OTP, tautan verifikasi, dan pesan penting tanpa memenuhi inbox utama Anda.</p>
        </section>

        <section className="generator-wrap">
          <div className="generator-card">
            <div className="generator-inner">
              <div className="generator-title">
                <div>
                  <h2>Buat inbox baru</h2>
                  <p>Pilih nama sendiri atau kosongkan agar dibuat otomatis.</p>
                </div>
                <span className="secure-badge"><ShieldCheck size={15} /> Token akses privat</span>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span className="label">Nama email</span>
                  <input className="control" value={localPart} onChange={(event) => setLocalPart(event.target.value.toLowerCase())} maxLength={40} placeholder="contoh: ilink.user" autoComplete="off" />
                </label>
                <label className="field">
                  <span className="label">Domain</span>
                  <select className="control" value={domain} onChange={(event) => setDomain(event.target.value)}>
                    {domains.map((item) => <option key={item} value={item}>@{item}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span className="label">Masa aktif</span>
                  <select className="control" value={ttlMinutes} onChange={(event) => setTtlMinutes(Number(event.target.value))}>
                    {TTL_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <button className="primary-btn" disabled={loading} onClick={() => createInbox(false)}>
                  {loading ? <RefreshCw size={17} className="spin" /> : <Sparkles size={17} />}
                  {loading ? "Membuat..." : "Buat Email"}
                </button>
              </div>
              {error && <div className="error-box">{error}</div>}
              <div className="microcopy">
                <span><Zap size={13} /> Aktif dalam hitungan detik</span>
                <span><RefreshCw size={13} /> Inbox diperiksa otomatis</span>
                <span><Trash2 size={13} /> Hapus kapan saja</span>
                <button onClick={() => createInbox(true)} disabled={loading} style={{all:"unset", cursor:loading?"not-allowed":"pointer", color:"#aca0ff", fontWeight:700}}>Gunakan nama acak <ArrowRight size={12} style={{verticalAlign:"-2px"}} /></button>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <article className="feature"><span className="feature-icon"><Clock3 /></span><h3>Cepat dan praktis</h3><p>Tidak perlu membuat akun. Alamat langsung aktif dan siap menerima email setelah dibuat.</p></article>
          <article className="feature"><span className="feature-icon"><LockKeyhole /></span><h3>Tautan inbox privat</h3><p>Setiap inbox memiliki token akses acak. Alamat email saja tidak cukup untuk membaca isi pesan.</p></article>
          <article className="feature"><span className="feature-icon"><Inbox /></span><h3>Nyaman untuk OTP</h3><p>Daftar pesan diperbarui otomatis sehingga kode OTP dan tautan verifikasi cepat ditemukan.</p></article>
        </section>

        <section className="steps-section">
          <div className="section-head"><h2>Tiga langkah sederhana</h2><p>Gunakan email sementara secara bertanggung jawab untuk menjaga inbox utama tetap bersih.</p></div>
          <div className="steps">
            <article className="step"><span className="step-number">LANGKAH 01</span><h3>Buat alamat</h3><p>Pilih nama, domain, serta masa aktif inbox yang Anda perlukan.</p></article>
            <article className="step"><span className="step-number">LANGKAH 02</span><h3>Gunakan di layanan tujuan</h3><p>Salin alamat dan gunakan untuk menerima email verifikasi yang sah.</p></article>
            <article className="step"><span className="step-number">LANGKAH 03</span><h3>Baca lalu hapus</h3><p>Buka pesan pada halaman privat, kemudian hapus inbox ketika sudah selesai.</p></article>
          </div>
        </section>

        <footer className="footer"><span>© {currentYear} {appName}. Dibuat untuk penggunaan yang sah dan bertanggung jawab.</span><span>Pesan kedaluwarsa akan dibersihkan otomatis.</span></footer>
      </div>
    </main>
  );
}
