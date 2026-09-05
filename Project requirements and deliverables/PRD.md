# PRD — EduArabic for All

**Product Requirements Document**
Version 3.0 · 5 September 2026 · Pemilik: Afiq

> Versi ini dibina terus daripada design canvas sebenar yang telah dihasilkan (`EDUARABIC/*.dc.html` dalam folder "Project requirements and deliverables") — bukan cadangan teori sahaja. Setiap komponen, state dan fungsi dalam canvas telah dianalisis dan disenaraikan supaya tiada yang tercicir semasa port ke React.

---

## 1. Ringkasan Produk

**EduArabic for All** ialah Web App yang menyokong siri modul Bahasa Arab **fizikal** (buku/kad set). Setiap modul fizikal ada QR code + kod aktivasi unik yang membuka akses digital: Audio Library dan AI Ustaz khusus modul tersebut. Modul **Grammar** disediakan percuma untuk semua akaun berdaftar (dengan video pengajaran + kuiz interaktif). Terdapat Shop dalam-app untuk beli modul fizikal terus (dihantar secara pos), di samping jualan offline/reseller.

### Perubahan versi ini berbanding PRD v2.0
| Perkara | v2.0 | v3.0 (semasa, ikut arahan terkini) |
|---|---|---|
| Hosting | Netlify | **Cloudflare Pages** (push GitHub → auto-deploy) |
| Video/kandungan media | Tiada dinyatakan khusus | **Cloudflare R2** untuk video (lesson video Grammar topics), audio boleh kekal di Supabase Storage atau turut guna R2 |
| Peranan | user / admin | **student** / admin (student = nama rasmi peranan pengguna biasa) |
| Bahasa UI | EN + BM (i18n) | **EN sebagai default** (struktur i18n-ready boleh tambah bahasa lain kemudian, tapi hanya EN dibina buat masa ini) |
| Payment gateway | Cadangan (Billplz/ToyyibPay/Bayarcash) | **Bayarcash + ToyyibPay** (dua-dua disediakan, pilih semasa checkout) |
| Sumber reka bentuk | Prompt/cadangan sahaja | **Design canvas sebenar sudah siap** (10 fail `.dc.html`) — rujukan visual 100% |

---

## 2. Susunan Teknologi (Tech Stack) — MUKTAMAD

| Lapisan | Teknologi |
|---|---|
| Framework | **React 18** (function components + hooks) |
| Build tool | **Vite** |
| Styling | **Tailwind CSS** |
| Routing | **React Router v6** |
| Auth + Backend | **Supabase** (Auth email/password + Google OAuth, Postgres, RLS) |
| Storage — Audio | Supabase Storage (atau R2 — lihat §9) |
| Storage — Video | **Cloudflare R2** (video kuliah Grammar topics, dan sebarang video lain pada masa depan) |
| AI | **Google Gemini API**, dipanggil melalui **Supabase Edge Function** (proxy server-side — API key admin tidak pernah terdedah ke client) |
| Payment | **Bayarcash** + **ToyyibPay** (kedua-dua diaktifkan, pengguna pilih semasa checkout) |
| Hosting | **Cloudflare Pages** |
| CI/CD | Push ke **GitHub** → auto-build & deploy ke Cloudflare Pages |
| Animasi | **GSAP** (ScrollTrigger, ScrollToPlugin) — digunakan pada Landing page |
| Ikon | **Hugeicons** (`hgi-stroke-rounded` font CDN) |
| Font | **Sora** (tajuk), **Plus Jakarta Sans** (UI), **Amiri** (teks Arab) |
| i18n | Struktur `react-i18next` disediakan, **EN sahaja** dimuatkan buat masa ini |

---

## 3. Peranan & Kebenaran

Dua peranan sahaja:

| Peranan | Akses |
|---|---|
| **student** (default selepas daftar) | Landing (awam), Auth, Dashboard, Activate Module, Audio Library, AI Ustaz, Grammar module (percuma), Shop, Checkout, Profile |
| **admin** | Semua Admin Console: Dashboard, Manage admins, Manage materials, Manage products, Activation codes, Orders, AI console, Profile settings |

Tambah admin baharu: e-mel sahaja (tiada set password manual), log masuk terus guna Google Auth selepas e-mel disahkan wujud dalam senarai admin.

Kawalan akses: `<ProtectedRoute>` (student, perlu sesi) + `<AdminRoute>` (`role === 'admin'`). RLS Supabase kuatkuasa di peringkat data untuk `admin_api_keys`, `module_codes`, `orders`.

---

## 4. Inventori Skrin, Komponen & Fungsi (daripada design canvas — TIADA yang tercicir)

### 4.1 Landing (`Landing.dc.html`) — tema **terang** (light), berbeza daripada skrin app (gelap)
- Header sticky: logo, nav (How it works / Modules / AI Ustaz / Reviews), Sign in + Get started. **Nav & auth buttons hilang terus pada mobile <640px tanpa hamburger menu — PERLU DIBAIKI (§6.1).**
- Hero: badge "Physical modules, digital learning", tajuk "Listen, Speak & Repeat!", CTA "Start Now!" + "Browse modules", 3 trust badge (Endorsed by Arabic Specialists / AI Integrated / Audio Support), imej produk placeholder + kad terapung "Ai Ustaz Module".
- Section "How it works" (4 langkah): Get a module → Scan the QR → Enter your code → Learn.
- Section "AI Ustaz": mockup chat (Ustaz Hakim, Al Quran module) + penerangan "A different Ustaz for every module".
- Section "Modules": grid 4 kad produk (nama, unit count, harga RM, Add to Cart + Buy Now) — data: Bahasa Arab Pemula (RM39.90), Arab Tujuan Kerjaya (RM59.90), Bahasa Arab Al Quran (RM97.90), Anakku Berbahasa Arab (RM27.90). Sub-section "App features" (4 kad: Free Grammar module, Audio Library, AI Ustaz per module, Instant activation).
- Section "Reviews": 3 testimoni.
- Section "FAQ": accordion 7 soalan (guna `sc-for` + toggle state) — kandungan disediakan penuh dalam canvas (rujuk fail asal untuk teks tepat).
- Footer: logo, nav pautan, copyright.
- **Animasi GSAP:** smooth-scroll semua anchor link, hero fade-up stagger, scroll-triggered reveal (`.gs-stagger`, `.gs-reveal`), floating CTA button (`.gs-float`), shine sweep effect (`.gs-shine`) — semua guna `prefers-reduced-motion` matchMedia guard.

### 4.2 Auth (`Auth.dc.html`) — tema gelap
- Panel tunggal (bukan dua-lajur seperti v1.0), max-width 400px, link "Back to site".
- 3 view (state `view: signin|signup|forgot`): **Sign in** (Google button, email, password, "Forgot password?", submit, link ke Sign up), **Sign up/Create account** (Google button, full name, email, password, submit, link ke Sign in), **Forgot password** (2 sub-state: `notSent` — input email + "Send reset link"; `sent` — kad kejayaan "Check your email, expires in 30 minutes").

### 4.3 Dashboard (`Dashboard.dc.html`) — mobile app frame (402px, dark, bottom tab bar)
- Header: avatar bulat "NA" (initial nama) dengan dropdown menu (Profile settings / Change background / Log out), salam "Assalamualaikum, {nama}", ikon notifikasi.
- Senarai "MY MODULES": kad per modul (cover, nama, progress bar %, "X% · Y/Z units"), tekan → ke modul.
- Kad CTA "Activate a new module" (dashed border) → "Enter code" button → ke Activate.
- Kad "Grammar module — Free for your account" (aksen gold) → ke Grammar.
- Bottom tab bar: Home / Grammar / AI Ustaz / Shop.

### 4.4 Activate Module (`Activate.dc.html`)
- 3 state: `idle` (input kod 4-aksara uppercase + butang Activate), `error` (kad merah "Invalid code" + Try again), `success` (kad kejayaan + preview modul + "Start learning").
- **NOTA PENTING:** Kod aktivasi dalam design ini **satu medan 4-aksara sahaja** (`part1`), manakala kod yang dijana Admin (§4.9) berformat `PREFIX-NNNN` (contoh `QURN-8841`, 4 huruf + 4 digit). Ini **tidak konsisten** — perlu diselaraskan semasa bina React (cadangan: satu input format `XXXX-XXXX` atau padankan terus dengan format admin). Lihat §6.2.

### 4.5 Audio Library (`AudioLibrary.dc.html`)
- Header: tajuk + nama modul aktif.
- Tab unit horizontal-scroll (Unit 1–4, aktif ditanda warna primary).
- Senarai track per unit: butang play/pause bulat, tajuk EN + tajuk Arab (`dir="rtl"`, font Amiri), progress bar bila playing, durasi. Data ujian: 4 unit × 1–4 track setiap satu.
- Bottom tab bar (nota: susunan tab di sini **Home/Grammar/Shop/AI Ustaz** — beza susunan dengan Dashboard/Grammar yang guna Home/Grammar/AI Ustaz/Shop — **PERLU DISERAGAMKAN**, §6.3).

### 4.6 AI Ustaz (`AIUstaz.dc.html`)
- Header: nama Ustaz semasa (`currentModule.ustaz`), bar kuota (progress + label "12/60"), dropdown pilih modul (setiap modul ada Ustaz + nama berlainan — contoh Ustaz Hakim untuk Al Quran, Ustaz Zaid untuk Pemula).
- Senarai mesej (bubble kiri/kanan, RTL-aware untuk teks Arab pengguna).
- Input bar + butang hantar (bulat, ikon sent).
- State `chats` disimpan per-modul (`{ quran: [...], pemula: [...] }`) — bertukar modul kekalkan sejarah chat berasingan.
- **Tiada UI untuk masukkan API key sendiri** (betul — API key kini di Admin sahaja, konsisten dengan PRD).

### 4.7 Grammar (`Grammar.dc.html`)
- Header aksen gold, badge "FREE".
- Senarai 6 topik (Nouns & articles, Verb conjugation, Sentence structure, Case endings i'rab, Pronouns, Common particles) — setiap satu ada status `done` (tick hijau) atau `locked` (anak panah kelabu, tiada logik unlock sequential ditunjukkan secara eksplisit dalam mock — perlu ditakrifkan: unlock berperingkat ikut topik sebelum selesai, ATAU semua terbuka).

### 4.8 Grammar Topic (`GrammarTopic.dc.html`)
- 2 view: **lesson** (video player placeholder 16:9 + penerangan teks + senarai 3 jenis kuiz amalan: Multiple choice/8 soalan, Arrange the words/5, True & False/6) dan **quiz** (progress bar, 3 jenis soalan interaktif: MCQ pilihan, susun-atur perkataan Arab drag-to-pool, True/False) → "Finish quiz" kembali ke lesson.
- **Video di sini akan dihoskan di Cloudflare R2** (§9).
- Kuiz **tidak menyimpan markah/hasil** dalam mock — perlu wire ke Supabase untuk rekod attempt & progress sebenar (§6.4).

### 4.9 Shop (`Shop.dc.html`)
- 3 view: **Catalog** (senarai produk dengan kad — nama, unit, harga, butang Buy), **Product detail** (foto besar, nama, unit + "physical card & book set", harga, penerangan, nota penghantaran "Ships within 3–5 business days", Buy now), **Checkout** (ringkasan item, borang alamat penghantaran — Full name/Phone/Address, pilihan kaedah bayar — **UI sedia ada hanya "FPX/Online Banking" vs "DuitNow QR" sebagai visual sahaja, BELUM ada pilihan Bayarcash/ToyyibPay eksplisit — perlu ditambah**, ringkasan Subtotal/Shipping RM6/Total, Place order), **Done** (kejayaan pesanan, nota "activation code arrives with the module").

### 4.10 Admin (`Admin.dc.html`) — desktop, sidebar 250px + 7 seksyen
1. **Dashboard** — 4 kad statistik (Total users, Most active module, AI Ustaz messages 30d, Sales in-app), carta bar "Module activations" per modul.
2. **Manage admins** — input email + "Add admin", jadual (Email/Added/Remove).
3. **Manage materials** — sub-nav ikut modul (pokok modul), papar modul dipilih (nama + badge FREE jika berkenaan + unit count), senarai unit (tajuk + audio count + "+ Audio"), butang "+ Add unit". *(Mock ini hanya increment counter — perlu wire ke upload sebenar, §6.5.)*
4. **Manage products** — sub-nav filter (All/Active/Tidak Aktif), jadual (Product/Module/Price/Stock/Status toggle/Sell-in-app toggle/Edit), borang edit inline (Name/Price/Stock sahaja — **tiada upload imej atau medan penerangan**, §6.6), butang "+ New product".
5. **Activation codes** — borang jana kumpulan (pilih modul + kuantiti → Generate batch), butang Export CSV (blob download client-side), jadual kod (Code/Module/Batch/Activated count/Status/Enable-Disable). Format kod: `PREFIX-NNNN` (4 huruf modul + 4 digit).
6. **Orders** — sub-nav filter (All/Pending/Shipped/Delivered), jadual (Order/Customer/Total/Payment badge/Shipping status dropdown/View-Hide), baris expand papar alamat + item.
7. **AI console** — **SATU** medan Gemini API key global (masked/toggle-visible, "One key powers every module below"), tab pilih modul (Al Quran/Pemula/Kerjaya/Anakku), borang per-modul: Persona name, System prompt (textarea), Model (dropdown gemini-2.5-flash/pro), Daily quota/user, "Save configuration".
8. **Profile settings** (diakses via footer sidebar, bukan nav utama) — Full name, Email, Save changes, Change password (toggle reveal), Log out.
- **Toast notification** global (bawah-kanan) untuk semua tindakan (Product saved, Codes generated, CSV exported, Password updated, dsb).

---

## 5. Design Tokens (dari canvas sebenar)

**Skrin app (dark):**
```
--bg-app:      #070A14   (frame app)
--bg-outer:    #05070d   (backdrop di luar frame mobile — preview only, tak perlu dalam produksi)
--ink:         #F3F5FA
--ink-soft:    #A2AABD
--ink-faint:   #6B7488
--primary:     #2FC49F
--primary-soft:#1C6D5C
--gold:        #F0B429   (Grammar module, achievement)
--violet:      #B9A7F0   (AI Ustaz)
--danger:      #f06868
--border:      rgba(255,255,255,.09)
--panel:       rgba(255,255,255,.035)
--panel-2:     rgba(255,255,255,.06)
--radius:      16–20px (kad), 100px (pill/badge)
```
**Landing page (light):**
```
--bg-light:    #FFFFFF
--ink-light:   #14161C
--ink-soft-l:  #5B6472
--ink-faint-l: #8B93A3
--primary:     #2FC49F  (sama)
```
Font: **Sora** 700/800 (tajuk), **Plus Jakarta Sans** 400–700 (UI), **Amiri** 400/700 (Arab, `dir="rtl"`). Ikon: Hugeicons `hgi-stroke`.

---

## 6. Isu & Adjustment Diperlukan (gap antara canvas mock dan produk sebenar)

1. **Mobile nav Landing hilang tanpa hamburger** (<640px) — WAJIB tambah menu mobile berfungsi.
2. **Format kod aktivasi tak konsisten** — Activate.dc.html guna 1 medan 4-aksara, Admin jana kod format `PREFIX-NNNN`. **Keputusan:** satu medan input menerima format penuh `XXXX-XXXX` (padan dengan output admin), buang state `part2` yang tidak digunakan.
3. **Susunan bottom tab bar tidak seragam** antara skrin (Dashboard/Grammar guna Home-Grammar-AIUstaz-Shop, AudioLibrary guna Home-Grammar-Shop-AIUstaz) — **seragamkan** kepada satu susunan tetap (cadangan: Home, Grammar, AI Ustaz, Shop) dalam satu komponen `<BottomTabBar>` dikongsi.
4. **API key Gemini** dipaparkan sebagai input di client dalam mock (masked) — dalam produksi **mesti** disimpan di jadual server-side sahaja dan tidak pernah dihantar balik ke browser walaupun masked; borang admin hantar terus ke Edge Function untuk simpan, tidak render nilai sedia ada secara penuh.
5. **Upload bahan (audio/video) hanya mock counter** — perlu UI upload sebenar: audio → Supabase Storage/R2, video (Grammar topic) → Cloudflare R2, dengan progress indicator.
6. **Borang produk tiada upload imej & penerangan** — tambah medan `image` (upload ke R2/Storage) dan `description` (textarea) dalam borang admin.
7. **Kaedah bayar checkout belum eksplisit Bayarcash/ToyyibPay** — ganti radio "FPX/DuitNow" generik dengan pilihan jelas "Bayarcash" / "ToyyibPay" (atau papar kaedah dalam gateway lepas pilih salah satu penyedia).
8. **Kuiz Grammar Topic tidak simpan markah** — wire submit kuiz ke Supabase (`quiz_attempts`) untuk kira progress topik & keseluruhan modul Grammar.
9. **Logik unlock topik Grammar tidak jelas** (`done`/`locked` static dalam mock) — tentukan: unlock berperingkat (perlu selesai topik sebelum) atau semua terbuka serentak.
10. **Progress bar modul di Dashboard hardcoded** — perlu dikira sebenar daripada rekod audio selesai / unit selesai pengguna.
11. **Google OAuth** — butang wujud dalam Auth mock; sahkan sama ada nak aktifkan penuh atau letak sebagai "coming soon" pada fasa pertama (tak menghalang pelancaran jika belum setup Google Cloud Console).

---

## 7. Cadangan Struktur Folder React

```
eduarabic/
├─ index.html
├─ vite.config.js
├─ tailwind.config.js
├─ wrangler.toml / _redirects        # Cloudflare Pages SPA fallback
├─ .env.example
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx                        # Router
│  ├─ index.css
│  ├─ lib/
│  │  ├─ supabase.js
│  │  └─ r2.js                       # helper upload/URL R2 (via Worker/Edge Function)
│  ├─ context/AuthContext.jsx
│  ├─ components/
│  │  ├─ ui/                         # Button, Card, Input, Badge, Pill
│  │  ├─ layout/BottomTabBar.jsx     # seragam, §6.3
│  │  ├─ layout/Navbar.jsx           # Landing, dengan mobile hamburger, §6.1
│  │  ├─ ProtectedRoute.jsx
│  │  ├─ AdminRoute.jsx
│  │  └─ SecureVideo.jsx             # embed video R2
│  ├─ pages/
│  │  ├─ Landing.jsx
│  │  ├─ Auth.jsx                    # signin/signup/forgot dalam satu
│  │  ├─ Dashboard.jsx
│  │  ├─ Activate.jsx
│  │  ├─ AudioLibrary.jsx
│  │  ├─ AiUstaz.jsx
│  │  ├─ Grammar.jsx
│  │  ├─ GrammarTopic.jsx
│  │  ├─ Shop.jsx / Product.jsx / Checkout.jsx
│  │  └─ admin/
│  │     ├─ AdminLayout.jsx
│  │     ├─ AdminDashboard.jsx
│  │     ├─ AdminAdmins.jsx
│  │     ├─ AdminMaterials.jsx
│  │     ├─ AdminProducts.jsx
│  │     ├─ AdminCodes.jsx
│  │     ├─ AdminOrders.jsx
│  │     ├─ AdminAiConsole.jsx
│  │     └─ AdminProfile.jsx
│  └─ i18n/ (struktur EN sahaja buat masa ini)
└─ supabase/
   ├─ schema.sql
   └─ functions/
      ├─ ai-ustaz-chat/              # proxy Gemini
      ├─ activate-module/            # RPC sah kod
      ├─ bayarcash-webhook/
      └─ toyyibpay-webhook/
```

---

## 8. Cadangan Skema Database (Supabase)

```sql
profiles (id, email, full_name, role, created_at)               -- role: student | admin
modules (id, name, slug, cover_url, is_grammar_free, created_at)
units (id, module_id, title, order_index)
audio_tracks (id, unit_id, title_en, title_ar, storage_path, duration)
grammar_topics (id, order_index, title_en, video_r2_key, description, unlock_after_topic_id)
quiz_questions (id, topic_id, type, payload_json)                 -- type: mcq | order | tf
quiz_attempts (id, user_id, topic_id, score, completed_at)
module_ai_config (module_id PK, persona_name, system_prompt, model, daily_quota)
admin_settings (key PK, value_encrypted)                          -- simpan Gemini API key (SATU, global)
ai_usage_log (id, user_id, module_id, message_count, date)
products (id, name, description, price, image_url, module_id, stock, on_sale, is_active)
module_codes (id, code, module_id, batch_id, activated_count, status, created_at)
user_modules (id, user_id, module_id, activated_at, via_code_id)
orders (id, user_id, total, payment_provider, payment_status, shipping_status, shipping_address, created_at)
order_items (id, order_id, product_id, quantity, price)
admins (id, email, added_at)                                       -- atau guna profiles.role='admin' terus
```
RLS: `admin_settings` — tiada akses client (Edge Function sahaja); `module_codes` insert/select admin sahaja, `user_modules` insert melalui RPC yang sahkan kod aktif.

---

## 9. Cloudflare R2 — Video & Media

- Video Grammar Topic (`grammar_topics.video_r2_key`) dimuat naik oleh admin melalui panel Manage materials → disimpan dalam bucket R2 → diakses melalui **Cloudflare Worker** sebagai gatekeeper (elak hotlink terus, boleh tambah signed URL/expiring token kemudian).
- Audio boleh kekal di Supabase Storage (lebih ringkas untuk fasa pertama) ATAU turut dipindah ke R2 jika volum tinggi — keputusan boleh dibuat semasa isu kos storan timbul.
- `<SecureVideo src="{r2Url}" />` — bekas `aspect-ratio:16/9`, overlay minimum untuk elak right-click save terus (bukan DRM sebenar — nota keselamatan sama seperti v1.0).

---

## 10. Deployment

1. Push kod ke **GitHub** (repo `EDUARABICFORALL` atau nama baharu ikut keperluan).
2. Sambungkan repo ke **Cloudflare Pages** — build command `npm run build`, output `dist/`.
3. `_redirects` (`/* /index.html 200`) untuk SPA routing.
4. Env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) ditetapkan dalam Cloudflare Pages project settings — **bukan** dalam kod.
5. Cloudflare R2 bucket + Worker gatekeeper disediakan berasingan, URL/endpoint disambung melalui env var.

---
*Rujuk `EDUARABIC/*.dc.html` dalam folder "Project requirements and deliverables" untuk setiap butiran visual & interaksi sebelum bina setiap skrin.*
