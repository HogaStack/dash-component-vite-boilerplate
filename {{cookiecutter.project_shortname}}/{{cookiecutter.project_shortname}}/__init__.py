from __future__ import print_function as _

import os as _os
import sys as _sys
import json

import dash as _dash

# noinspection PyUnresolvedReferences
from ._imports_ import *
from ._imports_ import __all__

if not hasattr(_dash, '__plotly_dash') and not hasattr(_dash, 'development'):
    print('Dash was not successfully imported. '
          'Make sure you don\'t have a file '
          'named \n"dash.py" in your current directory.', file=_sys.stderr)
    _sys.exit(1)

_basepath = _os.path.dirname(__file__)
_filepath = _os.path.abspath(_os.path.join(_basepath, 'package-info.json'))
with open(_filepath) as f:
    package = json.load(f)

npm_package_name = package['name']
package_name = npm_package_name.replace(' ', '_').replace('-', '_')
__version__ = package['version']
_publish_on_npm = '{{cookiecutter.publish_on_npm}}' == 'True'

_current_path = _os.path.dirname(_os.path.abspath(__file__))

_this_module = _sys.modules[__name__]

async_resources = [
    filename[len("async-"):-len(".js")]
    for filename in _os.listdir(_current_path)
    if filename.startswith("async-") and filename.endswith(".js")
]

_js_dist = []


def _resource(relative_package_path, dynamic=False, async_=False):
    resource = {
        "relative_package_path": relative_package_path,
        "namespace": package_name,
    }

    if _publish_on_npm:
        resource["external_url"] = "https://unpkg.com/{0}@{2}/{1}/{3}".format(
            npm_package_name, __name__, __version__, relative_package_path
        )

    if dynamic:
        resource["dynamic"] = True

    if async_:
        resource["async"] = True

    return resource

_js_dist.extend(
    [
        _resource("async-{}.js".format(async_resource), async_=True)
        for async_resource in async_resources
    ]
)

_js_dist.extend(
    [
        _resource("async-{}.js.map".format(async_resource), dynamic=True)
        for async_resource in async_resources
    ]
)

_js_dist.extend(
    [
        _resource('{{cookiecutter.project_shortname}}.min.js'),
        _resource('{{cookiecutter.project_shortname}}.min.js.map', dynamic=True),
    ]
)

_css_dist = [
    _resource(filename)
    for filename in _os.listdir(_current_path)
    if filename.endswith(".css")
]


for _component in __all__:
    setattr(locals()[_component], '_js_dist', _js_dist)
    setattr(locals()[_component], '_css_dist', _css_dist)
