import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import dashDynamicImport from './vite-plugin-dash-dynamic-import.js';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const dashLibraryName = packageJson.name.replace(/-/g, '_');

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig(({ command, mode }) => {
    const isServe = command === 'serve';

    const entry = isServe 
        ? { main: path.resolve(__dirname, 'src/demo/index.js') }
        : { main: path.resolve(__dirname, 'src/lib/index.js') };

    const filename = isServe 
        ? 'output.js'
        : `${dashLibraryName}.${mode === 'development' ? 'dev' : 'min'}.js`;

    const externals = isServe 
        ? undefined 
        : {
            react: 'React',
            'react-dom': 'ReactDOM',
            'plotly.js': 'Plotly',
            'prop-types': 'PropTypes',
        };

    return {
        mode: mode,
        build: {
            outDir: isServe ? '.' : dashLibraryName,
            lib: !isServe ? {
                entry: path.resolve(__dirname, 'src/lib/index.js'),
                name: dashLibraryName,
                formats: ['iife'],
            } : undefined,
            rollupOptions: {
                output: {
                    chunkFileNames: '[name].js',
                    entryFileNames: filename,
                    assetFileNames: '[name].[ext]',
                },
                external: externals ? Object.keys(externals) : [],
            },
            sourcemap: true,
            minify: !isServe ? 'esbuild' : false,
        },
        plugins: [
            react(),
            !isServe ? dashDynamicImport() : [],
        ].filter(Boolean),
        define: {
            'process.env.NODE_ENV': JSON.stringify(mode),
        },
        server: {
            port: 8080,
            open: true,
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
    };
});
