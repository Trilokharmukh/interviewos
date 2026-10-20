import { getAuth } from "@/lib/auth";
import { databaseConfigured, getPool } from "@/lib/db";
import { studySchema } from "@/lib/study";
import { z } from "zod";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const noCache = { "Cache-Control": "private, no-store" };
async function user(request: Request) {
  if (!databaseConfigured()) return null;
  const session = await getAuth().api.getSession({ headers: request.headers });
  return session?.user.id;
}
export async function GET(request: Request) {
  try {
    const userId = await user(request);
    if (!userId)
      return Response.json(
        { error: "Sign in to sync progress." },
        { status: 401, headers: noCache },
      );
    const result = await getPool().query(
      "SELECT data,version FROM interviewos_study_state WHERE user_id=$1",
      [userId],
    );
    return Response.json(result.rows[0] ?? { data: null, version: 0 }, {
      headers: noCache,
    });
  } catch {
    return Response.json(
      { error: "Cloud storage is unavailable. Your device data is safe." },
      { status: 503, headers: noCache },
    );
  }
}
const payloadSchema = z.object({
  data: studySchema,
  version: z.number().int().min(0),
});
export async function PUT(request: Request) {
  // The session is the sole source of user identity. Reject cross-origin writes.
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  // Next.js can expose an internal URL behind a proxy. Production uses the
  // configured auth origin; otherwise compare against the routed Host header.
  const protocol =
    request.headers.get("x-forwarded-proto") === "https"
      ? "https:"
      : requestUrl.protocol;
  const expectedOrigin = process.env.BETTER_AUTH_URL
    ? new URL(process.env.BETTER_AUTH_URL).origin
    : `${protocol}//${request.headers.get("host") ?? requestUrl.host}`;
  if (!origin || origin !== expectedOrigin)
    return Response.json({ error: "Invalid origin." }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 2_000_000)
    return Response.json({ error: "Backup exceeds 2 MB." }, { status: 413 });
  try {
    const userId = await user(request);
    if (!userId)
      return Response.json(
        { error: "Sign in to sync progress." },
        { status: 401 },
      );
    const body = await request.text();
    if (Buffer.byteLength(body) > 2_000_000)
      return Response.json({ error: "Backup exceeds 2 MB." }, { status: 413 });
    const parsed = payloadSchema.safeParse(JSON.parse(body));
    if (!parsed.success)
      return Response.json({ error: "Invalid study data." }, { status: 400 });
    const { data, version } = parsed.data;
    // Atomic compare-and-swap: an older tab/device cannot overwrite newer data.
    const result =
      version === 0
        ? await getPool().query(
            "INSERT INTO interviewos_study_state(user_id,data,version) VALUES($1,$2::jsonb,1) ON CONFLICT(user_id) DO NOTHING RETURNING version",
            [userId, JSON.stringify(data)],
          )
        : await getPool().query(
            "UPDATE interviewos_study_state SET data=$1::jsonb,version=version+1,updated_at=now() WHERE user_id=$2 AND version=$3 RETURNING version",
            [JSON.stringify(data), userId, version],
          );
    if (!result.rowCount)
      return Response.json(
        {
          error:
            "Newer progress exists on another device. Export your device copy before reloading cloud progress.",
        },
        { status: 409 },
      );
    return Response.json(
      { version: result.rows[0].version },
      { headers: noCache },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof SyntaxError
            ? "Invalid JSON."
            : "Cloud storage is unavailable. Your device data is safe.",
      },
      { status: error instanceof SyntaxError ? 400 : 503 },
    );
  }
}
