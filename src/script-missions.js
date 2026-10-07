'use strict';

const scriptMissions = [
  {
    id: 'py-welcome', track: 'python', title: 'Tu registro comienza', topic: 'Salida y ejecución', xp: 60,
    goal: 'Inicia un registro de hábitos: al ejecutar el script debe aparecer Registro de hábitos listo.',
    requirements: ['Muestra exactamente una línea: Registro de hábitos listo', 'Todavía no necesita entradas ni archivos.'],
    lesson: 'Python ejecuta instrucciones guardadas en un archivo .py. La terminal inicia el intérprete y muestra la salida del programa. Un mensaje que imprime tu script es distinto de un error del intérprete. Guarda el archivo antes de volver a ejecutarlo.',
    concepts: ['print muestra un valor y termina la línea. El texto literal se escribe entre comillas.', 'Los comentarios comienzan con # y sirven para explicar una intención; no producen salida. La sangría adquiere importancia cuando agrupes instrucciones.'],
    question: '¿Qué parte de tu archivo produce la salida y qué mensaje indicaría que el intérprete ni siquiera llegó a ejecutarla?',
    reflection: 'Explica qué hace el intérprete y qué cambia si modificas el texto que muestra tu script.',
    hints: ['¿La misión pide calcular algo o mostrar un mensaje?', 'Compara el ejemplo de print con el contrato: ¿qué parte del texto debes decidir tú?', 'Revisa espacios y acentos en la salida, no solo el nombre del archivo.'],
    docs: 'https://docs.python.org/3/tutorial/inputoutput.html',
    tests: [{ name: 'El registro se presenta', input: '', expected: 'Registro de hábitos listo' }]
  },
  {
    id: 'py-sessions', track: 'python', title: 'Minutos de práctica', topic: 'Entrada, números y repetición', xp: 110,
    goal: 'Lee cuántas sesiones hubo y sus minutos; muestra el total de minutos practicados.',
    requirements: ['La primera línea contiene N, un entero entre 0 y 100.', 'Después hay exactamente N líneas, cada una con minutos enteros no negativos.', 'Muestra solo el total como entero. Si N es cero, muestra 0.'],
    lesson: 'input lee una línea como texto. int permite interpretarla como número entero. Un ciclo procesa la cantidad de sesiones indicada; un acumulador conserva el total entre vueltas. Para decidir dónde iniciar cada dato, sigue a mano cero, una y varias sesiones.',
    concepts: ['int(input()) combina lectura y conversión cuando se espera un entero válido.', 'range(n) permite repetir un bloque n veces. La sangría determina qué instrucciones pertenecen al ciclo.', 'Una variable que conserva información entre vueltas debe iniciarse antes del ciclo.'],
    question: 'Con cero sesiones, ¿cuántas líneas adicionales debes leer y qué valor debería mostrar el programa?',
    reflection: 'Sigue a mano dos sesiones y explica qué cambia y qué se conserva en cada vuelta.',
    hints: ['La primera línea dice cuántas lecturas faltan, no es una duración.', '¿Dónde vive el total para no perder lo acumulado al comenzar otra vuelta?', 'Prueba N igual a cero y luego una sola sesión.'],
    docs: 'https://docs.python.org/3/tutorial/controlflow.html',
    tests: [{ name: 'Tres sesiones', input: '3\n15\n20\n10\n', expected: '45' }, { name: 'Sin sesiones', input: '0\n', expected: '0' }, { name: 'Una sesión', input: '1\n35\n', expected: '35' }, { name: 'Con ceros', input: '4\n0\n5\n0\n7\n', expected: '12' }]
  },
  {
    id: 'py-history', track: 'python', title: 'Un hábito que permanece', topic: 'Argumentos y archivos', xp: 180,
    goal: 'Convierte tu registro en una pequeña herramienta de terminal que conserve las sesiones entre ejecuciones.',
    requirements: ['Guarda los datos en un archivo del directorio de trabajo actual; tú eliges el nombre y formato.', 'Argumentos registrar MINUTOS: guarda la sesión y muestra Registrado.', 'Argumento total: muestra la suma de minutos como entero; si no hay registros, muestra 0.', 'Argumento historial: muestra una línea por sesión en orden, con formato INDICE: MINUTOS; el índice empieza en 1. Sin registros no muestra líneas.', 'Los minutos son enteros no negativos y los comandos reciben argumentos válidos.', 'Cada comprobación usa una carpeta temporal limpia; los pasos de una misma comprobación comparten esa carpeta.'],
    lesson: 'Los argumentos se entregan al iniciar el proceso, a diferencia de las líneas que input espera después. sys.argv contiene esas palabras. Al terminar el proceso, sus variables desaparecen; un archivo conserva datos para la siguiente ejecución. pathlib ayuda a trabajar con rutas. El directorio de trabajo decide dónde queda un archivo relativo.',
    concepts: ['sys.argv permite distinguir el comando y sus datos. Decide primero qué debe ocurrir con cada comando.', 'Path puede comprobar si un archivo existe, leerlo y escribirlo. Piensa cómo recuperar cada sesión sin perder las anteriores.', 'Separar lectura de datos, cambio de estado y presentación facilita probar la herramienta.'],
    question: 'Si registras dos sesiones en procesos distintos, ¿qué debe guardar el primero para que el segundo no pierda el historial?',
    reflection: 'Describe el formato que elegiste, cómo recuperas sesiones anteriores y qué probarías en una carpeta vacía.',
    hints: ['Distingue argumentos de inicio de la entrada que lee input.', '¿Tu archivo guarda una sesión o todas las necesarias para reconstruir el estado?', 'Prueba total antes de registrar y después de cerrar y volver a abrir el proceso.'],
    docs: 'https://docs.python.org/3/library/pathlib.html',
    tests: [{ name: 'Primera apertura', steps: [{ args: ['total'], expected: '0' }, { args: ['historial'], expected: '' }] }, { name: 'Datos entre ejecuciones', steps: [{ args: ['registrar', '15'], expected: 'Registrado' }, { args: ['registrar', '20'], expected: 'Registrado' }, { args: ['total'], expected: '35' }, { args: ['historial'], expected: '1: 15\n2: 20' }] }, { name: 'Una sesión de cero', steps: [{ args: ['registrar', '0'], expected: 'Registrado' }, { args: ['historial'], expected: '1: 0' }] }]
  },
  {
    id: 'js-welcome', track: 'javascript', title: 'Tu gestor despierta', topic: 'Salida y Node.js', xp: 60,
    goal: 'Inicia un gestor de tareas de terminal: al ejecutar el archivo debe aparecer Gestor de tareas listo.',
    requirements: ['Muestra exactamente una línea: Gestor de tareas listo', 'Todavía no necesita entradas ni archivos.'],
    lesson: 'JavaScript también puede ejecutarse fuera del navegador con Node.js. Escribes instrucciones en un archivo .js y lo inicias desde la terminal. Una llamada de salida muestra texto; un error de sintaxis impide ejecutar el archivo. Guardar antes de volver a ejecutar es parte de la comprobación.',
    concepts: ['console.log muestra un valor y añade un salto de línea. Un literal de texto se escribe entre comillas.', 'Una instrucción puede terminar en punto y coma. Los comentarios de una línea comienzan con //.'],
    question: '¿Qué esperas ver cuando el archivo se ejecuta bien y cómo distinguirías ese texto de un error de Node.js?',
    reflection: 'Explica qué hizo Node.js y qué hizo tu programa para mostrar el mensaje.',
    hints: ['El programa solo necesita mostrar un mensaje, no leer datos.', 'Localiza en el ejemplo la llamada que escribe texto y el texto que podrías cambiar.', 'Compara la salida con el contrato carácter por carácter.'],
    docs: 'https://nodejs.org/api/console.html',
    tests: [{ name: 'El gestor se presenta', input: '', expected: 'Gestor de tareas listo' }]
  },
  {
    id: 'js-pending', track: 'javascript', title: '¿Qué queda por hacer?', topic: 'Entrada y colecciones', xp: 120,
    goal: 'Lee estados de tareas y muestra cuántas siguen pendientes.',
    requirements: ['La primera línea contiene N, un entero entre 0 y 100.', 'Después llegan exactamente N líneas, cada una con pendiente o hecha.', 'Muestra solo la cantidad de tareas pendientes como entero. Con N igual a cero, muestra 0.'],
    lesson: 'En un script de Node.js, la entrada estándar puede leerse como texto con el módulo integrado fs. Después decides cómo separar líneas, convertir N a número y recorrer los estados. Una comparación distingue pendiente de hecha; no necesitas conservar todas las tareas si solo quieres contarlas.',
    concepts: ['fs.readFileSync(0, "utf8") lee la entrada estándar completa como texto.', 'split permite separar líneas y Number convierte una representación numérica. Un ciclo o una operación de colección puede procesar N elementos.', '=== compara valores sin convertirlos automáticamente. Un contador conserva el número de coincidencias.'],
    question: '¿Cuántos estados debes revisar si N es cero? ¿Qué cambiaría si llega una tarea hecha entre dos pendientes?',
    reflection: 'Explica cómo separaste las líneas y por qué tu contador cambia solo en algunos casos.',
    hints: ['La primera línea indica una cantidad, no es el estado de una tarea.', 'Busca una forma de recorrer exactamente N estados, aunque N sea cero.', '¿Qué condición debe cumplirse para aumentar el contador?'],
    docs: 'https://nodejs.org/api/fs.html',
    tests: [{ name: 'Estados mezclados', input: '4\npendiente\nhecha\npendiente\nhecha\n', expected: '2' }, { name: 'Lista vacía', input: '0\n', expected: '0' }, { name: 'Todas hechas', input: '3\nhecha\nhecha\nhecha\n', expected: '0' }, { name: 'Una pendiente', input: '1\npendiente\n', expected: '1' }]
  },
  {
    id: 'js-save', track: 'javascript', title: 'Tu lista recuerda', topic: 'CLI y persistencia', xp: 200,
    goal: 'Transforma el gestor en una lista de tareas que puedas usar en varias ejecuciones.',
    requirements: ['Guarda los datos en un archivo del directorio de trabajo actual; tú eliges el nombre y formato.', 'Argumentos agregar NOMBRE: añade una tarea pendiente y muestra Guardada. NOMBRE es una sola palabra.', 'Argumento listar: muestra las tareas en orden con formato INDICE. [ ] NOMBRE o INDICE. [x] NOMBRE; el índice empieza en 1. Sin tareas no muestra líneas.', 'Argumentos completar INDICE: marca esa tarea como hecha y muestra Completada. Los índices recibidos son válidos.', 'Cada comprobación usa una carpeta temporal limpia; los pasos de una misma comprobación comparten esa carpeta.'],
    lesson: 'process.argv contiene los argumentos que llegaron al iniciar Node.js. Un archivo conserva las tareas y su estado entre procesos. El módulo fs ofrece lectura y escritura; JSON es una opción para representar una lista con nombre y estado, pero puedes elegir otra. Antes de modificar una tarea, recupera el estado guardado. La ruta relativa depende del directorio de trabajo.',
    concepts: ['process.argv.slice(2) deja los argumentos del usuario después de la ruta de Node y del archivo.', 'fs.existsSync, fs.readFileSync y fs.writeFileSync permiten comprobar, recuperar y guardar el estado.', 'JSON.stringify y JSON.parse pueden convertir entre datos de JavaScript y texto JSON. Decide cómo distinguir una tarea pendiente de una completada.'],
    question: '¿Qué debe sobrevivir entre agregar y listar? ¿Qué información necesitas cambiar cuando alguien completa una tarea?',
    reflection: 'Describe tu formato de almacenamiento, cómo recuperas el orden y cómo compruebas que completar no borra otras tareas.',
    hints: ['Ejecuta agregar y listar en procesos distintos. ¿El segundo conoce lo que hizo el primero?', 'Una tarea necesita al menos un nombre y un estado que puedas guardar.', 'Piensa qué representa un índice visible para el usuario y cómo ubicar esa tarea en tu estructura.'],
    docs: 'https://nodejs.org/api/fs.html',
    tests: [{ name: 'Primera apertura', steps: [{ args: ['listar'], expected: '' }] }, { name: 'Tareas entre ejecuciones', steps: [{ args: ['agregar', 'Leer'], expected: 'Guardada' }, { args: ['agregar', 'Practicar'], expected: 'Guardada' }, { args: ['listar'], expected: '1. [ ] Leer\n2. [ ] Practicar' }, { args: ['completar', '1'], expected: 'Completada' }, { args: ['listar'], expected: '1. [x] Leer\n2. [ ] Practicar' }] }, { name: 'Una tarea completada', steps: [{ args: ['agregar', 'Repasar'], expected: 'Guardada' }, { args: ['completar', '1'], expected: 'Completada' }, { args: ['listar'], expected: '1. [x] Repasar' }] }]
  }
];

module.exports = { scriptMissions };
