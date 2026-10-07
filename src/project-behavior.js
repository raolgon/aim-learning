'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const { execute } = require('./runner');

const cases = Object.freeze({
  'project-cs-gui': [
    ['Inicio vacío', 'Abre la ventana sin datos. Describe qué muestra la lista y el total.'],
    ['Gasto válido', 'Agrega un gasto válido. Describe cómo cambian la lista y el total.'],
    ['Entrada rechazada', 'Intenta una categoría vacía o un importe inválido. Comprueba que la lista y el total no cambian.']
  ],
  'project-cs-db': [
    ['Operación válida', 'Prueba crear, consultar y ajustar un producto desde tu API.'],
    ['Entrada inválida', 'Prueba una cantidad negativa y un producto inexistente sin modificar existencias.'],
    ['Persistencia', 'Reinicia el servicio y comprueba que un producto guardado sigue disponible.']
  ],
  'project-cs-github': [
    ['Crear y consultar', 'Prueba crear una incidencia y consultarla por identificador.'],
    ['Cambio de estado', 'Prueba una transición permitida y una rechazada.'],
    ['Caso de frontera', 'Prueba una incidencia inexistente o datos inválidos.']
  ],
  'project-cpp-gui': [
    ['Inicio vacío', 'Abre la ventana sin mediciones. Describe qué muestran la lista y las estadísticas.'],
    ['Serie mixta', 'Agrega valores negativos y positivos. Comprueba mínimo, máximo y promedio.'],
    ['Entrada rechazada', 'Prueba una medición inválida. Comprueba que la serie y las estadísticas no cambian.']
  ],
  'project-cpp-db': [
    ['Operación válida', 'Prueba registrar, consultar y ajustar una pieza.'],
    ['Entrada inválida', 'Prueba un identificador inexistente o existencias inválidas.'],
    ['Persistencia', 'Termina el programa y comprueba la pieza en otro proceso.']
  ],
  'project-cpp-github': [
    ['Serie vacía', 'Prueba cómo responde la API pública cuando no hay mediciones.'],
    ['Serie par e impar', 'Prueba la mediana y el promedio con dos tamaños de serie.'],
    ['Extremos', 'Prueba mínimo y máximo con negativos y valores repetidos.']
  ]
});
const expectedCases = project => cases[project.id].map(([name, prompt], index) => ({ id: String(index), name, prompt }));

async function findTestProjects(root) {
  const tests = path.join(root, 'tests');
  const found = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true }).catch(() => [])) {
      if (['bin', 'obj', 'build', '.git'].includes(entry.name)) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile() && /\.csproj$/i.test(entry.name)) found.push(file);
    }
  }
  await walk(tests);
  return found;
}

function dotnetCount(output) {
  const total = /(?:Total|Totales?)\s*:\s*(\d+)/i.exec(output);
  const passed = /(?:Passed|Correcto|Superadas?)\s*:\s*(\d+)/i.exec(output);
  return { total: Number(total?.[1] || 0), passed: Number(passed?.[1] || 0) };
}

function failure(output) {
  return output.split(/\r?\n/).map(line => line.trim()).find(line => /(?:\bFailed\b|\bError\b|\berror\b|Fall[oó]|Excepci[oó]n|Test Failed)/i.test(line))?.slice(0, 350)
    || output.trim().slice(-350);
}

async function check(project, root, tools = {}, log = () => {}, signal) {
  if (project.kind === 'gui') return { mode: 'manual', passed: null, summary: 'La interfaz requiere tres pruebas manuales registradas por ti.' };
  if (project.track === 'csharp') {
    const projects = await findTestProjects(root);
    if (!projects.length) return { mode: 'automatic', passed: false, count: 0, summary: 'Crea un proyecto de pruebas .NET dentro de tests/ y cubre los tres casos propuestos.' };
    let total = 0;
    for (const file of projects) {
      log(`dotnet test ${path.relative(root, file)}\n`);
      const run = await execute(tools.dotnetPath || 'dotnet', ['test', file, '--nologo'], { cwd: root, timeout: 120000, onData: log, signal });
      const counts = dotnetCount(run.output + '\n' + run.stderr);
      total += counts.total;
      if (run.code !== 0 || counts.passed !== counts.total || !counts.total) {
        return { mode: 'automatic', passed: false, count: total, summary: 'Las pruebas .NET necesitan atención.', firstFailure: failure(run.output + '\n' + run.stderr) };
      }
    }
    return { mode: 'automatic', passed: total >= 3, count: total, summary: total >= 3 ? `${total} pruebas .NET superadas. Revisa que cubran los tres casos propuestos.` : `Solo se ejecutaron ${total} pruebas; necesitas al menos tres casos.` };
  }
  log('ctest --test-dir build -N\n');
  const listed = await execute(tools.ctestPath || 'ctest', ['--test-dir', path.join(root, 'build'), '-N'], { cwd: root, timeout: 15000, onData: log, signal });
  const count = Number(/Total Tests:\s*(\d+)/i.exec(listed.output)?.[1] || 0);
  if (listed.code !== 0 || count < 3) return { mode: 'automatic', passed: false, count, summary: `CTest encontró ${count} pruebas; registra al menos tres casos con add_test().` };
  log('ctest --test-dir build --output-on-failure\n');
  const run = await execute(tools.ctestPath || 'ctest', ['--test-dir', path.join(root, 'build'), '--output-on-failure'], { cwd: root, timeout: 120000, onData: log, signal });
  return { mode: 'automatic', passed: run.code === 0, count, summary: run.code === 0 ? `${count} pruebas CTest superadas. Revisa que cubran los tres casos propuestos.` : 'Hay una prueba CTest que necesita atención.', ...(run.code !== 0 ? { firstFailure: failure(run.output + '\n' + run.stderr) } : {}) };
}

module.exports = { expectedCases, check, dotnetCount };
