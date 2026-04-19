import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  // Kita pakai Anon Key biasa untuk memicu pembuatan user
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Paksa mendaftar (Sign Up), BUKAN Login
  const { data, error } = await supabase.auth.signUp({
    email: 'admin1@ncc.id',
    password: '123456',
  });

  if (error) {
    return NextResponse.json({ status: "GAGAL", alasan: error.message });
  }

  return NextResponse.json({ status: "SUKSES BUAT AKUN", data: data });
}
