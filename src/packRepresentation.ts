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

export function buildPack(meta: {
  name: string;
  description: string;
  mc_version: string;
}, files: DataPackFile[]): Pack {
  const pack: Pack = {
    name: meta.name,
    description: meta.description,
    mc_version: meta.mc_version,
    data: {},
  };

  for (const file of files) {
    if (!pack.data[file.namespace]) {
      pack.data[file.namespace] = { function: {} };
    }
    if (file.type === "function") {
      // Remove leading "function/" from relativePath
      const functionPath = file.relativePath.replace(/^function[\\/]/, "");
      if (!pack.data[file.namespace].function) {
        pack.data[file.namespace].function = {};
      }
      pack.data[file.namespace].function![functionPath] = file.content;
    }
    // TODO: handle tags, assets
  }

  return pack;
}
