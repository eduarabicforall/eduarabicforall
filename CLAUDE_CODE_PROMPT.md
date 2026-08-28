# Prompt untuk Claude Code — Bina EduArabic for All

> Salin keseluruhan fail ini sebagai arahan pertama kepada Claude Code dalam folder projek ini.
> Rujukan reka bentuk penuh ada dalam `PRD.md` dan fail `EDUARABIC/*.dc.html`. Baca kedua-duanya dahulu.

---

## Peranan kamu

Kamu jurutera frontend senior. Bina aplikasi web produksi **EduArabic for All** dengan meniru **100%** UI daripada fail Claude Design canvas (`EDUARABIC/*.dc.html`). Warna, tipografi, jarak, radius, bayang dan susun atur mesti sepadan dengan design canvas itu.

## Susunan teknologi (tetap)

React 18 + **Vite** + **Tailwind CSS v3** + **React Router v6** + **Supabase** (auth & backend) + **react-i18next** (EN default, BM kedua) + **Hugeicons** (font CDN `hgi-stroke`) + Google Fonts (Sora, Plus Jakarta Sans, Amiri).

## Peraturan penting

1. **Baca dahulu** setiap fail dalam `EDUARABIC/` — di dalamnya ada markup, `renderVals()` (data), dan logik state. Tukar sintaks canvas (`sc-for`→`.map()`, `sc-if`→`&&`/ternary, `dc-import name="Phone Mockup"`→`<PhoneMockup/>`, `DCLogic` state→`useState`/`useReducer`).
2. **Design tokens** letak sebagai CSS variables dalam `src/index.css` DAN petakan ke `tailwind.config.js` (`theme.extend.colors`). Nilai ada dalam `PRD.md §5`.
3. **Jangan hardcode teks UI** — semua melalui `t('kunci')`. Isi `en.json` + `ms.json`. **EN default.** Teks Arab kandungan (ayat, istilah) **kekal Arab**, `dir="rtl"`, font Amiri — bukan terjemahan UI.
4. **Mobile 100% responsif.** Grid tukar ke satu lajur pada mobile; sidebar → bottom tab bar/drawer; jadual boleh skrol mendatar. Guna sifat logikal (`ms-`, `me-`, `ps-`, `pe-`).
5. **Dua peranan:** `user` (default) & `admin`. `<ProtectedRoute>` (ada sesi) + `<AdminRoute>` (`role==='admin'`).
6. **Env var placeholder** — JANGAN minta atau hardcode kredensial. Guna `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Sedia `.env.example`. **Jangan** cuba sambung ke Supabase sebenar atau deploy Netlify dalam fasa ini.

## Struktur folder

Ikut `PRD.md §4` dengan tepat.

## Susunan kerja (buat mengikut urutan)

1. **Scaffold Vite React**, pasang: `react-router-dom @supabase/supabase-js i18next react-i18next`. Setup Tailwind (`tailwind.config.js`, `postcss.config.js`, arahan `@tailwind` dalam `index.css`).
2. **Design system:** `index.css` (CSS vars + font import + keyframes `eaFade`/`eaFold`), `tailwind.config.js` (warna, font, radius). Komponen UI asas dalam `src/components/ui/` (Button, Card, Input, Badge, Pill, IconButton).
3. **i18n:** konfigurasi `src/i18n/index.js`, `<LanguageToggle>`, isi `en.json`/`ms.json` semasa bina setiap halaman.
4. **Layout:** `Navbar`, `Footer` (awam); `Sidebar` + `MobileTabBar` (app); `AdminLayout`.
5. **Komponen khas:** `PhoneMockup.jsx` (props `variant`,`screen` — port drpd Phone Mockup.dc.html) dan `SecureVideo.jsx` (lihat spesifikasi bawah).
6. **Halaman awam:** `Landing` (8 bahagian, smooth-scroll), `Auth` (tab signin/join, Supabase auth + Google OAuth).
7. **Halaman app:** `Dashboard`, `LearningPath`, `Lesson` (guna `<SecureVideo>` + latihan), `AudioLibrary`, `Classes`, `AiUstaz`.
8. **Shop:** `Shop` (katalog+carian+penapis), `Product`, `Checkout` (CartContext, empty/success state, kaedah bayar UI). Seed 6 produk daripada tatasusunan `PRODUCTS` dalam Shop.dc.html.
9. **AI Ustaz:** chat + panel settings (API key → `localStorage` kunci `eduarabic_gai_key`), `src/lib/gemini.js` panggil Google AI Studio; minta output berstruktur {asal, betul, penjelasan} untuk kad pembetulan.
10. **Admin Panel:** 6 halaman (`AdminDashboard`, `AdminUsers`, `AdminModules`, `AdminVideos`, `AdminClasses`, `AdminOrders`) — UI + hook data (mock dulu, sedia untuk Supabase).
11. **Routing** penuh dalam `App.jsx` + providers (`AuthContext`, `CartContext`, i18n).
12. **`netlify.toml`** + `.env.example` + `supabase/schema.sql` (dari `PRD.md §10`, untuk fasa akan datang).
13. **Verify:** `npm run build` mesti lulus tanpa ralat. Uji mobile pada 360/390/768/1024/1280. Semak toggle EN/BM.

## Spesifikasi `<SecureVideo videoId="..." title="..." />`

- Embed `https://www.youtube-nocookie.com/embed/{videoId}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`.
- Bekas `position:relative; aspect-ratio:16/9; max-width:100%; border-radius:16px; overflow:hidden`.
- **Overlay** menutup jalur atas (~60px) dan sudut kanan bawah supaya logo/tajuk/"Watch on YouTube" tidak boleh diklik; overlay `pointer-events:none` di kawasan kawalan main supaya butang play tetap berfungsi (letak overlay hanya pada jalur atas + sudut).
- `onContextMenu={e=>e.preventDefault()}`, `user-select:none`.
- Terima hanya `videoId` (bukan URL) — jangan render pautan YouTube yang boleh diklik.
- Komentar dalam kod: nota bahawa perlindungan ini menghalang pengguna biasa sahaja; untuk domain-lock sebenar guna Cloudflare Stream / Vimeo Pro (fasa akan datang).

## Design tokens (rujukan pantas)

```
bg #070A14 · surface #0B1020 · panel rgba(255,255,255,.035) · panel-2 rgba(255,255,255,.06)
ink #F3F5FA · ink-soft #A2AABD · ink-faint #6B7488
primary #2FC49F · primary-soft #1C6D5C · gold #F0B429 · violet #B9A7F0
border rgba(255,255,255,.09) · border-soft rgba(255,255,255,.055) · radius 18–20px
Font: Sora (tajuk), Plus Jakarta Sans (UI), Amiri (Arab)
Phone theme: teal #17756A · sand #C0913F · crimson #A33241
```

## Output yang dijangka

Repo React lengkap yang `npm run dev` & `npm run build` berjalan, meniru UI canvas dengan tepat, mobile responsif, dwibahasa EN/BM, dua peranan, video terlindung, dan sedia disambung ke Supabase/Bayarcash/Netlify pada fasa seterusnya.

---
*Untuk butiran penuh setiap skrin, komponen dan fungsi, rujuk `PRD.md`.*
