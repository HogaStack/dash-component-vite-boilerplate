"""
DO NOT MODIFY
This file is used to validate your publish settings.
"""
from __future__ import print_function

import os
import sys
import importlib
from fnmatch import fnmatch


components_package = '{{cookiecutter.project_shortname}}'

components_lib = importlib.import_module(components_package)

missing_dist_msg = 'Error {} was not found in `{}.__init__.{}`!!!'
missing_manifest_msg = '''
Error {} was not found in `MANIFEST.in`!
It will not be included in the build!
'''
errors = []

with open('MANIFEST.in', 'r') as f:
    manifest = f.read()

manifest_patterns = [
    line.split(maxsplit=1)[1].strip().replace('\\', '/')
    for line in manifest.splitlines()
    if line.strip().startswith('include ')
]


def check_dist(dist, filename):
    # Support the dev bundle.
    if filename.endswith('dev.js'):
        return True

    return any(
        filename in x
        for d in dist
        for x in (
            [d.get('relative_package_path')]
            if not isinstance(d.get('relative_package_path'), list)
            else d.get('relative_package_path')
        )
    )


def check_manifest(relative_path):
    relative_path = relative_path.replace('\\', '/')
    package_path = "{}/{}".format(components_package, relative_path)

    return any(
        fnmatch(relative_path, pattern) or fnmatch(package_path, pattern)
        for pattern in manifest_patterns
    )


def check_file(dist, filename):
    if not check_dist(dist, filename):
        errors.append(
            missing_dist_msg.format(filename, components_package, '_js_dist')
        )
    if not check_manifest(filename):
        errors.append(missing_manifest_msg.format(filename))


for cur, dirs, files in os.walk(components_package):
    dirs[:] = [d for d in dirs if d != '__pycache__']

    for f in files:
        relative_path = os.path.relpath(
            os.path.join(cur, f), components_package
        ).replace(os.sep, '/')

        if f.endswith(('py', 'pyc', 'pyo')):
            continue

        if f.endswith(('js', 'js.map')):
            # noinspection PyProtectedMember
            check_file(components_lib._js_dist, relative_path)
        elif f.endswith('css'):
            # noinspection PyProtectedMember
            check_file(components_lib._css_dist, relative_path)
        else:
            if not check_manifest(relative_path):
                errors.append(missing_manifest_msg.format(relative_path))

if errors:
    for error in errors:
        print(error, file=sys.stderr)
    sys.exit(1)
