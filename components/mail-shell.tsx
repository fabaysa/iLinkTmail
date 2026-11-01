import { ArrowUpRight, Inbox, Mail, ShieldCheck } from "lucide-react";

export function SiteHeader() {
  return <header className="nav"><a className="brand" href="/" aria-label="TemPmail — beranda"><span className="brand-mark"><Mail size={26} strokeWidth={1.5} /></span><span>{process.env.NEXT_PUBLIC_APP_NAME || "TemPmail"}</span><small>BY ILINK</small></a><nav aria-label="Navigasi utama"><a href="/#cara-kerja">Cara kerja</a><a href="/#faq">FAQ</a><a className="nav-home" href="/" aria-label="Buat alamat baru"><ArrowUpRight size={21} /></a></nav></header>;
}

export function MailIllustration() {
  return <figure className="mail-illustration" aria-label="Ilustrasi surat sementara dalam amplop"><svg viewBox="0 0 500 340" role="img" aria-hidden="true" fill="none"><ellipse cx="282" cy="297" rx="174" ry="12" fill="#dededb" /><path d="M62 232C-7 113 121 36 263 56S487 180 422 253" stroke="#a2a29d" strokeDasharray="5 8" /><g stroke="#171717" strokeWidth="2.5" strokeLinejoin="round"><path d="m115 122 145-65 145 65v164H115Z" fill="#e0e0dc"/><g transform="rotate(8 265 160)"><path d="M144 48h230v187H144z" fill="#fcfcfa"/><text x="166" y="125" fill="#171717" stroke="none" fontSize="44" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="-2">hello,</text><path d="M171 153h126m-126 17h92" stroke="#a6a6a0" strokeWidth="2"/></g><path d="m115 122 145 106 145-106v164H115Z" fill="#f5f5f2"/><path d="m115 286 106-87q39-25 78 0l106 87"/><g transform="rotate(-10 356 232)"><path d="M331 207h51v51h-51z" fill="#171717"/><text x="341" y="242" fill="#f5f5f2" stroke="none" fontSize="31" fontWeight="700" fontFamily="Arial, sans-serif">@</text></g><path d="m21 140 66-17-22 49-14-20-30-12Zm30 12 36-29" fill="#e0e0dc" strokeWidth="1.7"/><path d="M443 51v34m-17-17h34m-29-12 24 24m-24 0 24-24" strokeWidth="1.7"/></g></svg><figcaption>a little less permanent.</figcaption></figure>;
}

export function Hero() {
  return <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow">Email sementara. Tanpa jejak panjang.</p><h1 id="hero-title">Email singgah.<br />Privasi menetap.</h1><p className="hero-description">Untuk daftar, coba, lalu tinggalkan.<br />Simpan email pribadi untuk hal yang berarti.</p><p className="hero-facts">Tanpa akun <span>·</span> Gratis digunakan</p></div><MailIllustration /></section>;
}

export function PrivacyNote() {
  return <aside className="privacy-note"><p className="eyebrow">Sedikit lebih tenang</p><h2>Inbox singkat. <br />Urusan selesai.</h2><p className="privacy-description">Pakai alamat ini untuk kode verifikasi, uji layanan, atau sekali daftar.<br />Email utamamu tetap milikmu.</p><div className="privacy-signoff"><ShieldCheck size={39} strokeWidth={1.3} /><p>Lebih sedikit spam.<br />Lebih banyak ruang.</p></div></aside>;
}

export function EmptyInbox({ pending = false }: { pending?: boolean }) {
  return <div className="empty-state"><Inbox size={78} strokeWidth={1} aria-hidden="true" /><h3>{pending ? "Inbox-mu dimulai di sini." : "Belum ada yang mampir."}</h3><p>{pending ? <>Buat alamat di atas, lalu gunakan untuk<br />menerima email pertamamu.</> : <>Email baru akan muncul di sini secara otomatis.<br />Tak perlu menekan refresh berulang kali.</>}</p>{!pending && <small className="poll-status"><span className="status-dot" />Memeriksa pesan setiap 8 detik</small>}</div>;
}

export function SiteFooter() {
  return <footer className="footer"><div><a className="footer-brand" href="/">TemPmail</a><p>Alamat boleh sementara. Privasi tetap utama.</p></div><div className="footer-right"><a href="/#cara-kerja">Cara kerja</a><span>/</span><a href="/#faq">Privasi & bantuan</a><p>© {new Date().getFullYear()} iLink. Dibuat untuk ruang yang lebih tenang.</p></div></footer>;
}

export function HelpSections() {
  return <div className="help-sections"><section id="cara-kerja"><p className="eyebrow">Sesederhana satu, dua, tiga.</p><h2>Sekali pakai. Selesai.</h2><div className="steps"><article><span>01 / BUAT</span><h3>Pilih alamatmu.</h3><p>Gunakan nama sendiri atau nama acak. Pilih domain dan masa aktif sesuai kebutuhan.</p></article><article><span>02 / TERIMA</span><h3>Tunggu pesan mampir.</h3><p>Salin alamat ke layanan tujuan. Inbox memeriksa pesan baru setiap 8 detik.</p></article><article><span>03 / TINGGALKAN</span><h3>Hapus setelah selesai.</h3><p>Simpan tautan privat untuk membuka inbox kembali sebelum masa aktifnya habis.</p></article></div></section><section className="faq" id="faq"><h2>Hal yang mungkin kamu tanyakan.</h2><details><summary>Siapa yang bisa membaca inbox saya?</summary><p>Inbox diakses melalui tautan dengan token privat. Siapa pun yang memiliki tautan tersebut dapat membukanya, jadi jangan bagikan tautan inbox.</p></details><details><summary>Berapa lama alamat ini aktif?</summary><p>Pilih 10 menit, 1 jam, 6 jam, atau 24 jam saat membuat alamat. Inbox yang kedaluwarsa tidak dapat diakses dan dibersihkan secara berkala.</p></details><details><summary>Apakah saya bisa mengirim email?</summary><p>TemPmail hanya menerima email. Gunakan email pribadi untuk percakapan dan akun penting yang membutuhkan akses jangka panjang.</p></details></section></div>;
}

