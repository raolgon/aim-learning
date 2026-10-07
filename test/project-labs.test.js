'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const labs = require('../src/project-labs');
const workspaces = require('../src/project-workspaces');
const learning = require('../src/learning');
const behavior = require('../src/project-behavior');
const feedback = require('../src/project-feedback');

test('seis proyectos separados se abren por conceptos y GitHub exige proyectos previos y Git', () => {
  assert.equal(labs.projects.filter(p => p.track === 'csharp').length, 3);
  assert.equal(labs.projects.filter(p => p.track === 'cpp').length, 3);
  const state = learning.freshState();
  for (const track of ['csharp', 'cpp']) {
    delete state.gitRecords.completedAt;
    const route = labs.projects.filter(p => p.track === track);
    assert.deepEqual(route.map(p => p.kind), ['gui', 'database', 'github']);
    assert.ok(route.every(project => !labs.unlocked(state, project)));
    state.records[track === 'csharp' ? 'cs-limit' : 'cpp-save'] = { completedAt: 'hoy' };
    assert.ok(route.slice(0, 2).every(project => labs.unlocked(state, project)));
    assert.equal(labs.unlocked(state, route[2]), false);
    state.projectRecords[route[0].id] = { completedAt: 'hoy' };
    assert.equal(labs.unlocked(state, route[2]), false);
    state.projectRecords[route[1].id] = { completedAt: 'hoy' };
    assert.equal(labs.unlocked(state, route[2]), false);
    assert.match(labs.blocker(state, route[2]), /Practica Git/);
    state.gitRecords.completedAt = 'hoy';
    assert.equal(labs.unlocked(state, route[2]), true);
  }
  const expectedProjects = labs.projects.filter(project => project.kind !== 'github').reduce((sum, project) => sum + project.xp, 0);
  assert.equal(learning.xpTotal(state), expectedProjects + 280 + 280 + 120);
  assert.equal(learning.badges(state).find(badge => badge.name === 'Proyecto real').earned, true);
});

test('un proyecto final ya completado conserva su acceso tras añadir la ruta de Git', () => {
  const state = learning.freshState();
  const project = labs.projects.find(item => item.id === 'project-cs-github');
  state.records['cs-limit'] = { completedAt: 'antes' };
  state.projectRecords['project-cs-gui'] = { completedAt: 'antes' };
  state.projectRecords['project-cs-db'] = { completedAt: 'antes' };
  state.projectRecords[project.id] = { completedAt: 'antes' };
  delete state.gitRecords;
  assert.equal(labs.unlocked(state, project), true);
  assert.equal(labs.blocker(state, project), '');
});

test('el proyecto necesita código propio, tres evidencias, compilación vigente y reflexión', () => {
  const project = labs.projects.find(item => item.id === 'project-cpp-github');
  const record = { scaffoldHash: 'inicial', milestones: {}, verification: null };
  assert.ok(labs.missingForCompletion(project, record, 'inicial').some(item => /código/.test(item)));
  for (let index = 0; index < 3; index++) record.milestones[index] = 'Probé una entrada de frontera y describí lo que observé en el resultado.';
  record.verification = { passed: true, hash: 'código', behavior: { passed: true, count: 3 }, github: { passed: false } };
  record.reflection = 'El proyecto funciona en los casos que probé; aún mejoraría los mensajes de error.';
  assert.deepEqual(labs.missingForCompletion(project, record, 'código'), ['Completa la revisión local de Git, pruebas, workflow y enlace del pull request.']);
  record.verification.github.passed = true;
  assert.deepEqual(labs.missingForCompletion(project, record, 'código'), []);
  assert.ok(labs.missingForCompletion(project, record, 'cambio posterior').some(item => /versión actual/.test(item)));
});

test('una GUI exige tres observaciones correctas y vigentes, una por caso', () => {
  const project = labs.projects.find(item => item.id === 'project-cs-gui');
  const note = 'Abrí la ventana, introduje el dato y observé el total sin cambios inesperados.';
  const record = { scaffoldHash: 'inicial', milestones: { 0: note, 1: note, 2: note }, verification: { passed: true, hash: 'actual' }, reflection: note, manualChecks: {} };
  assert.ok(labs.missingForCompletion(project, record, 'actual').some(item => /caso manual 1/.test(item)));
  for (let index = 0; index < 3; index++) record.manualChecks[index] = { status: 'passed', note, hash: 'actual' };
  assert.deepEqual(labs.missingForCompletion(project, record, 'actual'), []);
  record.manualChecks[1].status = 'failed';
  assert.ok(labs.missingForCompletion(project, record, 'actual').some(item => /caso manual 2/.test(item)));
  record.manualChecks[1].status = 'passed';
  assert.ok(labs.missingForCompletion(project, record, 'cambio nuevo').some(item => /versión actual/.test(item)));
});

test('los proyectos de datos piden pruebas ejecutadas, no solo compilación', async () => {
  const project = labs.projects.find(item => item.id === 'project-cs-db');
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'aimlearning-behavior-test-'));
  try {
    await workspaces.create(project, root, 8);
    const result = await behavior.check(project, root);
    assert.equal(result.passed, false);
    assert.equal(result.count, 0);
    assert.deepEqual(behavior.expectedCases(project).map(item => item.name), ['Operación válida', 'Entrada inválida', 'Persistencia']);
    assert.deepEqual(behavior.dotnetCount('Passed: 3, Failed: 0, Total: 3'), { passed: 3, total: 3 });
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('el profesor local responde al error o prueba fallida sin escribir una solución', () => {
  const project = labs.projects.find(item => item.id === 'project-cs-db');
  const diagnostic = feedback.firstDiagnostic('Program.cs(18,4): error CS0103: The name X does not exist');
  assert.deepEqual(diagnostic, { location: 'Program.cs, línea 18', category: 'nombre o alcance' });
  const build = feedback.guidance(project, { verification: { phase: 'build', details: 'Program.cs(18,4): error CS0103: The name X does not exist' } }, 1, '', ['Program.cs']);
  assert.match(build.text, /Program\.cs, línea 18/);
  assert.match(build.text, /¿/);
  const tests = feedback.guidance(project, { verification: { phase: 'behavior', behavior: { mode: 'automatic', passed: false, count: 2 } } }, 2, 'No entiendo', ['Program.cs']);
  assert.match(tests.text, /2 pruebas/);
  assert.ok(!build.text.includes('CS0103'));
});

test('los proyectos crean estructuras de trabajo sin sobrescribir el código del alumno', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'aimlearning-lab-test-'));
  try {
    const project = labs.projects.find(item => item.id === 'project-cs-db');
    await workspaces.create(project, root, 8);
    const entry = path.join(root, 'Program.cs');
    const scaffold = await fs.readFile(entry, 'utf8');
    assert.match(scaffold, /health/);
    assert.ok(!scaffold.includes('app.MapPost'));
    const hash = await workspaces.sourceSnapshot(root);
    await fs.writeFile(entry, '// Mi propio código\n');
    await workspaces.create(project, root, 8);
    assert.equal(await fs.readFile(entry, 'utf8'), '// Mi propio código\n');
    assert.notEqual(await workspaces.sourceSnapshot(root), hash);
    const cpp = workspaces.starterFiles(labs.projects.find(item => item.id === 'project-cpp-github'));
    assert.match(cpp['CMakeLists.txt'], /enable_testing/);
    assert.ok(!Object.keys(cpp).some(file => file.startsWith('.github/workflows/')));
    const guide = workspaces.commands(labs.projects.find(item => item.id === 'project-cpp-github'), '/tmp/proyecto', 'bash');
    assert.ok(guide.some(step => /ctest/.test(step.command)));
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('GitHub no se da por comprobado por tener solo una estructura compilable', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'aimlearning-github-test-'));
  try {
    const project = labs.projects.find(item => item.id === 'project-cs-github');
    await workspaces.create(project, root, 8);
    const result = await workspaces.inspectGitHub(project, root, '');
    assert.equal(result.passed, false);
    assert.ok(result.findings.some(item => /commit/.test(item)));
    assert.ok(result.findings.some(item => /workflow/.test(item)));
    assert.ok(result.findings.some(item => /pull request/.test(item)));
    assert.match(result.note, /no comprueba el estado remoto/);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
