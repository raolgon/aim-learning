'use strict';

function missionStep(mission, state, catalog, options = {}) {
  const record = state.records?.[mission.id] || {};
  const route = catalog.filter(item => item.track === mission.track);
  if (!options.unlocked) {
    const available = [...route].reverse().find(item => options.isUnlocked(item) && !state.records?.[item.id]?.completedAt)
      || [...route].reverse().find(item => options.isUnlocked(item));
    return { title: 'Retoma el paso disponible', detail: 'Completa la misión anterior para abrir este reto.', action: available ? 'select' : null, id: available?.id, label: available ? 'Ir a ' + available.title : '' };
  }
  if (record.completedAt) {
    const next = route[route.findIndex(item => item.id === mission.id) + 1]
      || (mission.track === 'foundations' ? catalog.find(item => item.track === 'csharp') : null);
    return next ? { title: 'Continúa con ' + next.title, detail: 'Tu reflexión quedó registrada. Ya puedes explorar el siguiente reto.', action: 'select', id: next.id, label: 'Siguiente misión' }
      : { title: 'Ruta completada', detail: 'Puedes revisar tus proyectos o practicar una variante propia.', action: 'areaProjects', label: 'Ver proyectos reales' };
  }
  if (!record.attempt && !record.lessonReviewedAt) return { title: 'Empieza por la idea', detail: 'Lee el concepto y el ejemplo antes de explicar tu intento. No necesitas saber la respuesta del reto.', action: 'goLearn', label: 'Entender la idea' };
  if (mission.kind !== 'foundation' && !options.exists) return { title: 'Prepara tu primera práctica', detail: 'Te guiaremos para abrir tu carpeta, comprobar la herramienta y reconocer la terminal.', action: 'goSetup', label: 'Preparar mi entorno' };
  if (!record.attempt) return { title: 'Explica tu primer intento', detail: 'Una idea razonada basta para comenzar. Las pistas se abren después.', action: 'goProfessor', label: 'Ir al profesor' };
  if (!record.verification?.passed || options.verificationFresh === false) return { title: mission.kind === 'foundation' ? 'Comprueba tu decisión' : 'Prueba tu programa', detail: mission.kind === 'foundation' ? 'Elige una opción y revisa la pista que recibas.' : 'Compila y ejecuta los casos del reto desde la terminal.', action: 'goReflect', label: 'Ir a Comprueba' };
  return { title: 'Explica lo aprendido', detail: 'Cuenta por qué funciona tu enfoque y qué caso adicional revisarías.', action: 'goReflect', label: 'Escribir reflexión' };
}

function projectStep(project, state, projects, options = {}) {
  const record = state.projectRecords?.[project.id] || {};
  const route = projects.filter(item => item.track === project.track);
  if (!options.unlocked) {
    const missing = project.projectPrerequisites?.find(id => !state.projectRecords?.[id]?.completedAt);
    return missing
      ? { title: 'Completa el proyecto anterior', detail: 'El proyecto final se abre después de interfaz y base de datos.', action: 'projectSelect', id: missing, label: 'Ver proyecto pendiente' }
      : project.kind === 'github' && !state.gitRecords?.completedAt
        ? { title: 'Practica Git antes de GitHub', detail: 'Haz commits, ramas, una fusión con conflicto y un ensayo de PR y CI en tu equipo.', action: 'areaGit', label: 'Abrir ruta de Git' }
        : { title: 'Consolida los conceptos', detail: 'Termina primero la ruta intermedia de este lenguaje.', action: 'areaMissions', label: 'Ver misiones' };
  }
  if (record.completedAt) {
    const next = route.find(item => !state.projectRecords?.[item.id]?.completedAt && (!options.isUnlocked || options.isUnlocked(item)));
    if (next) return { title: 'Continúa con ' + next.title, detail: 'Tus evidencias quedaron registradas.', action: 'projectSelect', id: next.id, label: 'Ver siguiente proyecto' };
    if (route.some(item => item.kind === 'github' && !state.projectRecords?.[item.id]?.completedAt) && !state.gitRecords?.completedAt) return { title: 'Practica Git antes de GitHub', detail: 'Los dos proyectos de esta ruta están terminados; falta la práctica local de Git.', action: 'areaGit', label: 'Abrir ruta de Git' };
    return { title: 'Ruta de proyectos completada', detail: 'Revisa tu código y decide qué mejorarías o compartirías.', action: null, label: '' };
  }
  if (!options.workspace) return { title: 'Prepara tu espacio', detail: 'Abre una carpeta para guardar los proyectos y el progreso.', action: 'openFolder', label: 'Abrir carpeta' };
  if (!options.trusted) return { title: 'Habilita tu carpeta', detail: 'La revisión requiere un espacio de trabajo de confianza.', action: null, label: '' };
  if (!record.environment?.ready) return { title: record.environment ? 'Resuelve el entorno' : 'Comprueba tus herramientas', detail: record.environment ? 'Lee el diagnóstico y vuelve a comprobar después de instalar o configurar lo que falta.' : 'Confirma que las herramientas de este proyecto funcionan en esta ventana de VS Code.', action: 'projectEnvironment', label: record.environment ? 'Volver a comprobar' : 'Comprobar entorno' };
  if (!options.exists) return { title: 'Crea la estructura', detail: 'Los archivos iniciales no implementan el comportamiento del reto.', action: 'projectCreate', label: 'Crear estructura' };
  const stage = project.milestones.findIndex((_, index) => !record.milestones?.[index]);
  if (stage >= 0) return { title: 'Registra la etapa ' + (stage + 1), detail: 'Describe qué intentaste y qué observaste antes de pedir una pista.', action: 'projectStageTab', index: stage, label: 'Ir a la etapa' };
  if (!record.verification?.passed || options.verificationFresh === false) return { title: 'Compila y prueba el proyecto', detail: options.verificationFresh === false ? 'El código cambió desde la última revisión. Compila y prueba esta versión.' : project.kind === 'gui' ? 'Compila antes de registrar los casos manuales.' : 'Ejecuta las pruebas automáticas que escribiste.', action: 'projectReviewTab', label: 'Ir a Revisión' };
  if (project.kind === 'gui' && (options.manualFresh === false || project.milestones.some((_, index) => record.manualChecks?.[index]?.status !== 'passed'))) return { title: 'Prueba la interfaz', detail: options.manualFresh === false ? 'El código cambió; repite los casos manuales de esta versión.' : 'Registra los tres casos observados en la ventana.', action: 'projectReviewTab', label: 'Ver casos manuales' };
  return { title: 'Cierra con una reflexión', detail: 'Explica qué comprobaste y qué mejorarías en una siguiente versión.', action: 'projectReviewTab', label: 'Terminar revisión' };
}

module.exports = { missionStep, projectStep };
