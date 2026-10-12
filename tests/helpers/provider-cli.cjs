const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");

const ROOT = path.resolve(__dirname, "../..");
const OUTPUT_ROOT = path.join(ROOT, "tests", ".output");
const FIXTURES = new Set(["hello-world", "researcher", "swapi-tester"]);

function inside(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === "" || (!relative.startsWith(".." + path.sep) && relative !== ".." && !path.isAbsolute(relative));
}

function commandFor(provider, executable, cwd, sessionId, resume, prompt) {
  if (provider === "claude") {
    return {
      executable,
      args: ["-p", "--verbose", "--output-format", "stream-json",
        "--permission-mode", "acceptEdits", "--allowedTools", "Read,Write,Bash",
        resume ? "--resume" : "--session-id", sessionId],
      stdin: prompt,
    };
  }
  if (provider === "codex") {
    return {
      executable,
      args: ["-a", "never", "exec", "--sandbox", "danger-full-access", "--json",
        ...(resume ? ["resume", sessionId, "-"] : ["-C", cwd, "-"])],
      stdin: prompt,
    };
  }
  if (provider === "copilot") {
    return {
      executable,
      args: ["--session-id", sessionId, "--output-format", "json",
        "--allow-tool", "shell", "--allow-tool", "write", "-p", prompt],
      stdin: "",
    };
  }
  throw new Error("Unknown provider: " + provider);
}

function findExecutable(provider) {
  const override = process.env[provider.toUpperCase() + "_BIN"];
  const name = provider + (process.platform === "win32" ? ".exe" : "");
  const candidates = override ? [override] : [];
  for (const directory of (process.env.PATH || "").split(path.delimiter)) {
    if (directory) candidates.push(path.join(directory.replace(/^"|"$/g, ""), name));
  }
  if (provider === "claude") candidates.push(path.join(os.homedir(), ".local", "bin", name));
  const found = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (!found) throw new Error("Native " + provider + " executable not found. Set " + provider.toUpperCase() + "_BIN to its executable path.");
  return path.resolve(found);
}

function observe(provider, event, state) {
  const identity = provider === "codex" && event.type === "thread.started" ? event.thread_id
    : provider === "claude" && event.type === "result" ? event.session_id
      : provider === "copilot" && event.type === "result" ? event.sessionId : null;
  if (identity && state.expectedSessionId && identity !== state.expectedSessionId) state.failed = true;
  if (provider === "codex" && event.type === "thread.started") state.sessionId = event.thread_id;
  if (provider === "codex" && event.type === "turn.completed") state.completed = true;
  if (provider === "codex" && event.type === "turn.failed") state.failed = true;
  if (provider === "claude" && event.type === "result") {
    state.sessionId = event.session_id || state.sessionId;
    state.completed = !event.is_error && event.subtype === "success";
    state.failed ||= Boolean(event.is_error) || !state.completed;
  }
  if (provider === "copilot" && event.type === "result") {
    state.sessionId = event.sessionId || state.sessionId;
    state.completed = event.exitCode === 0;
    state.failed ||= !state.completed;
  }
  if (event.item?.type === "agent_message") return event.item.text;
  if (event.type === "assistant.message") return event.data?.content || "";
  if (event.type === "assistant") return (event.message?.content || []).filter((part) => part.type === "text").map((part) => part.text).join("\n");
  if (event.item?.type === "command_execution" && event.type === "item.started") return "TOOL: " + event.item.command;
  if (event.type === "tool.execution_start") return "TOOL: " + event.data?.toolName;
  return "";
}

function validateArtifacts(directory, fixture) {
  if (fixture === "hello-world") return;
  const board = path.join(directory, "board", "board.jsonl");
  const entries = fs.readFileSync(board, "utf8").split(/\r?\n/).filter((line) => line.trim()).map((line) => JSON.parse(line));
  const marker = fs.readFileSync(path.join(directory, "run", fixture + ".done"), "utf8").trim();
  if (marker !== "finished") throw new Error("Completion marker is not finished.");
  if (fixture === "researcher") {
    if (!entries.some((entry) => entry.from === "researcher" && entry.type === "status" && entry.text === "started")) {
      throw new Error("The helper did not write the required researcher board entry.");
    }
  } else {
    const data = JSON.parse(fs.readFileSync(path.join(directory, "run", "luke.json"), "utf8"));
    if (!data.name || !data.height || !data.birth_year) throw new Error("Downloaded SWAPI fields are missing.");
    const expected = data.name + ", height " + data.height + ", born " + data.birth_year;
    if (!entries.some((entry) => entry.from === "swapi-tester" && entry.type === "result" && entry.text === expected)) {
      throw new Error("The board result does not match the actual downloaded data.");
    }
  }
}

async function execute(command, directory, provider, state) {
  await new Promise((resolve, reject) => {
    const child = spawn(command.executable, command.args, { cwd: directory, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    let pending = "";
    child.stdout.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      fs.appendFileSync(path.join(directory, "events.jsonl"), text);
      pending += text;
      const lines = pending.split(/\r?\n/);
      pending = lines.pop();
      for (const line of lines) {
        try {
          const message = observe(provider, JSON.parse(line), state);
          if (message) console.log(message);
        } catch {
          if (line.trim()) console.log(line);
        }
      }
    });
    child.stderr.on("data", (chunk) => {
      fs.appendFileSync(path.join(directory, "stderr.log"), chunk);
      process.stderr.write(chunk);
    });
    child.stdin.on("error", (error) => { if (error.code !== "EPIPE") reject(error); });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (pending.trim()) {
        try { observe(provider, JSON.parse(pending), state); } catch {}
      }
      if (code !== 0) reject(new Error("Provider exited " + code + (signal ? " (" + signal + ")" : "") + ". See stderr.log."));
      else if (state.failed || !state.completed || !state.sessionId) reject(new Error("CLI exited without a successful completion event and matching session identity. See events.jsonl."));
      else resolve();
    });
    child.stdin.end(command.stdin);
  });
}

async function main(argv) {
  const [provider, action, argument, ...messageParts] = argv;
  if (!["claude", "codex", "copilot"].includes(provider)) throw new Error("Select claude, codex, or copilot.");
  if (!["run", "resume"].includes(action) || !argument) {
    throw new Error("Usage: PROVIDER.sh run TEST_NAME | resume RUN_DIRECTORY \"next instruction\"");
  }
  const executable = findExecutable(provider);
  let directory;
  let metadata;
  let prompt;
  if (action === "run") {
    if (!FIXTURES.has(argument)) throw new Error("Unknown test. Choose hello-world, researcher, or swapi-tester.");
    directory = path.join(OUTPUT_ROOT, provider, crypto.randomUUID());
    fs.mkdirSync(path.join(directory, "board"), { recursive: true });
    fs.mkdirSync(path.join(directory, "run"), { recursive: true });
    fs.writeFileSync(path.join(directory, "board", "board.jsonl"), "");
    const instructionFile = path.join(ROOT, "tests", "instructions", argument + ".md");
    const instructions = fs.readFileSync(instructionFile, "utf8");
    metadata = { provider, fixture: argument, sessionId: provider === "codex" ? null : crypto.randomUUID(), status: "created", createdAt: new Date().toISOString() };
    prompt = "Execute this explicitly authorized smoke test in the current isolated working directory. Do not run git, create worktrees, modify application code, install packages, or start servers. Output files are runtime test data: use native append/file-output operations.\n\nInstruction file: " + instructionFile + "\n\n" + instructions;
    if (argument === "hello-world") prompt += "\n\nTask: Reply exactly: Hello world from " + provider + ".";
  } else {
    if (!messageParts.length) throw new Error("A follow-up instruction is required.");
    directory = fs.realpathSync(path.resolve(argument));
    if (!inside(OUTPUT_ROOT, directory)) throw new Error("Resume accepts only this repository's generated test directories.");
    metadata = JSON.parse(fs.readFileSync(path.join(directory, "session.json"), "utf8"));
    if (metadata.provider !== provider || !metadata.sessionId) throw new Error("Run directory has no matching provider session.");
    prompt = messageParts.join(" ");
  }
  const lock = path.join(directory, ".running");
  let lockHandle;
  try { lockHandle = fs.openSync(lock, "wx"); } catch { throw new Error("Another process owns this test directory. Do not send concurrent turns to one conversation."); }
  const metadataPath = path.join(directory, "session.json");
  console.log("Test directory: " + directory);
  console.log("Submitting:\n" + prompt + "\n");
  const state = { sessionId: metadata.sessionId, expectedSessionId: action === "resume" ? metadata.sessionId : null, completed: false, failed: false };
  fs.appendFileSync(path.join(directory, "requests.txt"), "\n[" + new Date().toISOString() + "]\n" + prompt + "\n");
  metadata.status = "running";
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  try {
    await execute(commandFor(provider, executable, directory, state.sessionId, action === "resume", prompt), directory, provider, state);
    if (action === "run") validateArtifacts(directory, metadata.fixture);
    metadata.status = "passed";
    console.log("PASS: successful provider completion" + (action === "run" ? " and required test artifacts" : "") + ".");
  } catch (error) {
    metadata.status = "failed";
    metadata.error = error.message;
    throw error;
  } finally {
    metadata.sessionId = state.sessionId;
    metadata.updatedAt = new Date().toISOString();
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    fs.closeSync(lockHandle);
    fs.unlinkSync(lock);
    console.log("Session: " + (state.sessionId || "not created"));
  }
}

module.exports = { inside, commandFor, observe, validateArtifacts };
if (require.main === module) main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
