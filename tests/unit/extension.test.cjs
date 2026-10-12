const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../..");
const directory = path.join(root, "extensions/vscode");

test("Extension registration matches the renamed package and no legacy commands remain", () => {
  const metadata = JSON.parse(fs.readFileSync(path.join(directory, "package.json"), "utf8"));
  const commands = [];
  const mock = {
    commands: { registerCommand(id) { commands.push(id); return { dispose() {} }; } },
    window: { registerUriHandler() { return { dispose() {} }; } },
  };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(directory, "extension.js"), "utf8"), {
    require(id) { return id === "vscode" ? mock : require(id); },
    module, exports: module.exports, process, console, URLSearchParams, setTimeout,
  });
  module.exports.activate({ subscriptions: [] });
  assert.deepEqual(commands.sort(), metadata.contributes.commands.map((entry) => entry.command).sort());
  assert.ok(commands.every((id) => id.startsWith("evolutionAgents.experimental.")));
  assert.equal(metadata.name, "evolution-agents");
  assert.equal(metadata.displayName, "Evolution Agents");
  assert.equal(metadata.preview, true);
  const invoke = fs.readFileSync(path.join(directory, "scripts/invoke-extension.ps1"), "utf8");
  assert.ok(invoke.includes("vscode://" + metadata.publisher + "." + metadata.name + "/open?"));
});

test("Packaging uses an explicit source allowlist and installation is opt-in", () => {
  const script = fs.readFileSync(path.join(directory, "scripts/package-extension.ps1"), "utf8");
  assert.ok(script.includes("[switch]$Install"));
  assert.ok(script.includes("if ($Install)"));
  assert.ok(script.includes("@('package.json', 'extension.js', 'README.md')"));
  assert.ok(!script.includes("-Recurse") || script.includes("Remove-Item -LiteralPath $stagePath"));
});
