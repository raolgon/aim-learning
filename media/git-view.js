'use strict';

window.renderGitJourney = function renderGitJourney(data, ui, helpers) {
  const { app, escape: e, icon, button, disabled, rememberFocus, restoreFocus } = helpers;
  rememberFocus();
  const steps = data.gitSteps || [];
  const records = data.state.gitRecords?.steps || {};
  const done = steps.filter(step => records[step.id]?.completedAt).length;
  const requested = Math.max(0, Math.min(Number(ui.gitStep) || 0, steps.length - 1));
  const step = steps[requested];
  if (!step) return;
  const record = records[step.id] || {};
  const accessible = requested === 0 || Boolean(records[steps[requested - 1].id]?.completedAt);
  const canWork = Boolean(data.foundationReady && data.workspace && data.trusted && accessible && !data.busy);
  const brand = `<div class="brand"><img class="brand-logo" src="${e(document.body.dataset.logoUri || '')}" alt="" aria-hidden="true"><span>AImlearning</span><span class="version">${e(data.version || '')}</span></div>`;
  const progress = `<div class="progress-label"><span>${done} de ${steps.length} etapas</span><strong>${data.xp} XP</strong></div><progress max="${steps.length}" value="${done}" aria-label="Progreso de Git"></progress>`;
  if (document.body.classList.contains('sidebar')) {
    app.innerHTML = `<div class="sidebar-content">${brand}<h1>Git antes de GitHub.</h1><p>${e(step.title)}</p>${progress}<p class="quiet">Practica en tu equipo. Tú decides cada commit y cada fusión.</p>${button('open', 'Abrir academia ' + icon('arrow'), 'class="primary"')}</div>`;
    restoreFocus(); return;
  }
  const nav = `<nav class="area-switch" aria-label="Secciones de AImlearning"><button data-action="areaMissions">Misiones</button><button data-action="areaProjects">Proyectos reales</button><button data-action="areaGit" aria-current="page">Git</button></nav>`;
  app.innerHTML = `<header class="topbar">${brand}${nav}<div class="identity"><span class="rank">${icon('trophy')}${e(data.rank)}</span><strong>${data.xp} XP</strong></div></header>
    <div class="academy">
      <aside class="route" aria-label="Ruta de Git"><h2>Git en práctica</h2><p class="route-intro">Una ruta local, independiente del lenguaje, antes de los proyectos finales con GitHub.</p>${progress}
        <nav aria-label="Etapas de Git"><ol class="mission-list">${steps.map((item, index) => `<li><button class="mission${index === requested ? ' selected' : ''}${records[item.id]?.completedAt ? ' completed' : ''}" data-action="gitStage" data-index="${index}" aria-current="${index === requested ? 'step' : 'false'}"${disabled(data.busy)}><span class="step">${records[item.id]?.completedAt ? icon('check') : index > 0 && !records[steps[index - 1].id]?.completedAt ? icon('lock') : index + 1}</span><span><strong>${e(item.title)}</strong><small>${records[item.id]?.completedAt ? 'Comprobado' : index > 0 && !records[steps[index - 1].id]?.completedAt ? 'Después de la etapa anterior' : 'Práctica disponible'}</small></span></button></li>`).join('')}</ol></nav>
        <p class="quiet principle">Esta práctica no crea un remoto ni publica tu trabajo.</p>
      </aside>
      <main>
        ${!data.foundationReady ? '<div class="banner"><strong>Primero, las bases</strong><p>Termina las misiones comunes antes de practicar Git.</p>' + button('areaMissions', 'Ver misiones') + '</div>' : !data.workspace ? '<div class="banner"><strong>Abre una carpeta de práctica</strong><p>La ruta de Git necesita una carpeta para guardar sus archivos y evidencias.</p>' + button('openFolder', 'Abrir carpeta') + '</div>' : !data.trusted ? '<div class="banner"><strong>Carpeta restringida</strong><p>Confía en la carpeta en VS Code antes de crear o revisar un repositorio.</p></div>' : ''}
        ${!accessible ? '<div class="banner"><strong>Etapa bloqueada</strong><p>Completa la anterior. Puedes leer esta lección para prepararte.</p></div>' : ''}
        <div class="mission-header"><h1>Git antes de GitHub</h1><div class="mission-meta"><span>Ruta transversal</span><span>Estado · commits · ramas · revisión</span><span>${data.state.gitRecords?.completedAt ? 'Completada' : '+120 XP al completar'}</span></div><p class="goal">Aprende a observar, versionar e integrar cambios en un repositorio local antes de publicar un proyecto real.</p></div>
        <section class="next-step" aria-label="Tu siguiente paso"><div><strong>Tu siguiente paso</strong><p>${data.gitExists ? record.completedAt ? done === steps.length ? 'Ruta local completada. Ya puedes volver a los proyectos finales.' : 'Elige la siguiente etapa para continuar.' : 'Lee la etapa, realiza la práctica y registra qué observaste.' : 'Prepara una carpeta aislada para tus ensayos de Git.'}</p></div>${!data.gitExists ? button('gitStart', 'Preparar práctica ' + icon('arrow'), disabled(!canWork)) : record.completedAt ? button(done === steps.length ? 'areaProjects' : 'gitNext', done === steps.length ? 'Volver a proyectos' : 'Siguiente etapa', disabled(data.busy)) : button('gitTerminal', 'Abrir terminal ' + icon('arrow'), disabled(!canWork))}</section>
        <article class="git-lesson"><span class="eyebrow">Etapa ${requested + 1} de ${steps.length}</span><h2>${e(step.title)}</h2><p>${e(step.concept)}</p><div class="thinking"><span class="thinking-icon">${icon('spark')}</span><div><h3>Tu práctica</h3><p>${e(step.task)}</p></div></div>
          <p class="quiet">Trabaja solo en <code>aimlearning-projects/git-practice/</code>. Haz tú los cambios y ejecuta los comandos en la terminal de VS Code o del sistema.</p>
          ${requested === 0 ? '<details class="setup"><summary>Si Git pide tu identidad</summary><p>Configura un nombre y correo solo para este repositorio con <code>git config --local user.name "Tu nombre"</code> y <code>git config --local user.email "tu@ejemplo.com"</code>. Sustituye esos valores por los tuyos; esta práctica no los envía a GitHub.</p></details>' : ''}
          ${data.gitExists ? `<div class="actions">${button('gitTerminal', icon('terminal') + ' Abrir terminal de Git', disabled(!canWork))}</div>` : ''}
          <h2>Comandos para explorar</h2><p class="quiet">Son herramientas, no pasos automáticos. Observa la salida después de cada comando; edita los archivos de esta práctica con tus propias palabras.</p><ol class="commands">${step.commands.map((command, index) => `<li><div class="command"><code>${e(command)}</code>${button('gitCopy', icon('copy'), `data-step="${requested}" data-index="${index}" aria-label="Copiar comando ${index + 1}"`)}</div></li>`).join('')}</ol>
          <h2>Qué se comprobará</h2><p>${e(step.evidence)}</p>
          <label for="git-attempt">Qué intentaste y qué observaste</label><textarea id="git-attempt" rows="4" maxlength="4000" placeholder="Primero observé… Después decidí…"${disabled(!canWork)}>${e(ui.drafts?.['git:' + step.id] ?? record.attempt ?? '')}</textarea>
          <div class="actions">${button('gitAttempt', record.attempt ? 'Actualizar mi explicación' : 'Registrar mi intento', disabled(!canWork))}${button('gitHint', 'Pedir una pista', disabled(!canWork || !record.attempt))}${button('gitCheck', data.busyKind === 'git' ? 'Comprobando…' : 'Comprobar mi práctica', 'class="primary"' + disabled(!canWork || !data.gitExists || !record.attempt))}${data.busyKind === 'git' ? button('cancel', 'Cancelar comprobación') : ''}</div>
          ${record.hint && (!data.state.aiModel || record.hintSource?.startsWith('Tutor de IA')) ? `<div class="project-hint" role="status"><strong>Una pista para pensar</strong><p>${e(record.hint)}</p>${record.hintSource ? `<small>${e(record.hintSource)}</small>` : ''}</div>` : ''}
          ${helpers.tutorWaitView('git')}
          ${record.verification ? `<div class="verification ${record.verification.passed ? 'passed' : ''}" role="status"><h3>${record.verification.passed ? 'Evidencia local comprobada' : 'Hay algo que revisar'}</h3>${record.verification.findings?.length ? `<ul>${record.verification.findings.map(item => `<li>${e(item)}</li>`).join('')}</ul>` : '<p>La etapa quedó registrada en esta carpeta.</p>'}${requested === 2 && record.conflictSeen && !record.completedAt ? '<p>Ya observaste el conflicto. Ahora resuélvelo y concluye la fusión.</p>' : ''}</div>` : ''}
          ${requested === 3 ? '<p class="quiet">La extensión inspecciona archivos y commits locales. No ejecuta el workflow de GitHub ni confirma que exista un pull request remoto.</p>' : ''}
        </article><footer><span>AImlearning · Git en práctica</span><span>Observa, decide y explica.</span></footer>
      </main>
    </div>`;
  restoreFocus();
};
