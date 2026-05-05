import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const { cleanData } = await request.json();
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // 1. Cari data lama
    const { data: existing } = await supabase
      .from('announcements')
      .select('id')
      .eq('title', 'SYSTEM_TIMELINE_CONFIG')
      .single();

    if (existing) {
      // 2. Update
      const { error: updateError } = await supabase
        .from('announcements')
        .update({ content: JSON.stringify(cleanData) })
        .eq('id', existing.id);
      if (updateError) throw updateError;
    } else {
      // 3. Insert
      const { error: insertError } = await supabase
        .from('announcements')
        .insert([{ 
          title: 'SYSTEM_TIMELINE_CONFIG', 
          content: JSON.stringify(cleanData),
          target_audience: 'All'
        }]);
      if (insertError) throw insertError;
    }

    // ⚡ REVALIDASI CACHE
    revalidatePath('/dashboard');

    return NextResponse.json({ message: 'Sync Success' });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
