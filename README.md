# InterviewOS

A Next.js App Router + TypeScript interview study workspace. The existing static app is preserved at `/legacy/index.html`. Original source files and all original lesson IDs are retained.

## Run

Node 22 or newer (Vercel uses Node 24):

```sh
npm ci
npm run build
npm start
```

For local development, `npm run dev`. The application works without a database in device mode. Account UI is enabled only after the database and authentication configuration pass the health check.

## Architecture

- `src/app`: pages, route metadata, authentication and protected study APIs.
- `src/components`: dashboard, library, lesson reader, tracker, notes, reminders, account UI, and the study provider.
- `src/content`: typed teaching content; 19 original lessons, 9 original deep dives, and additional lessons.
- `src/lib/study.ts`: validation, safe backup merging, review intervals, streak calculation.
- `src/lib/auth.ts`: Better Auth with database-backed rate limits and server-verified sessions.
- `src/lib/db.ts`: lazy PostgreSQL connection pool; no database connection at build time.
- `scripts/migrate.ts`: additive schema setup for auth and study persistence.
- `tests`: data-preservation/security tests and desktop/mobile Playwright scenarios.

## Connect PostgreSQL

Use Neon via **Vercel → Storage → Create Database → Neon**. Select a free plan and connect it to the existing `interviewos` project. The integration supplies `DATABASE_URL`. Do not enable paid plans or automated billing without reviewing them.

Set `BETTER_AUTH_SECRET` to a securely generated random secret of at least 32 characters. Set `BETTER_AUTH_URL` to `https://interviewos-nine-omega.vercel.app` in Production; use `http://localhost:3000` locally. Do not commit actual environment files.

Pull the development environment through your authenticated Vercel CLI and run the additive migration before redeploying:

```sh
vercel env pull .env.local
npm run db:migrate
```

Use separate database resources/branches for development and production. Run migrations for the intended environment only. Existing rows are preserved. No migrations run automatically at build time.

Authentication uses email/password with a 12-character minimum. Account creation, sign-in, session handling, password hashing, cookies, origin validation, and database-backed rate limits are delegated to Better Auth. Email verification, recovery email, and social login need a configured email/OAuth provider and are not enabled by this release.

## Existing user data

On the same production domain/browser, the provider reads `interviewos-v1` once if the new device key is absent. It validates and copies progress, notes, quizzes, study history, reminders, and activity. The original key is never overwritten or deleted. New saves use `interviewos-v4-device`.

Cloud accounts use separate per-user device keys. A newly signed-in account does not silently receive the guest/device data. Use **Account & data → Import device progress** to merge it deliberately. Existing cloud notes are kept, and newer per-lesson progress wins. Export a backup before manually replacing conflicting note text.

Cloud updates are conditional on a server revision number. A stale device receives 409 and retains its local data. Export the local copy, reload cloud progress, then import that backup to merge. A recovery copy is also retained locally. Pending changes retry while the app is open and when the network returns.

Device-only storage is browser-local and can be lost if site data is cleared; use JSON backups or a connected cloud account. Other browsers/devices can import the old app’s JSON export.

## Reminders

In-app/desktop notifications are checked while the app is open. The calendar export contains one-time sessions and an optional floating-local-time daily recurring event, with a 10-minute alarm. Import the `.ics` file into a calendar for reminders when InterviewOS is closed. Exported events are snapshots; calendar delivery and updates are controlled by the calendar application. There is no background email or web push delivery in this release.

## Quality checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npx playwright test
```

GitHub Actions runs the checks, production build, and desktop/mobile browser tests without production credentials. API unit tests intentionally run in device mode. Live PostgreSQL/account flows require the configured database and migration and must be verified after connection.

## Deployment

Use the existing Vercel project `interviewos` in `trilokharmukhs-projects`. Framework: Next.js. Build: `npm run build`. Output directory: default. Preserve the existing production domains. Never deploy secrets or local `.env` files.
