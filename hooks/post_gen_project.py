from __future__ import print_function

import shlex
import sys
import os
import shutil
import subprocess

install_deps = '{{cookiecutter.install_dependencies}}'
project_shortname = '{{cookiecutter.project_shortname}}'
use_async = '{{cookiecutter.use_async}}'


is_windows = sys.platform == 'win32'
minimum_node20 = (20, 19, 0)
minimum_node22 = (22, 12, 0)

if is_windows:
    python_executable = os.path.join('venv', 'Scripts', 'python')
else:
    python_executable = os.path.join('venv', 'bin', 'python')


def _execute_command(cmd):
    line = shlex.split(cmd, posix=not is_windows)

    print('Executing: {}'.format(cmd))

    # call instead of Popen to get realtime output
    status = subprocess.call(line, shell=is_windows)

    if status != 0:
        print('post_gen_project command failed: {}'.format(cmd),
              file=sys.stderr)
        sys.exit(status)

    return status


def _parse_node_version(version):
    parts = version.strip().lstrip('v').split('-')[0].split('.')
    return tuple(int(part) for part in parts[:3])


def _is_supported_node_version(version):
    if version[0] == 20:
        return version >= minimum_node20

    if version[0] == 21:
        return False

    return version >= minimum_node22


def _check_node_version():
    try:
        version_output = subprocess.check_output(
            ['node', '--version'],
            universal_newlines=True,
        )
    except (OSError, subprocess.CalledProcessError):
        print(
            'Node.js is required to install and build this project. '
            'Please install Node.js ^20.19.0 or >=22.12.0.',
            file=sys.stderr
        )
        sys.exit(1)

    version = _parse_node_version(version_output)

    if not _is_supported_node_version(version):
        print(
            'Unsupported Node.js version: {}\n\n'
            'This template requires Node.js ^20.19.0 or >=22.12.0. '
            'Please upgrade Node.js and regenerate or '
            'reinstall the project dependencies.'.format(version_output.strip()),
            file=sys.stderr
        )
        sys.exit(1)



# Remove the cookiecutter_templates directory since it only contains
# files that are conditionally included.
template_dir = os.path.join(os.getcwd(), 'cookiecutter_templates')
shutil.rmtree(template_dir)
# If it doesn't use async, we can remove the fragments and lazyloader.js
if use_async != "True":
    print('use_async is set to False, your component will not be lazy loaded and fragments will not be created.')
    shutil.rmtree(os.path.join(os.getcwd(), 'src', 'lib', 'fragments'))
    os.remove(os.path.join(os.getcwd(), 'src', 'lib', 'LazyLoader.js'))


if install_deps != 'True':
    print('`install_dependencies` is false!!', file=sys.stderr)
    print('Please create a venv in your project root'
          ' and install the dependencies in requirements.txt',
          file=sys.stderr)
    sys.exit(0)

_check_node_version()

# Create a virtual env
venv = '{} -m venv venv'.format(sys.executable)

# noinspection PyBroadException
try:
    _execute_command(venv)
except BaseException:
    print(
        '''
        venv creation failed.
        Make sure you have installed virtualenv on Python 2.
        ''',
        file=sys.stderr
    )
    raise

print('\n\nInstalling dependencies\n', file=sys.stderr)

# Install Python requirements.
_execute_command(
    r'{} -m pip install -r requirements.txt'.format(python_executable)
)

# Install node_modules
_execute_command('npm install --ignore-scripts')

# Run the first build
print('Building initial bundles...')

_execute_command('npm run build:js')

# Activating the venv and running the command
# doesn't work on Linux with subprocess.
# The command needs to run in the venv we just created to use the dash cmd.
# But it also needs shell to be true for the command to work.
# And shell doesn't work with `npm run` nor `. venv/bin/activate`
# The command works in a terminal.
_execute_command('npm run build:python-activated')

print('\n{} ready!\n'.format(project_shortname))


sys.exit(0)
