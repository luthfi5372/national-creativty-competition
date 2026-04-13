import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "SYNC_SUCCESS",
    timestamp: "2026-04-14T00:58:30Z",
    deployment_id: "ncc-final-sync-verified",
    property_check: "mediaUrl has been renamed to assetUrl",
    message: "If you see this, Vercel is finally building the correct code."
  });
}
