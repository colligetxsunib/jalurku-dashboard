# JalurKu Maintenance Dashboard

Panel admin untuk **merawat (maintenance)** backend JalurKu — terutama **tes minat RIASEC**,
plus endpoint lain yang perlu dikelola (ingest data, dokumen RAG, katalog, kesehatan layanan).

Repositori ini **terpisah dari backend** (`jalurku-be`). Dibangun dengan **React 19 + Vite 8**
di atas template admin open-source **[CoreUI](https://coreui.io/react) (MIT)** agar tidak mulai
dari nol.

---

## Fitur

| Halaman | Endpoint backend | Fungsi |
|---|---|---|
| **Ringkasan** | `GET /health` | Status layanan + status kredensial |
| **Tes Minat (RIASEC)** | `GET /riasec/questions`, `POST /riasec/submit` | Lihat instrumen, uji skoring langsung (pratinjau `simpan=false`), visualisasi vektor minat + Holland code |
| **Ingest Data** | `POST /admin/ingest` | Impor 6 tipe data (rules, ketentuan, katalog, acuan, dokumen, profesi) |
| **Dokumen RAG** | `POST /admin/dokumen/{id}/berkas` | Unggah PDF sumber resmi, opsi langsung chunk + embed |
| **Katalog** | `GET /catalog/ptn`, `/catalog/prodi`, `/catalog/prodi/{id}` | Telusuri PTN & prodi referensi |
| **Pengaturan** | `POST /session` | Base URL API, buat sesi tamu, X-Admin-Key |

## Stack

- React 19, React Router 7, Redux (state tema/sidebar bawaan CoreUI)
- Vite 8 (dev server + build)
- CoreUI React 5 (komponen UI, MIT)

## Menjalankan

```bash
npm install        # pasang dependensi (meregenerasi package-lock.json)
npm run dev        # dev server Vite di http://localhost:3000
# build produksi:
npm run build      # keluaran ke build/ (lihat vite.config.mjs)
npm run serve      # pratinjau hasil build
```

> Catatan: `package-lock.json` sengaja tidak di-commit setelah perubahan dependensi; file ini
> akan dibuat ulang saat `npm install` pertama.

## Konfigurasi

Isi lewat halaman **Pengaturan** di aplikasi (tersimpan di `localStorage` perangkat), atau sediakan
nilai awal lewat environment Vite (opsional) — lihat `.env.example`:

- `VITE_API_BASE_URL` — base URL API, mis. `http://localhost:8000` (prefix `/api/v1` ditambahkan otomatis).
- `VITE_CONSENT_VERSION` — versi consent default untuk pembuatan sesi tamu.

Di halaman Pengaturan Anda juga:

- **Buat sesi** tamu otomatis (untuk endpoint yang butuh token).
- Isi **X-Admin-Key** (untuk ingest & unggah dokumen).

> Keamanan: dashboard tidak menyimpan rahasia di repositori. Token & admin key hanya hidup di
> `localStorage` peramban Anda dan bisa dihapus lewat tombol **Lupakan kredensial**. Kredensial
> hanya dikirim sebagai header ke API JalurKu Anda sendiri.

## Struktur (bagian JalurKu)

```
src/
  api/
    config.js       Baca/tulis konfigurasi (localStorage) + base URL
    client.js       Pembungkus fetch (auth header + error envelope backend)
  components/
    ApiErrorAlert.jsx  Render ApiError (termasuk detail.field[] validasi)
  views/jalurku/
    Overview.jsx    Ringkasan + health
    Riasec.jsx      Instrumen & uji skoring RIASEC
    Ingest.jsx      Impor data admin
    Documents.jsx   Unggah dokumen RAG
    Catalog.jsx     Telusuri PTN/prodi
    Settings.jsx    Konfigurasi base URL, sesi, admin key
  _nav.jsx          Menu sidebar
  routes.js         Peta rute -> view
```
Komponen layout (sidebar/header/footer/breadcrumb) berasal dari CoreUI, disesuaikan merek JalurKu.

## Atribusi

UI berbasis **[CoreUI Free React Admin Template](https://github.com/coreui/coreui-free-react-admin-template)**
— MIT License, Copyright (c) 2026 creativeLabs Łukasz Holeczek. Lihat `LICENSE`.
