import { LuaFactory } from "wasmoon";
import * as fs from "fs";
import * as path from "path";

export interface Pack {
  name: string;
  description: string;
  mc_version: string;
  icon?: Blob;
  data: {
    [namespace: string]: {
      function: {
        [functionPath: string]: string;
      };
      tags?: {
        function?: {
          [tagPath: string]: { replace?: boolean; values: string | { id: string; required: boolean } };
        };
      };
    };
  };
  assets?: {
    [namespace: string]: {
      textures?: {
        [texturePath: string]: Blob;
      };
    };
  };
}

import type { DataPackFile } from "./dataLoader";

export async function buildPack(
  meta: {
    name: string;
    description: string;
    mc_version: string;
    data_pack?: any;
    resource_pack?: any;
    author?: string;
    icon?: string;
    plugins?: string[];
    post_process_plugins?: string[];
    output?: string;
  },
  files: DataPackFile[],
  pluginDir?: string // Directory to resolve plugin paths, defaults to cwd
): Promise<Pack> {
  const pack: Pack = {
    name: meta.name,
    description: meta.description,
    mc_version: meta.mc_version,
    data: {},
  };

  // Load files from disk
  for (const file of files) {
    pack.data[file.namespace] = pack.data[file.namespace] ?? { function: {} };
    const nsObj = pack.data[file.namespace] as { function: { [functionPath: string]: string } };
    nsObj.function = nsObj.function ?? {};
    if (file.type === "function") {
      // Remove leading "function/" from relativePath
      const functionPath = file.relativePath.replace(/^function[\\/]/, "");
      nsObj.function[functionPath] = file.content;
    }
    // TODO: handle tags, assets
  }

  // --- Plugin support ---
  if (meta.plugins && Array.isArray(meta.plugins)) {
    const luaFactory = new LuaFactory();
    for (const pluginFile of meta.plugins) {
      // Resolve plugin path
      const pluginPath = pluginDir
        ? path.join(pluginDir, pluginFile)
        : pluginFile;
      if (!fs.existsSync(pluginPath)) {
        throw new Error(`Plugin file not found: ${pluginPath}`);
      }
      const pluginCode = fs.readFileSync(pluginPath, "utf8");
      const lua = await luaFactory.createEngine();

      // JS API for plugins
      const packApi = {
        ns: (namespace: string) => ({
          functions: {
            add: (name: string, content: string) => {
              if (!pack.data[namespace]) {
                pack.data[namespace] = { function: {} };
              }
              pack.data[namespace].function[name] = content;
            },
          },
        }),
      };

      await lua.global.set("pack", packApi);

      // Execute plugin code
      await lua.doString(pluginCode);

      // No need to manually close the Lua engine; wasmoon handles cleanup.
    }
  }

  return pack;
}
