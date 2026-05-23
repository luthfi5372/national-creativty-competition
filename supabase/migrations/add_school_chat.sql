-- ============================================================================
-- NCC 13th - Fitur "Ruang Sekolah" (School Group Chat & Hub)
-- SQL Migration Script
-- ============================================================================
-- Jalankan SQL ini di Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Buat tabel school_messages untuk menyimpan pesan chat sekolah
CREATE TABLE IF NOT EXISTS public.school_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat index untuk mempercepat pencarian obrolan berdasarkan nama sekolah
CREATE INDEX IF NOT EXISTS idx_school_messages_school_name ON public.school_messages(school_name);
CREATE INDEX IF NOT EXISTS idx_school_messages_created_at ON public.school_messages(created_at DESC);

-- 3. Aktifkan Row Level Security (RLS) demi keamanan privasi chat antar-sekolah
ALTER TABLE public.school_messages ENABLE ROW LEVEL SECURITY;

-- 4. Hapus policy lama jika ada untuk mencegah duplikasi error saat re-run
DROP POLICY IF EXISTS "Users can read own school messages" ON public.school_messages;
DROP POLICY IF EXISTS "Users can insert own school messages" ON public.school_messages;

-- 5. Buat kebijakan RLS: Peserta hanya bisa membaca pesan sekolahnya sendiri
-- Kebijakan ini mencocokkan Nama Sekolah (school_name) dari tabel competition_entries
CREATE POLICY "Users can read own school messages" ON public.school_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.competition_entries 
            -- user_id disimpan sebagai string di competition_entries, kita cast auth.uid()::text
            WHERE user_id = auth.uid()::text 
              AND UPPER(TRIM(school_name)) = UPPER(TRIM(school_messages.school_name))
        )
    );

-- 6. Buat kebijakan RLS: Peserta hanya bisa mengirim pesan ke sekolahnya sendiri
CREATE POLICY "Users can insert own school messages" ON public.school_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.competition_entries 
            WHERE user_id = auth.uid()::text 
              AND UPPER(TRIM(school_name)) = UPPER(TRIM(school_messages.school_name))
        )
        AND auth.uid()::text = sender_id
    );

-- 7. Tambahkan publikasi real-time agar pesan terkirim secara instan ke layar peserta lain
-- Pastikan tabel masuk ke dalam publikasi Supabase realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.school_messages;
