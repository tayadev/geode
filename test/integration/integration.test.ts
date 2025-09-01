import { test, expect } from "bun:test";
import { parsePackLua } from "../../src/luaParser";
import { loadDataPackFiles } from "../../src/dataLoader";
import { buildPack } from "../../src/packRepresentation";
import { exportPack } from "../../src/exporter";
import type { PackMeta } from "../../src/packMeta";
import * as fs from "fs";
import * as path from "path";

// Helper to recursively compare two directories
function compareDirs(actualDir: string, expectedDir: string) {
  const actualEntries = fs.readdirSync(actualDir, { withFileTypes: true });
  const expectedEntries = fs.readdirSync(expectedDir, { withFileTypes: true });

  // Compare entry names
  const actualNames = actualEntries.map(e => e.name).sort();
  const expectedNames = expectedEntries.map(e => e.name).sort();
  expect(actualNames).toEqual(expectedNames);

  for (const entry of actualEntries) {
    const actualPath = path.join(actualDir, entry.name);
    const expectedPath = path.join(expectedDir, entry.name);
    if (entry.isDirectory()) {
      compareDirs(actualPath, expectedPath);
    } else if (entry.isFile()) {
      const actualContent = fs.readFileSync(actualPath, "utf8");
      const expectedContent = fs.readFileSync(expectedPath, "utf8");
      expect(actualContent).toBe(expectedContent);
    }
  }
}

// Discover all test case directories in /integration
const integrationDir = path.join(__dirname);
const testCases = fs.readdirSync(integrationDir, { withFileTypes: true })
  .filter(e => e.isDirectory() && e.name !== ".actual")
  .map(e => e.name);

for (const caseName of testCases) {
  const caseDir = path.join(integrationDir, caseName);
  const inputDir = path.join(caseDir, "input");
  const expectedDir = path.join(caseDir, "expected");
  const actualDir = path.join(caseDir, ".actual");

  test(`integration: ${caseName} pipeline produces expected output files`, async () => {
    // Clean up any previous .actual
    if (fs.existsSync(actualDir)) {
      fs.rmSync(actualDir, { recursive: true, force: true });
    }
    fs.mkdirSync(actualDir, { recursive: true });

    // Find pack.lua and srcDir
    const packLuaPath = path.join(inputDir, "pack.lua");
    const srcDir = path.join(inputDir, "src");

    // Parse pack.lua
    const config = await parsePackLua(packLuaPath);
    const meta: PackMeta = {
      name: config.name,
      description: config.description,
      mc_version: config.mc_version,
      data_pack: config.data_pack,
      author: config.author,
      plugins: config.plugins,
      resource_pack: config.resource_pack,
      icon: config.icon,
      post_process_plugins: config.post_process_plugins,
      output: config.output,
    };
    const files = loadDataPackFiles(srcDir);
    const pack = buildPack(meta, files);

    // Export to .actual (never overwrite /expected)
    await exportPack(pack, meta, actualDir);

    // Compare .actual to expected
    compareDirs(actualDir, expectedDir);

    // Clean up .actual after test
    fs.rmSync(actualDir, { recursive: true, force: true });
  });
}
