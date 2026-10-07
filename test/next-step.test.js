'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { missions } = require('../src/catalog');
const { projects } = require('../src/project-labs');
const L = require('../src/learning');
const Next = require('../src/next-step');

test('el siguiente paso de una misión sigue intento, prueba y reflexión', () => {
  const state = L.freshState();
  const mission = missions[0];
  const options = { unlocked: true, workspace: false, trusted: false, exists: false };
  assert.equal(Next.missionStep(mission, state, missions, options).action, 'goLearn');
  state.records[mission.id]={lessonReviewedAt:'viewed'};
  assert.equal(Next.missionStep(mission, state, missions, options).action,'goProfessor');
  assert.equal(L.xpTotal(state),0);
  assert.equal(state.records[mission.id].verification,undefined);
  state.records[mission.id] = { attempt: 'Primera idea' };
  assert.equal(Next.missionStep(mission, state, missions, options).action, 'goReflect');
  state.records[mission.id].verification = { passed: true };
  assert.match(Next.missionStep(mission, state, missions, options).title, /aprendido/i);
  assert.equal(Next.missionStep(mission, state, missions, { ...options, verificationFresh: false }).action, 'goReflect');
  state.records[mission.id].completedAt = 'now';
  assert.equal(Next.missionStep(mission, state, missions, options).id, missions[1].id);
});

test('la guía de proyecto pasa de entorno a estructura, etapas y revisión', () => {
  const state = L.freshState();
  const project = projects.find(item => item.id === 'project-cs-gui');
  const options = { unlocked: true, workspace: true, trusted: true, exists: false };
  assert.equal(Next.projectStep(project, state, projects, options).action, 'projectEnvironment');
  state.projectRecords[project.id] = { environment: { ready: false } };
  assert.match(Next.projectStep(project, state, projects, options).title, /entorno/);
  state.projectRecords[project.id].environment.ready = true;
  assert.equal(Next.projectStep(project, state, projects, options).action, 'projectCreate');
  options.exists = true;
  assert.equal(Next.projectStep(project, state, projects, options).index, 0);
  state.projectRecords[project.id].milestones = { 0: 'a', 1: 'b', 2: 'c' };
  assert.equal(Next.projectStep(project, state, projects, options).action, 'projectReviewTab');
  state.projectRecords[project.id].verification = { passed: true };
  assert.match(Next.projectStep(project, state, projects, { ...options, verificationFresh: false }).detail, /cambió/);
  assert.match(Next.projectStep(project, state, projects, options).title, /interfaz/);
  state.projectRecords[project.id].manualChecks = { 0: { status: 'passed' }, 1: { status: 'passed' }, 2: { status: 'passed' } };
  assert.match(Next.projectStep(project, state, projects, { ...options, manualFresh: false }).detail, /repite/);
  assert.match(Next.projectStep(project, state, projects, options).title, /reflexión/);
});

test('sin carpeta la acción ofrece abrirla y una ruta bloqueada lleva al prerrequisito', () => {
  const state = L.freshState();
  const mission = missions.find(item => item.id === 'cs-welcome');
  assert.equal(Next.missionStep(mission, state, missions, { unlocked: true, workspace: false }).action, 'goLearn');
  state.records[mission.id]={lessonReviewedAt:'viewed'};
  assert.equal(Next.missionStep(mission, state, missions, { unlocked: true, workspace: false }).action, 'goSetup');
  const project = projects.find(item => item.id === 'project-cs-github');
  const step = Next.projectStep(project, state, projects, { unlocked: false });
  assert.equal(step.action, 'projectSelect');
  assert.equal(step.id, 'project-cs-gui');
  state.projectRecords['project-cs-gui'] = { completedAt: 'now' };
  state.projectRecords['project-cs-db'] = { completedAt: 'now' };
  assert.equal(Next.projectStep(project, state, projects, { unlocked: false }).action, 'areaGit');
  const completed = projects.find(item => item.id === 'project-cs-db');
  assert.equal(Next.projectStep(completed, state, projects, { unlocked: true, isUnlocked: item => item.kind !== 'github' }).action, 'areaGit');
});
