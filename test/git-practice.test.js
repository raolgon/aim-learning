'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const practice = require('../src/git-practice');

const gitAvailable = spawnSync('git', ['--version'], { encoding: 'utf8' }).status === 0;
test('la ruta Git verifica un repositorio real, un conflicto y un ensayo local de PR/CI', { skip: !gitAvailable }, async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'aimlearning-git-'));
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
    return { code: result.status, output: result.stdout, stderr: result.stderr };
  };
  try {
    await practice.create(root);
    assert.equal((await practice.inspect(root, 0)).passed, false);
    assert.equal(git('init', '-b', 'main').code, 0);
    assert.equal(git('config', 'user.name', 'Alumno de prueba').code, 0);
    assert.equal(git('config', 'user.email', 'alumno@example.invalid').code, 0);
    assert.equal(git('add', 'mensaje.txt', 'RETO.md').code, 0);
    assert.equal(git('commit', '-m', 'Base de prueba').code, 0);
    assert.equal((await practice.inspect(root, 0)).passed, true);

    assert.equal(git('switch', '-c', 'idea-alternativa').code, 0);
    await fs.writeFile(path.join(root, 'mensaje.txt'), 'Propuesta desde la rama.\n');
    assert.equal(git('add', 'mensaje.txt').code, 0);
    assert.equal(git('commit', '-m', 'Cambio de rama').code, 0);
    assert.equal(git('switch', 'main').code, 0);
    assert.equal((await practice.inspect(root, 1)).passed, true);

    await fs.writeFile(path.join(root, 'mensaje.txt'), 'Propuesta desde main.\n');
    assert.equal(git('add', 'mensaje.txt').code, 0);
    assert.equal(git('commit', '-m', 'Cambio de main').code, 0);
    assert.notEqual(git('merge', 'idea-alternativa').code, 0);
    const conflict = await practice.inspect(root, 2);
    assert.equal(conflict.passed, false);
    assert.equal(conflict.conflictSeen, true);
    await fs.writeFile(path.join(root, 'mensaje.txt'), 'Decisión propia después de comparar ambas propuestas.\n');
    assert.equal(git('add', 'mensaje.txt').code, 0);
    assert.equal(git('commit', '-m', 'Resolver conflicto').code, 0);
    assert.equal((await practice.inspect(root, 2, { conflictSeen: true })).passed, true);
    assert.equal((await practice.inspect(root, 2)).passed, false);

    const workflowDir = path.join(root, '.github', 'workflows');
    await fs.mkdir(workflowDir, { recursive: true });
    await fs.writeFile(path.join(root, 'PROPUESTA-PR.md'), 'Propongo integrar una decisión clara para el mensaje. Comparé ambas ramas y resolví el conflicto. Probé que el archivo quedó presente, que la fusión terminó y que Git no deja cambios pendientes. Quisiera revisión de la redacción final.\n');
    await fs.writeFile(path.join(workflowDir, 'check.yml'), 'name: Comprobar propuesta\non: pull_request\njobs:\n  revisar:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: test -s mensaje.txt\n');
    assert.equal((await practice.inspect(root, 3)).passed, false);
    assert.equal(git('add', 'PROPUESTA-PR.md', '.github/workflows').code, 0);
    assert.equal(git('commit', '-m', 'Preparar revisión').code, 0);
    assert.equal((await practice.inspect(root, 3)).passed, true);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
