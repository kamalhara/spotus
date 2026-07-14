import { defineConfig } from "@trigger.dev/sdk/v3";
import { syncEnvVars } from "@trigger.dev/build/extensions/core";

const triggerSecretNames = [
  "FIREBASE_SERVICE_ACCOUNT",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

export default defineConfig({
  project: "proj_qjgooyoaxntqpxpjjvpg",
  runtime: "node",
  logLevel: "log",
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  build: {
    extensions: [
      syncEnvVars(async () =>
        triggerSecretNames.flatMap((name) => {
          const value = process.env[name];
          return value ? [{ name, value, isSecret: true }] : [];
        }),
      ),
    ],
  },
  dirs: ["./src/trigger"],
});
