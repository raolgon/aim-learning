'use strict';
const vscode = require('vscode');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { missions, tracks } = require('./catalog');
const learning = require('./learning');
const runner = require('./runner');
const tutorRequestControl=require('./tutor-request');
const tutor = require('./tutor');
const localModels = require('./local-models');
const projectLabs = require('./project-labs');
const projectWorkspaces = require('./project-workspaces');
const projectBehavior = require('./project-behavior');
const projectFeedback = require('./project-feedback');
const projectEnvironment = require('./project-environment');
const missionSetup = require('./mission-setup');
const nextStep = require('./next-step');
const gitPractice = require('./git-practice');
const i18n = require('./i18n');

function activate(context) {
  const foundationIds = new Set(missions.filter(m => m.kind === 'foundation').map(m => m.id));
  const savedState = context.workspaceState.get('aimlearning.v1');
  const sharedFoundations = context.globalState.get('aimlearning.foundations.v1') || {};
  let state = learning.initialState(savedState, sharedFoundations);
  const lessonReviews = context.globalState.get('aimlearning.lessonReviews.v1', {});
  for (const m of missions) if (lessonReviews[m.id] && !state.records[m.id]?.lessonReviewedAt) state.records[m.id] = {...state.records[m.id],lessonReviewedAt:lessonReviews[m.id]};
  let panel, busy = false, busyKind = null, abortController, tutorRequest;
  const webviews = new Set();
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
  status.command = 'aimlearning.open';
  status.tooltip = 'AImlearning';
  context.subscriptions.push(status, { dispose: () => abortController?.abort() });
  const language = () => vscode.workspace.getConfiguration('aimlearning').get('language', 'es');
  const tr = text => i18n.text(text, language());
  const translated = value => i18n.content(value, language());
  const pick = (items, options = {}) => vscode.window.showQuickPick(items.map(item => typeof item === 'string' ? tr(item) : { ...item, label: tr(item.label), description: tr(item.description) }), { ...options, title: tr(options.title), placeHolder: tr(options.placeHolder) });
  const input = (options = {}) => vscode.window.showInputBox({ ...options, title: tr(options.title), prompt: tr(options.prompt), placeHolder: tr(options.placeHolder), ...(options.validateInput ? { validateInput: async value => tr(await options.validateInput(value)) } : {}) });
  const mission = () => translated(missions.find(m => m.id === state.selected) || missions[0]);
  const selectedProject = () => translated(projectLabs.projects.find(project => project.id === state.projectSelected) || projectLabs.projects[0]);
  const folder = () => vscode.workspace.workspaceFolders?.[0];
  const rootFor = (m) => folder() && path.join(folder().uri.fsPath, 'aimlearning-projects', m.id);
  const projectRoot = (project) => folder() && path.join(folder().uri.fsPath, 'aimlearning-projects', 'real-projects', project.id);
  const gitRoot = () => folder() && gitPractice.rootFor(folder().uri.fsPath);
  const config = () => {
    const settings = vscode.workspace.getConfiguration('aimlearning');
    return { dotnetPath: settings.get('dotnetPath', 'dotnet'), cppCompiler: settings.get('cppCompiler', 'g++'), cmakePath: settings.get('cmakePath', 'cmake'), ctestPath: settings.get('ctestPath', 'ctest'), gitPath: settings.get('gitPath', 'git'), pythonPath: settings.get('pythonPath', ''), nodePath: settings.get('nodePath', '') };
  };
  async function save() {
    const foundationRecords = Object.fromEntries(Object.entries(state.records).filter(([id]) => foundationIds.has(id)));
    await context.globalState.update('aimlearning.foundations.v1', foundationRecords);
    await context.workspaceState.update('aimlearning.v1', state);
    await broadcast();
  }
  function trusted() {
    if (!folder()) throw new Error('Abre una carpeta de práctica con Archivo → Abrir carpeta y vuelve a AImlearning.');
    if (!vscode.workspace.isTrusted) throw new Error('Confía en tu carpeta de práctica para crear o ejecutar tus proyectos.');
  }
  function requireUnlocked(m) { if (!learning.unlocked(state, m)) throw new Error('Completa primero la misión anterior de esta ruta.'); }
  async function payload() {
    const m = mission(), root = rootFor(m);
    const exists = m.kind !== 'foundation' && root ? await fs.stat(path.join(root, runner.entryFilename(m.track))).then(() => true, () => false) : false;
    let commands = [], guideError;
    try { if (root && m.kind !== 'foundation') commands = runner.commandGuide(m, root, state.shell, config()); } catch (err) { guideError = err.message; }
    const xp = learning.xpTotal(state);
    const project = selectedProject();
    const labRoot = projectRoot(project);
    const labExists = Boolean(labRoot && await fs.stat(path.join(labRoot, 'RETO.md')).then(() => true, () => false));
    const gitExists = Boolean(gitRoot() && await fs.stat(path.join(gitRoot(), 'RETO.md')).then(() => true, () => false));
    const projectRecord = state.projectRecords?.[project.id] || {};
    const missionRecord = state.records?.[m.id] || {};
    let missionFresh = true, projectFresh = true, manualFresh = true;
    if (exists && m.kind !== 'foundation' && missionRecord.verification?.passed) {
      try { missionFresh = (await runner.snapshot(root)).hash === missionRecord.verification.hash; }
      catch { missionFresh = false; }
    }
    if (labExists && projectRecord.verification?.passed) {
      try {
        const hash = await projectWorkspaces.sourceSnapshot(labRoot);
        projectFresh = hash === projectRecord.verification.hash;
        manualFresh = project.milestones.every((_, index) => projectRecord.manualChecks?.[index]?.hash === hash);
      } catch { projectFresh = false; manualFresh = false; }
    }
    let projectCommands = [], projectGuideError;
    try { if (labRoot) projectCommands = projectWorkspaces.commands(project, labRoot, state.shell, config()); } catch (error) { projectGuideError = error.message; }
    return { state: i18n.state(state, language()), language: language(), missions: missions.map(translated).map(({ tests, challenge, ...item }) => ({ ...item, ...(challenge ? { challenge: { situation: challenge.situation, prompt: challenge.prompt, options: challenge.options } } : {}), testCount: tests?.length || 0, unlocked: learning.unlocked(state, item) })),
      projects: projectLabs.projects.map(translated).map(item => ({ ...item, milestones: item.milestones.map(({ hint, ...step }) => step), unlocked: projectLabs.unlocked(state, item), blocker: tr(projectLabs.blocker(state, item)) })),
      projectExists: labExists, projectCommands: translated(projectCommands), projectGuideError: tr(projectGuideError), projectChecks: translated(projectBehavior.expectedCases(project)), projectRequirements: projectEnvironment.requirementNames(project),
      nextMission: translated(nextStep.missionStep(m, state, missions, { unlocked: learning.unlocked(state, m), isUnlocked: item => learning.unlocked(state, item), exists, workspace: Boolean(folder()), trusted: vscode.workspace.isTrusted, verificationFresh: missionFresh })),
      nextProject: translated(nextStep.projectStep(project, state, projectLabs.projects, { unlocked: projectLabs.unlocked(state, project), isUnlocked: item => projectLabs.unlocked(state, item), exists: labExists, workspace: Boolean(folder()), trusted: vscode.workspace.isTrusted, verificationFresh: projectFresh, manualFresh })),
      projectEnvironment: translated(projectRecord.environment || null), gitSteps: gitPractice.steps.map(translated).map(({ hint, ...step }) => step), gitExists,
      missionSetup: m.kind === 'foundation' ? null : setupPayload(m, exists),
      version: require('../package.json').version,
      tracks: translated(tracks), foundationReady: learning.foundationsComplete(state), xp, rank: tr(learning.rank(xp)), badges: translated(learning.badges(state)), exists, commands: translated(commands), guideError: tr(guideError), workspace: folder()?.name, trusted: vscode.workspace.isTrusted, busy, busyKind, tutorRequest };
  }
  function setupPayload(m, exists) {
    const saved = state.missionSetups?.[m.track] || {};
    const current = missionSetup.signature(m.track,config());
    const report = saved.report?.signature === current ? saved.report : null;
    const terminalReady = saved.terminalSignature === current;
    const workspace = Boolean(folder()), trustedFolder = workspace && vscode.workspace.isTrusted;
    return { stage:missionSetup.stage({workspace,trusted:trustedFolder,report,terminalReady,exists}),report:translated(report),terminalReady,system:missionSetup.runtimeLabel(),folder:folder()?.name,shell:process.platform==='win32'?'PowerShell':process.platform==='darwin'?'zsh':'bash' };
  }
  async function checkMissionTools(m) {
    trusted(); requireUnlocked(m);
    if (m.kind === 'foundation') throw new Error('Las bases no necesitan herramientas de programación.');
    busy=true;busyKind='missionTools';abortController=new AbortController();await broadcast();
    try {
      const report=await missionSetup.diagnose(m.track,config(),{cwd:folder().uri.fsPath,signal:abortController.signal});
      if (abortController.signal.aborted) return;
      state.missionSetups ||= {};state.missionSetups[m.track] ||= {};
      state.missionSetups[m.track].report=report;await save();
    } finally {busy=false;busyKind=null;abortController=null;await broadcast();}
  }
  function guidedShellPath() { return process.platform==='win32'?path.join(process.env.SystemRoot||process.env.WINDIR||'C:/Windows','System32','WindowsPowerShell','v1.0','powershell.exe'):process.platform==='darwin'?'/bin/zsh':'/bin/bash'; }
  async function setupTerminal(m) {
    trusted();requireUnlocked(m);
    if (!setupPayload(m,false).report?.ready) throw new Error('Comprueba primero la herramienta de esta ruta.');
    const shellPath=guidedShellPath();
    const term=vscode.window.createTerminal({name:tr('AImlearning · preparación'),cwd:folder().uri.fsPath,shellPath});term.show();
    const pid=await term.processId;
    if (!pid) throw new Error('No se pudo abrir la terminal. Revisa los perfiles de terminal de VS Code y vuelve a intentar.');
    state.shell=process.platform==='win32'?'powershell':'bash';
    state.missionSetups ||= {};state.missionSetups[m.track] ||= {};
    state.missionSetups[m.track].terminalSignature=missionSetup.signature(m.track,config());state.missionSetups[m.track].terminalShell=state.shell;await save();
  }
  async function broadcast() {
    const data = await payload();
    await vscode.commands.executeCommand('setContext', 'aimlearning.foundationsComplete', data.foundationReady);
    await vscode.commands.executeCommand('setContext', 'aimlearning.workspaceReady', Boolean(folder()) && data.trusted);
    status.text = `$(book) AImlearning · ${data.xp} XP`;
    status.tooltip = tr('Abrir AImlearning');
    status.show();
    for (const view of webviews) await view.postMessage({ type: 'state', data });
  }
  async function notify(text, kind = 'info', details = {}) {
    for (const view of webviews) await view.postMessage({ type: 'notice', text: tr(text), kind, ...details });
  }
  async function createProject(m) {
    trusted(); requireUnlocked(m);
    const root = rootFor(m);
    const entry = path.join(root, runner.entryFilename(m.track));
    if (await fs.stat(entry).then(() => true, () => false)) {
      await vscode.window.showTextDocument(vscode.Uri.file(entry), { viewColumn: vscode.ViewColumn.One, preserveFocus: false });
      return;
    }
    let sdkMajor;
    if (m.track === 'csharp') {
      const result = await runner.execute(config().dotnetPath, ['--version'], { cwd: folder().uri.fsPath, timeout: 15000 });
      sdkMajor = Number(result.output.trim().split('.')[0]);
      if (result.code !== 0 || !Number.isInteger(sdkMajor) || sdkMajor < 8) throw new Error('Necesitas .NET SDK 8 o posterior. Instálalo, reinicia VS Code y vuelve a crear el proyecto. Puedes configurar aimlearning.dotnetPath.');
    }
    if (m.track === 'python' || m.track === 'javascript') {
      const tool = runner.runtimeFor(m.track, config());
      const result = await runner.execute(tool, ['--version'], { cwd: folder().uri.fsPath, timeout: 15000 });
      const valid = m.track === 'python' ? /^Python 3\./.test((result.output + result.stderr).trim()) : /^v\d+\./.test(result.output.trim());
      if (result.code !== 0 || !valid) throw new Error(m.track === 'python' ? 'Necesitas Python 3. Instálalo y comprueba su versión en la terminal; también puedes configurar aimlearning.pythonPath. Si está solo en WSL, abre la carpeta con VS Code en WSL.' : 'Necesitas Node.js. Instálalo y comprueba node --version en la terminal; también puedes configurar aimlearning.nodePath.');
    }
    await fs.mkdir(root, { recursive: true });
    if (m.track === 'csharp') await writeNew(path.join(root, 'AImlearningApp.csproj'), `<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>\n    <TargetFramework>net${sdkMajor}.0</TargetFramework>\n    <ImplicitUsings>enable</ImplicitUsings>\n    <Nullable>enable</Nullable>\n  </PropertyGroup>\n</Project>\n`);
    const sequence = missions.filter(item => item.track === m.track);
    const previous = sequence[sequence.findIndex(item => item.id === m.id) - 1];
    let reused = false;
    if (previous && learning.recordFor(state, previous.id).completedAt) {
      const previousRoot = rootFor(previous);
      try {
        for (const file of await runner.sourceFiles(previousRoot)) {
          const reusable = m.track === 'python' ? /\.py$/ : m.track === 'javascript' ? /\.js$/ : /\.(cs|cpp|cc|cxx|h|hpp)$/;
          if (!reusable.test(file)) continue;
          const dest = path.join(root, path.relative(previousRoot, file));
          await fs.mkdir(path.dirname(dest), { recursive: true });
          await writeNew(dest, await fs.readFile(file, 'utf8'));
          reused = true;
        }
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    const comment = m.track === 'python' ? '#' : '//';
    await writeNew(entry, `${comment} AImlearning · ${m.title}\n${comment} ${m.goal}\n${comment} ${tr('Escribe tu intento aquí. El profesor te ayudará a razonar.')}\n`);
    await writeNew(path.join(root, 'RETO.md'), `# ${m.title}\n\n${m.goal}\n\n${m.requirements.map(r => '- ' + r).join('\n')}\n\n## ${tr('Del ejemplo a tu reto')}\n\n**${tr('Qué código te puede servir')}:** ${m.guidance.tools}\n\n**${tr('Cómo llevarlo a este ejercicio')}:** ${m.guidance.path}\n\n**${tr('Cómo saber si vas bien')}:** ${m.guidance.check}\n\n## ${tr('Antes de programar')}\n\n${m.question}\n\n## ${tr('Reflexión')}\n\n${m.reflection}\n`);
    await writeNew(path.join(root, '.gitignore'), 'bin/\nobj/\n.aimlearning-build/\nanalizador\nanalizador.exe\n__pycache__/\n*.pyc\n.venv/\nnode_modules/\n');
    await vscode.window.showTextDocument(vscode.Uri.file(entry), { viewColumn: vscode.ViewColumn.One });
    await notify(reused ? 'Recuperamos tu propio código anterior en una carpeta nueva. Adáptalo al siguiente reto.' : 'Tu archivo está preparado. Lee el concepto, escribe tu intento y prueba desde la terminal.');
  }
  async function writeNew(file, content) {
    try { await fs.writeFile(file, content, { flag: 'wx' }); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
  async function terminal() {
    trusted();
    const root = rootFor(mission());
    const exists = await fs.stat(root).then(() => true, () => false);
    const saved=state.missionSetups?.[mission().track];
    const guided=saved?.terminalSignature===missionSetup.signature(mission().track,config()) && saved?.terminalShell===state.shell;
    const term = vscode.window.createTerminal({ name: tr('AImlearning · práctica'), cwd: exists ? root : folder().uri.fsPath, ...(guided?{shellPath:guidedShellPath()}:{}) });
    term.show();
    await notify('La terminal está lista. Tú decides qué ejecutar; los comandos explicados están en la pestaña Terminal.');
  }
  async function check(m) {
    trusted(); requireUnlocked(m);
    const r = learning.recordFor(state, m.id);
    if (!r.attempt) throw new Error('Antes de comprobar, registra qué intentaste en la pestaña Profesor.');
    if (!(await vscode.workspace.saveAll(false))) throw new Error('Guarda los cambios antes de comprobar.');
    const root = rootFor(m);
    await runner.snapshot(root);
    busy = true;
    abortController = new AbortController();
    await broadcast();
    const writer = new vscode.EventEmitter();
    const closed = new vscode.EventEmitter();
    let finish;
    const finished = new Promise(resolve => { finish = resolve; });
    const pty = {
      onDidWrite: writer.event, onDidClose: closed.event,
      open: async () => {
        try {
          r.verification = await runner.verify(m, root, config(), { signal: abortController.signal, log: text => writer.fire(tr(text).replace(/\r?\n/g, '\r\n')) });
          state.records[m.id] = r;
          await save();
          closed.fire(r.verification.passed ? 0 : 1);
        } catch (error) {
          r.verification = { passed: false, phase: 'build', summary: error.message, cases: [] };
          state.records[m.id] = r;
          await save();
          writer.fire(tr(error.message) + '\r\n');
          closed.fire(1);
        } finally { finish(); }
      },
      close: () => { abortController?.abort(); }
    };
    try {
      const task = new vscode.Task({ type: 'aimlearning', mission: m.id }, folder(), tr(`Comprobar: ${m.title}`), 'AImlearning', new vscode.CustomExecution(async () => pty));
      task.presentationOptions = { reveal: vscode.TaskRevealKind.Always, panel: vscode.TaskPanelKind.Dedicated, clear: true };
      await vscode.tasks.executeTask(task);
      await finished;
    } finally {
      busy = false;
      await broadcast();
      writer.dispose(); closed.dispose();
    }
  }
  async function professor(m, message) {
    if (m.kind !== 'foundation') trusted();
    requireUnlocked(m);
    const r = learning.recordFor(state, m.id);
    if (!r.attempt) throw new Error('Describe primero tu intento. Puedes registrar una idea aunque tu código todavía no compile.');
    let reply, source;
    if (state.aiModel) {
      if (m.kind !== 'foundation' && !(await vscode.workspace.saveAll(false))) throw new Error('Guarda los cambios antes de pedir al tutor que revise tu código.');
      const contextData = tutor.contextFor(m, r, message, m.kind === 'foundation' ? '' : await tutorSource(rootFor(m)), language());
      contextData.foundation = m.kind === 'foundation';
      const answer = await generatedGuidance(contextData, m);
      reply = answer.text; source = answer.source;
    } else {
      reply = m.kind === 'foundation' ? learning.foundationQuestion(r, message) : learning.questions[learning.fallbackQuestion(r, message)];
      source = 'Guía pedagógica local';
      if (m.kind !== 'foundation' && r.verification?.phase === 'build') {
        const diagnostic = projectFeedback.firstDiagnostic(r.verification.details);
        if (diagnostic) {
          reply = 'El primer error de compilación' + (diagnostic.location ? ' aparece en ' + diagnostic.location : '') + ' y apunta a ' + diagnostic.category + '. ¿Qué esperaba allí el compilador y qué escribiste tú?';
          if (language() === 'en') reply = 'The first build error' + (diagnostic.location ? ' is at ' + diagnostic.location.replace(', línea ', ', line ') : '') + ' and points to ' + tr(diagnostic.category) + '. What did the compiler expect there, and what did you write?';
          source = 'Guía local · compilación';
        }
      } else if (m.kind !== 'foundation' && r.verification?.passed === false && r.verification?.cases?.length) {
        const failed = r.verification.cases.find(item => !item.passed);
        if (failed) {
          reply = 'El caso «' + failed.name + '» no coincide con el contrato. Toma la entrada más pequeña de ese caso: ¿en qué paso aparece la primera diferencia entre lo esperado y lo observado?';
          if (language() === 'en') reply = 'The case «' + tr(failed.name) + '» does not match the contract. Take its smallest input: where does the first difference between expected and observed behavior appear?';
          source = 'Guía local · prueba fallida';
        }
      }
    }
    r.dialogue = [...(r.dialogue || []), ...(message.trim() ? [{ role: 'student', text: message.trim().slice(0, 3000) }] : []), { role: 'professor', text: reply, source, requestId:tutorRequest?.id }].slice(-200);
    state.records[m.id] = r;
    await save();
  }
  async function conceptProfessor(m, message) {
    requireUnlocked(m);
    const r = learning.recordFor(state, m.id);
    let reply, source;
    if (state.aiModel) {
      const answer = await generatedGuidance(tutor.conceptContext(translated(m), r, message, language()), m);
      reply = answer.text; source = answer.source;
    } else {
      const lesson = translated(m);
      reply = lesson.lesson + '\n\n' + (m.kind === 'foundation' ? lesson.example.reasoning : lesson.example.explanation) + '\n\n' + tr('Con tus palabras, ¿qué parte entiendes y en cuál te pierdes? Esa observación puede ser el inicio de tu intento.');
      source = tr('Guía conceptual local');
    }
    r.dialogue = [...(r.dialogue || []), {role:'student',text:message.trim().slice(0,3000),scope:'concept'}, {role:'professor',text:reply,source,scope:'concept',requestId:tutorRequest?.id}].slice(-200);
    state.records[m.id] = r; await save();
  }
  async function aiGuidance(contextData) {
    if (state.aiModel.provider === 'laya') throw new Error(tr('Laya no genera respuestas. Conecta un modelo generativo para recibir orientación de IA.'));
    const signal=abortController?.signal;
    tutorRequestControl.throwIfCancelled(signal);
    let raw;
    if (state.aiModel.provider === 'openai') {
      const key = await context.secrets.get('aimlearning.openaiApiKey');
      if (!key) throw new Error('Falta tu clave de OpenAI. Vuelve a conectar la IA.');
      raw = await tutorRequestControl.abortable(tutor.sendOpenAI(key, state.aiModel.id, contextData,fetch,signal),signal);
    } else if (['ollama', 'compatible'].includes(state.aiModel.provider)) {
      raw = await tutorRequestControl.abortable(localModels.sendLocal(state.aiModel.provider, state.aiModel.baseUrl, state.aiModel.id, contextData,fetch,signal),signal);
    } else {
      const models = await tutorRequestControl.abortable(vscode.lm.selectChatModels({ id: state.aiModel.id }),signal);
      const model = models.find(item => item.id === state.aiModel.id);
      if (!model) throw new Error('El modelo de VS Code ya no está disponible. Conecta otro.');
      const token = new vscode.CancellationTokenSource();
      const cancelToken=()=>token.cancel();
      signal?.addEventListener('abort',cancelToken,{once:true});
      const timer = setTimeout(() => token.cancel(), 45000);
      try {
        const messages = [vscode.LanguageModelChatMessage.User(tutor.instructionsFor(contextData.language)), vscode.LanguageModelChatMessage.User(JSON.stringify(contextData))];
        const response = await tutorRequestControl.abortable(model.sendRequest(messages, {}, token.token),signal);
        raw = '';
        const iterator=response.text[Symbol.asyncIterator]();
        while(true) {const part=await tutorRequestControl.abortable(iterator.next(),signal);if(part.done)break;raw+=part.value;if(raw.length>3000){token.cancel();break;}}
      } finally { clearTimeout(timer);signal?.removeEventListener('abort',cancelToken);token.dispose(); }
    }
    tutorRequestControl.throwIfCancelled(signal);
    const reply = tutor.parseTutorResponse(raw, contextData.language);
    if (!reply) throw new Error(tr('La IA devolvió una respuesta vacía o incompatible con las reglas del profesor. Vuelve a intentar.'));
    return reply;
  }
  async function tutorSource(root) {
    try { return (await runner.snapshot(root)).content; }
    catch (error) { if (error.code === 'ENOENT') return ''; throw error; }
  }
  async function generatedGuidance(contextData, mission) {
    const text = await aiGuidance(contextData);
    if (mission && (tutor.revealsFoundationChoice(text, mission) || tutor.revealsFoundationChoice(text, translated(mission)))) throw new Error(tr('La respuesta de la IA revelaba una solución y no se mostró. Vuelve a intentar.'));
    return { text, source: `Tutor de IA · ${state.aiModel.name}` };
  }
  async function thinking(action, request) {
    busy = true; busyKind = state.aiModel ? 'tutor' : 'local';
    if(state.aiModel) {abortController=new AbortController();tutorRequest={id:crypto.randomUUID(),key:request.key,action:request.action,startedAt:Date.now(),cancelRequested:false};}
    const active=tutorRequest;
    try {await broadcast();return await action();}
    catch(error) {if(error.code==='TUTOR_CANCELLED'){error.requestId=active?.id;error.key=active?.key;}throw error;}
    finally {busy=false;busyKind=null;abortController=null;tutorRequest=null;await broadcast();}
  }
  function labRecord(project) {
    state.projectRecords ||= {};
    return state.projectRecords[project.id] ||= { milestones: {}, hints: {}, dialogue: [] };
  }
  function requireProject(project) {
    trusted();
    if (!projectLabs.unlocked(state, project)) throw new Error(projectLabs.blocker(state, project));
  }
  async function projectProfessor(project, index, message) {
    requireProject(project);
    if (!Number.isInteger(index) || index < 0 || index >= project.milestones.length) throw new Error('Elige una etapa válida.');
    const record = labRecord(project);
    if (!record.milestones[index]) throw new Error('Registra primero tu intento de esta etapa para recibir orientación.');
    let answer;
    if (state.aiModel) {
      if (!(await vscode.workspace.saveAll(false))) throw new Error('Guarda los cambios antes de pedir al tutor que revise tu código.');
      const stage = project.milestones[index];
      const contextData = tutor.contextFor({ title: project.title + ' · ' + stage.title, goal: project.brief, requirements: [stage.prompt, ...project.deliverables], concepts: [project.subtitle] }, {attempt: record.milestones[index], verification: record.verification, dialogue: record.dialogue}, message, await tutorSource(projectRoot(project)), language());
      answer = await generatedGuidance(contextData);
    } else {
      const names = await fs.readdir(projectRoot(project)).catch(() => []);
      answer = projectFeedback.guidance(project, record, index, message, names, language());
    }
    record.dialogue = [...(record.dialogue || []), ...(message.trim() ? [{ role: 'student', text: message.trim().slice(0, 3000) }] : []), { role: 'professor', text: answer.text, source: answer.source,requestId:tutorRequest?.id }].slice(-200);
    state.projectRecords[project.id] = record;
    await save();
  }
  async function createLab(project) {
    requireProject(project);
    let sdkMajor = 8;
    if (project.track === 'csharp') {
      if (project.id === 'project-cs-gui' && process.platform !== 'win32') throw new Error('Este proyecto usa Windows Forms. Abre la carpeta en VS Code para Windows y utiliza el SDK de .NET de Windows.');
      const result = await runner.execute(config().dotnetPath, ['--version'], { cwd: folder().uri.fsPath, timeout: 15000 });
      sdkMajor = Number(result.output.trim().split('.')[0]);
      if (result.code !== 0 || !Number.isInteger(sdkMajor) || sdkMajor < 8) throw new Error('Necesitas .NET SDK 8 o posterior para este proyecto.');
    }
    const root = projectRoot(project);
    await projectWorkspaces.create(project, root, sdkMajor, language());
    const record = labRecord(project);
    record.scaffoldHash ||= await projectWorkspaces.sourceSnapshot(root);
    await save();
    const entry = project.id === 'project-cpp-github' ? 'src/analysis.cpp' : project.track === 'csharp' ? 'Program.cs' : 'main.cpp';
    await vscode.window.showTextDocument(vscode.Uri.file(path.join(root, entry)), { viewColumn: vscode.ViewColumn.One });
    await notify('Proyecto preparado. La estructura abre o compila; tú construirás el comportamiento y registrarás tus pruebas.');
  }
  async function checkLab(project, pullRequestUrl) {
    requireProject(project);
    if (!(await vscode.workspace.saveAll(false))) throw new Error('Guarda tus cambios antes de revisar el proyecto.');
    const root = projectRoot(project);
    await fs.stat(path.join(root, 'RETO.md'));
    const record = labRecord(project);
    if (project.kind === 'github') record.pullRequestUrl = String(pullRequestUrl || record.pullRequestUrl || '').trim().slice(0, 500);
    busy = true; busyKind = 'project'; abortController = new AbortController(); await broadcast();
    const writer = new vscode.EventEmitter();
    const closed = new vscode.EventEmitter();
    let finish;
    const finished = new Promise(resolve => { finish = resolve; });
    const pty = {
      onDidWrite: writer.event, onDidClose: closed.event,
      open: async () => {
        const write = text => writer.fire(String(text).replace(/\r?\n/g, '\r\n'));
        try {
          const build = await projectWorkspaces.verifyBuild(project, root, config(), write, abortController.signal);
          const behavior = build.passed ? await projectBehavior.check(project, root, config(), write, abortController.signal) : null;
          const github = build.passed && behavior?.passed && project.kind === 'github' ? await projectWorkspaces.inspectGitHub(project, root, record.pullRequestUrl, config(), abortController.signal, behavior) : null;
          const currentHash = build.passed ? await projectWorkspaces.sourceSnapshot(root) : build.hash;
          const changed = currentHash !== build.hash;
          const passed = build.passed && !changed && (project.kind === 'gui' || behavior?.passed) && (!github || github.passed);
          const summary = changed ? 'El código cambió durante las pruebas. Guarda y revisa de nuevo.' : !build.passed ? build.summary : behavior && behavior.passed === false ? behavior.summary : github && !github.passed ? 'La compilación y las pruebas pasaron, pero faltan evidencias locales de GitHub.' : project.kind === 'gui' ? 'El proyecto compila. Registra los tres casos manuales; la interfaz no se comprueba automáticamente.' : behavior.summary;
          record.verification = { ...build, phase: build.passed ? 'behavior' : 'build', passed, summary, behavior, github };
          state.projectRecords[project.id] = record;
          await save();
          if (github) {
            write('\n' + github.findings.map(item => 'REVISAR · ' + item).join('\n') + '\n' + github.note + '\n');
          }
          write('\n' + summary + '\n');
          closed.fire(passed ? 0 : 1);
        } catch (error) {
          record.verification = { passed: false, phase: 'build', summary: error.message, details: error.message, hash: '' };
          state.projectRecords[project.id] = record;
          await save();
          write(error.message + '\n');
          closed.fire(1);
        } finally { finish(); }
      },
      close: () => abortController?.abort()
    };
    try {
      const task = new vscode.Task({ type: 'aimlearning', mission: project.id }, folder(), 'Revisar proyecto: ' + project.title, 'AImlearning', new vscode.CustomExecution(async () => pty));
      task.presentationOptions = { reveal: vscode.TaskRevealKind.Always, panel: vscode.TaskPanelKind.Dedicated, clear: true };
      await vscode.tasks.executeTask(task);
      await finished;
    } finally {
      busy = false; busyKind = null; abortController = null; await broadcast();
      writer.dispose(); closed.dispose();
    }
  }
  async function completeLab(project, reflection) {
    requireProject(project);
    if (!(await vscode.workspace.saveAll(false))) throw new Error('Guarda tus cambios antes de completar.');
    const record = labRecord(project);
    record.reflection = String(reflection || '').trim().slice(0, 4000);
    const hash = await projectWorkspaces.sourceSnapshot(projectRoot(project));
    const missing = projectLabs.missingForCompletion(project, record, hash);
    if (missing.length) throw new Error(missing[0]);
    record.completedAt ||= new Date().toISOString();
    state.projectRecords[project.id] = record;
    await save();
    await notify('Proyecto completado con evidencia registrada. Los ' + project.xp + ' XP se otorgan una sola vez.', 'success');
  }
  async function connectAI() {
    if (mission().kind !== 'foundation') trusted();
    const provider = await pick([
      { label: 'Ollama local', description: 'Detecta modelos de Ollama instalados en tu equipo', provider: 'ollama' },
      { label: 'Servidor local compatible', description: 'LM Studio, llama.cpp, vLLM o el modelo local que usas con OpenCode', provider: 'compatible' },
      { label: 'Modelo de VS Code', description: 'Usa un proveedor de modelos ya configurado en VS Code', provider: 'vscode' },
      { label: 'OpenAI API', description: 'Usa tu propia clave de API; el uso puede generar cargos', provider: 'openai' }
    ], { title: 'Conectar tutor de IA', placeHolder: 'Elige de dónde vendrá el modelo' });
    if (!provider) return;
    let selectedModel;
    if (provider.provider === 'ollama' || provider.provider === 'compatible') {
      const defaultAddress = provider.provider === 'ollama' ? 'http://127.0.0.1:11434' : 'http://127.0.0.1:1234/v1';
      const address = await input({
        title: provider.provider === 'ollama' ? 'Dirección de Ollama' : 'Dirección del servidor local compatible',
        prompt: 'AImlearning solo acepta localhost. Al conectar consultará los modelos disponibles; tu código no se enviará hasta que preguntes al tutor.',
        value: state.aiModel?.provider === provider.provider ? state.aiModel.baseUrl : defaultAddress,
        ignoreFocusOut: true,
        validateInput: value => { try { localModels.localBase(value, provider.provider); return null; } catch (error) { return error.message; } }
      });
      if (!address) return;
      const found = await localModels.listLocalModels(provider.provider, address);
      const choice = await pick(found.models.map(item => ({ label: item.id, id: item.id })), { title: 'Modelo local del tutor', placeHolder: 'Elige un modelo ya cargado o descargado' });
      if (!choice) return;
      selectedModel = { provider: provider.provider, id: choice.id, name: `${provider.provider === 'ollama' ? 'Ollama' : 'Local'} · ${choice.id}`, baseUrl: found.base };
    } else if (provider.provider === 'openai') {
      const choice = await pick([
        { label: 'GPT-6 Luna', description: 'Más económico para consultas frecuentes', id: 'gpt-6-luna' },
        { label: 'GPT-6 Sol', description: 'Más capacidad para razonamiento y código', id: 'gpt-6-sol' }
      ], { title: 'Modelo del tutor' });
      if (!choice) return;
      let key = await context.secrets.get('aimlearning.openaiApiKey');
      if (!key) {
        key = await input({ title: 'Clave de la API de OpenAI', prompt: 'Se guardará en el almacén de secretos de VS Code. Solo se usará al pedir orientación o una pista.', password: true, ignoreFocusOut: true, validateInput: value => value.trim() ? null : 'Escribe una clave de API.' });
        if (!key) return;
        await context.secrets.store('aimlearning.openaiApiKey', key.trim());
      }
      selectedModel = { provider: 'openai', id: choice.id, name: choice.label };
    } else {
      const models = await vscode.lm.selectChatModels({});
      if (!models.length) throw new Error('VS Code no ofrece modelos a esta extensión. Configura un proveedor o usa Ollama local.');
      const selected = await pick(models.map(model => ({ label: model.name, description: model.vendor, model })), { title: 'Modelo del tutor', placeHolder: 'Se leerá solo el proyecto de la misión al pedir orientación o una pista.' });
      if (!selected) return;
      selectedModel = { provider: 'vscode', id: selected.model.id, name: selected.model.name };
    }
    if (state.aiModel?.provider === 'laya' && selectedModel.provider !== 'laya') await context.secrets.delete('aimlearning.layaApiKey');
    if (state.aiModel?.provider === 'openai' && selectedModel.provider !== 'openai') await context.secrets.delete('aimlearning.openaiApiKey');
    state.aiModel = selectedModel;
    await save();
    await notify(`Tutor de IA conectado: ${state.aiModel.name}. Puedes pedir ayuda conceptual ahora; las pistas del reto requieren un intento.`, 'success');
  }
  async function handle(message) {
    if (!message || typeof message.type !== 'string') return;
    try {
      if (message.type === 'ready') return broadcast();
      if (message.type === 'open') return open();
      if (message.type === 'language') {
        if (!['es', 'en'].includes(message.value)) return;
        await vscode.workspace.getConfiguration('aimlearning').update('language', message.value, vscode.ConfigurationTarget.Global);
        return broadcast();
      }
      if(message.type==='cancelTutor') {if(busyKind==='tutor' && tutorRequest?.id===message.requestId){tutorRequest.cancelRequested=true;abortController?.abort();await broadcast();}return;}
      if (message.type === 'cancel') { abortController?.abort(); return; }
      if (busy) throw new Error('Hay una operación en curso. Espera a que termine o cancela la comprobación.');
      const m = mission();
      const teach=action=>thinking(action,{key:message.type.startsWith('project')?'project:'+state.projectSelected:message.type==='gitHint'?'git':'mission:'+m.id,action:message.type});
      switch (message.type) {
        case 'gitStart': {
          trusted();
          if (!learning.foundationsComplete(state)) throw new Error('Completa primero las bases comunes antes de iniciar la práctica de Git.');
          const version = await runner.execute(config().gitPath, ['--version'], { cwd: folder().uri.fsPath, timeout: 15000 });
          if (version.code !== 0) throw new Error('Git no está disponible aquí. Instálalo en este entorno o configura aimlearning.gitPath.');
          await gitPractice.create(gitRoot(), language());
          await vscode.window.showTextDocument(vscode.Uri.file(path.join(gitRoot(), 'RETO.md')), { viewColumn: vscode.ViewColumn.One });
          await broadcast();
          await notify('Carpeta de práctica preparada. Tú iniciarás el repositorio y ejecutarás los comandos.');
          break;
        }
        case 'gitTerminal': {
          trusted();
          if (!(await fs.stat(path.join(gitRoot(), 'RETO.md')).then(() => true, () => false))) throw new Error('Prepara primero la carpeta de práctica.');
          const term = vscode.window.createTerminal({ name: 'AImlearning · Git', cwd: gitRoot() });
          term.show(); break;
        }
        case 'gitCopy': {
          const step = gitPractice.steps[Number(message.step)];
          const command = step?.commands[Number(message.index)];
          if (command) { await vscode.env.clipboard.writeText(command); await notify('Comando copiado. Léelo y ejecútalo tú en la carpeta de práctica.'); }
          break;
        }
        case 'gitAttempt': {
          trusted();
          const index = Number(message.step);
          const step = gitPractice.steps[index];
          if (!step || (index > 0 && !state.gitRecords?.steps?.[gitPractice.steps[index - 1].id]?.completedAt)) throw new Error('Completa primero la etapa anterior de Git.');
          const note = String(message.text || '').trim();
          if (note.length < 40) throw new Error('Explica tu intento y lo que observaste con al menos 40 caracteres.');
          state.gitRecords ||= { steps: {} };
          state.gitRecords.steps ||= {};
          state.gitRecords.steps[step.id] ||= {};
          state.gitRecords.steps[step.id].attempt = note.slice(0, 4000);
          await save();
          await notify('Intento registrado. Ahora puedes pedir una pista o comprobar la evidencia local.');
          break;
        }
        case 'gitHint': {
          const index = Number(message.step);
          const step = gitPractice.steps[index];
          if (!step || !state.gitRecords?.steps?.[step.id]?.attempt) throw new Error('Registra primero tu intento antes de pedir una pista.');
          if (state.aiModel) {
            const record = state.gitRecords.steps[step.id];
            await teach(async () => {
              const answer = await generatedGuidance(tutor.contextFor({title:step.title,goal:step.task,concepts:['Git']}, record, tr('Dame una pista pequeña basada en mi intento, sin resolver la etapa.'), '', language()));
              record.hint = answer.text; record.hintSource = answer.source;
              await save();
            });
          } else { state.gitRecords.steps[step.id].hint = step.hint; state.gitRecords.steps[step.id].hintSource = 'Pista para razonar'; }
          await save(); break;
        }
        case 'gitCheck': {
          trusted();
          const index = Number(message.step);
          const step = gitPractice.steps[index];
          if (!step || (index > 0 && !state.gitRecords?.steps?.[gitPractice.steps[index - 1].id]?.completedAt)) throw new Error('Completa primero la etapa anterior de Git.');
          const record = state.gitRecords?.steps?.[step.id];
          if (!record?.attempt) throw new Error('Registra primero tu intento.');
          if (!(await fs.stat(path.join(gitRoot(), 'RETO.md')).then(() => true, () => false))) throw new Error('Prepara primero la carpeta de práctica.');
          if (!(await vscode.workspace.saveAll(false))) throw new Error('Guarda tus cambios antes de comprobar.');
          busy = true; busyKind = 'git'; abortController = new AbortController(); await broadcast();
          try {
            const result = await gitPractice.inspect(gitRoot(), index, record, { gitPath: config().gitPath, signal: abortController.signal });
            if (!abortController.signal.aborted) {
              record.conflictSeen ||= result.conflictSeen;
              record.verification = { passed: result.passed, findings: result.findings, checkedAt: new Date().toISOString() };
              if (result.passed) record.completedAt ||= new Date().toISOString();
              if (gitPractice.steps.every(item => state.gitRecords.steps[item.id]?.completedAt)) state.gitRecords.completedAt ||= new Date().toISOString();
              await save();
              await notify(result.passed ? 'Etapa de Git comprobada. Ya puedes continuar.' : 'Hay evidencia pendiente. Lee el resultado y vuelve a intentarlo.', result.passed ? 'success' : 'info');
            }
          } finally { busy = false; busyKind = null; abortController = null; await broadcast(); }
          break;
        }
        case 'projectSelect': {
          const project = projectLabs.projects.find(item => item.id === message.id);
          if (project) { state.projectSelected = project.id; await save(); }
          break;
        }
        case 'projectCreate': await createLab(selectedProject()); break;
        case 'projectEnvironment': {
          const project = selectedProject();
          requireProject(project);
          busy = true; busyKind = 'environment'; abortController = new AbortController(); await broadcast();
          try {
            const result = await projectEnvironment.diagnose(project, config(), { cwd: folder().uri.fsPath, signal: abortController.signal });
            if (!abortController.signal.aborted) {
              const record = labRecord(project);
              record.environment = result;
              await save();
              await notify(result.ready ? 'El entorno está listo para este proyecto.' : 'Hay herramientas pendientes. Revisa cada resultado y vuelve a comprobar.', result.ready ? 'success' : 'info');
            }
          } finally { busy = false; busyKind = null; abortController = null; await broadcast(); }
          break;
        }
        case 'projectTerminal': {
          requireProject(selectedProject());
          const root = projectRoot(selectedProject());
          const exists = await fs.stat(root).then(() => true, () => false);
          const term = vscode.window.createTerminal({ name: tr('AImlearning · proyecto real'), cwd: exists ? root : folder().uri.fsPath });
          term.show(); break;
        }
        case 'projectCopy': {
          const project = selectedProject();
          const guide = projectWorkspaces.commands(project, projectRoot(project), state.shell, config());
          if (Number.isInteger(message.index) && guide[message.index]) { await vscode.env.clipboard.writeText(guide[message.index].command); await notify('Comando copiado. Léelo antes de ejecutarlo.'); }
          break;
        }
        case 'projectDocs': {
          const project = selectedProject();
          if (Number.isInteger(message.index) && project.docs[message.index]) await vscode.env.openExternal(vscode.Uri.parse(i18n.documentation(project.docs[message.index], language())));
          break;
        }
        case 'projectMilestone': {
          const project = selectedProject();
          requireProject(project);
          const index = Number(message.index);
          if (!Number.isInteger(index) || index < 0 || index >= project.milestones.length) throw new Error('Elige una etapa válida.');
          const note = String(message.text || '').trim();
          if (note.length < 40) throw new Error('Explica tu intento y lo que observaste con al menos 40 caracteres.');
          const record = labRecord(project);
          record.milestones[index] = note.slice(0, 4000);
          state.projectRecords[project.id] = record;
          await save();
          await notify('Razonamiento registrado. Ya puedes pedir una pista para esta etapa.'); break;
        }
        case 'projectHint': {
          const project = selectedProject();
          requireProject(project);
          const index = Number(message.index);
          if (!Number.isInteger(index) || index < 0 || index >= project.milestones.length) throw new Error('Elige una etapa válida.');
          const record = labRecord(project);
          if (!record.milestones[index]) throw new Error('Describe primero tu intento en esta etapa.');
          if (state.aiModel) { await teach(() => projectProfessor(project, index, tr('Dame una pista pequeña basada en mi intento, sin resolver la etapa.'))); break; }
          record.hints[index] = project.milestones[index].hint;
          state.projectRecords[project.id] = record;
          await save(); break;
        }
        case 'projectProfessor': await teach(() => projectProfessor(selectedProject(), Number(message.index), String(message.text || ''))); break;
        case 'projectManualCheck': {
          const project = selectedProject();
          requireProject(project);
          if (project.kind !== 'gui') throw new Error('Este proyecto usa pruebas automáticas.');
          const index = Number(message.index);
          if (!Number.isInteger(index) || index < 0 || index >= projectBehavior.expectedCases(project).length) throw new Error('Elige un caso manual válido.');
          const status = String(message.status || '');
          const note = String(message.note || '').trim();
          if (!['passed', 'failed'].includes(status) || note.length < 25) throw new Error('Marca el resultado y describe lo que observaste con al menos 25 caracteres.');
          if (!(await vscode.workspace.saveAll(false))) throw new Error('Guarda tus cambios antes de registrar la prueba.');
          const record = labRecord(project);
          record.manualChecks ||= {};
          record.manualChecks[index] = { status, note: note.slice(0, 2000), hash: await projectWorkspaces.sourceSnapshot(projectRoot(project)), checkedAt: new Date().toISOString() };
          state.projectRecords[project.id] = record;
          await save();
          await notify(status === 'passed' ? 'Caso manual registrado. Esta observación corresponde al código actual.' : 'Caso fallido registrado. Revisa lo observado y vuelve a probar cuando cambies el código.');
          break;
        }
        case 'projectCheck': await checkLab(selectedProject(), message.pullRequestUrl); break;
        case 'projectComplete': await completeLab(selectedProject(), message.reflection); break;
        case 'lessonReviewed': {
          requireUnlocked(m);
          const record=learning.recordFor(state,m.id);record.lessonReviewedAt ||= new Date().toISOString();state.records[m.id]=record;
          const reviews=context.globalState.get('aimlearning.lessonReviews.v1',{});
          await context.globalState.update('aimlearning.lessonReviews.v1',{...reviews,[m.id]:record.lessonReviewedAt});await save();break;
        }
        case 'missionTools': await checkMissionTools(m);break;
        case 'setupTerminal': await setupTerminal(m);break;
        case 'setupSettings': await vscode.commands.executeCommand('workbench.action.openSettings', 'aimlearning.' + ({csharp:'dotnetPath',cpp:'cppCompiler',python:'pythonPath',javascript:'nodePath'})[m.track]);break;
        case 'manageTrust': await vscode.commands.executeCommand('workbench.trust.manage');break;
        case 'openFolder': await vscode.commands.executeCommand('workbench.action.files.openFolder'); break;
        case 'setupDocs': {
          const urls = { csharp: 'https://learn.microsoft.com/es-es/dotnet/core/install/', cpp: 'https://code.visualstudio.com/docs/languages/cpp', python: 'https://code.visualstudio.com/docs/python/python-tutorial', javascript: 'https://nodejs.org/en/download' };
          await vscode.env.openExternal(vscode.Uri.parse(i18n.documentation(urls[m.track], language()))); break;
        }
        case 'select': {
          const selected = missions.find(item => item.id === message.id);
          if (selected) {
            if (selected.track !== 'foundations' && !learning.foundationsComplete(state)) throw new Error('Completa primero la ruta Antes del código para abrir los lenguajes.');
            state.selected = selected.id; state.track = selected.track; await save();
          }
          break;
        }
        case 'shell':
          if (['powershell', 'cmd', 'bash'].includes(message.value)) { state.shell = message.value; await save(); }
          break;
        case 'create':
          if (m.kind === 'foundation') throw new Error('Esta etapa se resuelve sin escribir código. Continúa en Aprende.');
          await createProject(m); await broadcast(); break;
        case 'terminal': await terminal(); break;
        case 'copy': {
          if (m.kind === 'foundation') break;
          const guide = runner.commandGuide(m, rootFor(m), state.shell, config());
          if (Number.isInteger(message.index) && guide[message.index]) { await vscode.env.clipboard.writeText(guide[message.index].command); await notify('Comando copiado. Léelo antes de ejecutarlo.'); }
          break;
        }
        case 'docs': await vscode.env.openExternal(vscode.Uri.parse(i18n.documentation(m.docs, language()))); break;
        case 'attempt': {
          if (m.kind !== 'foundation') trusted();
          requireUnlocked(m);
          const text = String(message.text || '').trim();
          if (text.length < (m.kind === 'foundation' ? 40 : 15)) throw new Error(m.kind === 'foundation' ? 'Explica tu razonamiento con al menos 40 caracteres.' : 'Describe tu idea y qué observaste con al menos una frase.');
          const r = learning.recordFor(state, m.id);
          r.attempt = text.slice(0, 4000); r.attemptAt = new Date().toISOString();
          state.records[m.id] = r;
          await save(); await notify(m.kind === 'foundation' ? 'Razonamiento registrado. Ya puedes pedir orientación y comprobar tu decisión.' : 'Intento registrado. Ya puedes pedir orientación y comprobar el proyecto.', 'success', {action:'attempt',field:'attempt',key:'mission:'+m.id}); break;
        }
        case 'hint': {
          if (m.kind !== 'foundation') trusted();
          requireUnlocked(m);
          const r = learning.recordFor(state, m.id);
          if (!r.attempt) throw new Error('Registra tu intento antes de pedir una pista.');
          if (state.aiModel) { await teach(() => professor(m, tr('Dame una pista pequeña basada en mi intento, sin resolver la misión.'))); break; }
          const index = Math.min(r.hints || 0, m.hints.length - 1);
          r.hints = Math.min(index + 1, m.hints.length);
          r.dialogue = [...(r.dialogue || []), { role: 'professor', text: m.hints[index], source: 'Pista para razonar' }].slice(-200);
          state.records[m.id] = r; await save(); break;
        }
        case 'professor':
          await teach(() => professor(m, String(message.text || ''))); break;
        case 'conceptProfessor':
          if (!String(message.text || '').trim()) throw new Error('Escribe qué concepto quieres entender.');
          await teach(() => conceptProfessor(m, String(message.text))); break;
        case 'connectAI': await connectAI(); break;
        case 'disconnectAI':
          await context.secrets.delete('aimlearning.layaApiKey'); if (state.aiModel?.provider === 'openai') await context.secrets.delete('aimlearning.openaiApiKey'); state.aiModel = null; await save(); break;
        case 'verify':
          if (m.kind === 'foundation') {
            const result = learning.verifyFoundation(state, m, String(message.choice || ''));
            await save();
            await notify(result.passed ? 'La opción encaja con el escenario. Ahora explica por qué; no hemos evaluado tu razonamiento.' : 'Revisa la pista y vuelve a intentarlo.', result.passed ? 'success' : 'info');
          } else await check(m);
          break;
        case 'complete': {
          if (m.kind !== 'foundation') trusted();
          requireUnlocked(m);
          let currentHash;
          if (m.kind === 'foundation') currentHash = learning.fingerprint(`${m.id}:${learning.recordFor(state, m.id).choice || ''}`);
          else {
            if (!(await vscode.workspace.saveAll(false))) throw new Error('Guarda tus cambios primero.');
            currentHash = (await runner.snapshot(rootFor(m))).hash;
          }
          learning.complete(state, m, currentHash, String(message.text || ''));
          await save(); await notify(`Misión completada. Tus ${m.xp} XP se otorgan una sola vez.`, 'success'); break;
        }
      }
    } catch (error) {
      if(error.code==='TUTOR_CANCELLED'){for(const view of webviews)await view.postMessage({type:'tutorCancelled',key:error.key,requestId:error.requestId,text:tr(error.message)});return;}
      const field = {attempt:'attempt',projectMilestone:'project-note',gitAttempt:'git-attempt'}[message.type];
      const chatAction = ['professor','conceptProfessor','hint','projectProfessor','projectHint'].includes(message.type);
      await notify(error.code === 'ENOENT' ? 'Crea primero el proyecto de esta misión.' : error.message, 'error', {
        action:message.type, ...(field ? {field} : {}),
        ...(field || chatAction ? {key:message.type.startsWith('project')?'project:'+state.projectSelected:'mission:'+mission().id} : {})
      });
    }
  }
  function setup(webview, sidebar = false) {
    webviews.add(webview);
    webview.options = { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')] };
    const nonce = crypto.randomBytes(20).toString('hex');
    const css = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'style.css'));
    const script = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'app.js'));
    const projectScript = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'project-view.js'));
    const gitScript = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'git-view.js'));
    const localeScript = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'i18n.js'));
    const localeData = JSON.stringify(i18n.dictionary).replace(/</g, '\\u003c');
    const logo = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'mark.svg'));
    webview.html = `<!DOCTYPE html><html lang="${language()}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src ${webview.cspSource};"><link rel="stylesheet" href="${css}"><title>AImlearning</title></head><body${sidebar ? ' class="sidebar"' : ''} data-logo-uri="${logo}"><div id="app"><p class="loading">${tr('Abriendo tu ruta de aprendizaje…')}</p></div><div id="notice" role="status" aria-live="polite"></div><script nonce="${nonce}">window.AImlearningEnglish=${localeData};</script><script nonce="${nonce}" src="${localeScript}"></script><script nonce="${nonce}" src="${projectScript}"></script><script nonce="${nonce}" src="${gitScript}"></script><script nonce="${nonce}" src="${script}"></script></body></html>`;
    const subscription = webview.onDidReceiveMessage(handle);
    return () => { webviews.delete(webview); subscription.dispose(); };
  }
  function open() {
    if (panel) return panel.reveal(vscode.ViewColumn.Beside);
    panel = vscode.window.createWebviewPanel('aimlearning.academy', 'AImlearning', vscode.ViewColumn.Beside, { enableScripts: true, retainContextWhenHidden: true });
    const cleanup = setup(panel.webview);
    panel.onDidDispose(() => { cleanup(); panel = null; });
  }
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('aimlearning.home', { resolveWebviewView(view) { const cleanup = setup(view.webview, true); view.onDidDispose(cleanup); } }),
    vscode.commands.registerCommand('aimlearning.open', open),
    vscode.commands.registerCommand('aimlearning.terminal', () => handle({ type: 'terminal' })),
    vscode.commands.registerCommand('aimlearning.verify', () => handle({ type: 'verify' })),
    vscode.workspace.onDidGrantWorkspaceTrust(broadcast),
    vscode.workspace.onDidChangeConfiguration(async event => {
      if (!event.affectsConfiguration('aimlearning')) return;
      if (event.affectsConfiguration('aimlearning.language')) return broadcast();
      for (const record of Object.values(state.projectRecords || {})) delete record.environment;
      await save();
    })
  );
  broadcast();
  return { getState: () => state, getPayload: payload, handle, open };
}
function deactivate() {}
module.exports = { activate, deactivate };
