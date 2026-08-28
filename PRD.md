# PRD — EduArabic for All

**Product Requirements Document**
Version 1.0 · 28 Ogos 2026 · Pemilik: Afiq

---

## 1. Ringkasan Produk

**EduArabic for All** ialah platform pembelajaran Bahasa Arab dalam talian untuk semua peringkat. Ia menggabungkan modul video pendek, pustaka audio, kelas langsung bersama ustaz, "AI Ustaz" (pembetulan ayat Arab), sistem learning path bergamifikasi (XP, streak, badge, sijil), dan kedai modul dengan pembayaran sekali (Bayarcash FPX/DuitNow).

Sumber reka bentuk: 6 fail Claude Design canvas (`.dc.html`) yang sudah lengkap dari segi UI dan menjadi rujukan visual **100%** untuk hasil React. Matlamat PRD ini ialah menukar UI itu kepada aplikasi produksi sebenar.

### Objektif utama
- Tiru UI design canvas sedia ada dengan tepat (warna, tipografi, susun atur, komponen).
- Bina sebagai aplikasi web moden, mudah alih 100%, dwibahasa (EN default + BM).
- Sediakan asas untuk auth, peranan (admin/user), backend, video terlindung, dan pembayaran.

---

## 2. Susunan Teknologi (Tech Stack)

| Lapisan | Teknologi | Catatan |
|---|---|---|
| Framework | **React 18** | Function components + hooks |
| Build tool | **Vite** | Pantas, HMR, output statik |
| Styling | **Tailwind CSS v3** | Design tokens dipetakan ke `tailwind.config.js` |
| Routing | **React Router v6** | Route awam + terlindung |
| Auth + Backend | **Supabase** | Auth (email/password + OAuth Google), Postgres, RLS, Storage |
| i18n | **react-i18next** | EN default, BM kedua |
| Ikon | **Hugeicons** (font CDN `hgi-stroke`) | Sama seperti design canvas |
| Font | Sora, Plus Jakarta Sans, Amiri | Google Fonts (Amiri untuk teks Arab) |
| Video | **YouTube (nocookie)** dibungkus komponen `<SecureVideo>` | Lihat §7 |
| AI Ustaz | **Google AI Studio (Gemini)** | Guna API key pengguna, simpan client-side |
| Pembayaran | **Bayarcash** (FPX / DuitNow / kad) | Sekali bayar, akses seumur hidup |
| Hosting | **Netlify** | SPA redirect, env var |
| Version control | **GitHub** | Push via `gh` CLI |

> **Status semasa (fasa ini):** Hanya **push ke GitHub** dahulu. Setup Supabase dan deploy Netlify **ditangguh** — kod ditulis "ready" dengan pemboleh ubah persekitaran (env var) sebagai placeholder.

---

## 3. Peranan & Kebenaran (Roles)

Dua peranan sahaja, disimpan dalam jadual `profiles.role`:

| Peranan | Akses |
|---|---|
| **user** (default) | Landing, Auth, Dashboard pelajar, Learning path, Audio, Kelas, AI Ustaz, Shop, Checkout, tetapan akaun sendiri |
| **admin** | Semua akses `user` + **Admin Panel**: urus pengguna & peranan, modul & unit, video (YouTube ID), kelas langsung, produk shop, pesanan, statistik |

Kawalan akses:
- Route terlindung guna `<ProtectedRoute>` (semak sesi Supabase).
- Route admin guna `<AdminRoute>` (semak `role === 'admin'`).
- Peringkat data dikuatkuasakan oleh **Row Level Security (RLS)** Supabase, bukan hanya UI.

---

## 4. Seni Bina & Struktur Folder

```
eduarabic/
├─ index.html
├─ vite.config.js
├─ tailwind.config.js
├─ postcss.config.js
├─ netlify.toml
├─ .env.example
├─ public/
│  └─ assets/logo.png
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx                 # Router + providers
│  ├─ index.css               # Tailwind + design tokens (CSS vars)
│  ├─ lib/
│  │  ├─ supabase.js          # Supabase client
│  │  └─ gemini.js            # Panggilan Google AI Studio
│  ├─ i18n/
│  │  ├─ index.js             # konfigurasi react-i18next
│  │  ├─ en.json
│  │  └─ ms.json
│  ├─ context/
│  │  ├─ AuthContext.jsx      # sesi + profil + role
│  │  └─ CartContext.jsx      # troli shop
│  ├─ components/
│  │  ├─ ui/                  # Button, Card, Input, Badge, Pill...
│  │  ├─ layout/              # Navbar, Footer, Sidebar, MobileTabBar
│  │  ├─ SecureVideo.jsx      # embed YouTube terlindung
│  │  ├─ LanguageToggle.jsx
│  │  ├─ PhoneMockup.jsx      # port drpd "Phone Mockup.dc.html"
│  │  ├─ ProtectedRoute.jsx
│  │  └─ AdminRoute.jsx
│  ├─ pages/
│  │  ├─ Landing.jsx
│  │  ├─ Auth.jsx
│  │  ├─ Dashboard.jsx
│  │  ├─ LearningPath.jsx
│  │  ├─ Lesson.jsx           # pemain video + latihan
│  │  ├─ AudioLibrary.jsx
│  │  ├─ Classes.jsx
│  │  ├─ AiUstaz.jsx
│  │  ├─ Shop.jsx             # katalog
│  │  ├─ Product.jsx          # butiran modul
│  │  ├─ Checkout.jsx
│  │  └─ admin/
│  │     ├─ AdminLayout.jsx
│  │     ├─ AdminDashboard.jsx
│  │     ├─ AdminUsers.jsx
│  │     ├─ AdminModules.jsx
│  │     ├─ AdminVideos.jsx
│  │     ├─ AdminClasses.jsx
│  │     └─ AdminOrders.jsx
│  └─ data/                   # data contoh sementara (sebelum Supabase penuh)
└─ supabase/
   └─ schema.sql              # migrasi jadual + RLS (untuk fasa akan datang)
```

---

## 5. Design System (dari canvas — WAJIB tiru tepat)

### Warna (CSS variables → Tailwind tokens)
```
--bg:          #070A14   (bg)
--bg-2:        #0B1020   (surface)
--panel:       rgba(255,255,255,.035)
--panel-2:     rgba(255,255,255,.06)
--ink:         #F3F5FA   (teks utama)
--ink-soft:    #A2AABD   (teks lembut)
--ink-faint:   #6B7488   (teks samar)
--primary:     #2FC49F   (hijau teal — jenama)
--primary-soft:#1C6D5C
--gold:        #F0B429   (aksen emas — badge/streak)
--violet:      #B9A7F0   (AI Ustaz)
--border:      rgba(255,255,255,.09)
--border-soft: rgba(255,255,255,.055)
--radius:      18–20px
```
Tema gelap sepenuhnya. Gradien radial latar (biru/teal/ungu) pada Landing, Auth, Shop.

Tema aksen Phone Mockup: **teal** `#17756A`, **sand** `#C0913F`, **crimson** `#A33241`.

### Tipografi
- **Sora** (700/800): tajuk besar, angka, jenama.
- **Plus Jakarta Sans** (400–700): teks badan / UI.
- **Amiri** (400/700): semua teks Arab (`dir="rtl"`).

### Tokens lain
- Radius kad: 16–22px. Butang: 11–13px.
- Bayang kad terapung: `0 40px 90px -40px rgba(0,0,0,.7)`.
- Animasi: `eaFade` (naik + pudar), `eaFloat` (apung 6–7s) untuk mockup.

---

## 6. Inventori Skrin, Komponen & Fungsi

> Senarai penuh setiap fail canvas dan apa yang perlu diport. Tiada yang dicicirkan.

### 6.1 Landing Page (`Landing Page.dc.html`)
**Bahagian:**
1. **Header sticky** — logo, nav (Features, Pricing, Audio, AI Ustaz, Reviews) dengan smooth-scroll, butang "Sign in".
2. **Hero** — tajuk "EduArabic.", subtajuk, dua CTA (Start free, View pricing), dua butang store (App Store / Google Play), baris rating ★★★★★. Grafik: 3 Phone Mockup (teal tengah terapung, sand & crimson tepi).
3. **Features "See EduArabic in action"** — 2 lajur langkah (9 langkah bernombor) + Phone Mockup (screen `lesson`) di tengah.
4. **Pricing** — 3 pelan (Free RM0 / Plus RM4.90 / Pro RM10.90), badge "Most popular", banner promo laman web.
5. **Compare plans** — jadual perbandingan (3 kumpulan: Modules, AI Ustaz, Classes & audio) dengan sel tick/dash/pill.
6. **Reviews** — 3 kad testimoni + rating 4.9/5.
7. **CTA akhir** — tajuk gradien, butang store.
8. **Footer** — logo, 3 lajur pautan (Product, Company, Legal), baris hak cipta + "Payments by Bayarcash".

**Fungsi/logik:** `scrollToId()` smooth-scroll; data-driven (`navLinks`, `storeBtns`, `stepsLeft/Right`, `plans`, `compareGroups`, `reviews`, `footerCols`).

### 6.2 Auth (`Auth.dc.html`)
**Susun atur:** dua panel — kiri jenama ("One account. Every lesson." + 3 perks), kanan kad borang.
**Komponen:** tab Sign in / Create account, medan (Full name [join sahaja], Email, Password), "Forgot password?" [signin sahaja], butang primer, pemisah "OR CONTINUE WITH", butang Google & Apple, "Back to home".
**State:** `mode: signin|join` menukar medan, placeholder password, label butang.
**Port React:** sambung ke Supabase `signInWithPassword`, `signUp`, `signInWithOAuth('google')`. Selepas jaya → `/dashboard`.

### 6.3 Student Dashboard (`Student Dashboard.dc.html`)
**Susun atur:** sidebar (250px) + main.
- **Sidebar:** logo; nav 6 item (Dashboard, Learning path, Audio Library, My classes, AI Ustaz, Achievements); kad "Upgrade to Plus"; profil pengguna + settings.
- **Topbar:** salam "Assalamualaikum, {nama}", streak (fire 12), XP (1,240), loceng notifikasi.
- **Kad "Continue learning":** gradien teal, tag NAHW·Unit 3 & Clip 2/5, tajuk + teks Arab, butang Resume, bar kemajuan 40%.
- **Weekly goal:** 7 hari (tick/flash today/lock), kad badge "2 more days".
- **Learning path:** senarai node (done/active/locked) dengan penyambung garisan, ikon jenis (Clip/Exercise/Audio/Test).
- **Upcoming classes:** 2 kad kelas (Join Zoom / Remind me).
- **Kad "Ask AI Ustaz".**
**Fungsi:** `week`, `path` (nodeDone/Active/Locked), `classes` — semua data-driven; nanti dari Supabase (progress pengguna).

### 6.4 AI Ustaz (`AI Ustaz.dc.html`)
**Susun atur:** sidebar (sama) + kawasan chat.
- **Header chat:** avatar AI, status "Online", pill status API key, butang settings.
- **Panel Settings (slide-in):** input Google AI Studio API key (toggle reveal), pautan dapatkan key, pilih model (gemini-2.5-flash/pro, 2.0-flash), persona ustaz, butang Save, nota keselamatan.
- **Senarai mesej:** gelembung user (RTL) & AI; kad pembetulan ("You wrote" dicoret merah / "Correct" hijau + "Why").
- **Input bar:** cip cadangan, textarea auto, butang hantar; nota "AI Ustaz can make mistakes".
- **Kuota:** kad "AI Ustaz quota 3/5" di sidebar.
**Fungsi/logik:** `state.messages`, `push()`, auto-scroll, simpan API key ke `localStorage` (`eduarabic_gai_key`). Port React: panggil Gemini API sebenar via `src/lib/gemini.js`, minta output berstruktur (asal/betul/penjelasan).

### 6.5 Shop (`Shop.dc.html`) — 3 view dalam 1
- **Catalog:** tajuk, carian, penapis kategori (All, Nahw, Sarf, Conversation, Qur'an, Balaghah, Bundle), grid kad produk (kover gradien+ikon, level, badge bundle, kategori, tajuk EN + Arab, blurb, lessons/hours, harga + harga lama coret, butang Add). Keadaan "no results".
- **Product:** kover besar, 3 highlight, kategori, tajuk EN/Arab, penerangan, harga, Buy now / Add to cart, senarai "What's inside" (curriculum).
- **Checkout:** senarai troli (buang item), borang butiran (nama/email/telefon), pilih kaedah bayar (FPX/DuitNow QR/Kad), ringkasan pesanan + subtotal, butang "Pay RMx". Keadaan **empty cart** & **payment success** (ref + kaedah).
**Data:** 6 produk (`PRODUCTS`) — Nahw Foundations, Sarf Essentials, Muhadathah, Qur'anic Arabic, Balaghah, Complete Arabic Pathway (bundle). Semua harga, level, curriculum sudah ditetapkan (guna sebagai seed).
**Fungsi:** `addToCart`, `removeFromCart`, `payNow` (jana ref). Port React: `CartContext`, integrasi Bayarcash sebenar (§8).

### 6.6 Phone Mockup (`Phone Mockup.dc.html`) — komponen boleh guna semula
Props: `variant` (teal/sand/crimson), `screen` (home/lesson). Elemen: bingkai telefon, status bar, header "Hello, Ahmad", skrin **home** (Level 5, XP, bar progress, Continue learning, Free audio) atau **lesson** (pemain, ayat Arab, latihan pilihan), tab bawah (Home/Path/Audio/AI). Port sebagai `<PhoneMockup variant screen />`.

---

## 7. Video Terlindung — Komponen `<SecureVideo>`

**Matlamat:** letak kandungan video guna YouTube tetapi kurangkan kebolehan pengguna biasa mencuri pautan (gaya Vimeo). **Nota jujur:** YouTube percuma tidak dapat 100% menghalang pengguna teknikal daripada mencari video ID. Pendekatan ini menghalang majoriti pengguna biasa.

**Reka bentuk komponen (fungsi boleh guna semula):**
- Terima prop `videoId` (bukan URL penuh) — ID tidak pernah dipapar sebagai pautan yang boleh diklik.
- Guna domain **`youtube-nocookie.com`** (privacy-enhanced) dengan parameter:
  `rel=0` (tiada video berkaitan), `modestbranding=1`, `controls=1`, `disablekb=0`, `iv_load_policy=3` (tiada anotasi), `fs=1`, `playsinline=1`.
- **Overlay lutsinar** menutup jalur atas (logo/tajuk YouTube) dan sudut "Watch on YouTube" supaya tiada pautan keluar boleh diklik.
- `pointer-events` diurus supaya klik pada kawasan logo tidak membawa ke YouTube, tetapi butang main/pause tetap berfungsi.
- Bekas dengan `oncontextmenu` dinyahaktif (halang klik kanan) dan `user-select:none`.
- Video ditetapkan **Unlisted** di YouTube (tidak muncul dalam carian/channel).
- Sepenuhnya responsif (`aspect-ratio: 16/9`, `max-width:100%`).
- (Fasa akan datang / opsyen berbayar) Jika perlu domain-lock sebenar seperti Vimeo: cadangan **Cloudflare Stream** atau **Vimeo Pro** — didokumen sebagai upgrade, tidak dilaksana sekarang.

Admin memasukkan hanya **YouTube video ID** untuk setiap pelajaran melalui Admin Panel.

---

## 8. Integrasi Pembayaran — Bayarcash

- Kaedah: **FPX** (online banking), **DuitNow QR**, **Kad kredit/debit**.
- Model: **sekali bayar**, akses modul seumur hidup.
- Aliran: Checkout → cipta payment intent (server/Edge Function) → redirect ke Bayarcash → callback/return → sahkan checksum (HMAC SHA256) → buka kunci modul dalam `enrollments`.
- Simpan: `orders` (status, ref, kaedah, jumlah), `order_items`, `enrollments`.
- **Fasa ini:** UI checkout + placeholder; integrasi Bayarcash sebenar guna skill `bayarcash` apabila Supabase disambung.

---

## 9. Dwibahasa (i18n) — EN default + BM

- `react-i18next`; kunci teks dalam `en.json` & `ms.json`.
- **EN default**; toggle bahasa (komponen `<LanguageToggle>`) di navbar & sidebar; simpan pilihan dalam `localStorage`.
- Semua teks UI (label, butang, tajuk bahagian) melalui `t('...')`.
- **Teks Arab kandungan** (ayat, istilah nahw) **kekal Arab** dengan `dir="rtl"` dan font Amiri — bukan sebahagian terjemahan UI.
- Susun atur guna sifat logikal (`margin-inline-start`, `padding-inline`) supaya sedia RTL jika perlu kemudian.

---

## 10. Skema Data Supabase (fasa akan datang)

Jadual teras (ringkas):
- `profiles` — id (fk auth.users), full_name, role (`user`|`admin`), plan (`free`|`plus`|`pro`), xp, streak, locale.
- `modules` — id, slug, category, title_en, title_ar, level, description, price, old_price, cover, icon, is_bundle.
- `units` — id, module_id, title, order.
- `lessons` — id, unit_id, type (`clip`|`exercise`|`audio`|`test`), title, title_ar, youtube_id, duration, order.
- `progress` — user_id, lesson_id, status (`done`|`active`|`locked`), completed_at.
- `classes` — id, title, tutor, type (`group`|`one_on_one`), start_at, join_url, plan_required.
- `orders` / `order_items` / `enrollments` — pembayaran & akses.
- `ai_usage` — user_id, count, month (kuota AI Ustaz).

**RLS:** pengguna baca/tulis data sendiri sahaja; admin (`role='admin'`) penuh; modul/lessons boleh dibaca umum untuk katalog, kandungan video hanya untuk yang enrolled.

---

## 11. Admin Panel (reka baharu — tiada dalam canvas)

Guna design tokens & komponen yang sama (tema gelap, sidebar). Halaman:
- **Dashboard admin** — statistik: jumlah pengguna, pendapatan, pendaftaran, kelas akan datang.
- **Users** — senarai, cari, tukar peranan (user↔admin), tukar plan, nyahaktif.
- **Modules & Units** — CRUD modul, unit, harga, kover.
- **Videos/Lessons** — CRUD pelajaran; medan **YouTube ID**, jenis, tempoh, susunan.
- **Classes** — jadual kelas langsung, pautan join, plan diperlukan.
- **Orders** — senarai pesanan, status bayaran, ref Bayarcash.

Semua dikuatkuasakan RLS + `<AdminRoute>`.

---

## 12. Responsif Mudah Alih (100%)

- Semua grid `1fr 1fr` / `repeat(3,1fr)` → satu lajur pada mobile (`grid-cols-1 md:grid-cols-3`).
- Hero jadi satu lajur; grafik Phone Mockup dikecilkan/ditapis pada mobile.
- Sidebar dashboard/admin → **bottom tab bar** atau drawer pada mobile (`<MobileTabBar>` guna 4 item nav Phone Mockup).
- Jadual "Compare plans" → boleh skrol mendatar dalam bekas `overflow-x:auto`.
- Chat AI Ustaz penuh skrin pada mobile; input bar melekat bawah.
- Uji pada 360px, 390px, 768px, 1024px, 1280px.

---

## 13. Deploy & DevOps

1. **GitHub (sekarang):** init repo, commit design files + PRD + prompt, push via `gh` CLI.
2. **Netlify (nanti):** `netlify.toml` dengan build `vite build`, publish `dist`, SPA redirect `/* → /index.html 200`. Env var: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. **Supabase (nanti):** jalankan `supabase/schema.sql`, dayakan Auth (email + Google), seed modul dari `PRODUCTS`.
4. **Env:** `.env.example` disertakan; kredensial sebenar tidak dikomit.

---

## 14. Kriteria Terima (Acceptance)

- [ ] Kelima-lima skrin canvas dihasilkan semula dengan tepat (warna, font, susun atur, komponen) dalam React.
- [ ] Mobile 100% responsif pada semua breakpoint diuji.
- [ ] Toggle EN/BM berfungsi; EN default; teks Arab kekal RTL/Amiri.
- [ ] Routing lengkap + route terlindung + route admin.
- [ ] `<SecureVideo>` main YouTube nocookie dengan overlay perlindungan.
- [ ] Auth Supabase (email + Google) — placeholder env sedia.
- [ ] Shop: katalog → produk → checkout → success (aliran UI penuh, CartContext).
- [ ] AI Ustaz: chat + settings API key (localStorage) + panggilan Gemini.
- [ ] Admin Panel: 6 halaman dengan CRUD (UI + hook data).
- [ ] Bina tanpa ralat (`vite build`); dipush ke GitHub.

---

## 15. Skop Fasa

**Fasa 1 (sekarang):** Analisis + PRD + prompt Claude Code + push GitHub.
**Fasa 2:** Bina React penuh (Claude Code) dari `CLAUDE_CODE_PROMPT.md`.
**Fasa 3:** Sambung Supabase (auth, schema, RLS, seed).
**Fasa 4:** Integrasi Bayarcash + Gemini sebenar.
**Fasa 5:** Deploy Netlify + domain.

---
*Rujukan reka bentuk: `EDUARABIC/*.dc.html` (Landing Page, Auth, Student Dashboard, AI Ustaz, Shop, Phone Mockup).*
