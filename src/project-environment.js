'use strict';
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execute } = require('./runner');

function requirementNames(project) {
  if (project.track === 'csharp') return project.kind === 'gui' ? ['Windows', '.NET SDK'] : project.kind === 'github' ? ['.NET SDK', 'Git'] : ['.NET SDK'];
  return project.kind === 'github' ? ['CMake y compilador C++', 'CTest', 'Git'] : project.kind === 'gui' ? ['CMake y compilador C++', 'Qt 6 Widgets'] : ['CMake y compilador C++', 'SQLite3'];
}

async function diagnose(project, tools = {}, options = {}) {
  const run = options.execute || execute;
  const platform = options.platform || process.platform;
  const cwd = options.cwd || os.tmpdir();
  const signal = options.signal;
  const checks = [];
  const add = (name, passed, detail, recovery) => checks.push({ name, passed: Boolean(passed), detail, recovery: passed ? '' : recovery });
  const version = async (program, args = ['--version']) => run(program, args, { cwd, timeout: 15000, signal });
  if (project.track === 'csharp') {
    if (project.kind === 'gui') add('Windows', platform === 'win32', platform === 'win32' ? 'VS Code está ejecutándose en Windows.' : 'Esta ventana de VS Code no está ejecutándose en Windows.', 'Abre esta carpeta con VS Code para Windows; Windows Forms no se ejecuta en WSL.');
    const result = await version(tools.dotnetPath || 'dotnet');
    const major = Number(/^(\d+)\./.exec(String(result.output).trim())?.[1] || 0);
    add('.NET SDK', result.code === 0 && major >= 8, result.code === 0 ? 'SDK detectado: ' + String(result.output).trim().split(/\r?\n/)[0].slice(0, 80) : 'No se pudo ejecutar dotnet --version.', 'Instala .NET SDK 8 o posterior, reinicia VS Code y revisa aimlearning.dotnetPath.');
  } else {
    const cmake = tools.cmakePath || 'cmake';
    const result = await version(cmake);
    let configured = false;
    let dependencyFound = false;
    let missing = '';
    if (result.code === 0) {
      const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'aimlearning-env-'));
      try {
        const base = 'cmake_minimum_required(VERSION 3.16)\nproject(AImlearningEntorno LANGUAGES CXX)\n';
        await fs.writeFile(path.join(temp, 'CMakeLists.txt'), base);
        const setup = await run(cmake, ['-S', temp, '-B', path.join(temp, 'build')], { cwd: temp, timeout: 30000, signal });
        configured = setup.code === 0;
        missing = (setup.stderr || setup.output || '').split(/\r?\n/).find(line => /not found|could not find|unable to find|no CMAKE_CXX_COMPILER|no se encontr/i.test(line))?.trim().slice(0, 160) || '';
        if (configured && project.kind !== 'github') {
          const packageLine = project.kind === 'gui' ? 'find_package(Qt6 REQUIRED COMPONENTS Widgets)\n' : 'find_package(SQLite3 REQUIRED)\n';
          await fs.writeFile(path.join(temp, 'CMakeLists.txt'), base + packageLine);
          const dependency = await run(cmake, ['-S', temp, '-B', path.join(temp, 'build')], { cwd: temp, timeout: 30000, signal });
          dependencyFound = dependency.code === 0;
        }
      } finally { await fs.rm(temp, { recursive: true, force: true }).catch(() => {}); }
    }
    add('CMake y compilador C++', result.code === 0 && configured, configured ? 'CMake configuró un proyecto C++ pequeño.' : 'CMake no pudo configurar un proyecto C++.' + (missing ? ' ' + missing : ''), 'Instala CMake y un compilador C++17 en este mismo entorno de VS Code. Si usas WSL, instálalos dentro de WSL.');
    if (project.kind === 'gui') add('Qt 6 Widgets', dependencyFound, dependencyFound ? 'CMake encontró Qt 6 Widgets.' : 'CMake no encontró Qt 6 Widgets o no pudo configurar C++.', 'Instala Qt 6 con Widgets en este entorno y ajusta CMAKE_PREFIX_PATH si Qt está fuera de las rutas habituales.');
    if (project.kind === 'database') add('SQLite3', dependencyFound, dependencyFound ? 'CMake encontró SQLite3 y sus encabezados.' : 'CMake no encontró SQLite3 o no pudo configurar C++.', 'Instala SQLite3 con encabezados de desarrollo en el entorno donde compilas.');
    if (project.kind === 'github') {
      const ctest = await version(tools.ctestPath || 'ctest');
      add('CTest', ctest.code === 0, ctest.code === 0 ? 'CTest responde en la terminal.' : 'CTest no está disponible.', 'Instala CTest junto con CMake o configura aimlearning.ctestPath.');
    }
  }
  if (project.kind === 'github') {
    const git = await version(tools.gitPath || 'git');
    add('Git', git.code === 0, git.code === 0 ? 'Git responde en la terminal.' : 'Git no está disponible.', 'Instala Git en este entorno o configura aimlearning.gitPath.');
  }
  return { ready: checks.every(item => item.passed), checks, checkedAt: new Date().toISOString() };
}

module.exports = { requirementNames, diagnose };
