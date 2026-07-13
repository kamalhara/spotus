# Production readiness runbook

This repository now routes room creation, room joining, room deletion, room text
messages, notification delivery, and Cloudinary upload signing through the
authenticated Express API. Firestore rules are intentionally not changed in this
workstream.

## Required deployment configuration

Set these as secret environment variables on the backend:

- `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- `FIREBASE_SERVICE_ACCOUNT`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
- `ALLOWED_ORIGINS` as a comma-separated allowlist for the web build
- `BLOCKED_MESSAGE_TERMS` for the initial moderation denylist

Set `EXPO_PUBLIC_API_URL` in every EAS environment to the deployed API origin.
Do not put Cloudinary API secrets or service-account credentials in any
`EXPO_PUBLIC_` variable.

## Firestore TTL and room deletion

The committed TTL policy applies only to internal server rate-limit documents.
Do not enable TTL directly on `rooms.expiresAt` yet: Firestore TTL deletion does
not delete subcollections, so doing so would orphan room messages and trust
documents. TTL deletes are also billed document deletes, not free operations.

The room cleanup task therefore remains responsible for recursive data and media
cleanup. It is capped at 100 expired rooms per execution to prevent one run from
causing unbounded reads, memory use, or timeouts. Monitor for repeated
"per-run safety limit" warnings; if they occur, increase task frequency before
raising the cap.

Deploy index and TTL configuration with:

```sh
firebase deploy --only firestore:indexes
```

## Pre-release verification

1. Deploy the backend and confirm `/health` reports Firebase connectivity.
2. Verify requests without a Clerk bearer token return `401` for every `/api/*`
   mutation route.
3. Create, join, message, and delete a room on two physical devices.
4. Confirm a non-host receives `403` when attempting to delete a room.
5. Confirm expired and banned users cannot join or message a room.
6. Trigger the create-room and message rate limits in staging and verify `429`.
7. Upload an image and confirm there is no unsigned upload preset in the client.
8. Run `npm run lint` and `npm test --prefix server`.

## Still required before public beta

- Replace the temporary term-based message filter with a moderation provider and
  add image moderation before media messages are published.
- Connect Sentry (or an equivalent crash reporter) and verify source-map upload
  from EAS production builds. The SDK installation requires network access and a
  Sentry project DSN/auth token.
- Add Redis-backed caching only after Firestore read metrics demonstrate it is
  needed; do not add it speculatively.
- Complete the separately owned Firestore rules/authentication project before
  public access. Backend routes reduce abuse in the official client but cannot
  compensate for permissive database rules.
