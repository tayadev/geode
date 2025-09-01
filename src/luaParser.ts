import { LuaFactory } from "wasmoon";
import * as fs from "fs";
import * as path from "path";

export interface PackLuaConfig {
  name: string;
  description: string;
  mc_version: string;
  data_pack?: string;
  author?: string;
  plugins?: string[];
  resource_pack?: string;
  icon?: string;
  post_process_plugins?: string[];
  output?: string;
}

export async function parsePackLua(packLuaPath: string): Promise<PackLuaConfig> {
  const luaFactory = new LuaFactory();
  const lua = await luaFactory.createEngine();

  // Read pack.lua file
  const luaCode = fs.readFileSync(packLuaPath, "utf8");

  // Result object to be filled by Lua execution
  const result: Partial<PackLuaConfig> = {};

  // Provide a 'load' function to Lua that just returns the path for now
  await lua.global.set("load", (srcPath: string) => srcPath);

  // Execute the Lua code
  await lua.doString(luaCode);

  // Extract variables from Lua global scope
  const keys = [
    "name",
    "description",
    "mc_version",
    "data_pack",
    "author",
    "plugins",
    "resource_pack",
    "icon",
    "post_process_plugins",
    "output",
  ];

  for (const key of keys) {
    result[key as keyof PackLuaConfig] = await lua.global.get(key);
  }


  // Convert plugins/post_process_plugins to string[] if present
  if (result.plugins && typeof result.plugins === "object") {
    result.plugins = Array.isArray(result.plugins)
      ? result.plugins.map(String)
      : [String(result.plugins)];
  }
  if (result.post_process_plugins && typeof result.post_process_plugins === "object") {
    result.post_process_plugins = Array.isArray(result.post_process_plugins)
      ? result.post_process_plugins.map(String)
      : [String(result.post_process_plugins)];
  }

  return result as PackLuaConfig;
}
