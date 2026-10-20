import { databaseConfigured, getPool } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!databaseConfigured())
    return Response.json({ status: "ok", storage: "device", accounts: false });
  try {
    await getPool().query(
      "SELECT version FROM interviewos_study_state LIMIT 0",
    );
    return Response.json({
      status: "ok",
      storage: "postgresql",
      accounts: true,
    });
  } catch {
    return Response.json(
      { status: "degraded", storage: "unavailable", accounts: false },
      { status: 503 },
    );
  }
}
