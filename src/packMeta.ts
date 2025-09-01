export interface PackMeta {
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
}

/**
 * Direct lookup table from MC version string to pack_format.
 * 
 * This approach allows arbitrary MC version strings (including non-semver and pre-release versions)
 * to be mapped directly to their corresponding pack_format. To support a new MC version, simply add
 * it as a key to this object. If a version is not present, getPackFormat will return 0.
 * 
 * Example:
 *   mcVersionToPackFormat["1.20.1-pre1"] = 15;
 */
const mcVersionToPackFormat: Record<string, number> = {
  "1.13": 4,
  "1.13.1": 4,
  "1.13.2": 4,
  "1.14": 4,
  "1.14.1": 4,
  "1.14.2": 4,
  "1.14.3": 4,
  "1.14.4": 4,
  "1.15": 5,
  "1.15.1": 5,
  "1.15.2": 5,
  "1.16": 5,
  "1.16.1": 5,
  "1.16.2": 6,
  "1.16.3": 6,
  "1.16.4": 6,
  "1.16.5": 6,
  "1.17": 7,
  "1.17.1": 7,
  "1.18": 8,
  "1.18.1": 8,
  "1.18.2": 9,
  "1.19": 10,
  "1.19.1": 10,
  "1.19.2": 10,
  "1.19.3": 10,
  "1.19.4": 12,
  "1.20": 15,
  "1.20.1": 15,
  "1.20.2": 18,
  "1.20.3": 26,
  "1.20.4": 26,
  "1.20.5": 41,
  "1.20.6": 41,
  "1.21": 48,
  "1.21.1": 48,
  "1.21.2": 57,
  "1.21.3": 57,
  "1.21.4": 61,
  "1.21.5": 71,
  "1.21.6": 80,
  "1.21.7": 81,
  "1.21.8": 81,
  "1.21.9": 85,
  // Add more versions as needed
};

export function getPackFormat(mc_version: string): number {
  return mcVersionToPackFormat[mc_version] ?? 0;
}

export function generatePackMcmeta(meta: PackMeta): object {
  return {
    pack: {
      pack_format: getPackFormat(meta.mc_version),
      description: meta.description,
    },
  };
}
