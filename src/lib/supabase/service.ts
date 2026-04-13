import { createClient } from './client';
import { submitCompetitionEntry } from '@/lib/localAuth';

export type CompetitionEntry = {
  fullName: string;
  email: string;
  phone: string;
  school: string;
  city: string;
  category: string;
  teamSize: string;
  notes: string;
  paymentStatus?: "Wait" | "Verified" | "Paid" | "None";
};

export async function submitCompetitionEntryToSupabase(entry: CompetitionEntry) {
  const supabase = createClient();
  
  // Check if Supabase is configured
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  if (isPlaceholder) {
    console.warn("Supabase not configured. Falling back to Local Storage.");
    const result = submitCompetitionEntry({
      ...entry,
      paymentStatus: entry.paymentStatus || "None"
    });
    return { 
      data: result.success ? [entry] : null, 
      error: result.success ? null : { message: result.error || "Gagal menyimpan data lokal." } 
    };
  }

  try {
    const { data, error } = await supabase
      .from('competition_entries')
      .insert([
        {
          full_name: entry.fullName,
          email: entry.email,
          phone: entry.phone,
          school: entry.school,
          city: entry.city,
          category: entry.category,
          team_size: entry.teamSize,
          notes: entry.notes,
        }
      ])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error("Supabase interaction failed, falling back to local:", err);
    const result = submitCompetitionEntry({
      ...entry,
      paymentStatus: entry.paymentStatus || "None"
    });
    return { 
      data: result.success ? [entry] : null, 
      error: result.success ? null : { message: "Gagal menyimpan data." } 
    };
  }
}
