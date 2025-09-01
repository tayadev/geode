import { Command } from "commander";
import { parsePackLua } from "./luaParser";
import { loadDataPackFiles } from "./dataLoader";
import { buildPack } from "./packRepresentation";
import { exportPack } from "./exporter";
import type { PackMeta } from "./packMeta";
import * as path from "path";
import * as fs from "fs";

const program = new Command();

program
  .name("geode")
  .description("Geode CLI for building Minecraft data/resource packs")
  .version("1.0.0");

program
  .command("build")
  .argument("[projectPath]", "Path to the project directory (default: current directory)")
  .action(async (projectPath?: string) => {
    try {
      let packLuaPath: string;
      let srcDir: string;

      if (projectPath) {
        const resolvedPath = path.resolve(projectPath);
        if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
          // If path is a file, use it as pack.lua
          packLuaPath = resolvedPath;
          srcDir = path.join(path.dirname(packLuaPath), "src");
        } else {
          // If path is a directory, use [directory]/pack.lua
          packLuaPath = path.join(resolvedPath, "pack.lua");
          srcDir = path.join(resolvedPath, "src");
        }
      } else {
        // Default to current directory
        packLuaPath = path.join(process.cwd(), "pack.lua");
        srcDir = path.join(process.cwd(), "src");
      }

      if (!fs.existsSync(packLuaPath)) {
        console.error(`pack.lua not found at ${packLuaPath}`);
        process.exit(1);
      }

      // Parse pack.lua
      const config = await parsePackLua(packLuaPath);

      // Determine output path
      let outputPath = config.output;
      if (!outputPath) {
        outputPath = path.join(path.dirname(packLuaPath), "build", `${config.name}.zip`);
      }

      // Build PackMeta for output
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
        output: outputPath,
      };

      // Load data pack files
      const files = loadDataPackFiles(srcDir);

      // Build internal representation
      const pack = buildPack(meta, files);

      // Export to Minecraft format
      await exportPack(pack, meta, outputPath);

      console.log("Pack built and exported to", outputPath);
    } catch (err) {
      console.error("Error:", err);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
