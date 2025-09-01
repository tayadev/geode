import * as fs from "fs";
import * as path from "path";
import type { Pack } from "./packRepresentation";
import { generatePackMcmeta } from "./packMeta";

// Write pack.mcmeta to outputDir
export function writePackMcmeta(meta: any, outputDir: string) {
  const mcmeta = generatePackMcmeta(meta);
  const mcmetaPath = path.join(outputDir, "pack.mcmeta");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(mcmetaPath, JSON.stringify(mcmeta, null, 4), "utf8");
}

// Write function files to outputDir/data/[namespace]/function/[functionPath].mcfunction
export function writeFunctionFiles(pack: Pack, outputDir: string) {
  for (const namespace of Object.keys(pack.data)) {
    const functions = pack.data[namespace].function;
    if (!functions) continue;
    for (const functionPath of Object.keys(functions)) {
      const outPath = path.join(
        outputDir,
        "data",
        namespace,
        "function",
        functionPath + ".mcfunction"
      );
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      const content = functions[functionPath];
      if (typeof content === "string") {
        fs.writeFileSync(outPath, content, "utf8");
      }
    }
  }
}

// Main export function
export async function exportPack(pack: Pack, meta: any, outputPath: string) {
  if (outputPath.endsWith(".zip")) {
    // Export to temp dir, then zip
    const tmpDir = path.join("./.geode-tmp", Date.now().toString());
    fs.mkdirSync(tmpDir, { recursive: true });
    writePackMcmeta(meta, tmpDir);
    writeFunctionFiles(pack, tmpDir);

    // Use adm-zip to zip the directory
    const AdmZip = require("adm-zip");
    const zip = new AdmZip();

    // Recursively add all files and folders from tmpDir
    function addDirToZip(dir: string, base: string = "") {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const zipPath = path.join(base, entry.name);
        if (entry.isDirectory()) {
          addDirToZip(fullPath, zipPath);
        } else if (entry.isFile()) {
          zip.addLocalFile(fullPath, base);
        }
      }
    }
    addDirToZip(tmpDir);

    zip.writeZip(outputPath);

    // Clean up temp dir
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } else {
    writePackMcmeta(meta, outputPath);
    writeFunctionFiles(pack, outputPath);
  }
  // TODO: handle tags, assets
}
