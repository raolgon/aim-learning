'use strict';

window.renderProjectHub = function renderProjectHub(data, ui, helpers) {
  const { app, escape, icon, button, disabled, rememberFocus, restoreFocus, draft, nextStepBanner, chatView } = helpers;
  rememberFocus();
  const project = data.projects.find(item => item.id === data.state.projectSelected) || data.projects[0];
  const record = data.state.projectRecords?.[project.id] || {};
  const route = data.projects.filter(item => item.track === project.track);
  const done = route.filter(item => data.state.projectRecords?.[item.id]?.completedAt).length;
  const stageIndex = Math.max(0, Math.min(Number(ui.projectStage) || 0, project.milestones.length - 1));
  const stage = project.milestones[stageIndex];
  const noWork = !data.workspace || !data.trusted;
  const inactive = !project.unlocked || noWork || data.busy;
  const e = escape;
  const brand = `<div class="brand"><img class="brand-logo" src="${e(document.body.dataset.logoUri || '')}" alt="" aria-hidden="true"><span>AImlearning</span><span class="version">${e(data.version || '')}</span></div>`;
  const nav = `<nav class="area-switch" aria-label="Secciones de AImlearning"><button data-action="areaMissions">Misiones</button><button data-action="areaProjects" aria-current="page">Proyectos reales</button><button data-action="areaGit">Git</button></nav>`;
  const progress = `<div class="progress-label"><span>${done} de ${route.length} proyectos</span><strong>${data.xp} XP</strong></div><progress max="${route.length}" value="${done}" aria-label="Progreso de proyectos ${project.track === 'csharp' ? 'C#' : 'C++'}"></progress>`;
  if (document.body.classList.contains('sidebar')) {
    app.innerHTML = `<div class="sidebar-content">${brand}<h1>Tu siguiente paso.</h1><p>${e(data.nextProject?.title || project.title)}</p>${progress}<p class="quiet">${e(data.nextProject?.detail || project.blocker || '')}</p>${button('open', 'Abrir academia ' + icon('arrow'), 'class="primary"')}</div>`;
    restoreFocus();
    return;
  }
  const tabs = [['overview', 'Proyecto'], ['stages', 'Etapas'], ['terminal', 'Terminal'], ['review', 'Revisión']];
  const activeTab = tabs.some(([id]) => id === ui.projectTab) ? ui.projectTab : 'overview';
  const stageNote = record.milestones?.[stageIndex] || '';
  const content = activeTab === 'overview' ? `
    <div class="environment"><h2>Herramientas para este proyecto</h2><p>La comprobación usa las herramientas de esta ventana de VS Code. Si trabajas en WSL, deben estar instaladas en WSL.</p>
      <ul class="environment-list">${data.projectEnvironment ? data.projectEnvironment.checks.map(item => `<li><strong>${item.passed ? 'Listo' : 'Pendiente'} · ${e(item.name)}</strong><span>${e(item.detail)}</span>${item.recovery ? `<small>${e(item.recovery)}</small>` : ''}</li>`).join('') : data.projectRequirements.map(name => `<li><strong>${e(name)}</strong><span>Aún sin comprobar.</span></li>`).join('')}</ul>
      <div class="actions">${button('projectEnvironment', data.busyKind === 'environment' ? 'Comprobando…' : data.projectEnvironment ? 'Volver a comprobar' : 'Comprobar herramientas', disabled(inactive))}${data.busyKind === 'environment' ? button('cancel', 'Cancelar comprobación') : ''}</div>
    </div>
    <div class="project-lead"><h2>El trabajo que vas a hacer</h2><p>${e(project.reason)}</p><p>${e(project.environment)}</p></div>
    <h2>Entregables</h2><ul class="requirements">${project.deliverables.map(item => `<li>${e(item)}</li>`).join('')}</ul>
    <div class="project-path"><h2>Cómo avanzar</h2><ol>${project.milestones.map(item => `<li><strong>${e(item.title)}</strong><span>${e(item.prompt)}</span></li>`).join('')}</ol></div>
    <div class="further-reading"><strong>Para profundizar</strong><p>Estas fuentes amplían las herramientas del proyecto. La guía principal está aquí y en RETO.md.</p>${project.docs.map((url, index) => button('projectDocs', 'Documentación oficial ' + (index + 1), `class="text-button" data-index="${index}"`)).join(' ')}</div>
    <div class="actions">${button('projectStageTab', 'Ir a las etapas ' + icon('arrow'), disabled(inactive))}</div>
  ` : activeTab === 'stages' ? `
    <h2>Construye por etapas</h2><p>Describe tu propio intento antes de pedir pistas. El profesor te ayuda a razonar y no escribe la implementación por ti.</p>
    <div class="project-stage-nav" role="group" aria-label="Etapas del proyecto">${project.milestones.map((item, index) => button('projectStage', (record.milestones?.[index] ? icon('check') : String(index + 1)) + ' ' + e(item.title) + (record.milestones?.[index] ? '<span class="sr-only">Intento registrado</span>' : ''), `data-index="${index}" class="${stageIndex === index ? 'selected' : ''}" aria-pressed="${stageIndex === index}"`)).join('')}</div>
    <div class="project-stage"><h3>${e(stage.title)}</h3><p>${e(stage.prompt)}</p><label for="project-note">Qué intenté y qué observé</label><textarea id="project-note" aria-describedby="project-note-help project-note-error" rows="5" maxlength="4000" placeholder="Diseñé… Probé… Observé…${project.kind === 'gui' ? ' ¿Qué apareció en la ventana?' : ''}"${disabled(inactive)}>${e(draft(project.id + ':note:' + stageIndex, stageNote))}</textarea>
    <p id="project-note-help" class="quiet">Escribe al menos 40 caracteres: qué intentaste y qué observaste.</p>${helpers.fieldError('project-note')}
    <div class="actions">${button('projectMilestone', stageNote ? 'Actualizar mi etapa' : 'Registrar mi intento', 'class="primary"' + disabled(inactive))}${button('projectHint', 'Pedir una pista', disabled(inactive || !stageNote))}</div>
    ${!data.state.aiModel && record.hints?.[stageIndex] ? `<div class="project-hint" role="status"><strong>Una pista para pensar</strong><p>${e(record.hints[stageIndex])}</p></div>` : ''}
    </div>
    ${chatView(record.dialogue || [], {inputId:'project-question', action:'projectProfessor', value:draft(project.id + ':question', ''), locked:inactive || !stageNote, model:data.state.aiModel})}
    <div class="actions"><span class="quiet">${data.state.aiModel ? 'La IA recibe tu intento, la etapa, resultados y código del proyecto al pedir orientación o una pista.' : 'Guía local basada en esta etapa.'}</span></div>
  ` : activeTab === 'terminal' ? `
    <h2>Trabaja desde la terminal</h2><p>Lee cada comando antes de ejecutarlo. Puedes usar la terminal de VS Code o la del sistema en la misma carpeta.</p>
    <div class="terminal-controls"><label for="project-shell">Sintaxis</label><select id="project-shell"${disabled(data.busy)}>${[['powershell', 'PowerShell'], ['cmd', 'CMD · Windows'], ['bash', 'bash / zsh']].map(([id, title]) => `<option value="${id}"${data.state.shell === id ? ' selected' : ''}>${title}</option>`).join('')}</select>${button('projectTerminal', icon('terminal') + ' Abrir terminal', disabled(inactive))}</div>
    ${!data.projectExists ? '<p class="banner">Crea primero la estructura del proyecto para poder copiar sus comandos.</p>' : ''}
    ${data.projectGuideError ? `<p role="alert" class="banner">${e(data.projectGuideError)} Cambia la sintaxis a PowerShell o abre la carpeta manualmente.</p>` : ''}
    <ol class="commands">${data.projectCommands.map((step, index) => `<li><h3>${e(step.title)}</h3><p>${e(step.why)}</p><div class="command"><code>${e(step.command)}</code>${button('projectCopy', icon('copy'), `data-index="${index}" aria-label="Copiar: ${e(step.title)}"` + disabled(!data.projectExists))}</div></li>`).join('')}</ol>
    ${project.kind === 'github' ? '<p class="quiet">Crea el repositorio en tu cuenta, revisa los archivos con git status y decide cuándo subirlos. AImlearning no publica ni hace push automáticamente.</p>' : ''}
  ` : `
    <h2>Revisa tu proyecto</h2><p>Primero compila. ${project.kind === 'gui' ? 'Después prueba la ventana y registra lo que observaste en cada caso.' : 'Después AImlearning ejecuta las pruebas que escribiste en tests/.'}</p>
    ${project.kind === 'github' ? `<label for="project-pr">Enlace del pull request</label><input id="project-pr" type="url" placeholder="https://github.com/usuario/repositorio/pull/1" value="${e(draft(project.id + ':pr', record.pullRequestUrl || ''))}"${disabled(inactive)}><p class="quiet">Se comprueban el repositorio Git, las pruebas y el workflow locales. El enlace se valida por su forma, sin consultar GitHub.</p>` : ''}
    <div class="actions">${button('projectCheck', data.busyKind === 'project' ? 'Revisando…' : 'Compilar y revisar', 'class="primary"' + disabled(inactive || !data.projectExists))}${data.busyKind === 'project' ? button('cancel', 'Cancelar revisión') : ''}</div>
    ${record.verification ? `<div class="verification ${record.verification.passed ? 'passed' : ''}" role="status"><h3>${record.verification.passed ? project.kind === 'gui' ? 'Compilación lista; faltan tus pruebas manuales' : 'Compilación y pruebas ejecutadas' : 'Hay algo que revisar'}</h3><p>${e(record.verification.summary)}</p>${record.verification.behavior?.firstFailure ? `<p>Primer fallo: ${e(record.verification.behavior.firstFailure)}</p>` : ''}${record.verification.github?.findings?.length ? `<ul>${record.verification.github.findings.map(item => `<li>${e(item)}</li>`).join('')}</ul>` : ''}</div>` : '<p class="quiet">Aún no se ha compilado esta versión del proyecto.</p>'}
    <h2>Pruebas de comportamiento</h2><p class="quiet">${project.kind === 'gui' ? 'Estos resultados son observaciones tuyas; la extensión no controla la ventana automáticamente.' : 'Escribe al menos tres pruebas propias. Se comprueba que se ejecuten y pasen, pero sus nombres no demuestran cobertura.'}</p>
    <ol class="behavior-cases">${data.projectChecks.map((item, index) => {
      const check = record.manualChecks?.[index];
      return `<li class="behavior-case"><h3>${e(item.name)}</h3><p>${e(item.prompt)}</p>${project.kind === 'gui' ? `<label for="manual-status-${index}">Resultado observado</label><select id="manual-status-${index}"${disabled(inactive)}><option value="">Elige el resultado</option><option value="passed"${check?.status === 'passed' ? ' selected' : ''}>Funcionó como esperaba</option><option value="failed"${check?.status === 'failed' ? ' selected' : ''}>Encontré un fallo</option></select><label for="manual-note-${index}">Qué hiciste y qué apareció</label><textarea id="manual-note-${index}" rows="2" maxlength="2000" placeholder="Hice… Observé…"${disabled(inactive)}>${e(draft(project.id + ':manual:' + index, check?.note || ''))}</textarea>${button('projectManualCheck', check ? 'Actualizar observación' : 'Registrar observación', `data-index="${index}"` + disabled(inactive || !data.projectExists))}${check ? `<small class="quiet">${check.status === 'passed' ? 'Registrado como correcto' : 'Fallo registrado'} · vuelve a probar si modificas el código.</small>` : ''}` : ''}</li>`;
    }).join('')}</ol>
    <h2>Explica el resultado</h2><label for="project-reflection">Qué funcionó, cómo lo comprobaste y qué mejorarías</label><textarea id="project-reflection" rows="5" maxlength="4000" placeholder="Comprobé… Todavía mejoraría…"${disabled(inactive)}>${e(draft(project.id + ':reflection', record.reflection || ''))}</textarea>
    <div class="actions">${button('projectComplete', record.completedAt ? 'Proyecto completado' : 'Completar proyecto · +' + project.xp + ' XP', 'class="primary"' + disabled(inactive || !!record.completedAt || !data.projectExists))}</div>
    <p class="quiet">Completar exige código propio, tres etapas, compilación vigente y ${project.kind === 'gui' ? 'los tres casos manuales correctos para esta versión' : 'al menos tres pruebas automáticas superadas'}. No certifica toda la funcionalidad ni el estado remoto de GitHub.</p>
  `;
  app.innerHTML = `
    <header class="topbar">${brand}${nav}<div class="identity"><span class="rank">${icon('trophy')}${e(data.rank)}</span><strong>${data.xp} XP</strong></div></header>
    <div class="academy">
      <aside class="route" aria-label="Proyectos reales">
        <label for="project-track">Lenguaje</label><select id="project-track"${disabled(data.busy)}><option value="csharp"${project.track === 'csharp' ? ' selected' : ''}>C# · aplicaciones y servicios</option><option value="cpp"${project.track === 'cpp' ? ' selected' : ''}>C++ · escritorio y bibliotecas</option></select>
        <p class="route-intro">Ruta de proyectos separada de las misiones. El proyecto final usa GitHub y se abre al terminar los otros dos y la práctica de Git.</p>
        ${progress}
        <nav aria-label="Proyectos de ${project.track === 'csharp' ? 'C#' : 'C++'}"><ol class="mission-list project-list">${route.map((item, index) => {
          const completed = data.state.projectRecords?.[item.id]?.completedAt;
          return `<li><button class="mission${item.id === project.id ? ' selected' : ''}${completed ? ' completed' : ''}" data-action="projectSelect" data-id="${item.id}" aria-current="${item.id === project.id ? 'step' : 'false'}"${disabled(data.busy)}><span class="step">${completed ? icon('check') : !item.unlocked ? icon('lock') : index + 1}</span><span><strong>${e(item.title)}</strong><small>${e(item.subtitle)}</small><span class="sr-only">${completed ? 'Completado' : !item.unlocked ? 'Bloqueado' : 'Disponible'}</span></span></button></li>`;
        }).join('')}</ol></nav>
        <p class="quiet principle">Tu código y tus decisiones construyen el proyecto. Las pistas no restan puntos.</p>
      </aside>
      <main>
        ${!data.workspace ? `<div class="banner"><strong>Abre una carpeta de práctica</strong><p>Los proyectos y el progreso se guardan en ella.</p>${button('openFolder', 'Abrir carpeta')}</div>` : !data.trusted ? '<div class="banner"><strong>Carpeta restringida</strong><p>Confía en ella para crear y compilar proyectos.</p></div>' : ''}
        ${!project.unlocked ? `<div class="banner"><strong>Proyecto bloqueado</strong><p>${e(project.blocker)}</p></div>` : ''}
        <div class="project-header"><h1>${e(project.title)}</h1><div class="mission-meta"><span>${project.track === 'csharp' ? 'C#' : 'C++'}</span><span>${e(project.level)}</span><span>${e(project.subtitle)}</span></div><p class="goal">${e(project.brief)}</p>
          ${data.projectExists ? `<div class="actions header-actions">${button('projectCreate', 'Abrir mi código ' + icon('arrow'), disabled(inactive))}<span class="quiet">Tu trabajo permanece en aimlearning-projects/real-projects/.</span></div>` : ''}
        </div>
        ${nextStepBanner(data.nextProject, data.busy)}
        <div class="tabs" role="tablist" aria-label="Pasos del proyecto">${tabs.map(([id, label]) => `<button role="tab" id="project-tab-${id}" aria-controls="project-panel-${id}" aria-selected="${activeTab === id}" tabindex="${activeTab === id ? 0 : -1}" data-project-tab="${id}">${label}</button>`).join('')}</div>
        <section class="tab-content" role="tabpanel" id="project-panel-${activeTab}" aria-labelledby="project-tab-${activeTab}" tabindex="0">${content}</section>
        <footer><span>AImlearning · proyectos reales</span><span>El profesor orienta. Tú construyes.</span></footer>
      </main>
    </div>`;
  restoreFocus();
};
