import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import fs from "fs";
import path from "path";
import generatePackageJson from "rollup-plugin-generate-package-json";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

export const plugins = [
    peerDepsExternal(), // Exclude peer dependencies from bundle
    nodeResolve(), // Locates modules in the project's node_modules directory
    commonjs(), // converts CommonJS to ES6 modules
    typescript({
        useTsconfigDeclarationDir: true,
        tsconfig: "tsconfig.json",
        tsconfigOverride: {
            // Override base tsconfig.json during build
            exclude: [],
        },
    }),
    json(),
];

const subfolderPlugins = (folderName) => [
    ...plugins,
    generatePackageJson({
        baseContents: {
            name: `${pkg.name}/${folderName}`,
            private: true,
            main: "../cjs/index.js", // point to cjs format entry point
            module: "./index.js", // point to esm format entry point of indiv components
            types: "./index.d.ts", // point to esm format entry point of indiv components
        },
    }),
];

const getFolders = (entry) => {
    const dirs = fs.readdirSync(entry);

    // folders without an index.ts
    const dirsToIgnore = [];

    const dirsToUse = dirs
        .filter((dirName) => path.extname(dirName) === "") // exclude non-folders
        .filter((dirName) => dirsToIgnore.indexOf(dirName) === -1);

    return dirsToUse;
};

const folderBuildConfigs = getFolders("./src").map((folder) => {
    return {
        input: `src/${folder}/index.ts`,
        output: {
            file: `dist/${folder}/index.js`,
            sourcemap: true,
            exports: "named",
            format: "esm",
        },
        plugins: subfolderPlugins(folder),
        external: [],
    };
});

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: pkg.module,
                format: "esm",
                sourcemap: true,
                exports: "named",
                interop: "compat",
            },
            {
                file: pkg.main,
                format: "cjs",
                sourcemap: true,
                exports: "named",
                interop: "compat",
            },
        ],
        plugins,
        external: [],
    },
    ...folderBuildConfigs,
];
