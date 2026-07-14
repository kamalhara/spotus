# Production readiness runbook

This repository routes room creation, room joining, room deletion, room text
messages, notification delivery, and Cloudinary upload signing through the
authenticated Express API. Clerk sessions are exchanged for Firebase custom tokens at
`POST /api/auth/firebase-token`, so Firestore rules receive the Clerk user ID as
`request.auth.uid`.

## Required deployment configuration

Set these as secret environment variables on the backend:

- `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- `FIREBASE_SERVICE_ACCOUNT`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
- `ALLOWED_ORIGINS` as a comma-separated allowlist for the web build
- `BLOCKED_MESSAGE_TERMS` for the initial moderation denylist
- `SENTRY_DSN` for backend crash reporting

Set `EXPO_PUBLIC_API_URL` in every EAS environment to the deployed API origin.
Set `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_POSTHOG_API_KEY`, and optionally
`EXPO_PUBLIC_POSTHOG_HOST` in every EAS environment.
Do not put Cloudinary API secrets or service-account credentials in any
`EXPO_PUBLIC_` variable.

GitHub Actions requires `EXPO_TOKEN` for OTA updates and an optional
`RENDER_DEPLOY_HOOK_URL` if Render auto-deploy is disabled.

### Render free-tier availability

The Render blueprint enables a 10-minute self-ping to stay below Render's
15-minute idle window. Confirm that the deployed service has both
`ENABLE_SELF_PING=true` and the automatically provided `RENDER_EXTERNAL_URL`.
The service log should contain `Keep-alive enabled` after startup and
`Keep-alive ping successful` every ten minutes. A free service can still be
restarted by Render and shares the workspace's monthly free-instance allowance,
so the mobile client also warms the API on launch and tolerates a cold start.

## Firestore Spark plan and room deletion

The project must remain unlinked from a Cloud Billing account. Verify this in
Firebase Console under **Project settings > Usage and billing** before every
release. The default database should report `freeTier: true`, with PITR,
backups, clones, and TTL policies disabled. Do not enable TTL: TTL deletes
require billing and deleting a room document would orphan its subcollections.

The Trigger.dev room cleanup task therefore remains responsible for recursive
data and media cleanup. It is capped at 100 expired rooms per execution to
prevent one run from causing unbounded reads, memory use, or timeouts. Monitor
for repeated "per-run safety limit" warnings; if they occur, increase task
frequency before raising the cap.

Deploy the backend before closing the Firestore rules; older backend deployments
do not expose the custom-token endpoint and signed-in clients would be locked
out. Then deploy the indexes and rules:

```sh
firebase deploy --only firestore:indexes,firestore:rules
```

## Pre-release verification

1. Deploy the backend and confirm `/health` reports Firebase connectivity.
2. Confirm a signed-in app can call `/api/auth/firebase-token` and read its own
   `users/{uid}` document after `signInWithCustomToken`.
3. Verify requests without a Clerk bearer token return `401` for every `/api/*`
   mutation route.
4. Create, join, message, and delete a room on two physical devices.
5. Confirm a non-host receives `403` when attempting to delete a room.
6. Confirm expired and banned users cannot join or message a room.
7. Trigger the create-room and message rate limits in staging and verify `429`.
8. Upload an image and confirm there is no unsigned upload preset in the client.
9. Run `npm run lint` and `npm test --prefix server`.

## Still required before public beta

- Replace the temporary term-based message filter with a moderation provider and
  add image moderation before media messages are published.
- Connect Sentry (or an equivalent crash reporter) and verify source-map upload
  from EAS production builds. The SDK installation requires network access and a
  Sentry project DSN/auth token.
- Add Redis-backed caching only after Firestore read metrics demonstrate it is
  needed; do not add it speculatively.
