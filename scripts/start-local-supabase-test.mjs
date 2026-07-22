import { spawn } from "node:child_process";
import { Transform } from "node:stream";
import { fileURLToPath } from "node:url";

export const SUPABASE_START_TEST_ARGS = Object.freeze([
  "start",
  "--exclude",
  "edge-runtime,imgproxy,logflare,mailpit,postgres-meta,realtime,storage-api,studio,supavisor,vector",
]);

const SENSITIVE_SUPABASE_LINE_LABEL =
  /\b(?:anon\s+key|service_role\s+key|secret\s+key|jwt\s+secret|s3\s+access\s+key|s3\s+secret\s+key|db\s+url|database\s+url|postgres(?:ql)?\s+url|password)\b/iu;
const SENSITIVE_SUPABASE_TABLE_LABEL =
  /\b(?:publishable|secret|anon\s+key|service_role\s+key|jwt\s+secret|s3\s+access\s+key|s3\s+secret\s+key)\b/iu;
const POSTGRES_URL = /postgres(?:ql)?:\/\/[^\s'"<>]+/giu;
const JWT_LIKE_TOKEN = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/gu;

export function redactSupabaseStartOutput(text) {
  return text
    .split(/(?<=\n)/u)
    .map((line) => redactSupabaseStartLine(line))
    .join("");
}

function redactSupabaseStartLine(line) {
  const lineBreak = line.match(/\r?\n$/u)?.[0] ?? "";
  const body = lineBreak ? line.slice(0, -lineBreak.length) : line;
  const tableRow = /^(\s*[│|]\s*)([^│|]+?)(\s*[│|]\s*)([^│|]*)(\s*[│|]\s*)$/u.exec(body);
  if (tableRow && SENSITIVE_SUPABASE_TABLE_LABEL.test(tableRow[2])) {
    return `${tableRow[1]}${tableRow[2]}${tableRow[3]}[REDACTED] ${tableRow[5].trimStart()}${lineBreak}`;
  }
  if (SENSITIVE_SUPABASE_LINE_LABEL.test(body)) {
    const match = /^(\s*[^:=\n]+[:=]\s*)(.*)$/u.exec(body);
    if (match) {
      return `${match[1]}[REDACTED]${lineBreak}`;
    }
    return "[REDACTED]" + lineBreak;
  }
  return body.replace(POSTGRES_URL, "postgresql://[REDACTED]").replace(JWT_LIKE_TOKEN, "[REDACTED_JWT]") + lineBreak;
}

export class SupabaseStartRedactionTransform extends Transform {
  #pending = "";

  _transform(chunk, _encoding, callback) {
    const text = this.#pending + chunk.toString("utf8");
    const lines = text.split(/(?<=\n)/u);
    this.#pending = lines.pop() ?? "";
    for (const line of lines) {
      this.push(redactSupabaseStartOutput(line));
    }
    callback();
  }

  _flush(callback) {
    if (this.#pending) {
      this.push(redactSupabaseStartOutput(this.#pending));
      this.#pending = "";
    }
    callback();
  }
}

export function runSupabaseStartTest() {
  const child = spawn("supabase", SUPABASE_START_TEST_ARGS, {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.pipe(new SupabaseStartRedactionTransform()).pipe(process.stdout);
  child.stderr.pipe(new SupabaseStartRedactionTransform()).pipe(process.stderr);

  child.on("error", (error) => {
    console.error(`Unable to start the local Supabase security stack: ${error.message}`);
    process.exitCode = 1;
  });

  child.on("close", (code, signal) => {
    if (signal) {
      console.error(`Local Supabase security stack start exited via ${signal}.`);
      process.exitCode = 1;
      return;
    }
    process.exitCode = code ?? 1;
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSupabaseStartTest();
}
