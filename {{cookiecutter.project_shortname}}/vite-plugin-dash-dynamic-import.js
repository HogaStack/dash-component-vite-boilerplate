import fs from 'fs';
import path from 'path';

function getFingerprint() {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const timestamp = Math.round(Date.now() / 1000);
    const version = packageJson.version.replace(/[^\w-]/g, '_');
    return `v${version}m${timestamp}`;
}

const runtimeCode = (fingerprint) => `
var getCurrentScript = function() {
    var script = document.currentScript;
    if (!script) {
        var doc_scripts = document.getElementsByTagName('script');
        var scripts = [];
        for (var i = 0; i < doc_scripts.length; i++) {
            scripts.push(doc_scripts[i]);
        }
        scripts = scripts.filter(function(s) { return !s.async && !s.text && !s.textContent; });
        script = scripts.slice(-1)[0];
    }
    return script;
};

var isLocalScript = function(script) {
    return /\/_dash-component-suites\\//.test(script.src);
};

var __dash_fingerprint__ = "${fingerprint}";

var originalLoad = function(src, opts) {
    return window.__vite_load_chunk__(src, opts);
};

window.__vite_load_chunk__ = function(src, opts) {
    var script = getCurrentScript();
    var isLocal = isLocalScript(script);

    if (!isLocal) {
        return originalLoad(src, opts);
    }

    var srcFragments = src.split('/');
    var fileFragments = srcFragments.slice(-1)[0].split('.');
    fileFragments.splice(1, 0, __dash_fingerprint__);
    srcFragments.splice(-1, 1, fileFragments.join('.'));
    
    return originalLoad(srcFragments.join('/'), opts);
};

(function() {
    var originalImport = window.__vite_glob_chunk_load__;
    if (originalImport) {
        window.__vite_glob_chunk_load__ = function(id) {
            var script = getCurrentScript();
            var isLocal = isLocalScript(script);
            
            if (!isLocal) {
                return originalImport(id);
            }
            
            var idFragments = id.split('/');
            var fileFragments = idFragments.slice(-1)[0].split('.');
            fileFragments.splice(1, 0, __dash_fingerprint__);
            idFragments.splice(-1, 1, fileFragments.join('.'));
            
            return originalImport(idFragments.join('/'));
        };
    }
})();
`;

export default function dashDynamicImportPlugin() {
    const fingerprint = getFingerprint();

    return {
        name: 'vite-plugin-dash-dynamic-import',
        apply: 'build',
        generateBundle(options, bundle) {
            const fingerprintValue = fingerprint;
            
            for (const chunk of Object.values(bundle)) {
                if (chunk.type === 'chunk' && chunk.isEntry) {
                    chunk.code = runtimeCode(fingerprintValue) + '\n' + chunk.code;
                }
            }
        },
    };
}
