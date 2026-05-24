-- ============================================================================
-- NCC 13th - STORAGE SCHEMAS MIGRATION
-- Inisialisasi Bucket dan Kebijakan RLS untuk Upload Bukti Bayar & Kelola Media
-- ============================================================================
-- Jalankan SQL ini di Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Buat bucket 'payment-proofs' di dalam skema storage jika belum ada
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs', 
  'payment-proofs', 
  true, 
  2097152, -- Batasan ukuran file: 2MB (2 * 1024 * 1024)
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif'] -- Jenis file gambar saja
)
on conflict (id) do update set
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Aktifkan Row Level Security (RLS) pada storage.objects jika belum aktif
alter table storage.objects enable row level security;

-- Hapus kebijakan lama jika ada untuk mencegah konflik nama
drop policy if exists "Allow public read access to payment-proofs bucket" on storage.objects;
drop policy if exists "Allow public upload access to payment-proofs bucket" on storage.objects;
drop policy if exists "Allow public delete access to payment-proofs bucket" on storage.objects;

-- 3. Kebijakan SELECT (Read): Siapa saja bisa melihat berkas di dalam bucket payment-proofs (Buku Peserta, Galeri, Bukti Transfer)
create policy "Allow public read access to payment-proofs bucket"
on storage.objects for select
using (bucket_id = 'payment-proofs');

-- 4. Kebijakan INSERT (Upload): Siapa saja bisa mengunggah berkas ke bucket payment-proofs (bukti pembayaran peserta & tambah foto galeri admin)
create policy "Allow public upload access to payment-proofs bucket"
on storage.objects for insert
with check (bucket_id = 'payment-proofs');

-- 5. Kebijakan DELETE (Hapus): Pengguna yang terautentikasi (Admin) bisa menghapus berkas di dalam bucket payment-proofs (bersihkan galeri / kelola media)
create policy "Allow public delete access to payment-proofs bucket"
on storage.objects for delete
using (bucket_id = 'payment-proofs');
