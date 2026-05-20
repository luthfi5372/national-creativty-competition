-- ============================================================================
-- MIGRASI: Lengkapi kolom tabel 'announcements' 
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================================================

-- 1. Tambah kolom 'title' jika belum ada (untuk judul pengumuman HQ)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' AND column_name = 'title'
    ) THEN
        ALTER TABLE announcements ADD COLUMN title TEXT;
    END IF;
END $$;

-- 2. Tambah kolom 'content' jika belum ada (untuk isi pesan / JSON payload)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' AND column_name = 'content'
    ) THEN
        ALTER TABLE announcements ADD COLUMN content TEXT;
    END IF;
END $$;

-- 3. Tambah kolom 'target_audience' jika belum ada (All, Verified, Pending, specific)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' AND column_name = 'target_audience'
    ) THEN
        ALTER TABLE announcements ADD COLUMN target_audience TEXT DEFAULT 'All';
    END IF;
END $$;

-- 4. Tambah kolom 'type' jika belum ada (info, warning, danger)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' AND column_name = 'type'
    ) THEN
        ALTER TABLE announcements ADD COLUMN type TEXT DEFAULT 'info';
    END IF;
END $$;

-- 5. Tambah kolom 'exam_id' jika belum ada (untuk broadcast khusus sesi ujian)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' AND column_name = 'exam_id'
    ) THEN
        ALTER TABLE announcements ADD COLUMN exam_id UUID;
    END IF;
END $$;

-- 6. Tambah kolom 'image_url' jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE announcements ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 7. Pastikan kolom 'message' NULLABLE (agar tidak wajib jika data dari HQ pakai content)
-- Jika saat ini NOT NULL, ubah menjadi nullable agar kedua sistem broadcast bisa jalan
ALTER TABLE announcements ALTER COLUMN message DROP NOT NULL;

-- 8. Set default untuk data lama yang belum punya target_audience
UPDATE announcements 
SET target_audience = 'All' 
WHERE target_audience IS NULL 
  AND title IS DISTINCT FROM 'SYS_PORTAL_SETTINGS'
  AND title IS DISTINCT FROM 'SYSTEM_TIMELINE_CONFIG';

-- 9. Sync: Copy message -> content jika content masih kosong (data lama)
UPDATE announcements 
SET content = message 
WHERE content IS NULL AND message IS NOT NULL;

-- 10. Sync: Copy message -> title jika title masih kosong (data lama)
UPDATE announcements 
SET title = '📢 Pengumuman' 
WHERE title IS NULL 
  AND message IS NOT NULL;

-- ============================================================================
-- VERIFIKASI: Cek struktur akhir tabel
-- ============================================================================
-- Jalankan query ini setelah migrasi untuk memastikan semua kolom ada:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'announcements' 
-- ORDER BY ordinal_position;
