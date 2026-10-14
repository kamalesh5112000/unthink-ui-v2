const fs = require("fs");
const path = require("path");

const version =
  process.env.NEXT_PUBLIC_KIOSK_VERSION ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  process.env.COMMIT_SHA ||
  process.env.BUILD_ID ||
  new Date().toISOString();

const filePath = path.join(process.cwd(), "public", "kiosk-version.json");
const payload = `${JSON.stringify({ version, generatedAt: new Date().toISOString() }, null, 2)}\n`;

fs.writeFileSync(filePath, payload);
