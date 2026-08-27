import { spawn } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(projectRoot, "BUILD_VERIFICATION.json");
const transcriptPath = resolve(
  projectRoot,
  "evidence/verification/command-transcript.json"
);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const transcript = {
  generatedAt: new Date().toISOString(),
  manifest: "BUILD_VERIFICATION.json",
  commands: [],
};

function run(argv) {
  return new Promise((resolveRun) => {
    const child = spawn(argv[0], argv.slice(1), {
      cwd: projectRoot,
      env: process.env,
      shell: false,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (exitCode) => resolveRun({ exitCode, stdout, stderr }));
  });
}

let failed = false;
for (const command of manifest.commands) {
  if (!command.definition_file || !Array.isArray(command.argv) || command.argv.length === 0) {
    throw new Error(`Invalid verification command: ${command.name}`);
  }
  await access(resolve(projectRoot, command.definition_file));
  const startedAt = new Date().toISOString();
  const result = await run(command.argv);
  transcript.commands.push({
    name: command.name,
    argv: command.argv,
    definitionFile: command.definition_file,
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
  });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  if (result.exitCode !== 0) failed = true;
}

await mkdir(dirname(transcriptPath), { recursive: true });
await writeFile(transcriptPath, `${JSON.stringify(transcript, null, 2)}\n`);
console.log(`Command transcript: ${transcriptPath}`);

if (failed) process.exitCode = 1;
