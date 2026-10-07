'use strict';
const i18n = require('./i18n');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execute } = require('./runner');

const steps = [
  { id: 'status', title: 'Estado y primer commit', concept: 'Git distingue archivos sin seguimiento, cambios preparados y cambios confirmados. status te deja observar cada estado antes de guardar una versión.', task: 'Abre la terminal en la carpeta de práctica. Inicia un repositorio con rama main, observa git status, prepara los dos archivos iniciales y crea tu primer commit. Explica qué cambió en el estado antes y después.', hint: '¿Qué diferencia ves entre un archivo sin seguimiento y uno preparado? Usa git status antes y después de git add.', commands: ['git init -b main', 'git status', 'git add mensaje.txt RETO.md', 'git commit -m "Base de práctica"'], evidence: 'Repositorio propio en main, mensaje.txt confirmado y árbol de trabajo limpio.' },
  { id: 'branch', title: 'Una rama con otra idea', concept: 'Una rama apunta a una línea de commits. Puedes explorar un cambio sin alterar main hasta decidir integrarlo.', task: 'Crea la rama idea-alternativa. Cambia la primera línea de mensaje.txt con tus palabras, confirma ese cambio y vuelve a main. Compara las versiones del archivo y explica qué rama contiene cada idea.', hint: 'Después del commit en la rama nueva, usa git log --oneline --all --graph para ver ambas líneas.', commands: ['git switch -c idea-alternativa', 'git status', 'git add mensaje.txt', 'git commit -m "Idea alternativa"', 'git switch main', 'git log --oneline --all --graph'], evidence: 'idea-alternativa contiene un commit propio y una versión distinta de mensaje.txt.' },
  { id: 'conflict', title: 'Entender y resolver un conflicto', concept: 'Un conflicto aparece cuando Git no puede elegir por ti entre dos cambios sobre la misma parte. En el archivo, las marcas delimitan una versión y la otra; no son contenido final. Lee ambas, decide y confirma el resultado.', task: 'En main, modifica la misma primera línea de mensaje.txt de otro modo y confirma. Intenta fusionar idea-alternativa. Antes de resolver, comprueba el estado desde AImlearning para registrar el conflicto. Después edita el archivo con una decisión propia, prepara el resultado y concluye la fusión.', hint: 'Busca las marcas de conflicto en mensaje.txt. ¿Qué quiso conservar cada rama y qué resultado deseas tú? Usa git status para saber cuándo terminaste.', commands: ['git add mensaje.txt', 'git commit -m "Cambio en main"', 'git merge idea-alternativa', 'git status', 'git add mensaje.txt', 'git commit'], evidence: 'Conflicto observado, resuelto y registrado en un commit de fusión; árbol limpio.' },
  { id: 'review', title: 'Ensayo de PR y CI', concept: 'Un pull request explica qué cambia y cómo revisarlo. En un workflow de GitHub Actions, on define cuándo arranca, jobs agrupa tareas, steps enumera acciones y run ejecuta comandos. La indentación organiza esas partes. El archivo local no demuestra que GitHub ya lo haya ejecutado.', task: 'Escribe PROPUESTA-PR.md con el propósito del cambio, las decisiones de la fusión y cómo lo comprobaste. Crea un workflow en .github/workflows/ que se active con pull_request, obtenga el repositorio y ejecute una comprobación útil de esta práctica. Confirma ambos archivos. No necesitas subir nada a GitHub todavía.', hint: 'Piensa qué podría comprobar otra persona sin abrir tu editor. Distingue la descripción del PR de la ejecución automática.', commands: ['git status', 'git diff --check', 'git add PROPUESTA-PR.md .github/workflows', 'git commit -m "Preparar revisión"'], evidence: 'Propuesta y workflow confirmados localmente; el workflow no se ejecuta hasta publicarlo.' }
];

const rootFor = folder => path.join(folder, 'aimlearning-projects', 'git-practice');
async function create(root, language = 'es') {
  await fs.mkdir(root, { recursive: true });
  const files = {
    'mensaje.txt': 'Una idea inicial para revisar.\n',
    'RETO.md': '# Práctica de Git\n\nTrabaja solo en esta carpeta. Lee cada etapa en AImlearning, ejecuta los comandos tú y observa git status. Nunca hagas push desde esta práctica.\n\nNo se crea un repositorio por ti: empieza con git init cuando comprendas qué carpeta vas a versionar.\n'
  };
  for (const [name, content] of Object.entries(files)) {
    try { await fs.writeFile(path.join(root, name), name.endsWith('.md') ? i18n.text(content, language) : content, { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
}

async function inspect(root, index, record = {}, options = {}) {
  if (!steps[index]) throw new Error('Etapa de Git desconocida.');
  const run = options.execute || execute;
  const git = options.gitPath || 'git';
  const command = async (...args) => run(git, args, { cwd: root, timeout: 15000, signal: options.signal });
  const findings = [];
  const need = (passed, text) => { if (!passed) findings.push(text); };
  const version = await command('--version');
  if (version.code !== 0) return { passed: false, findings: ['Git no está disponible en esta ventana de VS Code. Instálalo aquí o configura aimlearning.gitPath.'] };
  const top = await command('rev-parse', '--show-toplevel');
  const normalize = value => path.resolve(String(value).trim()).replace(/\\/g, '/').toLowerCase();
  need(top.code === 0 && normalize(top.output) === normalize(root), 'Inicia un repositorio Git dentro de esta carpeta de práctica, no en la carpeta padre.');
  if (findings.length) return { passed: false, findings };
  const current = await command('branch', '--show-current');
  const branch = current.output.trim();
  const status = await command('status', '--porcelain');
  if (index === 0) {
    const head = await command('rev-parse', '--verify', 'HEAD');
    const file = await command('ls-files', '--error-unmatch', 'mensaje.txt');
    need(branch === 'main', 'Trabaja en la rama main.');
    need(head.code === 0 && file.code === 0, 'Confirma mensaje.txt en tu primer commit.');
    need(status.code === 0 && !status.output.trim(), 'Revisa git status: todavía hay cambios sin confirmar.');
  }
  if (index === 1) {
    const count = await command('rev-list', '--count', 'main..idea-alternativa');
    const mainFile = await command('show', 'main:mensaje.txt');
    const branchFile = await command('show', 'idea-alternativa:mensaje.txt');
    need(count.code === 0 && Number(count.output.trim()) >= 1, 'La rama idea-alternativa necesita al menos un commit propio.');
    need(mainFile.code === 0 && branchFile.code === 0 && mainFile.output !== branchFile.output, 'Cambia y confirma mensaje.txt en idea-alternativa; compara su contenido con main.');
  }
  if (index === 2) {
    const unmerged = await command('ls-files', '-u');
    const conflictSeen = Boolean(record.conflictSeen || unmerged.output.trim());
    if (!conflictSeen) findings.push('Primero crea el conflicto y pulsa Comprobar mientras Git muestra archivos sin fusionar.');
    const parents = await command('rev-list', '--parents', '-n', '1', 'HEAD');
    const merged = parents.code === 0 && parents.output.trim().split(/\s+/).length >= 3;
    const ancestor = await command('merge-base', '--is-ancestor', 'idea-alternativa', 'HEAD');
    need(branch === 'main' && merged && ancestor.code === 0, 'Después de decidir el contenido, concluye la fusión en main con un commit de dos padres.');
    need(status.code === 0 && !status.output.trim(), 'Deja el árbol limpio después de resolver y confirmar.');
    return { passed: findings.length === 0, findings, conflictSeen };
  }
  if (index === 3) {
    const proposal = await fs.readFile(path.join(root, 'PROPUESTA-PR.md'), 'utf8').catch(() => '');
    const workflowDir = path.join(root, '.github', 'workflows');
    const workflowNames = await fs.readdir(workflowDir).catch(() => []);
    const workflowFiles = workflowNames.filter(name => /\.ya?ml$/i.test(name));
    const workflows = await Promise.all(workflowFiles.map(async name => ({ name, text: await fs.readFile(path.join(workflowDir, name), 'utf8') })));
    const validWorkflow = workflows.find(item => /(?:\bon:\s*pull_request\b|^\s*pull_request\s*:)/m.test(item.text) && /jobs\s*:/.test(item.text) && /steps\s*:/.test(item.text) && /actions\/checkout@/.test(item.text) && /run\s*:/.test(item.text) && /(?:test|dotnet test|ctest|diff --check)/i.test(item.text));
    const proposalCommitted = await command('cat-file', '-e', 'HEAD:PROPUESTA-PR.md');
    const workflowCommitted = validWorkflow && await command('cat-file', '-e', 'HEAD:.github/workflows/' + validWorkflow.name);
    need(proposal.trim().length >= 120 && proposalCommitted.code === 0, 'Redacta y confirma una propuesta de PR con propósito, decisiones y comprobaciones concretas.');
    need(Boolean(validWorkflow && workflowCommitted.code === 0), 'Confirma un workflow de pull_request con checkout y una comprobación útil.');
    need(status.code === 0 && !status.output.trim(), 'Confirma todos los archivos de la práctica.');
  }
  return { passed: findings.length === 0, findings };
}

module.exports = { steps, rootFor, create, inspect };
