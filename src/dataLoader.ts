import * as fs from "fs";
import * as path from "path";

// Represents a loaded data pack file
export interface DataPackFile {
  namespace: string;
  type: string; // e.g., "function", "tags"
  relativePath: string; // e.g., "example/function/hello"
  content: string;
}

// Recursively scan a directory and return all .mcfunction files (for now)
export function loadDataPackFiles(srcDir: string): DataPackFile[] {
  const files: DataPackFile[] = [];

  function scan(dir: string, namespace: string, type: string, relPath: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(
          fullPath,
          namespace,
          type,
          path.join(relPath, entry.name)
        );
      } else if (entry.isFile()) {
        // Only handle .mcfunction files for now
        if (type === "function" && entry.name.endsWith(".mcfunction")) {
          const content = fs.readFileSync(fullPath, "utf8");
          files.push({
            namespace,
            type,
            relativePath: path.join(relPath, entry.name.replace(/\.mcfunction$/, "")),
            content,
          });
        }
        // TODO: handle tags, other types
      }
    }
  }

  // Expect srcDir/data/[namespace]/function/[functionPath].mcfunction
  const dataDir = path.join(srcDir, "data");
  if (!fs.existsSync(dataDir)) return files;
  const namespaces = fs.readdirSync(dataDir);
  for (const ns of namespaces) {
    const nsDir = path.join(dataDir, ns);
    const functionDir = path.join(nsDir, "function");
    if (fs.existsSync(functionDir)) {
      scan(functionDir, ns, "function", "function");
    }
    // TODO: handle tags, other types
  }

  return files;
}
