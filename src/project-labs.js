'use strict';

// Esta ruta es independiente de las misiones: los proyectos usan los conceptos
// ya aprendidos, pero no contienen la solución de sus requisitos de negocio.
const projects = [
  {
    id: 'project-cs-gui', track: 'csharp', kind: 'gui', title: 'Control de gastos de escritorio',
    subtitle: 'Windows Forms · interfaz de escritorio', level: 'Intermedio', xp: 320,
    prerequisites: ['cs-limit'], projectPrerequisites: [],
    brief: 'Crea una aplicación de escritorio para registrar gastos, verlos en una lista y conocer el total sin usar la terminal para cada operación.',
    reason: 'Windows Forms es una opción habitual para aplicaciones de escritorio de C# en Windows. Practicarás controles, eventos, validación y separación entre la vista y los datos.',
    environment: 'Requiere Windows y el SDK de .NET con soporte de Windows Forms. El proyecto abre una ventana básica; tú diseñas el formulario y la lógica de gastos.',
    deliverables: ['Formulario con categoría, importe y acción para agregar un gasto.', 'Lista visible de gastos y total actualizado.', 'Mensaje claro ante una entrada inválida sin agregarla.', 'Una prueba manual de inicio vacío, gasto válido y gasto rechazado.'],
    milestones: [
      { title: 'Diseña el flujo', prompt: 'Dibuja los controles y explica qué hace el usuario desde abrir la ventana hasta ver el total.', hint: '¿Qué información debe quedar visible después de pulsar Agregar?' },
      { title: 'Conecta datos y eventos', prompt: 'Implementa los controles y explica dónde validas y dónde guardas el nuevo gasto.', hint: '¿Puede un clic inválido modificar la lista o el total?' },
      { title: 'Prueba la interfaz', prompt: 'Ejecuta la ventana. Describe los tres casos manuales y lo que observaste en cada uno.', hint: 'Prueba una categoría vacía y un importe con formato incorrecto.' }
    ],
    docs: ['https://learn.microsoft.com/en-us/dotnet/desktop/winforms/get-started/create-app-visual-studio']
  },
  {
    id: 'project-cs-db', track: 'csharp', kind: 'database', title: 'API de inventario',
    subtitle: 'ASP.NET Core · SQLite', level: 'Intermedio', xp: 360,
    prerequisites: ['cs-limit'], projectPrerequisites: [],
    brief: 'Construye una API para registrar productos, consultar existencias y actualizar cantidades con datos que sobreviven al reinicio.',
    reason: 'ASP.NET Core y una base de datos son herramientas frecuentes en servicios C#. Practicarás rutas HTTP, validación, SQL parametrizado y persistencia.',
    environment: 'Requiere .NET SDK 8 o posterior. El esqueleto inicia una API con /health; añadirás Microsoft.Data.Sqlite y el comportamiento de inventario.',
    deliverables: ['Modelo de producto con nombre y cantidad no negativa.', 'Operaciones HTTP para crear, consultar y ajustar existencias.', 'Base SQLite que conserva los cambios después de reiniciar el servidor.', 'Pruebas manuales con peticiones válidas, inválidas y un reinicio.'],
    milestones: [
      { title: 'Diseña los datos', prompt: 'Define qué representa un producto, su identificador y qué cambios deben ser persistentes.', hint: '¿Cómo distinguirás dos productos con el mismo nombre?' },
      { title: 'Conecta API y base', prompt: 'Implementa las operaciones HTTP y explica dónde validas y cómo evitas construir SQL con texto del usuario.', hint: 'Busca parámetros SQL y piensa qué respuesta darás a una cantidad negativa.' },
      { title: 'Prueba el reinicio', prompt: 'Prueba crear y consultar un producto, reinicia la API y verifica que el dato siga allí. Describe qué observaste.', hint: 'La memoria del proceso desaparece; ¿de dónde vuelve el producto?' }
    ],
    docs: ['https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis', 'https://learn.microsoft.com/en-us/dotnet/standard/data/sqlite/']
  },
  {
    id: 'project-cs-github', track: 'csharp', kind: 'github', title: 'Servicio listo para colaborar',
    subtitle: 'API · pruebas · GitHub Actions', level: 'Avanzado', xp: 450,
    prerequisites: ['cs-limit'], projectPrerequisites: ['project-cs-gui', 'project-cs-db'],
    brief: 'Construye un servicio de seguimiento de incidencias y publícalo como proyecto mantenible: documentación, pruebas, rama de trabajo, pull request y CI en GitHub.',
    reason: 'En equipos C# se revisan cambios, se ejecutan pruebas automatizadas y se publica el historial en GitHub. Este proyecto reúne diseño de API, calidad y colaboración.',
    environment: 'Requiere .NET SDK y Git. Necesitarás una cuenta y un repositorio en GitHub para publicar tu trabajo; AImlearning no crea repositorios ni hace push por ti.',
    deliverables: ['API de incidencias con operaciones de creación, consulta y cambio de estado.', 'Pruebas automatizadas del comportamiento principal y README con instrucciones.', 'Repositorio Git con rama de trabajo, remoto GitHub y pull request.', 'Workflow de GitHub Actions que compila y ejecuta las pruebas.'],
    milestones: [
      { title: 'Diseña el servicio', prompt: 'Define la información de una incidencia y los cambios de estado permitidos; explica cómo los probarás.', hint: '¿Qué debería ocurrir al cambiar una incidencia que no existe?' },
      { title: 'Hazlo verificable', prompt: 'Añade pruebas y documenta cómo ejecutar el servicio y comprobarlo desde una terminal nueva.', hint: '¿Puede otra persona reproducir tus pasos sin preguntarte nada?' },
      { title: 'Colabora en GitHub', prompt: 'Crea una rama, sube commits, abre un pull request y añade un workflow. Anota el enlace y qué comprobó la CI.', hint: '¿El workflow ejecuta pruebas reales o solo compila?' }
    ],
    docs: ['https://docs.github.com/en/get-started/using-git/about-git', 'https://docs.github.com/en/actions/get-started/quickstart']
  },
  {
    id: 'project-cpp-gui', track: 'cpp', kind: 'gui', title: 'Monitor de mediciones',
    subtitle: 'Qt Widgets · CMake', level: 'Intermedio', xp: 320,
    prerequisites: ['cpp-save'], projectPrerequisites: [],
    brief: 'Crea una ventana que permita cargar mediciones, mostrar la serie y visualizar mínimo, máximo y promedio al actualizar los datos.',
    reason: 'Qt Widgets es una herramienta habitual para aplicaciones de escritorio C++ multiplataforma. Practicarás eventos, contenedores, diseño de interfaz y compilación con CMake.',
    environment: 'Requiere CMake, un compilador C++17 y Qt 6 con Widgets. El esqueleto abre una ventana; tú incorporas controles y análisis.',
    deliverables: ['Ventana con entrada de mediciones y acción para agregarlas.', 'Lista visible y resultados calculados desde los datos actuales.', 'Rechazo de entradas inválidas sin alterar la serie.', 'Prueba manual con lista vacía, negativos y varios valores.'],
    milestones: [
      { title: 'Separa vista y cálculo', prompt: 'Dibuja la ventana y decide qué parte calcula estadísticas sin depender de los controles.', hint: '¿Podrías probar el cálculo con datos sin abrir una ventana?' },
      { title: 'Conecta eventos', prompt: 'Implementa la entrada, la lista y la actualización; explica cuándo cambia el estado.', hint: '¿Qué debe permanecer igual tras una entrada inválida?' },
      { title: 'Prueba la ventana', prompt: 'Abre la aplicación y registra los resultados de los casos vacío, negativo y serie mixta.', hint: '¿Qué muestra la interfaz antes de la primera medición?' }
    ],
    docs: ['https://doc.qt.io/qt-6/cmake-get-started.html', 'https://doc.qt.io/qt-6/widgets-tutorial.html']
  },
  {
    id: 'project-cpp-db', track: 'cpp', kind: 'database', title: 'Catálogo persistente',
    subtitle: 'SQLite C API · CMake', level: 'Intermedio', xp: 360,
    prerequisites: ['cpp-save'], projectPrerequisites: [],
    brief: 'Construye una herramienta de terminal para gestionar un catálogo de piezas con identificador, nombre y existencias en SQLite.',
    reason: 'C++ suele integrar bibliotecas nativas y trabajar cerca de los recursos. Aquí practicarás API de SQLite, sentencias preparadas, liberación de recursos y pruebas de persistencia.',
    environment: 'Requiere CMake, compilador C++17 y la biblioteca SQLite3 con encabezados de desarrollo. El esqueleto configura el enlace; tú implementas el catálogo.',
    deliverables: ['Comandos para registrar, consultar y ajustar existencias.', 'SQLite con sentencias preparadas para valores recibidos del usuario.', 'Liberación correcta de conexión y sentencias también ante errores.', 'Prueba de persistencia entre procesos y de un identificador inexistente.'],
    milestones: [
      { title: 'Diseña la tabla', prompt: 'Define los campos y restricciones. Explica qué sucede si se repite un identificador.', hint: '¿Qué dato hace única a una pieza?' },
      { title: 'Usa SQLite con cuidado', prompt: 'Implementa los comandos y explica cuándo preparas, vinculas, ejecutas y liberas una sentencia.', hint: '¿Qué recurso debe cerrarse si una operación falla a mitad?' },
      { title: 'Prueba dos procesos', prompt: 'Registra una pieza, termina el programa y consúltala en otra ejecución. Describe también un error esperado.', hint: 'Prueba una pieza que todavía no existe.' }
    ],
    docs: ['https://www.sqlite.org/cintro.html', 'https://cmake.org/cmake/help/latest/module/FindSQLite3.html']
  },
  {
    id: 'project-cpp-github', track: 'cpp', kind: 'github', title: 'Biblioteca de análisis compartible',
    subtitle: 'CMake · CTest · GitHub Actions', level: 'Avanzado', xp: 450,
    prerequisites: ['cpp-save'], projectPrerequisites: ['project-cpp-gui', 'project-cpp-db'],
    brief: 'Crea una biblioteca C++ reutilizable para analizar series, pruébala con CTest y publícala en GitHub con una rama, pull request y CI.',
    reason: 'En proyectos C++ se usan bibliotecas, cabeceras públicas, CMake y pruebas para que otros puedan integrar el código. GitHub permite revisar cambios y ejecutar compilaciones automáticas.',
    environment: 'Requiere CMake, compilador C++17 y Git. La publicación y el pull request se hacen desde tu cuenta de GitHub; AImlearning solo revisa evidencia local.',
    deliverables: ['Biblioteca con API pública para extremos, promedio y mediana.', 'Ejecutable de pruebas registrado en CTest, con casos de frontera.', 'README que explique compilar, probar y usar la biblioteca.', 'Repositorio GitHub con rama, pull request y workflow que ejecute CMake y CTest.'],
    milestones: [
      { title: 'Diseña la API pública', prompt: 'Decide qué funciones ofrecerás, qué datos reciben y cómo responden a una serie vacía.', hint: '¿Qué parte pertenece a la cabecera y cuál a la implementación?' },
      { title: 'Prueba como biblioteca', prompt: 'Crea pruebas que llamen a la API pública, ejecuta CTest y explica al menos un caso de frontera.', hint: '¿Tu prueba fallaría si el cálculo estuviera equivocado?' },
      { title: 'Publícala con CI', prompt: 'Documenta el proyecto, sube una rama, abre un pull request y comprueba el workflow. Registra el enlace.', hint: '¿Otra persona puede compilar y probar desde cero siguiendo tu README?' }
    ],
    docs: ['https://cmake.org/cmake/help/latest/manual/ctest.1.html', 'https://docs.github.com/en/actions/get-started/quickstart']
  }
];

function unlocked(state, project) {
  return project.prerequisites.every(id => Boolean(state.records?.[id]?.completedAt))
    && project.projectPrerequisites.every(id => Boolean(state.projectRecords?.[id]?.completedAt))
    && (project.kind !== 'github' || Boolean(state.gitRecords?.completedAt || state.projectRecords?.[project.id]?.completedAt));
}

function blocker(state, project) {
  const missingConcept = project.prerequisites.find(id => !state.records?.[id]?.completedAt);
  if (missingConcept) return 'Completa los conceptos de ' + (project.track === 'csharp' ? 'C#' : 'C++') + ' antes de comenzar.';
  if (project.projectPrerequisites.some(id => !state.projectRecords?.[id]?.completedAt)) return 'Completa los proyectos de interfaz y base de datos de esta ruta para abrir el proyecto de GitHub.';
  if (project.kind === 'github' && !state.gitRecords?.completedAt && !state.projectRecords?.[project.id]?.completedAt) return 'Practica Git localmente: estado, commits, ramas, conflictos, pull requests y CI antes de este proyecto.';
  return '';
}

function missingForCompletion(project, record, currentHash) {
  const missing = [];
  if (!record.scaffoldHash || record.scaffoldHash === currentHash) missing.push('Desarrolla el proyecto: el código sigue igual que la estructura inicial.');
  for (let index = 0; index < project.milestones.length; index++) {
    if (String(record.milestones?.[index] || '').trim().length < 40) missing.push('Explica qué hiciste y probaste en la etapa ' + (index + 1) + '.');
  }
  if (!record.verification?.passed || record.verification.hash !== currentHash) missing.push('Compila y revisa la versión actual del proyecto.');
  if (project.kind === 'gui') {
    for (let index = 0; index < 3; index++) {
      const check = record.manualChecks?.[index];
      if (check?.status !== 'passed' || String(check.note || '').trim().length < 25 || check.hash !== currentHash) {
        missing.push('Prueba y registra el resultado observado en el caso manual ' + (index + 1) + ' para esta versión del código.');
      }
    }
  } else if (!record.verification?.behavior?.passed) {
    missing.push('Añade y supera al menos tres pruebas automáticas del comportamiento.');
  }
  if (project.kind === 'github' && !record.verification?.github?.passed) missing.push('Completa la revisión local de Git, pruebas, workflow y enlace del pull request.');
  if (String(record.reflection || '').trim().length < 40) missing.push('Escribe una reflexión sobre el resultado y una limitación pendiente.');
  return missing;
}

module.exports = { projects, unlocked, blocker, missingForCompletion };
