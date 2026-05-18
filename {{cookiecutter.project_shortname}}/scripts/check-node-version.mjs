const minimumNode20 = {major: 20, minor: 19, patch: 0};
const minimumNode22 = {major: 22, minor: 12, patch: 0};

function parseVersion(version) {
    const [major, minor, patch] = version
        .replace(/^v/, '')
        .split('.')
        .map(value => Number.parseInt(value, 10));

    return {major, minor, patch};
}

function compareVersion(version, minimum) {
    for (const key of ['major', 'minor', 'patch']) {
        if (version[key] > minimum[key]) {
            return 1;
        }

        if (version[key] < minimum[key]) {
            return -1;
        }
    }

    return 0;
}

function isSupported(version) {
    if (version.major === 20) {
        return compareVersion(version, minimumNode20) >= 0;
    }

    if (version.major === 21) {
        return false;
    }

    return compareVersion(version, minimumNode22) >= 0;
}

const currentVersion = parseVersion(process.version);

if (!isSupported(currentVersion)) {
    console.error(
        [
            `Unsupported Node.js version: ${process.version}`,
            '',
            '{{ cookiecutter.project_shortname }} requires Node.js ^20.19.0 or >=22.12.0.',
            'Please upgrade Node.js, then reinstall dependencies:',
            '',
            '  rm -rf node_modules package-lock.json',
            '  npm install',
            '',
            'On Windows PowerShell, remove the generated install artifacts with:',
            '',
            '  Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue',
        ].join('\n')
    );
    process.exit(1);
}
