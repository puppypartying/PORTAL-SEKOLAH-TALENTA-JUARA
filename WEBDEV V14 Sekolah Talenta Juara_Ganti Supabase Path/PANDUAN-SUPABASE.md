# Panduan Setup Database Supabase — SMA Nusantara Unggul

Panduan ini menjelaskan langkah demi langkah menyiapkan database Supabase dari nol, lalu menghubungkannya ke website ini, sehingga data **Guru, Fasilitas, Ekskul, dan Pendaftar PPDB** benar-benar tersimpan di database (CRUD: Create, Read, Update, Delete), bukan lagi di `localStorage` browser.

---

## 1. Buat Akun & Project Supabase

1. Buka **https://supabase.com** lalu klik **Start your project**.
2. Daftar/masuk (bisa pakai akun GitHub atau email).
3. Klik **New Project**.
4. Isi:
   - **Name**: misalnya `sma-nusantara-unggul`
   - **Database Password**: buat password yang kuat dan **simpan baik-baik**
   - **Region**: pilih yang terdekat (misalnya `Southeast Asia (Singapore)`)
5. Klik **Create new project** dan tunggu ± 1-2 menit sampai project selesai dibuat.

---

## 2. Buat Tabel Database (Jalankan SQL)

1. Di dashboard project, buka menu **SQL Editor** (ikon di sidebar kiri).
2. Klik **New query**.
3. Buka file **`supabase-schema.sql`** yang sudah saya sertakan di folder project ini, salin **seluruh isinya**, lalu tempel ke SQL Editor.
4. Klik **Run** (atau tekan `Ctrl+Enter` / `Cmd+Enter`).
5. Jika berhasil akan muncul "Success. No rows returned" — ini artinya 4 tabel (`guru`, `fasilitas`, `ekskul`, `siswa`) sudah dibuat lengkap dengan data awal (seed) dan aturan keamanan (RLS).

Anda bisa cek hasilnya di menu **Table Editor** di sidebar kiri — akan terlihat 4 tabel baru berisi data.

---

## 3. Ambil URL & API Key Project

1. Di dashboard, buka **Project Settings** (ikon gear ⚙️ di sidebar kiri bawah).
2. Klik menu **API**.
3. Catat dua nilai berikut:
   - **Project URL** → contoh: `https://abcdefghijk.supabase.co`
   - **anon public key** (di bagian "Project API keys") → string panjang diawali `eyJ...`

> ⚠️ Gunakan **anon public key**, BUKAN `service_role key`. Anon key memang didesain aman untuk dipakai langsung di kode frontend/browser.

---

## 4. Masukkan Kredensial ke Website

1. Buka file **`js/supabase-config.js`** di folder project.
2. Ganti dua baris berikut dengan nilai Anda dari langkah 3:

```javascript
const SUPABASE_URL = 'https://abcdefghijk.supabase.co';      // Project URL Anda
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6...';  // anon public key Anda
```

3. Simpan file.

Selesai! Semua halaman (`guru.html`, `data-akademik.html`, `ppdb.html`, dll) sudah otomatis terhubung ke Supabase karena sudah memuat file ini melalui tag `<script>`.

---

## 5. Cara Membuka & Menguji Website

Karena website ini memakai `fetch` ke Supabase, sebaiknya dibuka melalui **local server**, bukan langsung klik dua kali file HTML (`file://`). Cara termudah:

**Opsi A — VS Code Live Server**
- Install ekstensi "Live Server" di VS Code, klik kanan `index.html` → "Open with Live Server".

**Opsi B — Python**
```bash
cd school_web
python3 -m http.server 8000
```
Lalu buka `http://localhost:8000` di browser.

**Opsi C — Hosting gratis**
Upload folder `school_web` ke layanan seperti Netlify, Vercel, atau GitHub Pages — semuanya bisa langsung jalan karena ini website statis murni (HTML/CSS/JS).

---

## 6. Apa yang Sekarang Tersambung ke Database?

| Halaman | Fitur CRUD | Tabel Supabase |
|---|---|---|
| `data-akademik.html` | Tambah/Edit/Hapus Guru | `guru` |
| `data-akademik.html` | Tambah/Edit/Hapus Fasilitas | `fasilitas` |
| `data-akademik.html` | Tambah/Edit/Hapus Ekskul | `ekskul` |
| `data-akademik.html` | Hapus & Lihat Pendaftar PPDB | `siswa` |
| `guru.html` | Menampilkan kartu guru (otomatis sinkron dari tabel `guru`) | `guru` |
| `ppdb.html` | Form pendaftaran publik → **Insert** ke database | `siswa` |

Setiap kali Anda menambah/edit/hapus data di `data-akademik.html`, perubahan langsung tersimpan permanen di Supabase dan akan terlihat oleh **siapa pun** yang membuka website (tidak lagi tersimpan per-browser seperti `localStorage`).

---

## 7. Catatan Keamanan (Penting Dibaca)

Skema SQL yang disertakan mengaktifkan **Row Level Security (RLS)** dengan kebijakan yang **mengizinkan akses publik penuh** (siapa saja yang membuka situs bisa tambah/edit/hapus data guru, fasilitas, ekskul, dan melihat/menghapus data pendaftar siswa). Ini sesuai pola project aslinya yang **tidak memiliki sistem login admin**.

Ini cocok untuk:
- Tugas kuliah / demo / portofolio
- Prototipe yang belum perlu keamanan ketat

**Tidak disarankan untuk:**
- Website sekolah produksi yang sesungguhnya, karena data pendaftar (NIK, NISN, alamat, no HP calon siswa) bisa dilihat/dihapus oleh siapa saja yang tahu URL Supabase Anda.

### Jika nanti ingin menambah login admin:
Anda bisa memakai **Supabase Auth** (built-in) lalu mengubah kebijakan RLS di tabel `siswa`, `guru`, `fasilitas`, `ekskul` agar hanya user yang sudah login (`auth.uid() is not null`) yang boleh INSERT/UPDATE/DELETE, sementara SELECT untuk publik (guru, fasilitas, ekskul) tetap terbuka. Beri tahu saya jika Anda ingin saya bantu implementasikan ini.

---

## 8. Troubleshooting

**Data tidak muncul / kosong:**
- Buka Console browser (F12 → tab Console), cek apakah ada error merah terkait Supabase.
- Pastikan `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di `js/supabase-config.js` sudah benar (tidak ada spasi tambahan, tidak memakai tanda kutip yang salah).

**Error "Failed to fetch" atau CORS:**
- Pastikan Anda membuka website lewat `http://localhost...` atau domain hosting, bukan `file://`.

**Error "new row violates row-level security policy":**
- Berarti SQL schema (langkah 2) belum dijalankan dengan benar, atau bagian RLS policy gagal ter-create. Jalankan ulang `supabase-schema.sql` di SQL Editor.

**Foto guru tidak tampil:**
- Foto guru lama (dari folder `images/`) sudah otomatis dipetakan lewat data seed di SQL. Untuk foto guru yang baru ditambahkan lewat form (`Tambah Guru` → upload foto), foto disimpan sebagai base64 langsung di kolom `foto_url` — cukup untuk skala kecil, tapi untuk produksi sebaiknya pakai **Supabase Storage** (bisa saya bantu setup jika diperlukan).
