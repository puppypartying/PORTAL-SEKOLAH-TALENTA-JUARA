-- ════════════════════════════════════════════════════════════════
-- SMA NUSANTARA UNGGUL — SUPABASE DATABASE SCHEMA
-- Jalankan seluruh isi file ini di Supabase SQL Editor
-- (Project Anda -> SQL Editor -> New Query -> paste -> Run)
-- ════════════════════════════════════════════════════════════════

-- ── 1. TABEL GURU ──────────────────────────────────────────────
create table if not exists guru (
  id          bigint generated always as identity primary key,
  nama        text not null,
  jabatan     text,
  mapel       text not null,
  pendidikan  text default 'S1',
  pengalaman  text,
  foto_url    text,
  status      text default 'Aktif',
  created_at  timestamptz default now()
);

-- ── 2. TABEL FASILITAS ─────────────────────────────────────────
create table if not exists fasilitas (
  id          bigint generated always as identity primary key,
  nama        text not null,
  kapasitas   text,
  kondisi     text default 'Baik',
  lokasi      text,
  status      text default 'Tersedia',
  created_at  timestamptz default now()
);

-- ── 3. TABEL EKSKUL ────────────────────────────────────────────
create table if not exists ekskul (
  id          bigint generated always as identity primary key,
  nama        text not null,
  pembina     text,
  jadwal      text,
  anggota     text,
  prestasi    text,
  created_at  timestamptz default now()
);

-- ── 4. TABEL SISWA (PENDAFTAR PPDB) ────────────────────────────
create table if not exists siswa (
  id          bigint generated always as identity primary key,
  nama        text not null,
  nik         text,
  nisn        text,
  jenis_kelamin text,
  tempat_lahir  text,
  tanggal_lahir date,
  alamat      text,
  no_hp       text,
  asal_sekolah text not null,
  jalur       text not null,
  status      text default 'Menunggu',
  created_at  timestamptz default now()
);

-- ════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- Mengizinkan akses publik (anon key) untuk SELECT/INSERT/UPDATE/DELETE
-- sesuai pola project ini (tanpa sistem login admin).
-- Form PPDB publik hanya boleh INSERT (tidak bisa lihat data pendaftar lain).
-- ════════════════════════════════════════════════════════════════

alter table guru      enable row level security;
alter table fasilitas  enable row level security;
alter table ekskul     enable row level security;
alter table siswa      enable row level security;

-- GURU: publik boleh baca & kelola (halaman admin data-akademik.html tanpa login)
create policy "guru_select_public" on guru for select using (true);
create policy "guru_insert_public" on guru for insert with check (true);
create policy "guru_update_public" on guru for update using (true);
create policy "guru_delete_public" on guru for delete using (true);

-- FASILITAS: publik boleh baca & kelola
create policy "fasilitas_select_public" on fasilitas for select using (true);
create policy "fasilitas_insert_public" on fasilitas for insert with check (true);
create policy "fasilitas_update_public" on fasilitas for update using (true);
create policy "fasilitas_delete_public" on fasilitas for delete using (true);

-- EKSKUL: publik boleh baca & kelola
create policy "ekskul_select_public" on ekskul for select using (true);
create policy "ekskul_insert_public" on ekskul for insert with check (true);
create policy "ekskul_update_public" on ekskul for update using (true);
create policy "ekskul_delete_public" on ekskul for delete using (true);

-- SISWA: publik boleh INSERT (daftar PPDB) & SELECT (dipakai admin di data-akademik.html
-- tanpa sistem login terpisah). Jika nanti ditambah login admin, kebijakan SELECT/DELETE
-- bisa dipindah agar hanya admin yang bisa membaca/menghapus.
create policy "siswa_insert_public" on siswa for insert with check (true);
create policy "siswa_select_public" on siswa for select using (true);
create policy "siswa_delete_public" on siswa for delete using (true);
create policy "siswa_update_public" on siswa for update using (true);

-- ════════════════════════════════════════════════════════════════
-- DATA AWAL (SEED) — opsional, supaya data lama tetap ada di database
-- ════════════════════════════════════════════════════════════════

insert into guru (nama, jabatan, mapel, pendidikan, pengalaman, foto_url, status) values
('Drs. H. Nendang Sukmadilaga, M.Pd.', 'Kepala Sekolah', 'Biologi', 'S2', '28 Tahun', 'images/Drs. H. Ahmad Subhan, M.Pd..jpg', 'Aktif'),
('Dra. Euis Indah Siti Masyitoh, M.Pd.', 'Waka Kurikulum', 'Bahasa Indonesia', 'S2', '24 Tahun', 'images/Dra. Herlina Mansyur, M.Pd..jpg', 'Aktif'),
('Ridwan, S.Pd., M.M.', 'Waka Kesiswaan', 'Ekonomi', 'S2', '18 Tahun', 'images/Muhammad Ridwan, S.Pd., M.M..jpg', 'Aktif'),
('Fitri Handayani, S.Pd.', 'Waka Sarana Prasarana', 'Matematika', 'S1', '15 Tahun', 'images/Fitri Handayani, S.Pd..jpg', 'Aktif'),
('Dani Ramadhan, S.Sos.', 'Waka Humas', 'Sosiologi', 'S1', '11 Tahun', 'images/Dani Ramadhan, S.Sos..jpg', 'Aktif'),
('Dr. Andi Wijaya, M.Si.', 'Kepala Laboratorium IPA', 'Biologi', 'S3', '20 Tahun', 'images/Dr. Andi Wijaya, M.Si..jpg', 'Aktif'),
('Citra Utami, S.Kom.', 'Kepala Laboratorium Komputer', 'Informatika', 'S1', '9 Tahun', 'images/Citra Utami, S.Kom..jpg', 'Aktif'),
('Nining Suryani, S.S., M.Hum.', 'Kepala Perpustakaan', 'Bahasa Inggris', 'S2', '16 Tahun', 'images/Nining Suryani, S.S., M.Hum..jpg', 'Aktif'),
('Dewi Lestari, S.Pd.', 'Kepala UKS', 'Kimia', 'S1', '13 Tahun', 'images/Dewi Lestari, S.Pd..jpg', 'Aktif'),
('Ahmad Fauzi, S.Pd.', 'Pembina OSIS', 'PJOK', 'S1', '10 Tahun', 'images/Ahmad Fauzi, S.Pd..jpg', 'Aktif'),
('Rizky Pratama, S.Si.', 'Wali Kelas XII-MIPA 1', 'Fisika', 'S1', '8 Tahun', 'images/Rizky Pratama, S.Si..jpg', 'Aktif'),
('Ratih Kumala, S.Pd.', 'Wali Kelas XI-IPS 1', 'Geografi', 'S1', '12 Tahun', 'images/Ratih Kumala, S.Pd..jpg', 'Aktif'),
('Bagus Setiawan, S.Pd.', 'Wali Kelas X-1', 'Sejarah', 'S1', '7 Tahun', 'images/Bagus Setiawan, S.Pd..jpg', 'Aktif'),
('Sri Wahyuni, S.Pd.', 'Wali Kelas XII-IPS 2', 'Akuntansi', 'S1', '—', 'images/Sri Wahyuni, S.Pd..jpg', 'Aktif'),
('Lukman Hakim, S.Ag., M.Pd.I.', 'Pembina Kerohanian Islam (Rohis)', 'Pendidikan Agama Islam', 'S2', '—', 'images/Lukman Hakim, S.Ag., M.Pd.I..jpg', 'Aktif'),
('Taufik Hidayat, S.H.', 'Koordinator Gerakan Literasi Sekolah', 'PPKn', 'S1', '—', 'images/Taufik Hidayat, S.H..jpg', 'Aktif')
on conflict do nothing;

insert into fasilitas (nama, kapasitas, kondisi, lokasi, status) values
('ICT Laboratory', '40 Unit PC', 'Sangat Baik', 'Gedung A Lt. 2', 'Tersedia'),
('Science Laboratory', '36 Siswa', 'Sangat Baik', 'Gedung B Lt. 1', 'Tersedia'),
('Masjid Sekolah', '500 Jamaah', 'Sangat Baik', 'Area Tengah', 'Tersedia'),
('Perpustakaan Digital', '12.000+ Buku', 'Baik', 'Gedung C Lt. 1', 'Tersedia'),
('Fatimah Amphitheatre', '300 Kursi', 'Sangat Baik', 'Gedung Seni', 'Digunakan'),
('Sports Facilities', 'Multi-lapangan', 'Baik', 'Area Outdoor & Indoor', 'Tersedia')
on conflict do nothing;

insert into ekskul (nama, pembina, jadwal, anggota, prestasi) values
('Robotik', 'Lilis Fitriani', 'Senin & Kamis', '42', 'Juara 1 Nasional'),
('Paduan Suara', 'Maya Kusuma', 'Rabu', '35', 'Juara II Provinsi'),
('Pencak Silat', 'Dedi Wahyudi', 'Selasa & Jumat', '44', '—'),
('Coding Club', 'Lilis Fitriani', 'Jumat', '36', '—')
on conflict do nothing;

insert into siswa (nama, asal_sekolah, jalur, nisn, status) values
('Nadia Putri Lestari', 'SMPN 5 Bandung', 'Prestasi Rapor', '0081234567', 'Diverifikasi'),
('Reza Maulana', 'SMPN 2 Cimahi', 'Zonasi', '0098765432', 'Menunggu'),
('Alya Maharani', 'SMPN 1 Bandung', 'Prestasi Lomba', '0085566778', 'Diverifikasi')
on conflict do nothing;
