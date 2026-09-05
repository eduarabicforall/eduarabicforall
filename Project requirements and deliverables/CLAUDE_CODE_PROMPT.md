# Prompt untuk Claude Code — Bina EduArabic for All (React)

> Salin keseluruhan fail ini sebagai arahan pertama kepada Claude Code dalam folder projek ini.
> Rujukan penuh ada dalam `PRD.md` (v3.0, dalam folder yang sama) dan fail `EDUARABIC/*.dc.html` — **baca kedua-duanya dahulu**, terutama §4 dan §6 dalam PRD untuk senarai lengkap komponen dan isu yang perlu diperbetulkan semasa port.

---

## Peranan kamu

Kamu jurutera frontend & backend senior. Bina aplikasi web produksi **EduArabic for All** dengan meniru **100%** UI daripada 10 fail Claude Design canvas (`EDUARABIC/*.dc.html`), sambil **membetulkan** isu/ketidakkonsistenan yang disenaraikan dalam `PRD.md §6` semasa port (bukan tiru bulat-bulat termasuk pepijat mock).

## Susunan teknologi (tetap — jangan tukar)

**React 18 + Vite + Tailwind CSS + React Router v6 + Supabase** (Auth + Postgres + RLS + Edge Functions) **+ Cloudflare R2** (video) **+ Cloudflare Pages** (hosting, deploy via GitHub) **+ Bayarcash + ToyyibPay** (payment gateway, dua-dua) **+ GSAP** (animasi Landing) **+ Hugeicons** (ikon) + Google Fonts (Sora, Plus Jakarta Sans, Amiri).

Bahasa UI: **EN sebagai default**. Sediakan struktur `react-i18next` (folder `src/i18n/`) tetapi isi **EN sahaja** buat masa ini — jangan bina borang/toggle bahasa dalam UI lagi.

Peranan: **dua sahaja** — `student` (default) dan `admin`.

## Peraturan penting

1. **Baca dahulu** setiap fail dalam `EDUARABIC/` — markup, `renderVals()` (data + state), logik (`DCLogic`). Tukar sintaks canvas: `sc-for` → `.map()`, `sc-if` → `&&`/ternary, state class `DCLogic` → `useState`/`useReducer`. Fail `support.js` ialah **runtime alat design sahaja** — JANGAN port apa-apa daripadanya, ia bukan logik aplikasi.
2. **Design tokens** — dua set (app = dark, Landing = light), letak sebagai CSS variables dalam `src/index.css` DAN petakan ke `tailwind.config.js`. Nilai penuh dalam `PRD.md §5`.
3. **Betulkan 11 isu dalam `PRD.md §6` semasa bina** — jangan tiru terus mock yang rosak:
   - Format kod aktivasi: satu input `XXXX-XXXX` (padan output Admin `PREFIX-NNNN`), buang state `part2` yang tidak dipakai.
   - Seragamkan susunan `<BottomTabBar>` (Home, Grammar, AI Ustaz, Shop) — satu komponen dikongsi semua skrin app, bukan disalin berulang dengan susunan berbeza.
   - Tambah hamburger menu mobile berfungsi pada Landing (`<640px`) — bukan sekadar sembunyikan nav.
   - Gemini API key: **satu** key global disimpan `admin_settings` (server-side sahaja, encrypted), borang admin PATCH ke Edge Function — client tidak sekali-kali terima nilai key sebenar (masked/placeholder sahaja).
   - Upload bahan (audio ke Storage/R2, video Grammar topic ke R2) — UI upload sebenar dengan progress bar, bukan mock counter.
   - Borang produk admin: tambah medan upload imej + penerangan (textarea).
   - Checkout: pilihan kaedah bayar eksplisit **Bayarcash** vs **ToyyibPay** (bukan radio "FPX/DuitNow" generik).
   - Kuiz Grammar Topic: submit rekod ke jadual `quiz_attempts`, kira progress topik/modul sebenar.
   - Tentukan & laksana logik unlock topik Grammar (cadangan: sequential — topik n+1 unlock lepas topik n `done`).
   - Progress bar modul di Dashboard: kira sebenar daripada rekod audio/kuiz selesai, bukan hardcode.
   - Google OAuth: boleh bina butang UI dahulu, sambungan Google Cloud Console sebagai TODO jika belum ada kredensial.
4. **Mobile 100% responsif.** Skrin app (Dashboard/Grammar/AudioLibrary/AIUstaz/Shop/Activate) sudah direka dalam bingkai mobile 402px — buat ia **full-width responsive** sebenar (bukan bingkai tetap) pada viewport mudah alih sebenar, kekalkan proporsi/reka letak yang sama. Admin panel (desktop-first, sidebar 250px) perlu collapse ke drawer/bottom-nav pada mobile.
5. **Dua peranan:** `student` (default) & `admin`. `<ProtectedRoute>` (ada sesi) + `<AdminRoute>` (`role==='admin'`).
6. **Env var placeholder** — JANGAN hardcode kredensial. `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Sedia `.env.example`. Kredensial Bayarcash/ToyyibPay/R2 disimpan sebagai Cloudflare Pages env vars / Supabase secrets — **bukan** dalam kod.

## Struktur folder

Ikut `PRD.md §7` dengan tepat.

## Susunan kerja (buat mengikut urutan)

1. **Scaffold Vite React**, pasang: `react-router-dom @supabase/supabase-js react-i18next gsap`. Setup Tailwind.
2. **Design system:** `index.css` (CSS vars dua set — app dark + landing light), `tailwind.config.js`. Komponen UI asas `src/components/ui/` (Button, Card, Input, Badge, Pill).
3. **Layout dikongsi:** `<BottomTabBar>` (seragam), `<Navbar>` (Landing, dengan mobile hamburger), `AdminLayout` (sidebar + collapse mobile).
4. **Landing.jsx** — 8 seksyen ikut `Landing.dc.html`, port animasi GSAP (`gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)`, smooth-scroll, stagger reveal, float, shine), FAQ accordion. Guna tema **light**.
5. **Auth.jsx** — 3 view (signin/signup/forgot) dalam satu komponen dengan state `view`, sambung Supabase `signInWithPassword`/`signUp`/`resetPasswordForEmail`/`signInWithOAuth('google')`.
6. **Dashboard.jsx** — senarai modul aktif (query `user_modules` join `modules`), progress bar sebenar, kad Activate + kad Grammar.
7. **Activate.jsx** — borang kod (format diselaraskan), RPC Supabase sahkan kod & insert `user_modules`.
8. **AudioLibrary.jsx** — tab unit + senarai track, player audio sebenar (HTML5 `<audio>` atau library ringan), sumber Supabase Storage/R2.
9. **AiUstaz.jsx** — chat UI + pemilih modul, panggil Edge Function `ai-ustaz-chat` (hantar `module_id` + mesej sahaja, Edge Function ambil API key + system prompt dari `admin_settings`/`module_ai_config`, panggil Gemini, log ke `ai_usage_log`, tegur bila cecah `daily_quota`).
10. **Grammar.jsx + GrammarTopic.jsx** — senarai topik dengan status unlock sebenar, video R2 (`<SecureVideo>`), 3 jenis kuiz (MCQ/Order/TF), submit ke `quiz_attempts`.
11. **Shop.jsx / Product.jsx / Checkout.jsx** — katalog dari `products` (aktif + `on_sale`), checkout dengan borang alamat + pilihan Bayarcash/ToyyibPay, insert `orders`+`order_items`, redirect ke gateway sebenar.
12. **Edge Functions:** `bayarcash-webhook`, `toyyibpay-webhook` (sahkan callback, kemaskini `orders.payment_status`), `activate-module` (RPC sah kod), `ai-ustaz-chat` (proxy Gemini).
13. **Admin Panel** — 8 skrin ikut `PRD.md §4.10`, wire semua ke Supabase sebenar (bukan mock state tempatan): Dashboard (query agregat), Manage admins (CRUD `admins`/`profiles.role`), Manage materials (CRUD modul→unit→audio, upload sebenar), Manage products (CRUD + upload imej ke Storage/R2), Activation codes (generate batch sebenar + insert DB + export CSV dari data sebenar), Orders (query + update shipping status), AI console (SATU key global → `admin_settings` via Edge Function, per-modul config → `module_ai_config`), Profile settings.
14. **Routing penuh** dalam `App.jsx` + `AuthContext`.
15. **`_redirects`** (`/* /index.html 200`) untuk Cloudflare Pages SPA routing, `.env.example`, `supabase/schema.sql` (dari `PRD.md §8`).
16. **Verify:** `npm run build` mesti lulus tanpa ralat. Uji mobile pada 360/390/768/1024/1280. Semak setiap 11 isu §6 PRD sudah dibetulkan (bukan sekadar disalin daripada mock).

## Spesifikasi `<SecureVideo src="..." title="..." />`

- Video daripada Cloudflare R2 (via Worker gatekeeper URL, bukan URL bucket awam terus).
- Bekas `position:relative; aspect-ratio:16/9; max-width:100%; border-radius:16px; overflow:hidden`.
- `onContextMenu={e=>e.preventDefault()}`, `controlsList="nodownload"`, `user-select:none` pada overlay.
- Nota kod: perlindungan ini menghalang pengguna biasa sahaja; untuk domain-lock/DRM sebenar guna signed URL token dengan expiry pendek dari Worker.

## Design tokens (rujukan pantas — lihat `PRD.md §5` untuk set penuh)

```
App (dark): bg #070A14 · ink #F3F5FA · ink-soft #A2AABD · ink-faint #6B7488
primary #2FC49F · gold #F0B429 · violet #B9A7F0 · danger #f06868
Landing (light): bg #FFFFFF · ink #14161C · ink-soft #5B6472 · ink-faint #8B93A3
Font: Sora (tajuk) · Plus Jakarta Sans (UI) · Amiri (Arab)
```

## Output yang dijangka

Repo React lengkap yang `npm run dev` & `npm run build` berjalan, meniru UI canvas dengan tepat (dengan 11 pembetulan §6 PRD terlaksana), mobile 100% responsif, EN sahaja, dua peranan (student/admin), video R2, audio Storage, AI Ustaz per-modul dengan satu API key server-side, Shop dengan Bayarcash+ToyyibPay, sedia deploy ke Cloudflare Pages melalui GitHub.

---
*Untuk butiran penuh setiap skrin, komponen, data ujian dan skema, rujuk `PRD.md`.*
