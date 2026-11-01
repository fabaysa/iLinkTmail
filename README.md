# iLink TempMail

Website Temporary Mail Generator siap deploy menggunakan **Next.js + Vercel + Supabase + Cloudflare Email Routing**.

## Fitur

- Generator alamat email custom atau acak.
- Pilihan domain dan masa aktif 10 menit–24 jam.
- Token inbox privat yang disimpan dalam bentuk hash SHA-256.
- Inbox auto-refresh setiap 8 detik.
- Tampilan HTML email dalam iframe sandbox dan versi teks aman.
- Pembersihan inbox kedaluwarsa melalui Vercel Cron.
- Rate limit pembuatan inbox berbasis hash IP.
- Cloudflare Email Worker untuk menerima dan mem-parsing email masuk.
- Tampilan responsif untuk desktop dan ponsel.

## Arsitektur

1. Pengguna membuat alamat melalui website di Vercel.
2. Next.js Route Handler menyimpan inbox ke Supabase memakai Service Role di sisi server.
3. Email menuju domain diterima Cloudflare Email Routing.
4. Email Worker mem-parsing MIME dan menyimpan pesan ke Supabase.
5. Halaman inbox mengambil pesan dari API Next.js menggunakan token privat.

> Vercel dan Supabase tidak menyediakan MX server untuk menerima semua email secara langsung. Karena itu Cloudflare Email Routing/Worker tetap diperlukan sebagai penerima email.

## 1. Siapkan Supabase

1. Buat project Supabase baru.
2. Buka **SQL Editor**.
3. Jalankan seluruh isi `supabase/migrations/001_initial.sql`.
4. Buka **Project Settings → API** dan simpan:
   - Project URL
   - Service Role Key (jangan pernah dipasang di browser)

## 2. Atur domain di Cloudflare

1. Tambahkan domain Anda ke Cloudflare dan arahkan nameserver.
2. Buka **Email → Email Routing**, lalu aktifkan Email Routing.
3. Buat Email Worker dari folder `cloudflare-worker`.
4. Ubah `SUPABASE_URL` di `cloudflare-worker/wrangler.toml`.
5. Jalankan:

```bash
cd cloudflare-worker
npm install
npx wrangler login
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npm run deploy
```

6. Pada Email Routing, buat aturan **Catch-all → Send to a Worker**, lalu pilih worker `ilink-tempmail-email-worker`.
7. Pastikan domain yang ditulis pada `NEXT_PUBLIC_MAIL_DOMAINS` sama dengan domain/subdomain penerima email.

## 3. Deploy website ke Vercel

1. Upload folder proyek utama ke GitHub.
2. Import repository tersebut di Vercel.
3. Tambahkan Environment Variables:

```env
NEXT_PUBLIC_APP_NAME=iLink TempMail
NEXT_PUBLIC_MAIL_DOMAINS=mail.domainanda.com,temp.domainanda.com
NEXT_PUBLIC_DEFAULT_TTL_MINUTES=60
SUPABASE_URL=https://PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY_ANDA
RATE_LIMIT_SECRET=RANDOM_STRING_MINIMAL_32_KARAKTER
CRON_SECRET=RANDOM_STRING_LAIN_MINIMAL_32_KARAKTER
```

4. Deploy ulang.
5. Buka `/api/health`; respons harus menampilkan `ok: true`.

Vercel Cron akan mengakses `/api/cron/cleanup` setiap hari. Saat `CRON_SECRET` diatur di Vercel, request cron memakai header `Authorization: Bearer <CRON_SECRET>`.

## 4. Menjalankan secara lokal

```bash
cp .env.example .env.local
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Penggantian nama dan warna

- Nama aplikasi: ubah `NEXT_PUBLIC_APP_NAME`.
- Domain: ubah `NEXT_PUBLIC_MAIL_DOMAINS`.
- Warna utama: edit variabel CSS pada bagian teratas `app/globals.css`.

## Keamanan penting

- Jangan menaruh `SUPABASE_SERVICE_ROLE_KEY` pada variabel berawalan `NEXT_PUBLIC_`.
- Batasi ukuran email dan jangan mengizinkan attachment pada versi awal.
- HTML email telah disanitasi dan gambar eksternal diblokir untuk mengurangi tracking.
- Gunakan layanan hanya untuk aktivitas yang sah; jangan dipakai untuk spam, penipuan, atau melewati pembatasan layanan.

## Desain antarmuka

UI mengikuti desain FigCraft TemPmail: palet monokrom, tipografi editorial,
ilustrasi amplop SVG lokal, serta layout responsif untuk beranda dan inbox.
Komponen tampilan bersama berada di `components/mail-shell.tsx` dan token
warna berada di `app/globals.css`. Tidak ada font atau gambar eksternal.

Beranda tetap menyediakan nama custom/acak, domain, dan masa aktif. Halaman
inbox menyediakan salin alamat, hapus inbox, refresh manual/otomatis 8 detik,
serta pembaca HTML sandbox dan teks aman. Link Cara kerja dan FAQ mengarah
ke panduan yang dapat dibuka di beranda.

Validasi lokal:

```bash
npm ci
npm run typecheck
npm run build
```

Jika Turbopack mengalami kegagalan junction di Windows/OneDrive, gunakan
`npm run build -- --webpack` untuk memverifikasi build produksi.
