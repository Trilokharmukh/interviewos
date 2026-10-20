import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";
import { databaseConfigured } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handler(request: Request) {
  if (!databaseConfigured())
    return Response.json(
      {
        error:
          "Account setup is pending. You can keep studying on this device.",
      },
      { status: 503 },
    );
  return toNextJsHandler(getAuth())[request.method === "GET" ? "GET" : "POST"](
    request,
  );
}
export { handler as GET, handler as POST };
