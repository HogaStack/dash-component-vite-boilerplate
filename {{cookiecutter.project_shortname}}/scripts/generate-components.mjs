import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const packagejson = require('../package.json');
const packageName = packagejson.name.replace(/-/g, '_');
const useVenv = process.argv.includes('--venv');

function getPythonExecutable() {
    if (!useVenv) {
        return process.env.PYTHON || 'python';
    }

    const pythonPath = path.join(
        projectRoot,
        'venv',
        process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python'
    );

    if (!fs.existsSync(pythonPath)) {
        throw new Error(`Could not find virtual environment Python at ${pythonPath}`);
    }

    return pythonPath;
}

const args = [
    '-m',
    'dash.development.component_generator',
    './src/lib/components',
    packageName,
    '-p',
    'package-info.json',
    '--ignore',
    '\\.test\\.',
];

{% if cookiecutter.r_prefix -%}
args.push('--r-prefix', '{{ cookiecutter.r_prefix }}');
{% endif -%}
{% if cookiecutter.jl_prefix -%}
args.push('--jl-prefix', '{{ cookiecutter.jl_prefix }}');
{% endif -%}

const result = spawnSync(getPythonExecutable(), args, {
    cwd: projectRoot,
    stdio: 'inherit',
});

if (result.error) {
    throw result.error;
}

process.exit(result.status || 0);
