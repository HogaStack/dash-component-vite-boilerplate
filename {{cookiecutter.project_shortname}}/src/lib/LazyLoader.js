import React from 'react';

const libraryName = __DASH_LIBRARY_NAME__;
const cdnBase = __DASH_ASYNC_CDN_BASE__;
const scriptPromises = {};

function getDashConfig() {
    const config = document.getElementById('_dash-config');

    if (!config) {
        return {};
    }

    try {
        return JSON.parse(config.textContent);
    } catch (e) {
        return {};
    }
}

function loadScript(src) {
    if (scriptPromises[src]) {
        return scriptPromises[src];
    }

    const existingScript = document.querySelector(`script[src="${src}"]`);

    if (existingScript) {
        scriptPromises[src] = Promise.resolve();
        return scriptPromises[src];
    }

    scriptPromises[src] = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = () => reject(new Error(`Could not load ${src}`));
        document.head.appendChild(script);
    });

    return scriptPromises[src];
}

function getAsyncUrl(componentName) {
    const dashConfig = getDashConfig();

    if (dashConfig.serve_locally === false && cdnBase) {
        return `${cdnBase}/async-${componentName}.js`;
    }

    const prefix = dashConfig.requests_pathname_prefix || '/';
    const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
    return `${normalizedPrefix}_dash-component-suites/${libraryName}/async-${componentName}.js`;
}

function getRegisteredAsyncComponent(componentName) {
    return window[libraryName] &&
        window[libraryName].__async__ &&
        window[libraryName].__async__[componentName];
}

function loadAsyncComponent(componentName) {
    const component = getRegisteredAsyncComponent(componentName);

    if (component) {
        return Promise.resolve({default: component});
    }

    return loadScript(getAsyncUrl(componentName)).then(() => {
        const loadedComponent = getRegisteredAsyncComponent(componentName);

        if (!loadedComponent) {
            throw new Error(`${componentName} was not registered by its async bundle.`);
        }

        return {default: loadedComponent};
    });
}

export const {{cookiecutter.component_name}} = React.lazy(
    () => loadAsyncComponent('{{cookiecutter.component_name}}')
);
