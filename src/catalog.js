'use strict';
const { examples } = require('./examples');
const { guidance } = require('./guidance');
const { foundations } = require('./foundations');
const { scriptMissions } = require('./script-missions');
const { advancedMissions } = require('./advanced-missions');

const missions = [
  ...foundations,
  {
    id: 'cs-welcome', track: 'csharp', title: 'Tu primera señal', topic: 'Salida y ejecución', xp: 60,
    goal: 'Inicia tu bitácora: al ejecutar el programa debe aparecer una línea con el texto Bitácora de gastos.',
    requirements: ['La salida debe ser exactamente: Bitácora de gastos', 'No necesita pedir datos todavía.'],
    lesson: 'El código fuente es el texto que escribes. El compilador comprueba su estructura y lo transforma en un programa ejecutable. La terminal permite pedir que lo compile y observar su salida. Mostrar algo no es lo mismo que devolver un valor dentro de una función.',
    concepts: ['En C#, una instrucción suele terminar en punto y coma. Un literal de texto se escribe entre comillas dobles.', 'La clase Console representa la entrada y salida de texto. Su método WriteLine muestra un valor y termina la línea. El ejemplo guiado muestra cómo escribir la llamada y qué aparece en la terminal.'],
    question: 'Antes de programar, ¿qué esperas ver en la terminal y cómo distinguirás la salida de tu programa de un mensaje del compilador?',
    reflection: 'Explica qué hizo el compilador y qué hizo tu programa. ¿Qué cambiarías para mostrar otro título?',
    hints: ['¿La tarea pide leer información o mostrarla?', '¿Qué herramienta del concepto de esta misión sirve para escribir una línea?', 'Compara la salida carácter por carácter: ¿coinciden los espacios y el acento?'],
    docs: 'https://learn.microsoft.com/es-es/dotnet/api/system.console.writeline',
    tests: [{ name: 'La bitácora se presenta', input: '', expected: 'Bitácora de gastos' }]
  },
  {
    id: 'cs-total', track: 'csharp', title: 'Dos gastos, una cuenta', topic: 'Variables y números', xp: 90,
    goal: 'Tu bitácora recibe dos importes, uno por línea, y muestra su total con dos decimales.',
    requirements: ['Usa punto decimal en entradas y salida; por ejemplo 2.50.', 'Los importes son no negativos. Muestra solo el total, sin preguntas ni etiquetas.', 'Ejemplo de uso: 8.00 y 3.50 producen 11.50.'],
    lesson: 'Lo que lees de la terminal comienza siendo texto. Un número permite hacer cálculos; un texto permite representar caracteres. Para dinero, decimal evita muchos problemas de representación propios de los números binarios de coma flotante. La cultura determina cómo se interpreta y se muestra el separador decimal.',
    concepts: ['Console.ReadLine lee una línea de texto. La conversión a número es una decisión separada de la lectura.', 'decimal.Parse y TryParse convierten representaciones de números. CultureInfo.InvariantCulture usa un formato independiente de la configuración regional.', 'El formato F2 representa un número con dos posiciones decimales.'],
    question: '¿Qué diferencia habría entre juntar dos textos y operar con dos cantidades?',
    reflection: '¿Por qué importa el tipo de dato? Describe una entrada que te ayudó a comprobar que hacías un cálculo.',
    hints: ['¿Qué tipo tiene el dato justo después de leerlo?', 'Prueba cantidades con parte decimal. ¿Se conserva su valor al leerlas?', '¿El valor calculado es incorrecto o solo cambia su representación en la salida?'],
    docs: 'https://learn.microsoft.com/es-es/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types',
    tests: [{ name: 'Importes cotidianos', input: '12.50\n7.25\n', expected: '19.75' }, { name: 'Sin gastos', input: '0\n0\n', expected: '0.00' }, { name: 'Precisión decimal', input: '1.10\n2.20\n', expected: '3.30' }]
  },
  {
    id: 'cs-budget', track: 'csharp', title: 'El límite lo pones tú', topic: 'Decisiones y límites', xp: 100,
    goal: 'Lee un presupuesto y un gasto, uno por línea. Indica si el gasto cabe en el presupuesto.',
    requirements: ['Ambos números son no negativos y usan punto decimal.', 'Muestra Dentro cuando alcanza el presupuesto, o Excedido cuando no alcanza.', 'Gastar exactamente el presupuesto todavía está Dentro.'],
    lesson: 'Una condición expresa una pregunta cuya respuesta es verdadera o falsa. Las ramas de una decisión representan comportamientos distintos. Los valores de frontera, justo donde cambia la decisión, revelan errores que los ejemplos normales no muestran.',
    concepts: ['if y else permiten elegir qué instrucciones ejecutar a partir de una condición.', 'Los operadores de comparación distinguen igualdad, orden estricto y orden que incluye igualdad.'],
    question: '¿Qué tres situaciones cercanas al límite comprobarías antes de confiar en tu programa?',
    reflection: 'Justifica qué ocurre al gastar exactamente el presupuesto y menciona un caso a cada lado del límite.',
    hints: ['Representa el presupuesto como una marca en una recta: ¿dónde queda tu gasto?', '¿Qué ocurre si las dos cantidades son iguales?', '¿Las dos salidas corresponden a las situaciones que describiste?'],
    docs: 'https://learn.microsoft.com/es-es/dotnet/csharp/language-reference/statements/selection-statements',
    tests: [{ name: 'Queda presupuesto', input: '100\n25\n', expected: 'Dentro' }, { name: 'En el límite', input: '100\n100\n', expected: 'Dentro' }, { name: 'Un poco más', input: '100\n100.01\n', expected: 'Excedido' }, { name: 'Presupuesto cero', input: '0\n0\n', expected: 'Dentro' }]
  },
  {
    id: 'cs-many', track: 'csharp', title: 'Una semana de gastos', topic: 'Repetición y estado', xp: 120,
    goal: 'Lee la cantidad de gastos y después cada importe en una línea. Muestra el total con dos decimales.',
    requirements: ['La primera línea es un entero entre 0 y 1000.', 'Después vienen exactamente esa cantidad de importes no negativos con punto decimal.', 'Si no hay gastos, el total es 0.00. Muestra solo el total.'],
    lesson: 'Un ciclo repite un bloque mientras se cumple una regla. Algunas variables viven una sola vuelta; otras conservan información entre vueltas. Para razonar sobre un ciclo, anota su estado antes y después de cada repetición.',
    concepts: ['for y while expresan repetición. La elección depende de qué conoces sobre su duración.', 'El alcance de una variable indica desde dónde se puede utilizar. Inicializarla de nuevo cambia el estado conservado.'],
    question: '¿Qué información necesita sobrevivir de un gasto al siguiente?',
    reflection: 'Sigue a mano dos vueltas de tu programa. ¿Qué se conserva y qué cambia? ¿Qué ocurre con cero gastos?',
    hints: ['Dibuja una tabla con una fila por gasto y los valores que tiene tu programa.', '¿Algún valor vuelve al inicio antes de que hayas terminado?', '¿Cuántas lecturas haces cuando la primera entrada es cero?'],
    docs: 'https://learn.microsoft.com/es-es/dotnet/csharp/language-reference/statements/iteration-statements',
    tests: [{ name: 'Varios días', input: '3\n10.50\n20\n4.25\n', expected: '34.75' }, { name: 'Semana sin gastos', input: '0\n', expected: '0.00' }, { name: 'Un único gasto', input: '1\n7.30\n', expected: '7.30' }, { name: 'No perder el acumulado', input: '4\n1\n2\n3\n4\n', expected: '10.00' }]
  },
  {
    id: 'cs-categories', track: 'csharp', title: '¿En qué se va?', topic: 'Colecciones y agrupación', xp: 150,
    goal: 'Agrupa los gastos por categoría y muestra el total de cada categoría.',
    requirements: ['Primero lee un entero N. Para cada gasto lee la categoría en una línea y el importe en la siguiente.', 'Las categorías distinguen mayúsculas y no contienen dos puntos. Los importes son no negativos.', 'Muestra una línea por categoría con formato Categoria: 0.00. Se acepta cualquier orden.', 'Con N igual a cero no muestres ninguna línea.'],
    lesson: 'Una colección permite trabajar con varios elementos sin inventar una variable por cada uno. Algunas colecciones representan secuencias; otras relacionan claves y valores. Elegir una estructura empieza por identificar qué preguntas necesita contestar tu programa.',
    concepts: ['List almacena una secuencia. Dictionary relaciona claves únicas con valores. Ambas son herramientas; puedes resolver el reto con otra estructura.', 'Separar lectura, procesamiento y presentación ayuda a explicar lo que ocurre.'],
    question: 'Si una categoría aparece por segunda vez, ¿qué información necesitas recuperar?',
    reflection: 'Explica por qué elegiste tu estructura y qué sucede cuando la categoría ya existía.',
    hints: ['Inventa un ejemplo donde la primera y la última categoría sean la misma.', '¿Tu representación permite distinguir una categoría nueva de una conocida?', '¿Estás mostrando un resultado por gasto o un resultado por categoría?'],
    docs: 'https://learn.microsoft.com/es-es/dotnet/csharp/language-reference/builtin-types/collections',
    tests: [{ name: 'Categorías que regresan', input: '3\nComida\n10\nBus\n4\nComida\n2.50\n', expected: 'Comida: 12.50\nBus: 4.00', unordered: true }, { name: 'Sin registros', input: '0\n', expected: '', unordered: true }, { name: 'Categorías distintas', input: '2\nCafe\n5\ncafe\n6\n', expected: 'Cafe: 5.00\ncafe: 6.00', unordered: true }]
  },
  {
    id: 'cs-save', track: 'csharp', title: 'Tu bitácora recuerda', topic: 'Archivos y aplicación CLI', xp: 200,
    goal: 'Convierte la bitácora en una herramienta de terminal que conserve los gastos entre ejecuciones.',
    requirements: ['Los datos se guardan en el directorio de trabajo actual, usando un archivo y formato que tú elijas.', 'Argumentos agregar Categoria Importe: guarda el gasto y muestra Guardado.', 'Argumento total: muestra la suma guardada con dos decimales; sin registros muestra 0.00.', 'Importes válidos, no negativos y con punto decimal. Las categorías de esta misión no contienen espacios.', 'Cada comprobación usa una carpeta temporal limpia; las ejecuciones de una misma comprobación comparten esa carpeta.'],
    lesson: 'La memoria del proceso desaparece cuando el programa termina. Un archivo conserva información para otra ejecución. Una aplicación de línea de comandos recibe argumentos al iniciarse: no son las líneas que lees después de la entrada estándar. El directorio de trabajo indica dónde se resuelven las rutas relativas.',
    concepts: ['args contiene los argumentos de inicio en un programa C# con instrucciones de nivel superior.', 'System.IO ofrece lectura y escritura de archivos. Antes de elegir un formato piensa cómo podrás recuperar cada dato.', 'Persistir requiere decidir qué guardar, dónde guardarlo y cómo interpretarlo después.'],
    question: 'Cuando cierras tu programa, ¿qué información se pierde y cuál debe permanecer?',
    reflection: 'Describe el formato que elegiste, cómo recuperas los datos y una mejora para manejar archivos dañados.',
    hints: ['Ejecuta el programa dos veces. ¿La segunda ejecución parte del estado que esperabas?', '¿Estás trabajando con argumentos de inicio o esperando nuevas entradas?', '¿Qué debería ocurrir la primera vez, cuando todavía no existe ningún archivo?'],
    docs: 'https://learn.microsoft.com/es-es/dotnet/standard/io/',
    tests: [{ name: 'Primera apertura', steps: [{ args: ['total'], expected: '0.00' }] }, { name: 'Datos entre ejecuciones', steps: [{ args: ['agregar', 'Cafe', '12.50'], expected: 'Guardado' }, { args: ['agregar', 'Bus', '8.25'], expected: 'Guardado' }, { args: ['total'], expected: '20.75' }] }]
  },
  ...advancedMissions.filter(m => m.track === 'csharp'),
  {
    id: 'cpp-welcome', track: 'cpp', title: 'Una nueva herramienta', topic: 'Compilar C++', xp: 60,
    goal: 'Comienza una herramienta para analizar mediciones. Al ejecutarse debe mostrar Analizador listo.',
    requirements: ['Muestra solo la línea Analizador listo.', 'Compila usando C++17 o posterior.'],
    lesson: 'En C++, compilar y ejecutar son pasos separados. El compilador produce un binario para tu sistema. El punto de entrada main indica dónde comienza el programa; los encabezados dan acceso a declaraciones de la biblioteca estándar.',
    concepts: ['El encabezado iostream declara los flujos de entrada y salida. std::cout es el flujo de salida estándar.', 'Una función tiene un tipo de retorno, un nombre, parámetros y un cuerpo. main es el punto de entrada de un programa C++.'],
    question: '¿Qué archivo escribes tú y qué archivo debería producir el compilador?',
    reflection: 'Explica la diferencia entre el fuente y el ejecutable. ¿Por qué hay que compilar de nuevo después de cambiar el fuente?',
    hints: ['¿El problema aparece durante la compilación o al ejecutar el binario?', '¿Tu programa tiene un punto de entrada reconocido por el compilador?', '¿Has vuelto a compilar después de tu último cambio?'],
    docs: 'https://learn.microsoft.com/es-es/cpp/cpp/main-function-command-line-args',
    tests: [{ name: 'El analizador arranca', input: '', expected: 'Analizador listo' }]
  },
  {
    id: 'cpp-range', track: 'cpp', title: 'Los extremos de una serie', topic: 'Entrada, ciclos y límites', xp: 140,
    goal: 'Lee una cantidad N y después N enteros. Muestra el menor y el mayor separados por un espacio.',
    requirements: ['N está entre 1 y 1000. Las mediciones están entre -1000000 y 1000000.', 'La salida contiene solo los dos extremos: menor mayor.', 'No se exige un algoritmo o estructura específicos.'],
    lesson: 'Para encontrar una propiedad de una secuencia, piensa qué información permite describir lo visto hasta cada momento. Los valores iniciales deben tener sentido para todas las entradas válidas, incluidos los números negativos.',
    concepts: ['std::cin permite extraer valores de la entrada estándar.', 'std::vector puede almacenar una cantidad variable de elementos. También hay problemas que pueden resolverse conservando solo parte de la información.'],
    question: '¿Qué serie pequeña te permitiría descubrir si tu elección inicial de valores falla?',
    reflection: 'Justifica tu estado inicial con una serie de números negativos y una serie de un solo elemento.',
    hints: ['Prueba una serie donde todos los valores sean negativos.', '¿Tu resultado siempre pertenece a la serie que leíste?', '¿Qué significa encontrar los extremos cuando solo hay un elemento?'],
    docs: 'https://learn.microsoft.com/es-es/cpp/standard-library/vector-class',
    tests: [{ name: 'Mediciones mixtas', input: '4\n3 -2 8 1\n', expected: '-2 8' }, { name: 'Todos negativos', input: '3\n-8 -2 -20\n', expected: '-20 -2' }, { name: 'Un solo valor', input: '1\n5\n', expected: '5 5' }]
  },
  ...advancedMissions.filter(m => m.track === 'cpp'),
  ...scriptMissions
];
const tracks = [
  { id: 'foundations', name: 'Antes del código', project: 'Bases y buenas prácticas', description: 'Primero aprende a pensar, planear, comprobar y trabajar con cuidado. No necesitas crear un proyecto.', filename: '' },
  { id: 'csharp', name: 'C#', project: 'Bitácora de gastos', description: 'De tu primera línea a una bitácora con validación, informes y presupuesto.', filename: 'Program.cs' },
  { id: 'cpp', name: 'C++', project: 'Analizador de mediciones', description: 'De los extremos a la estadística, la mediana y los datos persistentes.', filename: 'main.cpp' },
  { id: 'python', name: 'Python', project: 'Registro de hábitos', description: 'De tu primer script a un registro que conserva sesiones.', filename: 'main.py' },
  { id: 'javascript', name: 'JavaScript', project: 'Gestor de tareas', description: 'Aprende Node.js creando una lista de tareas persistente.', filename: 'app.js' }
];
for (const mission of missions) {
  if (mission.kind !== 'foundation') {
    mission.example = examples[mission.id];
    mission.guidance = guidance[mission.id];
  }
}
module.exports = { missions, tracks };
