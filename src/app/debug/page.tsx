import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  let dbStatus = "Checking...";
  let errorMsg = "";
  
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      dbStatus = "Error connecting to Database";
      errorMsg = error.message;
    } else {
      dbStatus = "Connected successfully!";
    }
  } catch (err: any) {
    dbStatus = "Critical crash during connection";
    errorMsg = err.message;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', color: '#333' }}>
      <h1>NCC Diagnostic Mode</h1>
      <hr />
      <div>
        <p><strong>Supabase URL Configured:</strong> {supabaseUrl ? "Yes (starts with " + supabaseUrl.substring(0, 15) + "...)" : "No (Missing ENVIRONMENT VARIABLE)"}</p>
        <p><strong>Anon Key Configured:</strong> {hasAnonKey ? "Yes" : "No (Missing ENVIRONMENT VARIABLE)"}</p>
        <p><strong>Database Connection Status:</strong> {dbStatus}</p>
        {errorMsg && <p style={{ color: 'red' }}><strong>Error Details:</strong> {errorMsg}</p>}
      </div>
      <hr />
      <p style={{ fontSize: '0.8rem', color: '#666' }}>If 'No' or 'Error' appears above, please check Vercel Project Settings -> Environment Variables.</p>
    </div>
  );
}
