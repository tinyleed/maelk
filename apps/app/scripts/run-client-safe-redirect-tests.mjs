import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import ts from "typescript";

const appRoot = process.cwd();
const outputRoot = mkdtempSync(join(tmpdir(), "maelk-client-safe-redirect-tests-"));
const sourceFiles = [
  "app/lib/client-safe-redirect.ts",
  "app/lib/client-safe-redirect.test.ts",
].map((file) => join(appRoot, file));

const compilerOptions = {
  target: ts.ScriptTarget.ES2023,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.Node10,
  rootDir: appRoot,
  outDir: outputRoot,
  strict: true,
  esModuleInterop: true,
  skipLibCheck: true,
  types: ["node"],
  noEmitOnError: true,
};

try {
  const program = ts.createProgram(sourceFiles, compilerOptions);
  const emitResult = program.emit();
  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  const errors = diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);

  if (errors.length > 0) {
    const host = {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => appRoot,
      getNewLine: () => "\n",
    };
    console.error(ts.formatDiagnosticsWithColorAndContext(errors, host));
    process.exitCode = 1;
  } else {
    execFileSync(process.execPath, ["--test", join(outputRoot, "app/lib/client-safe-redirect.test.js")], {
      stdio: "inherit",
    });
    console.log("client_safe_redirect_tests_ok");
  }
} finally {
  rmSync(outputRoot, { force: true, recursive: true });
}
