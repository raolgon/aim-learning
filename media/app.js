'use strict';
const api = acquireVsCodeApi();
let data;
let focusMemory;
function rememberFocus() {
  rememberChatScroll();
  const el = document.activeElement;
  if (!el || !app.contains(el)) return;
  if (el.id) focusMemory = { id: el.id, start: el.selectionStart, end: el.selectionEnd };
  else if (el.dataset.action) focusMemory = { action: el.dataset.action, item: el.dataset.id, index: el.dataset.index };
}
function restoreFocus() {
  if (data) window.AImlearningI18n.apply(app, data);
  restoreChatScroll();
  if (!focusMemory) return;
  const el = focusMemory.id ? document.getElementById(focusMemory.id) : Array.from(app.querySelectorAll('[data-action]')).find(node => node.dataset.action === focusMemory.action && node.dataset.id === focusMemory.item && node.dataset.index === focusMemory.index);
  if (!el || el.disabled) return;
  el.focus({ preventScroll: true });
  if (typeof focusMemory.start === 'number' && el.setSelectionRange) el.setSelectionRange(focusMemory.start, focusMemory.end);
}
let ui = { area: 'missions', tab: 'learn', projectTab: 'overview', projectStage: 0, gitStep: 0, drafts: {}, ...api.getState() };
const app = document.getElementById('app');
const notice = document.getElementById('notice');
const icons = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  lock: '<rect x="6" y="10" width="12" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  terminal: '<path d="m4 5 6 7-6 7m9 0h7"/>',
  book: '<path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/>',
  trophy: '<path d="M8 3h8v6a4 4 0 0 1-8 0V3Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-8 9h8m-4-7v7"/>',
  spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>'
};
const icon = (id) => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[id] || icons.arrow}</svg>`;
const escape = text => String(text ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const send = (type, extra = {}) => api.postMessage({ type, ...extra });
const persist = () => api.setState(ui);
const draft = (key, initial = '') => ui.drafts[data.state.selected + ':' + key] ?? initial;
const projectDraft = (key, initial = '') => ui.drafts['project:' + key] ?? initial;
const disabled = (condition) => condition ? ' disabled' : '';
const button = (action, label, extra = '') => `<button data-action="${action}" ${extra}>${label}</button>`;
const nextStepBanner = (step, inactive = false) => step ? `<section class="next-step" aria-label="Tu siguiente paso"><div><strong>Tu siguiente paso</strong><p>${escape(step.title)}. ${escape(step.detail)}</p></div>${step.action ? button(step.action, escape(step.label) + ' ' + icon('arrow'), `class="next-action"${step.id ? ' data-id="' + escape(step.id) + '"' : ''}${Number.isInteger(step.index) ? ' data-index="' + step.index + '"' : ''}` + disabled(inactive)) : ''}</section>` : '';

const chatScroll = new Map();
let pendingChat;
let chatError;
const fieldErrors = new Map();
function fieldError(id) { const text=fieldErrors.get(chatKey()+':'+id); return `<p id="${id}-error" class="field-error" role="alert"${text?'':' hidden'}>${escape(text || '')}</p>`; }
function attemptCount(text, minimum) { return data.language==='en'?`${text.trim().length} characters · minimum ${minimum}.`:`${text.trim().length} caracteres · mínimo ${minimum}.`; }
function focusChat() { const input=document.getElementById('question');input?.focus({preventScroll:true});document.querySelector('.teacher-chat')?.scrollIntoView({block:'nearest'}); }
function openAttempt() { ui.attemptOpen=chatKey();persist();render();const input=document.getElementById('attempt');input?.focus();input?.scrollIntoView({block:'center'}); }

function chatKey() { return ui.area === 'projects' ? 'project:' + data.state.projectSelected : 'mission:' + data.state.selected; }
function chatTurns() { return ui.area === 'projects' ? data.state.projectRecords?.[data.state.projectSelected]?.dialogue || [] : data.state.records[data.state.selected]?.dialogue || []; }
function rememberChatScroll() {
  const log = app.querySelector('.chat-log');
  if (log) chatScroll.set(log.dataset.chatKey, { top: log.scrollTop, follow: log.scrollHeight - log.clientHeight - log.scrollTop < 64 });
}
function restoreChatScroll() {
  const log = app.querySelector('.chat-log');
  if (!log) return;
  const memory = chatScroll.get(log.dataset.chatKey);
  log.scrollTop = !memory || memory.follow ? log.scrollHeight : memory.top;
  updateChatJump(log);
}
function updateChatJump(log) {
  const jump = app.querySelector('[data-action="chatLatest"]');
  if (jump) jump.hidden = log.scrollHeight - log.clientHeight - log.scrollTop < 64;
}
function elapsedLabel(startedAt) {const seconds=Math.max(0,Math.floor((Date.now()-Number(startedAt))/1000));return data.language==='en'?`Waiting: ${seconds} s`:`Espera: ${seconds} s`;}
function tutorWaitView(key=chatKey()) {
  const request=data.tutorRequest;
  if(data.busyKind!=='tutor' || (request && request.key!==key)) return '';
  return `<div class="tutor-wait"><div role="status">El profesor está preparando tu guía.</div><p class="quiet">${['ollama','compatible'].includes(data.state.aiModel?.provider)?'La primera respuesta de un modelo local puede tardar mientras se carga.':''}</p><div class="tutor-wait-actions"><span class="tutor-elapsed" data-started-at="${request?.startedAt || Date.now()}" aria-hidden="true" data-preserve-text>${elapsedLabel(request?.startedAt || Date.now())}</span>${request?button('cancelTutor',request.cancelRequested || ui.cancellingRequest===request.id?'Cancelando…':'Cancelar consulta',`data-request-id="${escape(request.id)}"`+disabled(request.cancelRequested || ui.cancellingRequest===request.id)):''}</div></div>`;
}
setInterval(()=>{for(const el of app.querySelectorAll('.tutor-elapsed')){el.textContent=elapsedLabel(el.dataset.startedAt);}},1000);

function chatView(turns, { inputId, action, value, locked, model, conceptual = false }) {
  const key = chatKey();
  const pending = pendingChat?.key === key ? pendingChat : null;
  const recorded = pending && pending.wasBusy && (!pending.requestId || turns.at(-1)?.requestId===pending.requestId) && turns.at(-2)?.role === 'student' && turns.at(-2).text === pending.text;
  const messages = pending && !recorded ? [...turns, { role:'student', text:pending.text, pending:true }] : turns;
  return `<section class="teacher-chat" aria-label="Chat con el profesor">
    <header class="chat-header"><div class="chat-teacher"><div>${icon('spark')}<strong>Profesor</strong></div><span data-preserve-text>${escape(model?.name || (data.language==='en'?'General guidance':'Orientación general'))}</span></div>${button(model?'disconnectAI':'connectAI',model?'Desconectar IA':'Conectar IA',disabled(data.busy))}</header>
    ${conceptual?'<p class="chat-mode">Ayuda conceptual: pregunta sin registrar un intento. Las pistas del reto siguen bloqueadas.</p>':''}
    <div class="chat-scroll-area"><div class="chat-log dialogue" role="log" aria-label="Conversación con el profesor" aria-live="polite" aria-relevant="additions text" tabindex="0" data-chat-key="${escape(key)}">
      ${messages.length ? messages.map(turn => `<article class="turn ${turn.role === 'student' ? 'student' : 'professor'}"><strong>${turn.role === 'student' ? 'Tú' : 'Profesor'}</strong><p>${escape(turn.text)}</p>${turn.source ? `<small>${escape(turn.source)}</small>` : ''}${turn.pending ? '<small>Enviando…</small>' : ''}</article>`).join('') : data.busyKind==='tutor' ? '' : `<div class="chat-empty">${icon('book')}<h3>Vamos a razonarlo juntos</h3><p>${locked ? 'Registra tu intento para empezar la conversación.' : conceptual ? 'Pregunta por una idea de la lección. Te ayudaré a entenderla con otra situación, sin resolver el reto.' : 'Cuéntame dónde te atascaste o qué quieres comprobar.'}</p></div>`}
      ${data.busyKind === 'tutor' && (!data.tutorRequest || data.tutorRequest.key===key) ? `<article class="turn professor thinking-turn" role="status"><strong>Profesor</strong><p><span>${data.language==='en'?(conceptual?'I am preparing an explanation':'I am thinking about your attempt'):(conceptual?'Estoy preparando una explicación':'Estoy pensando en tu intento')}</span><span class="thinking-dots" aria-hidden="true"><i></i><i></i><i></i></span></p></article>` : ''}
    </div>
    ${button('chatLatest', 'Ir al último mensaje ' + icon('arrow'), 'class="chat-jump" hidden')}</div>
    ${tutorWaitView(key)}
    ${chatError?.key === key ? `<div class="chat-error" role="${chatError.cancelled?'status':'alert'}"><strong>${chatError.cancelled?'Consulta cancelada':'No se pudo enviar'}</strong><p>${escape(chatError.text)}</p></div>` : ''}
    <div class="chat-composer"><label class="sr-only" for="${inputId}">Mensaje para el profesor</label><textarea id="${inputId}" rows="2" maxlength="3000" placeholder="Escribe tu pregunta o cuéntame qué observaste…"${disabled(locked || data.busy || !!pending)}>${escape(value)}</textarea>
      <div class="chat-compose-actions"><small>Enter para enviar · Shift+Enter para nueva línea</small>${button(action, 'Enviar ' + icon('arrow'), 'class="primary chat-send"' + disabled(locked || data.busy || !!pending || !value.trim()))}</div>
    </div>
  </section>`;
}
function sendChat(action) {
  const project = action === 'projectProfessor';
  const input = document.getElementById(project ? 'project-question' : 'question');
  const text = input?.value.trim();
  if (!text || input.disabled || data.busy || pendingChat) return;
  rememberChatScroll();
  chatScroll.set(chatKey(), {top:0, follow:true});
  const log = app.querySelector('.chat-log');
  if (log) log.scrollTop = log.scrollHeight;
  chatError = null;
  pendingChat = {key:chatKey(), text, wasBusy:false};
  const record=data.state.records[data.state.selected] || {};
  send(project ? 'projectProfessor' : (!record.attempt || ui.conceptHelp===chatKey()) ? 'conceptProfessor' : 'professor', {text, ...(project ? {index:ui.projectStage} : {})});
  render();
}
function reconcileChat() {
  if (!pendingChat) return;
  if (data.busy) { pendingChat.wasBusy = true;if(data.tutorRequest?.key===pendingChat.key)pendingChat.requestId=data.tutorRequest.id;return; }
  if (!pendingChat.wasBusy) return;
  const turns = pendingChat.key.startsWith('project:') ? data.state.projectRecords?.[pendingChat.key.slice(8)]?.dialogue : data.state.records[pendingChat.key.slice(8)]?.dialogue;
  if ((!pendingChat.requestId || turns?.at(-1)?.requestId===pendingChat.requestId) && turns?.at(-2)?.role === 'student' && turns.at(-2).text === pendingChat.text) {
    const draftKey = pendingChat.key.startsWith('project:') ? 'project:' + pendingChat.key.slice(8) + ':question' : pendingChat.key.slice(8) + ':question';
    ui.drafts[draftKey] = ''; persist();
    focusMemory = {id:pendingChat.key.startsWith('project:') ? 'project-question' : 'question'};
  }
  pendingChat = null;
}
app.addEventListener('scroll', event => {
  if (!event.target.classList?.contains('chat-log')) return;
  const log = event.target;
  chatScroll.set(log.dataset.chatKey,{top:log.scrollTop,follow:log.scrollHeight-log.clientHeight-log.scrollTop<64});
  updateChatJump(log);
}, true);

function setupView(m, inactive) {
  const setup=data.missionSetup || {stage:!data.workspace?'folder':!data.trusted?'trust':'tools',system:'',shell:data.state.shell==='powershell'?'PowerShell':'bash'};
  const stages=['folder','trust','tools','terminal','files','ready'];
  const labels=['Tu carpeta','Permiso para trabajar','Tu herramienta','Tu terminal','Tu primer archivo'];
  const current=stages.indexOf(setup.stage);
  const installation=m.track==='csharp'?'En la guía de instalación elige .NET SDK 8 o posterior, no solo el runtime.':m.track==='cpp'?'En la guía sigue la preparación de GCC o Clang; esta ruta utiliza C++17.':m.track==='python'?'En la guía de instalación elige Python 3.':'En la guía de instalación elige Node.js.';
  const tool=m.track==='csharp'?'.NET SDK':m.track==='cpp'?'GCC o Clang':m.track==='python'?'Python 3':'Node.js';
  const description=m.track==='csharp'?'El SDK es el kit que incluye el compilador: transforma tus archivos de C# en una aplicación. Necesitas la versión 8 o posterior; instalar solo el runtime no basta.':m.track==='cpp'?'El compilador transforma tus archivos de C++ en un programa. Esta ruta usa GCC o Clang con soporte de C++17.':m.track==='python'?'El intérprete de Python lee y ejecuta tus archivos .py. Esta ruta necesita Python 3.':'Node.js ejecuta tus archivos JavaScript fuera del navegador.';
  return `<section class="practice-setup" aria-label="Preparación de la práctica"><h2 id="setup-start" tabindex="-1">Prepara tu primera práctica</h2><p>Vamos paso a paso. Aquí preparas las herramientas; todavía no tienes que resolver el reto.</p>
    <ol class="setup-progress" aria-label="Pasos de preparación">${labels.map((label,index)=>`<li${current===index?' aria-current="step"':''}><span>${index<current?icon('check'):index+1}</span>${label}</li>`).join('')}</ol>
    ${setup.system?`<p class="quiet">Esta ventana usa: <strong data-preserve-text>${escape(setup.system)}</strong>${setup.folder?` · ${escape(setup.folder)}`:''}</p>`:''}
    <div class="setup-task">${setup.stage==='folder'?`<h3>1. Elige dónde guardarás tu trabajo</h3><p>Una carpeta es el lugar donde guardarás tus archivos. Crea una con un nombre que reconozcas, por ejemplo AImlearning-Practica, y ábrela en VS Code.</p><p>Al pulsar Abrir carpeta aparecerá el selector de tu sistema. Allí puedes crear o elegir tu carpeta y confirmar. Después vuelve a abrir AImlearning.</p>${button('openFolder','Abrir carpeta','class="primary"'+disabled(data.busy || !m.unlocked))}<p class="setup-expected">Qué esperar: el nombre de tu carpeta aparece en VS Code. Los retos se guardarán dentro de aimlearning-projects.</p>`:
    setup.stage==='trust'?`<h3>2. Permite trabajar en tu carpeta</h3><p>VS Code puede abrir una carpeta en modo restringido. Eso permite leer, pero impide crear o ejecutar los retos.</p><p>Si esta es la carpeta de práctica que tú creaste y conoces sus archivos, abre la gestión de confianza y permite trabajar en ella. La extensión no cambia ese permiso por ti.</p>${button('manageTrust','Revisar confianza de la carpeta','class="primary"'+disabled(data.busy))}<p class="setup-expected">Qué esperar: VS Code deja de mostrar Modo restringido y este paso avanza.</p>`:
    setup.stage==='tools'?`<h3>3. Comprueba ${escape(tool)}</h3><p>${description}</p><p>${m.track==='cpp'?'La comprobación consulta la versión instalada en esta ventana y comprueba la compatibilidad con C++17. No instala programas ni ejecuta tu solución.':'La comprobación consulta la versión instalada en esta ventana. No instala programas ni ejecuta tu solución.'}</p>${button('missionTools',data.busyKind==='missionTools'?'Comprobando…':'Comprobar herramienta','class="primary"'+disabled(inactive))}${data.busyKind==='missionTools'?button('cancel','Cancelar comprobación'):''}
    ${setup.report?`<div class="setup-result" role="status"><strong>${setup.report.ready?'Herramienta disponible':'Hay un paso pendiente'}</strong><p>${escape(setup.report.detail)}</p>${setup.report.version?`<code data-preserve-text>${escape(setup.report.version)}</code>`:''}${!setup.report.ready?`<p>Instala la herramienta en el sistema que usa esta ventana: <strong data-preserve-text>${escape(setup.system)}</strong>. Si trabajas en WSL, instalarla solo en Windows no la hace disponible aquí, ni al revés.</p><p>${installation}</p><p>Después de instalar, cierra y abre VS Code y vuelve a comprobar. Si ya la instalaste, revisa la ruta del ejecutable en los ajustes de AImlearning.</p>${button('setupDocs','Abrir guía de instalación')}${button('setupSettings','Revisar ruta de la herramienta')}`:''}</div>`:''}
    <p class="setup-expected">Qué esperar: verás la versión detectada y pasarás a preparar la terminal.</p>`:
    setup.stage==='terminal'?`<h3>4. Reconoce tu terminal</h3><p>La terminal es un panel donde escribes comandos y observas resultados. En esta preparación abriremos un perfil compatible con los comandos de tu ruta.</p><p>Perfil elegido para esta ventana: <strong data-preserve-text>${escape(setup.shell)}</strong>. No necesitas escoger entre PowerShell, CMD y bash para empezar.</p>${setup.report?.version?`<p class="quiet">Herramienta comprobada: <code data-preserve-text>${escape(setup.report.version)}</code></p>`:''}${button('setupTerminal','Abrir terminal guiada','class="primary"'+disabled(inactive))}<p class="setup-expected">Qué esperar: aparece el panel Terminal con una pestaña AImlearning · preparación y un cursor para escribir. Aún no se envía ningún comando.</p>`:
    `<h3>5. Abre tu primer archivo</h3><p>La carpeta, la herramienta y la terminal están preparadas. Ahora crearemos los archivos iniciales y abriremos ${escape(data.tracks.find(t=>t.id===m.track)?.filename || '')} en el editor.</p><p>Ese archivo es donde escribirás tu intento. Guarda con Ctrl+S o Cmd+S antes de comprobarlo. La estructura inicial no contiene la solución.</p>${button('create',data.exists?'Abrir mi código':'Crear y abrir mi archivo','class="primary"'+disabled(inactive))}<p class="setup-expected">Qué esperar: el archivo se abre en una pestaña del editor. En Terminal encontrarás los comandos explicados para compilar o ejecutar.</p>`}</div></section>`;
}

function foundationLearn(m, inactive) {
  return `
    <h2 id="lesson-start" tabindex="-1">La idea que vas a practicar</h2><p>${escape(m.lesson)}</p>
    <ul class="concepts">${m.concepts.map(text => `<li>${escape(text)}</li>`).join('')}</ul>
    <div class="foundation-example"><span class="eyebrow">Ejemplo de otra situación</span><h2>${escape(m.example.title)}</h2><p>${escape(m.example.situation)}</p><p>${escape(m.example.reasoning)}</p><strong>${escape(m.example.takeaway)}</strong></div>
    <h2>Tu escenario</h2><p>${escape(m.challenge.situation)}</p>
    <div class="thinking"><span class="thinking-icon">${icon('spark')}</span><div><h3>Piensa antes de elegir</h3><p>${escape(m.question)}</p></div></div>
    <div class="foundation-path"><h3>Cómo avanzar</h3><ol><li>Lee el escenario y detecta qué información o regla importa.</li><li>En Profesor, escribe tu razonamiento antes de ver el resultado.</li><li>En Comprueba, toma una decisión y revisa la pista si necesitas otro intento.</li></ol></div>
    <div class="further-reading"><strong>Para profundizar</strong><p>La lección contiene lo necesario. Este recurso amplía las ideas cuando quieras explorar más.</p>${button('docs', 'Abrir recurso adicional', 'class="text-button"')}</div>
    <div class="actions">${button('lessonReviewed', 'Ya revisé el ejemplo · explicar mi intento ' + icon('arrow'), disabled(inactive))}${button('goConcept','Necesito entender el concepto',disabled(!m.unlocked || data.busy))}</div>`;
}

function foundationReflect(m, r, inactive, next) {
  const selected = draft('choice', r.choice || '');
  return `
    <h2>Comprueba tu razonamiento</h2><p>Primero registra tu idea en Profesor. Después elige una opción. Si no encaja, recibirás una pista para revisarla; puedes intentarlo de nuevo sin perder XP.</p>
    <div class="foundation-challenge"><p>${escape(m.challenge.situation)}</p><fieldset${disabled(inactive || !r.attempt)}><legend>${escape(m.challenge.prompt)}</legend>${m.challenge.options.map(option => `<label class="choice"><input type="radio" name="foundation-choice" value="${escape(option.id)}"${selected === option.id ? ' checked' : ''}><span>${escape(option.label)}</span></label>`).join('')}</fieldset></div>
    ${!r.attempt ? '<p class="banner">Escribe primero tu razonamiento en Profesor; el resultado permanecerá oculto hasta tu intento.</p>' : ''}
    <div class="actions">${button('verify', 'Comprobar mi decisión', 'class="primary"' + disabled(inactive || !r.attempt))}</div>
    ${r.verification ? `<div class="verification ${r.verification.passed ? 'passed' : ''}" role="status"><h3>${r.verification.passed ? 'Tu decisión encaja' : 'Una pista para revisar'}</h3><p>${escape(r.verification.summary)}</p></div>` : '<p class="quiet">Todavía no has comprobado esta decisión.</p>'}
    ${r.verification?.passed && m.transferQuestion?`<h2>Ponlo a prueba en otra situación</h2><p>${escape(m.transferQuestion)}</p><p class="quiet">Incluye tu razonamiento en la reflexión. Se guarda como autoevaluación; no se califica automáticamente.</p>`:''}
    <h2>Lo que te llevas</h2><p>${escape(m.reflection)}</p><label for="reflection">Mi explicación</label><textarea id="reflection" rows="4" maxlength="4000" placeholder="Primero pensé… Luego revisé… Ahora entiendo…"${disabled(inactive)}>${escape(draft('reflection', r.reflection))}</textarea>
    <div class="actions">${button('complete', r.completedAt ? 'Reflexión guardada · misión completada' : `Completar misión · +${m.xp} XP`, 'class="primary"' + disabled(inactive || !r.verification?.passed || !!r.completedAt))}${r.completedAt && next ? button('select', 'Siguiente misión ' + icon('arrow'), `data-id="${next.id}"`) : ''}</div>
    <p class="quiet">Esta decisión comprueba un caso; tu explicación muestra cómo razonaste. Puedes volver a leer la lección cuando quieras.</p>`;
}

function render() {
  if (!data) return;
  if (ui.area === 'projects') return window.renderProjectHub(data, ui, { app, escape, icon, button, disabled, rememberFocus, restoreFocus, draft: projectDraft, nextStepBanner, chatView, fieldError });
  if (ui.area === 'git') return window.renderGitJourney(data, ui, { app, escape, icon, button, disabled, rememberFocus, restoreFocus, tutorWaitView });
  rememberFocus();
  const m = data.missions.find(item => item.id === data.state.selected) || data.missions[0];
  const foundation = m.kind === 'foundation';
  if (foundation && ui.tab === 'terminal') ui.tab = 'learn';
  const r = data.state.records[m.id] || {};
  const track = data.tracks.find(item => item.id === m.track);
  const route = data.missions.filter(item => item.track === m.track);
  const done = route.filter(item => data.state.records[item.id]?.completedAt).length;
  const locked = !m.unlocked;
  const noWork = !data.workspace || !data.trusted;
  const inactive = locked || (!foundation && noWork) || data.busy;
  const next = route[route.findIndex(item => item.id === m.id) + 1] || (foundation ? data.missions.find(item => item.track === 'csharp') : null);
  const brand = `<div class="brand"><img class="brand-logo" src="${escape(document.body.dataset.logoUri || '')}" alt="" aria-hidden="true"><span>AImlearning</span><span class="version">${escape(data.version || '')}</span></div>`;
  const progress = `<div class="progress-label"><span>${done} de ${route.length} misiones</span><strong>${data.xp} XP</strong></div><progress max="${route.length}" value="${done}" aria-label="Progreso de la ruta ${escape(track.name)}"></progress>`;
  if (document.body.classList.contains('sidebar')) {
    app.innerHTML = `<div class="sidebar-content">${brand}<h1>Tu siguiente paso.</h1><p>${escape(data.nextMission?.title || m.title)}</p>${progress}<h2>${escape(m.title)}</h2><p>${escape(m.topic)}</p>${button('open', `Continuar aprendiendo ${icon('arrow')}`, 'class="primary"')}<p class="quiet">${escape(data.nextMission?.detail || '')}</p><div class="rank">${icon('trophy')} ${escape(data.rank)}</div></div>`;
    restoreFocus();
    return;
  }
  app.innerHTML = `
    <header class="topbar${ui.tab==='professor'?' professor-topbar':''}">${brand}<nav class="area-switch" aria-label="Secciones de AImlearning"><button data-action="areaMissions" aria-current="page">Misiones</button><button data-action="areaProjects">Proyectos reales</button><button data-action="areaGit">Git</button></nav><div class="identity"><span class="rank">${icon('trophy')}${escape(data.rank)}</span><strong>${data.xp} XP</strong></div></header>
    <div class="academy${ui.tab==='professor'?' professor-mode':''}">
      <aside class="route${ui.routeExpanded?' expanded':''}" aria-label="Ruta de aprendizaje">
        ${button('toggleRoute','Ver mi ruta: '+escape(track.name),`class="route-toggle" aria-expanded="${Boolean(ui.routeExpanded)}" aria-controls="mission-route"`)}
        <div id="mission-route" class="route-content"><label for="track">Tu ruta</label>
        <select id="track"${disabled(data.busy)}>${data.tracks.map(t => `<option value="${t.id}"${t.id === track.id ? ' selected' : ''}${t.id !== 'foundations' && !data.foundationReady ? ' disabled' : ''}>${escape(t.name)} · ${escape(t.project)}${t.id !== 'foundations' && !data.foundationReady ? ' · tras las bases' : ''}</option>`).join('')}</select>
        <p class="route-intro">${escape(track.description)}</p>
        ${progress}
        <nav aria-label="Misiones"><ol class="mission-list">${route.map((item, index) => {
          const complete = data.state.records[item.id]?.completedAt;
          return `<li><button class="mission${item.id === m.id ? ' selected' : ''}${complete ? ' completed' : ''}" data-action="select" data-id="${item.id}" aria-current="${item.id === m.id ? 'step' : 'false'}"${disabled(data.busy)}><span class="step">${complete ? icon('check') : !item.unlocked ? icon('lock') : String(index + 1).padStart(2, '0')}</span><span><strong>${escape(item.title)}</strong><small>${escape(item.topic)}</small><span class="sr-only">${complete ? 'Completada' : !item.unlocked ? 'Bloqueada' : 'Disponible'}</span></span></button></li>`;
        }).join('')}</ol></nav>
        <details class="achievements"><summary>${icon('trophy')} Tus logros <span>${data.badges.filter(b => b.earned).length}/${data.badges.length}</span></summary><ul>${data.badges.map(b => `<li class="${b.earned ? 'earned' : ''}">${icon(b.earned ? 'check' : 'lock')}<span><strong>${escape(b.name)}</strong><small>${escape(b.detail)}</small></span></li>`).join('')}</ul></details>
        <p class="quiet principle">Pedir una pista es aprender.<br>Tu progreso no se pierde por equivocarte.</p></div>
      </aside>
      <main>
        ${foundation || ui.tab==='professor' || (!r.lessonReviewedAt && !r.attempt) ? '' : !data.workspace ? `<div class="banner"><strong>Primero, tu espacio de práctica</strong><p>Abre una carpeta vacía para guardar tus proyectos y tu progreso.</p>${button('goSetup', 'Preparar mi entorno')}</div>` : !data.trusted ? '<div class="banner"><strong>Carpeta en modo restringido</strong><p>Puedes leer las lecciones. Para crear o ejecutar tus proyectos, habilita la confianza de tu carpeta en VS Code.</p></div>' : ''}
        ${locked ? '<div class="banner"><strong>Un paso a la vez</strong><p>Puedes explorar esta lección. Completa la misión anterior para comenzar el reto.</p></div>' : ''}
        ${ui.tab==='professor'?`<div class="mission-header professor-mission-header"><h1>${escape(m.title)}</h1><details class="mission-context"><summary>Objetivo y siguiente paso</summary><p>${escape(m.goal)}</p>${nextStepBanner(data.nextMission,data.busy)}</details></div>`:`<div class="mission-header"><h1>${escape(m.title)}</h1><div class="mission-meta"><span>${escape(track.name)}</span><span>${escape(m.topic)}</span><span>${r.completedAt ? 'Completada' : '+' + m.xp + ' XP al completar'}</span></div><p class="goal">${escape(m.goal)}</p>${foundation || !data.exists ? '' : `<div class="actions header-actions">${button('create', 'Abrir mi código ' + icon('arrow'), disabled(inactive))}</div>`}</div>
        ${nextStepBanner(data.nextMission, data.busy)}
`}
        <div class="tabs" role="tablist" aria-label="Pasos de la misión">${(foundation ? [['learn', 'book', 'Aprende'], ['professor', 'spark', 'Profesor'], ['reflect', 'check', 'Comprueba']] : [['learn', 'book', 'Aprende'], ['terminal', 'terminal', 'Terminal'], ['professor', 'spark', 'Profesor'], ['reflect', 'check', 'Comprueba']]).map(([id, glyph, label]) => `<button role="tab" id="tab-${id}" aria-controls="panel-${id}" aria-selected="${ui.tab === id}" tabindex="${ui.tab === id ? 0 : -1}" data-tab="${id}">${icon(glyph)}${label}</button>`).join('')}</div>
        <section class="tab-content" role="tabpanel" id="panel-${ui.tab}" aria-labelledby="tab-${ui.tab}" tabindex="0">
          ${ui.tab === 'learn' ? foundation ? foundationLearn(m, inactive) : `
            <h2 id="lesson-start" tabindex="-1">La idea que vas a practicar</h2><p>${escape(m.lesson)}</p>
            <ul class="concepts">${m.concepts.map(c => `<li>${escape(c)}</li>`).join('')}</ul>
            <h2>Un ejemplo antes de tu reto</h2>
            <p>${escape(m.example.intro)}</p>
            <div class="worked-example" aria-label="Ejemplo guiado de un problema distinto al reto">
              <strong>En ${escape(track.filename)}</strong>
              <pre><code>${escape(m.example.code)}</code></pre>
              <div class="example-run">${m.example.input ? `<div><strong>Si escribes esta entrada</strong><pre><code>${escape(m.example.input)}</code></pre></div>` : '<p class="quiet">Este ejemplo no necesita entrada.</p>'}<div><strong>Verás esta salida</strong><pre><code>${escape(m.example.output)}</code></pre></div></div>
            </div>
            <p class="example-explanation">${escape(m.example.explanation)}</p>
            <h2>Qué se espera de tu programa</h2>${data.language === 'en' ? '<p class="quiet">Use the exact output strings, filenames and command arguments shown below, including Spanish words when specified.</p>' : ''}<ul class="requirements">${m.requirements.map(text => `<li>${escape(text)}</li>`).join('')}</ul>
            <h2>Del ejemplo a tu reto</h2>
            <p class="quiet">Estas son las piezas que necesitas y una forma de pensar cómo unirlas. Tú decides y escribes la implementación.</p>
            <div class="code-guidance"><div><h3>Qué código te puede servir</h3><p>${escape(m.guidance.tools)}</p></div><div><h3>Cómo llevarlo a este ejercicio</h3><p>${escape(m.guidance.path)}</p></div><div><h3>Cómo saber si vas bien</h3><p>${escape(m.guidance.check)}</p></div></div>
            <h2>Por dónde empezar</h2><ol class="start-steps">${m.example.steps.map(text => `<li>${escape(text)}</li>`).join('')}</ol>
            <div class="thinking"><span class="thinking-icon">${icon('spark')}</span><div><h3>Antes de escribir código</h3><p>${escape(m.question)}</p></div></div>
            <div class="further-reading"><strong>Para profundizar</strong><p>La documentación oficial amplía estos conceptos cuando quieras explorar más detalles.</p>${button('docs', 'Abrir documentación oficial', 'class="text-button"')}</div>
            <div class="actions">${button('lessonReviewed', data.exists ? 'Ya revisé el ejemplo · explicar mi intento' : 'Ya revisé el ejemplo · preparar mi práctica', disabled(locked || data.busy))}${button('goConcept','Necesito entender el concepto',disabled(locked || data.busy))}</div>
            <p class="quiet">${data.exists ? 'Tu proyecto permanece en aimlearning-projects/' + m.id + '. Edita y guarda tus archivos desde VS Code.' : 'Se crea una carpeta para esta misión. Si ya completaste otra, se reutiliza tu propio código sin cambiar el proyecto anterior.'}</p>
          ` : ''}
          ${ui.tab === 'terminal' ? `
            ${!data.exists || ui.setupOpen ? setupView(m, inactive) : ''}
            ${data.exists ? `<div class="actions">${button('goSetup','Revisar preparación')}${ui.setupOpen ? button('closeSetup','Volver a los comandos') : ''}</div>` : ''}
            ${data.exists && !ui.setupOpen ? `
            <h2>Conoce tus herramientas</h2><p>La terminal es parte de tu aprendizaje. Lee qué hace cada comando, predice el resultado y ejecútalo tú.</p>
            <div class="terminal-controls"><label for="shell">Sintaxis de tu terminal</label><select id="shell"${disabled(data.busy)}>${[['powershell', 'PowerShell'], ['cmd', 'CMD · Windows'], ['bash', 'bash / zsh']].map(([id, text]) => `<option value="${id}"${data.state.shell === id ? ' selected' : ''}>${text}</option>`).join('')}</select>${button('terminal', icon('terminal') + ' Abrir terminal de VS Code', disabled(inactive))}</div>
            <p class="quiet">También puedes copiar los comandos a la terminal de tu sistema. La selección cambia la sintaxis de la guía. Usa el perfil correspondiente al ejecutar los comandos.</p>
            ${!data.exists ? `<div class="banner"><p>Crea primero los archivos de la misión.</p>${button('create', 'Crear mi proyecto', disabled(inactive))}</div>` : ''}
            ${data.guideError ? `<p role="alert">${escape(data.guideError)}</p>` : ''}
            <ol class="commands">${data.commands.map((c, index) => `<li><h3>${escape(c.title)}</h3><p>${escape(c.why)}</p><div class="command"><code>${escape(c.command)}</code>${button('copy', icon('copy'), `data-index="${index}" aria-label="Copiar: ${escape(c.title)}"` + disabled(!data.exists))}</div></li>`).join('')}</ol>
            <details class="setup"><summary>¿Falta el compilador o intérprete?</summary><p>${escape(({ csharp: 'Instala el SDK de .NET 8 o posterior, no solo el runtime. Reinicia VS Code y comprueba dotnet --version.', cpp: 'Instala GCC o Clang. En Windows puedes usar MSYS2 o abrir la carpeta en WSL. Configura aimlearning.cppCompiler si necesitas otra ruta.', python: 'Instala Python 3. Comprueba python --version en Windows o python3 --version en Linux/WSL. Si Python solo está en WSL, abre esta carpeta con VS Code en WSL. Puedes ajustar aimlearning.pythonPath.', javascript: 'Instala Node.js y reinicia VS Code. Comprueba node --version. Si está en otra ruta, configura aimlearning.nodePath.' })[m.track])}</p>${button('setupDocs', 'Ver instrucciones de instalación', `data-track="${m.track}"`)}</details>
            ` : ''}
          ` : ''}
          ${ui.tab === 'professor' ? `
            <div class="attempt-summary"><span>${r.attempt?'<strong>Intento registrado</strong><small class="attempt-preview" data-preserve-text>'+escape(r.attempt)+'</small>':'Todavía no has registrado un intento.'}</span>${button(!foundation && noWork?'goSetup':'editAttempt',!foundation && noWork?'Preparar mi entorno':r.attempt?'Revisar o editar mi intento':'Explicar mi intento',disabled(locked || data.busy))}</div>
            ${chatView(r.dialogue || [], {inputId:'question',action:'professor',value:draft('question'),locked:locked || data.busy,model:data.state.aiModel,conceptual:!r.attempt || ui.conceptHelp===chatKey()})}
            <div class="teacher-actions">${button('hint','Pedir una pista',disabled(inactive || !r.attempt))}${r.attempt?button('goConcept','Necesito entender el concepto',disabled(locked || data.busy)):''}${r.attempt && ui.conceptHelp===chatKey()?button('attemptChat','Hablar sobre mi intento',disabled(inactive)):''}</div>
            <details id="attempt-details" class="attempt-details"${ui.attemptOpen===chatKey()?' open':''}><summary>${r.attempt?'Mi intento guardado':'Preparar mi intento'}</summary>
              <h2>Cuéntame cómo lo estás pensando</h2><p>${foundation?'Explica tu criterio con tus palabras. No necesitas escribir ni ejecutar código.':'Un intento puede ser código o una idea razonada. No hace falta que compile para pedir ayuda.'}</p>
              <p id="attempt-help">${foundation?'Escribe al menos 40 caracteres. Cuenta una idea y qué te hace pensar eso; no tiene que ser correcta.':'Escribe al menos 15 caracteres. Cuenta tu idea o lo que probaste y observaste; no hace falta que compile.'}</p>
              <p class="quiet">Para empezar: ¿qué entiendes?, ¿qué esperabas?, ¿en qué parte te pierdes?</p>
              <label for="attempt">Mi intento y lo que observé</label><textarea id="attempt" rows="4" maxlength="4000" data-minimum="${foundation?40:15}" aria-describedby="attempt-help attempt-count attempt-error" aria-invalid="${fieldErrors.has(chatKey()+':attempt')}" placeholder="Creo que necesito… Intenté… Esperaba… pero observé…"${disabled(inactive)}>${escape(draft('attempt',r.attempt))}</textarea>
              <p id="attempt-count" class="quiet" data-preserve-text>${attemptCount(draft('attempt',r.attempt || ''),foundation?40:15)}</p>${fieldError('attempt')}
              <div class="actions">${button('attempt',r.attempt?'Actualizar mi intento':'Registrar mi intento','class="primary"'+disabled(inactive))}</div>
            </details>
            <details class="teacher-settings"><summary>Qué comparte el profesor</summary><p>En ayuda conceptual se envían tu pregunta, la lección, su ejemplo y los últimos mensajes conceptuales. No se envían el contrato del reto, pruebas ni archivos.</p><p>${data.state.aiModel ? data.state.aiModel.provider === 'laya' ? 'Laya no genera respuestas. Conecta un modelo generativo para recibir orientación de IA.' : foundation ? 'Al pedir orientación o una pista se envían tu razonamiento, pregunta y resultados de esta actividad. No hay archivos de código en esta etapa.' : (['ollama', 'compatible'].includes(data.state.aiModel.provider) ? 'Al pedir orientación o una pista, el contexto y código de esta misión van a tu servidor en localhost. Comprueba si ese servidor usa modelos locales o reenvía solicitudes a la nube.' : 'Al pedir orientación o una pista se envían tu intento, pregunta, resultados y código de esta misión al proveedor elegido. El tutor devuelve orientación revisada, sin editar tus archivos.') : 'Sin IA recibirás orientación general. Con una IA conectada, las guías y pistas las genera ese modelo a partir de tu intento.'}</p></details>
            <details class="setup"><summary>Cómo conectar una IA local</summary><p><strong>Ollama:</strong> inicia el servidor. En la terminal usa ollama list para ver tus modelos; si no hay ninguno, descarga uno con ollama pull NOMBRE_DEL_MODELO. Después elige Ollama local en Conectar IA y selecciona el modelo encontrado.</p><p><strong>LM Studio u otro servidor compatible:</strong> carga un modelo y activa su servidor local. Introduce su dirección terminada en /v1. Si usas OpenCode con Ollama o LM Studio, selecciona aquí ese mismo servidor y modelo.</p></details>
          ` : ''}
          ${ui.tab === 'reflect' ? foundation ? foundationReflect(m, r, inactive, next) : `
            <h2>Comprueba tu razonamiento</h2><p>${m.track === 'python' || m.track === 'javascript' ? 'Se revisará la sintaxis de tu script' : 'Se compilará tu proyecto'} y se ejecutarán ${m.testCount} grupos de pruebas. Se evalúa el comportamiento: puedes usar un enfoque diferente.</p>
            ${!r.attempt ? '<p class="banner">Registra primero tu intento en Profesor para habilitar la comprobación.</p>' : ''}
            <div class="actions">${button('verify', data.busy ? 'Comprobando…' : 'Comprobar en la terminal', 'class="primary"' + disabled(inactive || !r.attempt || !data.exists))}${data.busy ? button('cancel', 'Cancelar') : ''}</div>
            ${r.verification ? `<div class="verification ${r.verification.passed ? 'passed' : ''}" role="status"><h3>${r.verification.passed ? 'Tu intento superó estas pruebas' : 'Un resultado para investigar'}</h3><p>${escape(r.verification.summary)}</p><ul class="case-list">${(r.verification.cases || []).map(c => `<li>${icon(c.passed ? 'check' : 'arrow')}<span><strong>${escape(c.name)}</strong>${c.detail ? `<small>${escape(c.detail)}</small>` : ''}</span></li>`).join('')}</ul></div>` : '<p class="quiet">Todavía no hay una comprobación para esta misión. Los errores te dan información; no te quitan XP.</p>'}
            ${r.verification?.passed && m.transferQuestion?`<h2>Ponlo a prueba en otra situación</h2><p>${escape(m.transferQuestion)}</p><p class="quiet">Incluye tu razonamiento en la reflexión. Se guarda como autoevaluación; no se califica automáticamente.</p>`:''}
    <h2>Lo que te llevas</h2><p>${escape(m.reflection)}</p><label for="reflection">Mi explicación</label><textarea id="reflection" rows="4" maxlength="4000" placeholder="Mi enfoque fue… Lo comprobé con… Ahora entiendo…"${disabled(inactive)}>${escape(draft('reflection', r.reflection))}</textarea>
            <div class="actions">${button('complete', r.completedAt ? 'Reflexión guardada · misión completada' : `Completar misión · +${m.xp} XP`, 'class="primary"' + disabled(inactive || !r.verification?.passed || !!r.completedAt))}${r.completedAt && next ? button('select', 'Siguiente misión ' + icon('arrow'), `data-id="${next.id}"`) : ''}</div>
            <p class="quiet">Las pruebas comprueban casos concretos. Tu reflexión se registra como autoevaluación; no certifica dominio por sí sola.</p>
          ` : ''}
        </section>
        <footer>${foundation ? 'Primero comprende. Luego construye.' : 'Tu código. Tu razonamiento. Tu siguiente paso.'}<span>${escape(track.name)} · ${route.length} misiones</span></footer>
      </main>
    </div>`;
  restoreFocus();
}
app.addEventListener('input', event => {
  const inlineError=document.getElementById(event.target.id+'-error');
  if(inlineError && event.target.id!=='attempt') {fieldErrors.delete(chatKey()+':'+event.target.id);inlineError.hidden=true;event.target.setAttribute('aria-invalid','false');}
  if (event.target.id==='attempt') {
    document.getElementById('attempt-count').textContent=attemptCount(event.target.value,Number(event.target.dataset.minimum));
    fieldErrors.delete(chatKey()+':attempt');event.target.setAttribute('aria-invalid','false');document.getElementById('attempt-error').hidden=true;
  }
  if (event.target.closest('.chat-composer')) {
    const control = event.target.closest('.chat-composer').querySelector('.chat-send');
    if (control) control.disabled = event.target.disabled || !event.target.value.trim();
  }
  if (ui.area === 'git' && event.target.id === 'git-attempt') {
    const step = data.gitSteps[ui.gitStep];
    if (step) { ui.drafts['git:' + step.id] = event.target.value; persist(); }
    return;
  }
  if (ui.area === 'projects') {
    const id = data.state.projectSelected;
    const keys = { 'project-note': id + ':note:' + ui.projectStage, 'project-question': id + ':question', 'project-pr': id + ':pr', 'project-reflection': id + ':reflection' };
    if (/^manual-note-\d+$/.test(event.target.id)) keys[event.target.id] = id + ':manual:' + event.target.id.slice('manual-note-'.length);
    if (keys[event.target.id]) { ui.drafts['project:' + keys[event.target.id]] = event.target.value; persist(); }
    return;
  }
  if (['attempt', 'question', 'reflection'].includes(event.target.id)) {
    ui.drafts[data.state.selected + ':' + event.target.id] = event.target.value;
    persist();
  }
});
app.addEventListener('change', event => {
  if (event.target.id === 'language') return send('language', { value: event.target.value });
  if (event.target.name === 'foundation-choice') {
    ui.drafts[data.state.selected + ':choice'] = event.target.value;
    persist();
  }
  if (event.target.id === 'track') {
    const route = data.missions.filter(m => m.track === event.target.value);
    const selected = route.find(m => m.unlocked && !data.state.records[m.id]?.completedAt) || route[0];
    ui.tab = 'learn'; persist(); send('select', { id: selected.id });
  }
  if (event.target.id === 'shell') send('shell', { value: event.target.value });
  if (event.target.id === 'project-shell') send('shell', { value: event.target.value });
  if (event.target.id === 'project-track') {
    const selected = data.projects.find(project => project.track === event.target.value);
    if (selected) { ui.projectTab = 'overview'; ui.projectStage = 0; persist(); send('projectSelect', { id: selected.id }); }
  }
});
app.addEventListener('click', event => {
  if (event.target.closest('[data-action="chatLatest"]')) {
    const log = app.querySelector('.chat-log');
    if (log) { log.scrollTop = log.scrollHeight; chatScroll.set(log.dataset.chatKey,{top:log.scrollTop,follow:true}); updateChatJump(log); }
    return;
  }
  const projectTab = event.target.closest('[data-project-tab]');
  if (projectTab) { ui.projectTab = projectTab.dataset.projectTab; persist(); render(); document.getElementById('project-tab-' + ui.projectTab).focus(); return; }
  const tab = event.target.closest('[data-tab]');
  if (tab) { ui.tab = tab.dataset.tab; persist(); render(); document.getElementById('tab-' + ui.tab).focus(); return; }
  const el = event.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const action = el.dataset.action;
  if(action==='cancelTutor'){ui.cancellingRequest=el.dataset.requestId;send('cancelTutor',{requestId:el.dataset.requestId});render();return;}
  if (action==='toggleRoute') {ui.routeExpanded=!ui.routeExpanded;persist();render();return;}
  if (action==='editAttempt') {openAttempt();return;}
  if (action==='attemptChat') {ui.conceptHelp=null;persist();render();focusChat();return;}
  if (action==='goConcept') {ui.tab='professor';ui.conceptHelp=chatKey();if(!draft('question').trim())ui.drafts[data.state.selected+':question']=data.language==='en'?'I need to understand the lesson concept. Can you explain it using another situation?':'Necesito entender el concepto de la lección. ¿Puedes explicarlo con otra situación?';persist();render();focusChat();return;}
  if (action === 'areaProjects' || action === 'areaMissions' || action === 'areaGit') { ui.area = action === 'areaProjects' ? 'projects' : action === 'areaGit' ? 'git' : 'missions'; persist(); render(); return; }
  if (action === 'gitStage' || action === 'gitNext') { ui.gitStep = action === 'gitNext' ? Math.min(ui.gitStep + 1, data.gitSteps.length - 1) : Number(el.dataset.index); persist(); render(); return; }
  if (action === 'gitCopy') return send(action, { step: Number(el.dataset.step), index: Number(el.dataset.index) });
  if (action === 'gitAttempt') return send(action, { step: ui.gitStep, text: document.getElementById('git-attempt').value });
  if (action === 'gitHint' || action === 'gitCheck') return send(action, { step: ui.gitStep });
  if (action === 'projectStageTab') { ui.projectTab = 'stages'; if (el.dataset.index) ui.projectStage = Number(el.dataset.index); persist(); render(); document.getElementById('project-panel-stages').focus(); return; }
  if (action === 'projectReviewTab') { ui.projectTab = 'review'; persist(); render(); document.getElementById('project-panel-review').focus(); return; }
  if (action === 'projectStage') { ui.projectStage = Number(el.dataset.index); persist(); render(); return; }
  if (action === 'projectSelect') { ui.projectTab = 'overview'; ui.projectStage = 0; persist(); send(action, { id: el.dataset.id }); return; }
  if (action === 'projectCopy' || action === 'projectDocs' || action === 'projectHint') return send(action, { index: Number(el.dataset.index ?? ui.projectStage) });
  if (action === 'projectMilestone') return send(action, { index: ui.projectStage, text: document.getElementById('project-note').value });
  if (action === 'projectProfessor') return sendChat(action);
  if (action === 'projectManualCheck') {
    const index = Number(el.dataset.index);
    return send(action, { index, status: document.getElementById('manual-status-' + index).value, note: document.getElementById('manual-note-' + index).value });
  }
  if (action === 'projectCheck') return send(action, { pullRequestUrl: document.getElementById('project-pr')?.value || '' });
  if (action === 'projectComplete') return send(action, { reflection: document.getElementById('project-reflection').value });
  if (action === 'goLearn') { ui.tab='learn';persist();render();const start=document.getElementById('lesson-start');start?.focus();start?.scrollIntoView({block:'start'});return; }
  if (action === 'lessonReviewed') { send('lessonReviewed');ui.tab=data.missions.find(item=>item.id===data.state.selected)?.kind==='foundation'?'professor':!data.exists?'terminal':'professor';ui.setupOpen=!data.exists && ui.tab==='terminal';persist();render();if(ui.tab==='professor' && !data.state.records[data.state.selected]?.attempt){openAttempt();return;}const start=document.getElementById(ui.tab==='terminal'?'setup-start':'panel-professor');start?.focus();start?.scrollIntoView({block:'start'});return; }
  if (action === 'goSetup') { ui.tab='terminal';ui.setupOpen=true;persist();render();const start=document.getElementById('setup-start');start?.focus();start?.scrollIntoView({block:'start'});return; }
  if (action === 'closeSetup') { ui.setupOpen=false;persist();render();return; }
  if (action === 'create') { ui.setupOpen=false;persist();send(action);return; }
  if (action === 'goTerminal') { ui.tab = 'terminal'; persist(); render(); document.getElementById('panel-terminal').focus(); return; }
  if (action === 'goProfessor' || action === 'goReflect') { ui.tab = action === 'goProfessor' ? 'professor' : 'reflect'; persist(); render(); if(ui.tab==='professor' && !data.state.records[data.state.selected]?.attempt && !document.getElementById('attempt')?.disabled){openAttempt();return;}document.getElementById('panel-' + ui.tab).focus(); return; }
  if (action === 'select') { ui.tab = 'learn'; persist(); send(action, { id: el.dataset.id }); return; }
  if (action === 'copy') return send(action, { index: Number(el.dataset.index) });
  if (action === 'attempt') {
    const input=document.getElementById('attempt'),minimum=Number(input.dataset.minimum);
    if(input.value.trim().length<minimum) {
      fieldErrors.set(chatKey()+':attempt',data.language==='en'?`Write at least ${minimum} characters: describe one idea and what you expected or did not understand.`:`Escribe al menos ${minimum} caracteres: cuenta una idea y lo que esperabas o no entendiste.`);
      ui.attemptOpen=chatKey();persist();render();document.getElementById('attempt')?.focus();return;
    }
    return send(action,{text:input.value});
  }
  if (action === 'complete') return send(action, { text: document.getElementById('reflection').value });
  if (action === 'verify' && data.missions.find(item => item.id === data.state.selected)?.kind === 'foundation') return send(action, { choice: document.querySelector('input[name="foundation-choice"]:checked')?.value || '' });
  if (action === 'professor' || action === 'professorAI') return sendChat('professor');
  send(action);
});
app.addEventListener('keydown', event => {
  if (event.target.closest('.chat-composer') && event.target.tagName === 'TEXTAREA') {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); sendChat(event.target.id === 'project-question' ? 'projectProfessor' : 'professor'); }
    return;
  }
  if (event.target.getAttribute('role') !== 'tab') return;
  if (event.target.dataset.projectTab) {
    const tabs = ['overview', 'stages', 'terminal', 'review'];
    const current = tabs.indexOf(ui.projectTab);
    const index = event.key === 'ArrowRight' ? (current + 1) % tabs.length : event.key === 'ArrowLeft' ? (current + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
    if (index < 0) return;
    event.preventDefault(); ui.projectTab = tabs[index]; persist(); render(); document.getElementById('project-tab-' + ui.projectTab).focus(); return;
  }
  const tabs = data.missions.find(item => item.id === data.state.selected)?.kind === 'foundation' ? ['learn', 'professor', 'reflect'] : ['learn', 'terminal', 'professor', 'reflect'];
  const current = tabs.indexOf(ui.tab);
  const index = event.key === 'ArrowRight' ? (current + 1) % tabs.length : event.key === 'ArrowLeft' ? (current + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
  if (index < 0) return;
  event.preventDefault(); ui.tab = tabs[index]; persist(); render(); document.getElementById('tab-' + ui.tab).focus();
});
app.addEventListener('toggle',event=>{if(event.target.id==='attempt-details' && event.target.isConnected){ui.attemptOpen=event.target.open?chatKey():null;persist();}},true);
let noticeTimer;
window.addEventListener('message', event => {
  if (event.data.type === 'state') { data = event.data.data; reconcileChat(); render(); }
  if(event.data.type==='tutorCancelled') {
    if(data.tutorRequest && data.tutorRequest.id!==event.data.requestId)return;
    if(pendingChat && pendingChat.requestId!==event.data.requestId)return;
    ui.cancellingRequest=null;
    if(event.data.key===chatKey()) {pendingChat=null;chatError={key:chatKey(),text:event.data.text,cancelled:true};focusMemory={id:ui.area==='projects'?'project-question':'question'};render();}
    else if(event.data.key==='git' && ui.area==='git'){notice.textContent=event.data.text;notice.className='visible info';app.querySelector('[data-action="gitHint"]')?.focus();}
  }
  if (event.data.type === 'notice') {
    const info=event.data;
    if (info.kind==='error' && info.field && (!info.key || info.key===chatKey()) && document.getElementById(info.field) && document.getElementById(info.field+'-error')) {
      fieldErrors.set(chatKey()+':'+info.field,info.text);
      if(info.field==='attempt')ui.attemptOpen=chatKey();
      render();const input=document.getElementById(info.field);input.setAttribute('aria-invalid','true');input.focus();notice.className='';return;
    }
    if (info.action==='attempt' && info.kind==='success' && info.key===chatKey()) {
      fieldErrors.delete(chatKey()+':attempt');ui.attemptOpen=null;ui.conceptHelp=null;persist();render();focusChat();return;
    }
    const chatFailure=['professor','conceptProfessor','hint','projectProfessor','projectHint'].includes(info.action) || (!info.action && pendingChat?.key===chatKey());
    if (info.kind === 'error' && chatFailure && (!info.key || info.key===chatKey()) && app.querySelector('.teacher-chat')) {
      pendingChat = null; chatError = {key:chatKey(),text:info.text};
      notice.className = ''; render(); return;
    }
    notice.textContent = event.data.text;
    notice.className = 'visible ' + event.data.kind;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { notice.className = ''; }, 12000);
  }
});
send('ready');
