# Geode

Geode is a development toolkit for creating minecraft data and resource packs.

## Getting Started

Geode projects are defined by a lua file `pack.lua` in the root of the project directory. This file contains instructions how to build your pack.

```lua:title=pack.lua
name = "My first pack"
description = "This is my cool pack"
mc_version = "1.21.8"
data_pack = load('src')
```

This configures the pack with a name, description, and the data pack to load from the `src` directory. The `load` function is a built-in function in Geode that loads all the files in a directory as part of the data pack.

So you can have your normal datapack files in the `src` directory, and they will be included in the pack automatically.

For example:
```mcfunction:title=src/data/example/function/hello.mcfunction
say hello world
```

Now you can build your pack by running `geode build` in the root of your project directory.
This will now have created a `build` directory containing the compiled pack as a zip file.

This pack will have the bare minimum to work with Minecraft:
- your pack files
- a pack.mcmeta file

## Plugins and how to extend Geode

By specifying plugins in your `pack.lua` file, you can have them run after the main setup of Geode, but before the pack is built to file. As such they can modify/delete/add resources in the pack.

Alternatively you can entirely replace the `load()` function to build your pack from the ground up in a different way.

```lua:title=pack.lua
name = "PluginDemo"
description = "A demonstration of plugins"
mc_version = "1.21.8"
data_pack = load('src')
author = "Your Name"
plugins = { "pack_achievement.lua" }
```

## Internals

Geode builds a internal representation of a pack that can be modified by plugins. Then geode exports the internal representation to the file system as a Minecraft data or resource pack.

Thus Geode works in the following steps:
- Create blank pack representation
- Fill in pack metadata
- Import files specified with `load()`
- Execute plugins
- Render out the internal representation to a virtual file representation
- Execute post-processing plugins
- Export to the file system

Pack.lua meta representation
```ts
interface PackMeta {
    name: string; // Name of the pack
    description: string; // Description of the pack
    mc_version: string; // Minecraft version that this pack is compatible with
    data_pack?: any; // where to import data pack data from
    resource_pack?: any; // where to import resource pack data from
    author?: string; // Author of the pack
    icon?: string; // Icon of the pack
    plugins?: string[]; // List of plugins to run
    post_process_plugins?: string[]; // List of post-process plugins to run
    output?: string; // Output location for the pack. Defaults to ./build/{name}.zip. If a folder is given the pack wont be zipped.
}
```

Pack Representation:
```ts
interface Pack {
    name: string;
    description: string;
    mc_version: string;
    icon: Blob;
    data: {
        [namespace: string]: {
            function: {
                [functionPath: string]: string; // paths dont include file extensions
            };
            tags: {
                function: {
                    [tagPath: string]: {replace?: boolean, values: string|{id:string,required:boolean}}
                }
            }
        };
    };
    assets: {
        [namespace: string]: {
            textures: {
                [texturePath: string]: Blob;
            }
        };
    };
}
```

This then gets turned into the minecraft pack format:
```
pack.mcmeta
pack.png
data
  [namespace]
    function
      [functionPath].mcfunction
    tags
      [tagPath].json
assets
  [namespace]
    textures
      [texturePath].png
```
