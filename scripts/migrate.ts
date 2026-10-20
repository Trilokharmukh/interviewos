import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const { getAuth } = await import("../src/lib/auth");
const { getPool } = await import("../src/lib/db");
const { getMigrations } = await import("better-auth/db/migration");
try {
  const { runMigrations } = await getMigrations(getAuth().options);
  await runMigrations();
  await getPool().query(`CREATE TABLE IF NOT EXISTS interviewos_study_state (
    user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    data JSONB NOT NULL, version INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  console.log(
    "Authentication and study tables are ready. Existing study rows were preserved.",
  );
} finally {
  await getPool().end();
}
