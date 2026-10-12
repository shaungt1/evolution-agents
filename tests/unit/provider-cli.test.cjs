const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { commandFor, observe, inside, validateArtifacts } = require("../helpers/provider-cli.cjs");

test("Codex run and resume use explicit full access and the selected conversation", () => {
  const initial = commandFor("codex", "codex.exe", "/test", null, false, "first");
  assert.deepEqual(initial.args.slice(0, 7), ["-a", "never", "exec", "--sandbox", "danger-full-access", "--json", "-C"]);
  const followUp = commandFor("codex", "codex.exe", "/test", "thread-one", true, "next");
  assert.deepEqual(followUp.args.slice(-3), ["resume", "thread-one", "-"]);
  assert.equal(followUp.stdin, "next");
  assert.ok(!followUp.args.includes("--last"));
});

test("Copilot receives quoted JSON as one literal argument without a shell", () => {
  const prompt = 'Append {"text":"a & b; $value"} exactly.';
  const command = commandFor("copilot", "copilot.exe", "/test", "session-one", true, prompt);
  assert.equal(command.args.at(-1), prompt);
  assert.ok(command.args.includes("session-one"));
  assert.equal(command.stdin, "");
});

test("Claude resumes a saved session rather than starting a background owner", () => {
  const command = commandFor("claude", "claude.exe", "/test", "session-one", true, "next");
  assert.ok(command.args.includes("--resume"));
  assert.ok(!command.args.includes("--bg"));
  assert.equal(command.stdin, "next");
});

test("Error completion is never accepted as a successful provider response", () => {
  const state = { completed: false, failed: false };
  observe("claude", { type: "result", subtype: "error", is_error: true, session_id: "one" }, state);
  assert.equal(state.failed, true);
  assert.equal(state.completed, false);
  const copilot = { completed: false, failed: false };
  observe("copilot", { type: "result", exitCode: 1, sessionId: "one" }, copilot);
  assert.equal(copilot.failed, true);
});

test("A resumed session cannot silently switch identity", () => {
  const state = { expectedSessionId: "original", failed: false };
  observe("copilot", { type: "result", exitCode: 0, sessionId: "different" }, state);
  assert.equal(state.failed, true);
});

test("Codex failure remains recorded even if a completed event follows", () => {
  const state = { failed: false };
  observe("codex", { type: "turn.failed" }, state);
  observe("codex", { type: "turn.completed" }, state);
  assert.equal(state.failed, true);
});

test("Resume-directory boundary rejects prefix lookalikes and parent traversal", () => {
  const parent = path.resolve("tests/.output");
  assert.equal(inside(parent, path.join(parent, "run-one")), true);
  assert.equal(inside(parent, parent + "-outside"), false);
  assert.equal(inside(parent, path.join(parent, "..", "private")), false);
});

test("A marker alone cannot prove the board write happened", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "evolution-proof-unit-"));
  try {
    fs.mkdirSync(path.join(directory, "run"));
    fs.mkdirSync(path.join(directory, "board"));
    fs.writeFileSync(path.join(directory, "run/researcher.done"), "finished");
    fs.writeFileSync(path.join(directory, "board/board.jsonl"), "");
    assert.throws(() => validateArtifacts(directory, "researcher"), /required researcher board entry/);
    fs.writeFileSync(path.join(directory, "board/board.jsonl"), '{"from":"researcher","type":"status","text":"started"}\n');
    assert.doesNotThrow(() => validateArtifacts(directory, "researcher"));
  } finally { fs.rmSync(directory, { recursive: true }); }
});

test("SWAPI evidence must match fetched fields, not an assumed character", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "evolution-swapi-unit-"));
  try {
    fs.mkdirSync(path.join(directory, "run"));
    fs.mkdirSync(path.join(directory, "board"));
    fs.writeFileSync(path.join(directory, "run/swapi-tester.done"), "finished");
    fs.writeFileSync(path.join(directory, "run/luke.json"), '{"name":"Leia","height":"150","birth_year":"19BBY"}');
    fs.writeFileSync(path.join(directory, "board/board.jsonl"), '{"from":"swapi-tester","type":"result","text":"Luke Skywalker, height 172, born 19BBY"}\n');
    assert.throws(() => validateArtifacts(directory, "swapi-tester"), /does not match/);
  } finally { fs.rmSync(directory, { recursive: true }); }
});
