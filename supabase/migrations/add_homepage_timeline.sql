-- 1. Drop old constraint if exists
ALTER TABLE homepage_descriptions DROP CONSTRAINT IF EXISTS homepage_descriptions_category_check;

-- 2. Add date_range column if it doesn't exist
ALTER TABLE homepage_descriptions ADD COLUMN IF NOT EXISTS date_range VARCHAR(150) DEFAULT 'Segera Diumumkan';

-- 3. Add new expanded constraint allowing contest timeline categories
ALTER TABLE homepage_descriptions ADD CONSTRAINT homepage_descriptions_category_check 
CHECK (category IN ('about', 'benefit', 'lkti', 'olimpiade', 'speech', 'mtq', 'all'));

-- 4. Seed default curvy timeline items so they start fully populated in the database
INSERT INTO homepage_descriptions (category, title, content, icon, order_index, date_range)
VALUES 
  -- LKTI
  ('lkti', 'Gel I: Abstrak', 'Pengumpulan abstrak karya tulis ilmiah inovatif Gelombang I.', 'Users', 1, '16 Juni — 22 September 2026'),
  ('lkti', 'Gel I: Fullpaper', 'Unggah naskah karya tulis lengkap bagi yang lolos seleksi abstrak.', 'Clock', 2, '2 — 17 September 2026'),
  ('lkti', 'Gel II: Abstrak', 'Pengumpulan abstrak karya tulis ilmiah Gelombang II.', 'Users', 3, '1 — 25 Oktober 2026'),
  ('lkti', 'Gel I/II: Fullpaper', 'Unggah naskah karya tulis lengkap jalur Gelombang II.', 'Clock', 4, '1 — 14 November 2026'),
  
  -- MIPA (Olimpiade)
  ('olimpiade', 'Gel I: Seleksi 1', 'Penyaringan awal uji kompetensi Matematika & IPA.', 'Users', 1, 'Segera Diumumkan'),
  ('olimpiade', 'Gel I: Seleksi 2', 'Babak lanjutan pemecahan studi kasus MIPA komprehensif.', 'Clock', 2, 'Segera Diumumkan'),
  ('olimpiade', 'Gel II: Simulasi', 'Uji coba akses portal Computer Based Test (CBT) Gelombang II.', 'Users', 3, 'Segera Diumumkan'),
  ('olimpiade', 'Gel II: Seleksi Utama', 'Puncak pertarungan talenta matematika sains Gelombang II.', 'Trophy', 4, 'Segera Diumumkan'),
  
  -- Speech Contest
  ('speech', 'Gel I: Naskah', 'Unggah materi naskah orasi bahasa Inggris Gelombang I.', 'Users', 1, 'Segera Diumumkan'),
  ('speech', 'Gel I: Pengumuman', 'Rilis daftar nama delegasi terbaik lolos kurasi naskah Gel I.', 'Trophy', 2, 'Segera Diumumkan'),
  ('speech', 'Gel II: Naskah', 'Pengumpulan materi naskah orasi bahasa Inggris Gelombang II.', 'Users', 3, 'Segera Diumumkan'),
  ('speech', 'Gel II: Pengumuman', 'Pelepasan daftar finalis Speech Contest resmi.', 'Trophy', 4, 'Segera Diumumkan'),
  
  -- MTQ
  ('mtq', 'Gel I: Video Tilawah', 'Pengunggahan klip rekaman lantunan ayat Al-Qur''an Gelombang I.', 'Users', 1, 'Segera Diumumkan'),
  ('mtq', 'Gel I: Pengumuman', 'Pengumuman hasil kurasi qari/qariah berprestasi Gel I.', 'Trophy', 2, 'Segera Diumumkan'),
  ('mtq', 'Gel II: Video Tilawah', 'Pengumpulan klip rekaman lantunan ayat Al-Qur''an Gelombang II.', 'Users', 3, 'Segera Diumumkan'),
  ('mtq', 'Gel II: Pengumuman', 'Hasil akhir penyeleksian MTQ tingkat nasional.', 'Trophy', 4, 'Segera Diumumkan')
ON CONFLICT DO NOTHING;
