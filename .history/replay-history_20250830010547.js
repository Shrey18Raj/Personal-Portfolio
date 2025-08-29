const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const historyDir = path.join(__dirname, ".history"); // your .history folder

// Get all history files
const files = fs.readdirSync(historyDir);

// Sort them chronologically (by timestamp in filename)
files.sort((a, b) => {
  const ta = parseInt(a.split("_").pop().split(".")[0]); // extract timestamp
  const tb = parseInt(b.split("_").pop().split(".")[0]);
  return ta - tb;
});

files.forEach(file => {
  const filePath = path.join(historyDir, file);

  // Extract timestamp (assuming filenames like index.js_20230830121536)
  const parts = file.split("_");
  const timestampStr = parts.pop().split(".")[0];
  const timestamp = new Date(
    timestampStr.length === 13 ? parseInt(timestampStr) : parseInt(timestampStr) * 1000
  );

  const commitDate = timestamp.toISOString();

  // Copy historical file into working directory (restore original state)
  const originalName = parts.join("_");
  const destPath = path.join(__dirname, originalName);
  fs.copyFileSync(filePath, destPath);

  // Stage and commit with custom date
  try {
    execSync(`git add "${originalName}"`);
    execSync(
      `GIT_AUTHOR_DATE="${commitDate}" GIT_COMMITTER_DATE="${commitDate}" git commit -m "Replayed edit: ${originalName}"`
    );
    console.log(`✅ Committed ${originalName} at ${commitDate}`);
  } catch (err) {
    console.error(`⚠️ Skipped ${originalName}: ${err.message}`);
  }
});

// Finally push
try {
  execSync("git push origin main");
  console.log("🚀 All commits pushed to GitHub");
} catch (err) {
  console.error("❌ Push failed:", err.message);
}
