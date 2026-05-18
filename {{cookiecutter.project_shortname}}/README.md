# {{cookiecutter.project_name}}

{{cookiecutter.project_name}} is a Dash component library.

{{cookiecutter.description}}

## Quick Start

Requires Node.js `^20.19.0 || >=22.12.0` and npm 10+.

Install dependencies if they were not installed during project generation:

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

Build the component wrappers and run the sample app:

```bash
npm run build
python usage.py
```

Then open http://localhost:8050.

## Development

Edit the initial component in:

```text
src/lib/components/{{cookiecutter.component_name}}.react.js
```

Useful commands:

```bash
npm start
npm run build:js
npm run build:python
npm run build
npm run lint
pytest tests
```

- `npm start` runs the standalone Vite demo app in `src/demo`.
- `npm run build:js` writes Dash browser bundles into `{{cookiecutter.project_shortname}}/`.
- `npm run build:python` regenerates Python wrappers from `src/lib/components`.
- `npm run build` runs both JavaScript and Python wrapper generation.
- `npm run lint` checks the JavaScript source.
- `pytest tests` runs the generated Dash integration test suite.

## Async Components

{% if cookiecutter.use_async == "True" -%}
This project was generated with async component support enabled.

The public Dash wrapper lives in:

```text
src/lib/components/{{cookiecutter.component_name}}.react.js
```

The real component implementation lives in:

```text
src/lib/fragments/{{cookiecutter.component_name}}.react.js
```

`npm run build:js` emits `async-{{cookiecutter.component_name}}.js` and registers it for Dash lazy loading.
{%- else -%}
This project was generated without async component support. To add async components later, add fragment files under `src/lib/fragments/` and wire a lazy wrapper from `src/lib/components/`.
{%- endif %}

## Python Usage

The generated package can be imported in a Dash app:

```python
import {{cookiecutter.project_shortname}}
from dash import Dash, html

app = Dash(__name__)
app.layout = html.Div([
    {{cookiecutter.project_shortname}}.{{cookiecutter.component_name}}(
        id="example",
        label="Example",
        value="my-value",
    )
])
```

See `usage.py` for a complete callback example.

## Tests

Install test dependencies:

```bash
pip install -r tests/requirements.txt
```

Run tests:

```bash
pytest tests --headless
```

The sample test in `tests/test_usage.py` loads `usage.py` and interacts with the component through Dash's Selenium testing fixture.

## Styling

Add custom CSS files to the package directory:

```text
{{cookiecutter.project_shortname}}/
```

CSS files in that directory are discovered by `{{cookiecutter.project_shortname}}/__init__.py` and added to Dash's `_css_dist`. Make sure publishable assets are included in `MANIFEST.in`.

## Publishing

Build and validate assets before publishing:

```bash
npm run build
npm run validate-init
python setup.py sdist bdist_wheel
```

Test the source distribution in a clean environment:

```bash
pip install dist/{{cookiecutter.project_shortname}}-0.0.1.tar.gz
```

Publish to PyPI:

```bash
twine upload dist/*
```

{% if cookiecutter.publish_on_npm|string == "True" -%}
This project is configured to publish JavaScript assets to npm/unpkg. Publish the npm package too:

```bash
npm publish
```
{%- else -%}
This project is configured to serve JavaScript assets locally from the Python package, so npm publishing is optional.
{%- endif %}

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [review_checklist.md](./review_checklist.md).
