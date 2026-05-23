import { getLiveStatsAction } from "@/app/actions/stats";
import LoginFormClient from "@/components/auth/LoginFormClient";

// Force dynamic rendering on server side to fetch live stats on every request
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const initialStats = await getLiveStatsAction();
  return <LoginFormClient initialStats={initialStats} />;
}
