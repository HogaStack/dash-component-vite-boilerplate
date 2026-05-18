# Dash Component Vite Boilerplate

[English](README.md) | 简体中文

用于构建 Dash 组件库的 Cookiecutter 模板，JavaScript 构建流程由现代化的 Vite 驱动。

本模板保留了 Plotly 基于 Webpack 的 [`dash-component-boilerplate`](https://github.com/plotly/dash-component-boilerplate) 的核心 Python/Dash 工作流：生成 React 组件源码、Dash Python 包装器、包元数据、测试以及可发布资源。JavaScript 构建部分改为使用 Vite 实现。

## 功能特性

- 基于 Vite 8 的 Dash 浏览器端包构建。
- 支持函数组件和类组件的 React 组件模板。
- 可选的异步组件输出，支持 Dash 感知的懒加载。
- 通过 Dash 组件生成器生成 Python 包装器。
- 提供本地 Vite demo 应用，便于快速前端开发。
- 针对生成的 JavaScript、CSS、元数据和 `MANIFEST.in` 进行发布校验。
- 通过 `node scripts/generate-components.mjs` 生成 Python 包装器。

## 环境要求

- Python 3.8+
- Node.js `^20.19.0 || >=22.12.0`
- npm 10+
- `cookiecutter`

生成后的项目会在依赖安装和 JavaScript 构建阶段强制检查 Node.js 版本要求。

如需安装 Cookiecutter：

```bash
pip install cookiecutter
```

## 创建组件项目

从本地仓库创建：

```bash
cookiecutter path/to/dash-component-vite-boilerplate
```

从 GitHub 创建：

```bash
cookiecutter gh:HogaStack/dash-component-vite-boilerplate
```

你将需要填写：

- `project_name`：项目的人类可读名称，例如 `Dash Core Components`。
- `project_shortname`：Python 包名。必须为小写，可包含数字和 `_`。
- `component_name`：初始 React 组件名。应使用 PascalCase，例如 `MyComponent`。
- `component_type`：函数组件或类组件。
- `use_async`：是否将初始组件生成为异步/懒加载组件。
- `author_name` / `author_email`：包元数据。
- `github_org`：可选的 GitHub 所有者，用于生成包 URL。
- `description`：包描述。
- `license`：生成的包许可证元数据。
- `publish_on_npm`：Dash 是否应包含用于 CDN 服务的 unpkg URL。
- `install_dependencies`：生成后的 hook 是否安装依赖并执行初始构建。

生成的项目会创建在以 `project_shortname` 命名的文件夹中。

## 生成项目工作流

进入生成后的项目目录：

```bash
npm install
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

在 macOS/Linux 上，使用以下方式激活虚拟环境：

```bash
. venv/bin/activate
```

常用命令：

```bash
npm start
npm run build:js
npm run build:python
npm run build
npm run lint
python usage.py
```

- `npm start` 会从 `src/demo` 启动独立的 Vite demo 应用。
- `npm run build:js` 会将 Dash JavaScript 包写入 Python 包目录。
- `npm run build:python` 会基于 `src/lib/components` 重新生成 Python 包装器。
- `npm run build` 会同时运行 JavaScript 构建和 Python 包装器生成。
- `python usage.py` 会启动一个使用生成组件的示例 Dash 应用。

## 异步组件

当 `use_async=True` 时，模板会生成：

- 位于 `src/lib/components/<ComponentName>.react.js` 的公共包装组件
- 位于 `src/lib/fragments/<ComponentName>.react.js` 的真实实现片段
- 在 `npm run build:js` 阶段生成的 `async-<ComponentName>.js` 包

Vite 构建会扫描 `src/lib/fragments/*.react.js`，因此后续可以继续添加异步片段。本地服务时，异步包会通过 Dash 的 `_dash-component-suites` 路由加载。如果 `publish_on_npm=True`，也会注册 unpkg 的 CDN URL。

## 发布

发布生成的组件库前：

```bash
npm run build
npm run validate-init
python setup.py sdist bdist_wheel
```

`validate-init` 会检查生成的资源是否已注册到 Dash 包中，并包含在 `MANIFEST.in` 中。当发布所需的关键文件缺失时，它会以非零状态码退出。

如果 `publish_on_npm=False`，Dash 会从 Python 包本地提供资源。如果 `publish_on_npm=True`，还需要发布 npm 包，以确保 unpkg URL 可以正确解析。

## 测试本模板

安装模板测试依赖：

```bash
pip install -r tests/requirements.txt
```

运行轻量级生成测试：

```bash
pytest tests/test_generate.py
```

安装/浏览器集成测试需要 npm、Chrome/Chromedriver 和 Dash 测试依赖：

```bash
pytest tests/test_install.py --headless
```

## 说明

Vite/Rollup/Rolldown 不提供 Webpack 在 IIFE 构建中的运行时 chunk 行为。本模板使用显式的 Vite library build，并配合一个小型 Dash 感知异步加载器，以保留 Dash 异步组件行为。

如需对比原始 Webpack 实现，请参考 Plotly 的 [`dash-component-boilerplate`](https://github.com/plotly/dash-component-boilerplate)。
