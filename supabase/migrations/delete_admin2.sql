-- ============================================================================
-- MIGRATION: Hapus Permanen admin2@ncc.id dari Database
-- ============================================================================
-- Karena sebelumnya ada mekanisme auto-register di sistem untuk bypass admin,
-- email admin2@ncc.id tanpa sengaja terdaftar secara permanen ke dalam tabel 
-- utama Supabase Auth (auth.users) dan kini dianggap sebagai "user biasa".
--
-- Jalankan script ini di menu "SQL Editor" pada Supabase Dashboard Anda
-- untuk menghapus secara total akun tersebut hingga bersih.
-- ============================================================================

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 1. Cari User ID berdasarkan email
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'admin2@ncc.id';
    
    IF target_user_id IS NOT NULL THEN
        -- 2. Hapus data terkait di tabel public terlebih dahulu 
        -- (menghindari error foreign key constraint jika tidak ada ON DELETE CASCADE)
        DELETE FROM public.profiles WHERE id = target_user_id;
        DELETE FROM public.competition_entries WHERE user_id = target_user_id;
        DELETE FROM public.school_messages WHERE sender_id = target_user_id::text;
        
        -- 3. Terakhir, hapus pengguna utama dari tabel auth Supabase
        DELETE FROM auth.users WHERE id = target_user_id;
        
        RAISE NOTICE '✅ Berhasil! Akun admin2@ncc.id telah dihapus permanen dari Supabase.';
    ELSE
        RAISE NOTICE '⚠️ Akun admin2@ncc.id tidak ditemukan di database auth.users.';
    END IF;
END $$;
