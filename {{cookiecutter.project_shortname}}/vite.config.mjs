import {createRequire} from 'node:module';
import {defineConfig, transformWithOxc} from 'vite';
import react from '@vitejs/plugin-react';

const require = createRequire(import.meta.url);
const packagejson = require('./package.json');
const dashLibraryName = packagejson.name.replace(/-/g, '_');
const publishOnNpm = '{{ cookiecutter.publish_on_npm }}' === 'True';

export const dashViteDefines = {
    __DASH_LIBRARY_NAME__: JSON.stringify(dashLibraryName),
    __DASH_PACKAGE_NAME__: JSON.stringify(packagejson.name),
    __DASH_PACKAGE_VERSION__: JSON.stringify(packagejson.version),
    __DASH_ASYNC_CDN_BASE__: JSON.stringify(
        publishOnNpm
            ? `https://unpkg.com/${packagejson.name}@${packagejson.version}/${dashLibraryName}`
            : ''
    ),
};

export const dashExternals = {
    react: 'React',
    'react-dom': 'ReactDOM',
    'react-dom/client': 'ReactDOM',
    'plotly.js': 'Plotly',
    'prop-types': 'PropTypes',
};

export function dashJsAsJsxPlugin() {
    return {
        name: 'dash-js-as-jsx',
        enforce: 'pre',
        transform(code, id) {
            if (!/src\/.*\.js$/.test(id.replace(/\\/g, '/'))) {
                return null;
            }

            return transformWithOxc(code, id, {
                lang: 'jsx',
                jsx: {
                    runtime: 'classic',
                    pragma: 'React.createElement',
                    pragmaFrag: 'React.Fragment',
                    importSource: 'react',
                },
            });
        },
    };
}

export default defineConfig({
    plugins: [dashJsAsJsxPlugin(), react()],
    define: dashViteDefines,
    server: {
        open: true,
    },
});
