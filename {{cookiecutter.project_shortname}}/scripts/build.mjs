import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import {build, defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {
    dashExternals,
    dashJsAsJsxPlugin,
    dashViteDefines,
} from '../vite.config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const packagejson = require('../package.json');
const dashLibraryName = packagejson.name.replace(/-/g, '_');
const useAsync = '{{ cookiecutter.use_async }}' === 'True';

const globals = dashExternals;
const external = Object.keys(globals);

const sharedConfig = {
    configFile: false,
    plugins: [dashJsAsJsxPlugin(), react()],
    define: dashViteDefines,
};

function removeIfExists(filePath) {
    if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, {force: true});
    }
}

function cleanGeneratedAssets() {
    const outDir = path.resolve(projectRoot, dashLibraryName);

    if (!fs.existsSync(outDir)) {
        return;
    }

    for (const filename of fs.readdirSync(outDir)) {
        if (
            filename === `${dashLibraryName}.min.js` ||
            filename === `${dashLibraryName}.min.js.map` ||
            /^async-.+\.js(\.map)?$/.test(filename)
        ) {
            removeIfExists(path.join(outDir, filename));
        }
    }
}

function getAsyncFragments() {
    const fragmentsDir = path.resolve(projectRoot, 'src/lib/fragments');

    if (!useAsync || !fs.existsSync(fragmentsDir)) {
        return [];
    }

    return fs.readdirSync(fragmentsDir)
        .filter(filename => filename.endsWith('.react.js'))
        .map(filename => ({
            componentName: filename.replace(/\.react\.js$/, ''),
            entry: path.join('src/lib/fragments', filename),
        }));
}

function libraryBuild(entry, name, fileName, footer) {
    const bundlerOptions = {
        external,
        output: {
            extend: true,
            globals,
            footer,
        },
    };

    return defineConfig({
        ...sharedConfig,
        build: {
            outDir: path.resolve(projectRoot, dashLibraryName),
            emptyOutDir: false,
            sourcemap: true,
            lib: {
                entry: path.resolve(projectRoot, entry),
                name,
                formats: ['iife'],
                fileName: () => fileName,
            },
            rollupOptions: bundlerOptions,
            rolldownOptions: bundlerOptions,
        },
    });
}

cleanGeneratedAssets();

await build(
    libraryBuild(
        'src/lib/index.js',
        dashLibraryName,
        `${dashLibraryName}.min.js`
    )
);

for (const {componentName, entry} of getAsyncFragments()) {
    const asyncGlobal = `__dash_async_${componentName}`;
    await build(
        libraryBuild(
            entry,
            asyncGlobal,
            `async-${componentName}.js`,
            [
                `window["${dashLibraryName}"] = window["${dashLibraryName}"] || {};`,
                `window["${dashLibraryName}"].__async__ = window["${dashLibraryName}"].__async__ || {};`,
                `window["${dashLibraryName}"].__async__["${componentName}"] = ${asyncGlobal}.default || ${asyncGlobal};`,
            ].join('\n')
        )
    );
}
