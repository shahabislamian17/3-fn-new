// scripts/healthcheck.cjs
/* eslint-disable no-console */
const { spawnSync } = require("child_process");

const REQUIRED_ENVS = [
  "NEXT_PUBLIC_APP_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "PLAID_CLIENT_ID",
  "PLAID_SECRET",
  "FIREBASE_PROJECT_ID",
];

function checkEnv() {
  let ok = true;
  for (const key of REQUIRED_ENVS) {
    if (!process.env[key]) {
      console.error(`❌ Missing env var: ${key}`);
      ok = false;
    }
  }
  if (!ok) process.exit(1);
  console.log("✅ Env vars ok");
}

function run(cmd, args) {
  console.log(`\n▶ ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`❌ ${cmd} failed`);
    process.exit(result.status);
  }
}

function main() {
  checkEnv();
  run("npm", ["run", "lint"]);
  run("npm", ["run", "typecheck"]);
  run("npm", ["run", "test"]);
  console.log("\n✅ Healthcheck passed");
}

main();
