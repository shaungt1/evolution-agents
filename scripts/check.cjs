const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const excluded = new Set([".git", ".admin-local", "node_modules", ".output", ".build"]);
const files = [];
function walk(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (excluded.has(item.name)) continue;
    const candidate = path.join(directory, item.name);
    if (item.isDirectory()) walk(candidate);
    else if (item.isFile()) files.push(candidate);
  }
}
function check(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr || result.stdout);
}
walk(root);
const gitBash = "C:\\Program Files\\Git\\bin\\bash.exe";
const bash = process.platform === "win32" && fs.existsSync(gitBash) ? gitBash : "bash";
for (const file of files) {
  if (/\.(?:js|cjs)$/.test(file)) check(process.execPath, ["--check", file]);
  if (file.endsWith(".json")) JSON.parse(fs.readFileSync(file, "utf8"));
  if (file.endsWith(".sh")) check(bash, ["-n", file]);
  if (file.endsWith(".ps1") && process.platform === "win32") {
    const shell = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
    const literal = file.replace(/'/g, "''");
    check(shell, ["-NoProfile", "-Command", "$issues = $null; [System.Management.Automation.Language.Parser]::ParseFile('" + literal + "', [ref]$null, [ref]$issues) | Out-Null; if ($issues.Count) { throw ($issues | Out-String) }"]);
  }
  if (file.endsWith(".md") && !file.startsWith(path.join(root, "docs") + path.sep)) {
    const content = fs.readFileSync(file, "utf8");
    for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#")) continue;
      if (!fs.existsSync(path.resolve(path.dirname(file), target.split("#")[0]))) {
        throw new Error("Broken documentation link: " + path.relative(root, file) + " -> " + target);
      }
    }
  }
}
const metadata = JSON.parse(fs.readFileSync(path.join(root, "extensions/vscode/package.json"), "utf8"));
const manifest = fs.readFileSync(path.join(root, "extensions/vscode/packaging/extension.vsixmanifest"), "utf8");
for (const [key, value] of Object.entries({ Id: metadata.name, Version: metadata.version, Publisher: metadata.publisher })) {
  if (!manifest.includes(key + '="' + value + '"')) throw new Error("Extension packaging metadata differs: " + key);
}
if (process.platform === "win32") {
  const shell = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
  for (const file of files.filter((file) => file.endsWith(".xml") || file.endsWith(".vsixmanifest"))) {
    check(shell, ["-NoProfile", "-Command", "[xml](Get-Content -Raw -LiteralPath '" + file.replace(/'/g, "''") + "') | Out-Null"]);
  }
}
console.log("PASS: source syntax, JSON/XML metadata, shell recipes, and maintained documentation links.");
