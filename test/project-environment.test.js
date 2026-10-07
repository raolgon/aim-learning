'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { projects } = require('../src/project-labs');
const Environment = require('../src/project-environment');

const project = id => projects.find(item => item.id === id);
const ok = output => ({ code: 0, output, stderr: '' });

test('Windows Forms distingue el sistema operativo del SDK', async () => {
  const result = await Environment.diagnose(project('project-cs-gui'), {}, { platform: 'linux', execute: async () => ok('8.0.100') });
  assert.equal(result.ready, false);
  assert.deepEqual(result.checks.map(item => item.passed), [false, true]);
  assert.match(result.checks[0].recovery, /Windows/);
  const ready = await Environment.diagnose(project('project-cs-gui'), {}, { platform: 'win32', execute: async () => ok('8.0.100') });
  assert.equal(ready.ready, true);
});

test('CMake configurado no oculta una dependencia Qt faltante', async () => {
  let configure = 0;
  const result = await Environment.diagnose(project('project-cpp-gui'), {}, { execute: async (_program, args) => {
    if (args[0] === '--version') return ok('cmake version 3.28.0');
    configure++;
    return configure === 1 ? ok('configured') : { code: 1, output: 'Qt6 not found', stderr: 'Qt6 not found' };
  } });
  assert.equal(result.ready, false);
  assert.deepEqual(result.checks.map(item => item.passed), [true, false]);
  assert.match(result.checks[1].recovery, /Qt 6/);
});

test('el proyecto final comprueba CTest y Git por separado', async () => {
  const result = await Environment.diagnose(project('project-cpp-github'), {}, { execute: async (program, args) => {
    if (program === 'git') return { code: -1, output: '', stderr: 'missing' };
    return ok(args[0] === '--version' ? 'version 1.0' : 'configured');
  } });
  assert.deepEqual(result.checks.map(item => item.passed), [true, true, false]);
  assert.equal(result.ready, false);
  assert.deepEqual(Environment.requirementNames(project('project-cs-db')), ['.NET SDK']);
});
