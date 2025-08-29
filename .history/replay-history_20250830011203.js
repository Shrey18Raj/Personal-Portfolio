const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const historyDir = path.join(__dirname, ".history"); // your .history folder

// Get all history files
let files = fs.readdirSync(historyDir);

// Sort them chronologically (by timestamp in filename)
files.sort((a, b) => {
  const ta = parseInt(a.split("_").pop().split(".")[0]);
  const tb = parseInt(b.split("_").pop().split(".")[0]);
  return ta - tb;
});

files.forEach(file => {
  const filePath = path.join(historyDir, file);

  // Extract timestamp (e.g. main_20250815031420 → 20250815031420)
  const parts = file.split("_");
  const timestampStr = parts.pop().split(".")[0];

  let timestamp;
  if (/^\d{14}$/.test(timestampStr)) {
    // YYYYMMDDhhmmss → convert to ISO
    const year = timestampStr.slice(0, 4);
    const month = timestampStr.slice(4, 6);
    const day = timestampStr.slice(6, 8);
    const hour = timestampStr.slice(8, 10);
    const minute = timestampStr.slice(10, 12);
    const second = timestampStr.slice(12, 14);
    timestamp = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  } else {
    console.error("❌ Unknown timestamp format:", timestampStr, "in file:", file);
    return; // skip this file if format not recognized
  }

  const commitDate = timestamp.toISOString();

  // Restore file to working directory (remove timestamp from name)
  const originalName = parts.join("_"); // everything before the timestamp
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

// Finally push everything
try {
  execSync("git push origin main");
  console.log("🚀 All commits pushed to GitHub");
} catch (err) {
  console.error("❌ Push failed:", err.message);
}
