# Dash Component Vite Boilerplate

English | [简体中文](README.zh-CN.md)

Cookiecutter template for building Dash component libraries with a modern Vite-powered JavaScript build.

This template keeps the core behavior of Plotly's Webpack-based [`dash-component-boilerplate`](https://github.com/plotly/dash-component-boilerplate): it generates React component source, Dash Python wrappers, R wrappers, Julia wrappers, package metadata, tests, and publish-ready assets. The JavaScript build is implemented with Vite instead of Webpack.

## Features

- Vite 8 library builds for Dash browser bundles.
- React component templates for function and class components.
- Optional async component output with Dash-aware lazy loading.
- Python/R/Julia wrapper generation through Dash's component generator.
- Local Vite demo app for fast frontend iteration.
- Publish validation for generated JavaScript, CSS, metadata, and `MANIFEST.in`.
- Cross-platform backend generation through `node scripts/generate-components.mjs`.

## Requirements

- Python 3.8+
- Node.js `^20.19.0 || >=22.12.0`
- npm 10+
- `cookiecutter`

The generated project enforces this Node.js requirement during dependency
installation and JavaScript builds.

Install Cookiecutter if needed:

```bash
pip install cookiecutter
```

## Generate A Component Project

From a local checkout:

```bash
cookiecutter path/to/dash-component-vite-boilerplate
```

From GitHub:

```bash
cookiecutter gh:HogaStack/dash-component-vite-boilerplate
```

You will be prompted for:

- `project_name`: Human-readable project name, for example `Dash Core Components`.
- `project_shortname`: Python package name. It must be lowercase and may contain numbers and `_`.
- `component_name`: Initial React component name. It should be PascalCase, for example `MyComponent`.
- `component_type`: Function component or class component.
- `use_async`: Whether to generate the initial component as an async/lazy-loaded component.
- `jl_prefix` / `r_prefix`: Optional Julia/R component prefixes.
- `author_name` / `author_email`: Package metadata.
- `github_org`: Optional GitHub owner used for package URLs.
- `description`: Package description.
- `license`: Generated package license metadata.
- `publish_on_npm`: Whether Dash should include unpkg URLs for CDN serving.
- `install_dependencies`: Whether the post-generation hook should install dependencies and run the initial build.

The generated project is created in a folder named after `project_shortname`.

## Generated Project Workflow

Inside the generated project:

```bash
npm install
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

On macOS/Linux, activate with:

```bash
. venv/bin/activate
```

Common commands:

```bash
npm start
npm run build:js
npm run build:backends
npm run build
npm run lint
python usage.py
```

- `npm start` runs the standalone Vite demo app from `src/demo`.
- `npm run build:js` writes Dash JavaScript bundles into the Python package directory.
- `npm run build:backends` regenerates Python/R/Julia wrappers from `src/lib/components`.
- `npm run build` runs both JavaScript and backend generation.
- `python usage.py` starts a sample Dash app using the generated component.

## Async Components

When `use_async=True`, the template generates:

- a public wrapper in `src/lib/components/<ComponentName>.react.js`
- a real implementation fragment in `src/lib/fragments/<ComponentName>.react.js`
- an `async-<ComponentName>.js` bundle during `npm run build:js`

The Vite build scans `src/lib/fragments/*.react.js`, so additional async fragments can be added later. Async bundles are loaded through Dash's `_dash-component-suites` route when serving locally. If `publish_on_npm=True`, CDN URLs are also registered for unpkg.

## Publishing

Before publishing a generated component library:

```bash
npm run build
npm run validate-init
python setup.py sdist bdist_wheel
```

`validate-init` checks that generated assets are registered in the Dash package and included by `MANIFEST.in`. It exits with a non-zero status when publish-critical files are missing.

If `publish_on_npm=False`, Dash will serve assets locally from the Python package. If `publish_on_npm=True`, publish the npm package as well so unpkg URLs resolve correctly.

## Testing This Template

Install template test requirements:

```bash
pip install -r tests/requirements.txt
```

Run the lightweight generation test:

```bash
pytest tests/test_generate.py
```

The install/browser integration test requires npm, Chrome/Chromedriver, and Dash testing dependencies:

```bash
pytest tests/test_install.py --headless
```

## Notes

Vite/Rollup/Rolldown do not provide Webpack's runtime chunk behavior for IIFE builds. This template uses explicit Vite library builds plus a small Dash-aware async loader to preserve Dash async component behavior.

For comparison with the original Webpack implementation, see Plotly's [`dash-component-boilerplate`](https://github.com/plotly/dash-component-boilerplate).
