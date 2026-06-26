/* ════════════════════════════════════════════════════════════════
   KONFIGURASI SUPABASE
   Ganti dua nilai di bawah ini dengan punya Anda.
   Lihat panduan lengkap di file PANDUAN-SUPABASE.md
   ════════════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://armgeupbybrroalzhaqz.supabase.co';   // <- ganti dengan Project URL Anda
const SUPABASE_ANON_KEY = 'sb_publishable_QtgU7IoO7ESLB1zneEd-eA_2_6HUGin'; // <- ganti dengan anon public key Anda

/* Jangan ubah baris di bawah ini */
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
