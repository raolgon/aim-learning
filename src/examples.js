'use strict';
const { advancedExamples } = require('./advanced-examples');

// These are complete examples of DIFFERENT problems. The learner's mission
// contracts have no implementation stored here or elsewhere in the extension.
const examples = {
  'cs-welcome': {
    intro: 'Este programa muestra un saludo. En C# puedes escribir una instrucción directamente en Program.cs: el proyecto se encarga del punto de entrada.',
    code: 'Console.WriteLine("Hola desde C#");',
    input: '', output: 'Hola desde C#',
    explanation: 'Console.WriteLine muestra lo que hay entre comillas y termina la línea. Las comillas delimitan el texto; el punto y coma termina la instrucción. No escribas las comillas como parte de la salida.',
    steps: ['Abre Program.cs. Los comentarios que empiezan por // solo te orientan: no se ejecutan.', 'Escribe una instrucción de salida con el texto que pide tu misión. Guarda el archivo.', 'En Terminal, ejecuta dotnet run y compara la línea que aparece con el contrato. Si cambias el archivo, vuelve a ejecutar.']
  },
  'cs-total': {
    intro: 'Aquí una sola entrada de texto se convierte en número y se presenta con dos decimales. El ejemplo no hace el cálculo de tu misión.',
    code: 'using System.Globalization;\n\nstring texto = Console.ReadLine()!;\ndecimal valor = decimal.Parse(texto, CultureInfo.InvariantCulture);\nConsole.WriteLine(valor.ToString("F2", CultureInfo.InvariantCulture));',
    input: '4.5', output: '4.50',
    explanation: 'ReadLine devuelve texto. decimal.Parse lo interpreta como número usando el punto decimal. ToString("F2") controla el formato de salida. El signo ! indica aquí que esperamos una línea de entrada; no realiza la conversión.',
    steps: ['En Program.cs, piensa cuántas líneas necesitas leer según el contrato.', 'Convierte cada entrada a un tipo numérico antes de operar. Decide qué cálculo representa el total.', 'Prueba con un par de cantidades decimales y luego con cero; compara los dos decimales de la salida.']
  },
  'cs-budget': {
    intro: 'Este ejemplo decide algo distinto: si una persona es mayor de edad.',
    code: 'int edad = int.Parse(Console.ReadLine()!);\nif (edad >= 18)\n{\n    Console.WriteLine("Mayor de edad");\n}\nelse\n{\n    Console.WriteLine("Menor de edad");\n}',
    input: '20', output: 'Mayor de edad',
    explanation: 'La comparación >= incluye la igualdad. Solo se ejecuta una rama. Con 18 también se mostraría Mayor de edad; con 17, Menor de edad.',
    steps: ['Anota qué dos datos recibe el reto y en qué orden. Ya conoces ReadLine y la conversión numérica.', 'Escribe con palabras la condición que separa los dos resultados y decide qué pasa cuando ambos valores son iguales.', 'Prueba un valor menor, uno igual y uno mayor al límite.']
  },
  'cs-many': {
    intro: 'Un ciclo puede repetir una acción un número conocido de veces. Aquí se muestran índices, sin calcular gastos.',
    code: 'for (int i = 0; i < 3; i++)\n{\n    Console.WriteLine(i);\n}',
    input: '', output: '0\n1\n2',
    explanation: 'El ciclo empieza con i igual a 0, comprueba i < 3 y aumenta i después de cada vuelta. Por eso el cuerpo se ejecuta tres veces. Una variable declarada dentro del cuerpo no conserva automáticamente su valor para la siguiente vuelta.',
    steps: ['Lee primero la cantidad de elementos. Dibuja cuántas vueltas debería dar tu ciclo.', 'Piensa qué dato necesitas conservar entre vueltas y dónde debería vivir esa variable.', 'Comprueba los extremos: ninguna entrada y una sola entrada.']
  },
  'cs-categories': {
    intro: 'Una colección por clave permite recuperar un valor asociado con un nombre. Aquí se controla el stock de un artículo, no gastos.',
    code: 'var stock = new Dictionary<string, int>();\nstock["lapiz"] = 2;\nstock["lapiz"] += 1;\nConsole.WriteLine(stock["lapiz"]);',
    input: '', output: '3',
    explanation: 'La clave "lapiz" identifica un único valor. La última instrucción lee el valor actualizado. Si una clave no existe, leerla directamente produce un error; antes conviene comprobarla o usar una operación que admita esa situación.',
    steps: ['Escribe un ejemplo a mano con dos categorías iguales y una distinta.', 'Elige cómo recordar el resultado parcial de cada categoría. Una lista o un diccionario pueden servir.', 'Comprueba que aparece una sola línea por categoría y prueba también cero registros.']
  },
  'cs-save': {
    intro: 'Un archivo conserva texto para otra ejecución. Este ejemplo escribe y lee una nota sencilla; el formato de tus gastos lo decides tú.',
    code: 'File.WriteAllText("nota.txt", "Recuerda probar");\nstring nota = File.ReadAllText("nota.txt");\nConsole.WriteLine(nota);',
    input: '', output: 'Recuerda probar',
    explanation: 'La ruta relativa nota.txt se resuelve en el directorio desde el que ejecutas el programa. WriteAllText sustituye el contenido anterior: para un registro que crece necesitarás decidir cómo conservar lo existente. El programa recibe los argumentos de inicio mediante args.',
    steps: ['Desde la terminal, decide qué significa agregar y qué significa total para tu herramienta.', 'Elige un archivo y un formato que puedas volver a leer en otra ejecución.', 'Ejecuta agregar, cierra el proceso y ejecuta total. Prueba también una carpeta donde aún no exista el archivo.']
  },
  'cpp-welcome': {
    intro: 'Un programa C++ necesita un punto de entrada. Este ejemplo muestra otro mensaje y se puede compilar como archivo main.cpp.',
    code: '#include <iostream>\n\nint main()\n{\n    std::cout << "Hola desde C++\\n";\n    return 0;\n}',
    input: '', output: 'Hola desde C++',
    explanation: '#include da acceso a las declaraciones de entrada y salida. main es donde comienza la ejecución; std::cout escribe en la terminal. El salto de línea \\n termina la línea mostrada. El archivo fuente se compila antes de ejecutar el binario.',
    steps: ['Abre main.cpp. Escribe un programa con punto de entrada y salida de texto.', 'Guarda, compila con el comando de la pestaña Terminal y ejecuta el binario creado.', 'Comprueba el texto exacto solicitado por tu misión. Después cambia una letra y observa por qué necesitas compilar otra vez.']
  },
  'cpp-range': {
    intro: 'Este programa lee una cantidad conocida de enteros y muestra el doble de cada uno. Practica entrada y repetición sin encontrar extremos.',
    code: '#include <iostream>\n\nint main()\n{\n    int cantidad;\n    std::cin >> cantidad;\n    for (int i = 0; i < cantidad; ++i)\n    {\n        int valor;\n        std::cin >> valor;\n        std::cout << valor * 2 << "\\n";\n    }\n    return 0;\n}',
    input: '2\n4 -3', output: '8\n-6',
    explanation: 'std::cin extrae enteros aunque estén en distintas líneas o separados por espacios. cantidad controla el número de vueltas. valor solo necesita vivir durante una vuelta; el ejemplo no conserva resultados anteriores.',
    steps: ['Lee N y después N mediciones. Pueden venir en líneas distintas o separadas por espacios.', 'Razona qué información debe permanecer válida mientras avanzas por los valores.', 'Prueba una sola medición y una serie formada solo por números negativos.']
  },
  'py-welcome': {
    intro: 'Este script saluda desde Python. Usa la misma herramienta de salida que necesitarás, pero resuelve otra situación.',
    code: 'print("Hola desde Python")',
    input: '', output: 'Hola desde Python',
    explanation: 'print envía el texto entre comillas a la terminal y termina la línea. Las comillas delimitan el texto, pero no aparecen en la salida.',
    steps: ['Abre main.py y distingue los comentarios del código que sí se ejecuta.', 'Observa qué parte del ejemplo es la instrucción y qué parte es el mensaje. Decide el texto de tu misión.', 'Guarda y ejecuta el archivo desde Terminal. Compara letras, acentos y espacios.']
  },
  'py-sessions': {
    intro: 'Aquí una cantidad controla cuántas palabras se leen y se muestran en mayúsculas. El ejemplo no calcula minutos.',
    code: 'cantidad = int(input())\nfor _ in range(cantidad):\n    palabra = input()\n    print(palabra.upper())',
    input: '2\nsol\nluna\n', output: 'SOL\nLUNA',
    explanation: 'La primera línea se convierte en número. range(cantidad) determina las vueltas y las instrucciones con sangría se repiten. Cada palabra es nueva en su vuelta; este ejemplo no conserva un total.',
    steps: ['Lee la primera línea como cantidad de sesiones. Dibuja cuántas vueltas habrá si vale cero, uno o tres.', 'En cada vuelta lee una duración como entero. Decide qué información debe mantenerse entre vueltas.', 'Muestra solo el total y pruébalo con una semana vacía y otra con varias sesiones.']
  },
  'py-history': {
    intro: 'Este ejemplo guarda y recupera una nota de texto. Tu registro necesitará conservar varias sesiones y distinguir comandos.',
    code: 'from pathlib import Path\n\nruta = Path("nota.txt")\nruta.write_text("Recordar descansar", encoding="utf-8")\nprint(ruta.read_text(encoding="utf-8"))',
    input: '', output: 'Recordar descansar',
    explanation: 'Path representa una ruta. write_text crea o sustituye el contenido; read_text lo recupera. Si tu historial tiene varias sesiones, decide un formato que permita volver a leerlas sin perder las anteriores.',
    steps: ['Anota qué palabras recibirá el script al iniciarse para registrar, calcular el total o mostrar el historial.', 'Elige un formato de archivo que permita reconstruir todas las sesiones en una ejecución nueva.', 'Prueba primero una carpeta vacía y después registra dos sesiones en procesos separados antes de consultar total e historial.']
  },
  'js-welcome': {
    intro: 'Este archivo muestra un saludo desde Node.js. Tu misión usa la misma idea de salida con otro mensaje.',
    code: 'console.log("Hola desde JavaScript");',
    input: '', output: 'Hola desde JavaScript',
    explanation: 'console.log escribe el texto y termina la línea. Las comillas delimitan el literal y el punto y coma termina la instrucción.',
    steps: ['Abre app.js. Los comentarios que empiezan por // orientan, pero no se ejecutan.', 'Identifica la llamada de salida y el texto del ejemplo. Decide qué debe mostrar tu gestor.', 'Guarda, ejecuta con Node.js y compara la salida exacta con el contrato.']
  },
  'js-pending': {
    intro: 'Este programa lee palabras y muestra la longitud de cada una. Practica entrada y repetición sin contar tareas.',
    code: 'const fs = require("node:fs");\nconst lineas = fs.readFileSync(0, "utf8").trim().split(/\\r?\\n/);\nconst cantidad = Number(lineas[0]);\nfor (let i = 0; i < cantidad; i++) {\n  console.log(lineas[i + 1].length);\n}',
    input: '2\nsol\nluna\n', output: '3\n4',
    explanation: 'fs lee el texto completo de la entrada estándar. La primera línea controla el ciclo y cada vuelta usa una de las líneas siguientes. El ejemplo muestra una longitud por palabra; tu misión necesita un único conteo final.',
    steps: ['Separa la primera línea de los N estados. Considera que N puede ser cero.', 'Recorre los estados y decide qué condición modifica la cantidad que quieres mostrar.', 'Prueba una lista vacía, una tarea pendiente y una mezcla de estados.']
  },
  'js-save': {
    intro: 'Este ejemplo escribe y vuelve a leer una nota. Tu gestor tendrá varias tareas con nombre y estado, además de comandos.',
    code: 'const fs = require("node:fs");\nfs.writeFileSync("nota.txt", "Revisar mis cambios", "utf8");\nconst nota = fs.readFileSync("nota.txt", "utf8");\nconsole.log(nota);',
    input: '', output: 'Revisar mis cambios',
    explanation: 'writeFileSync sustituye el contenido del archivo y readFileSync lo recupera. Para una lista que crece, primero necesitarás recuperar el estado existente y después guardarlo de nuevo con el cambio.',
    steps: ['Distingue los comandos agregar, listar y completar a partir de los argumentos de inicio.', 'Decide cómo representar el nombre, el estado y el orden de cada tarea en un archivo.', 'Ejecuta varios procesos seguidos: agrega dos tareas, consulta la lista, completa una y vuelve a listar.']
  },
  ...advancedExamples
};

module.exports = { examples };
