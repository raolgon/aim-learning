'use strict';
const { advancedGuidance } = require('./advanced-guidance');

// El puente enseña a trasladar un concepto al reto. No contiene programas
// completos ni la salida construida en código para ninguna misión.
const guidance = {
  'cs-welcome': {
    tools: 'Trabaja en Program.cs. En este proyecto puedes escribir instrucciones directamente. Console.WriteLine(...) muestra una línea; el texto que quieres mostrar va entre comillas dobles y la instrucción termina con ;.',
    path: 'Mira el saludo del ejemplo. Identifica qué parte llama al método y qué parte es el mensaje. Conserva la forma de la instrucción y decide qué texto debe ocupar el lugar del saludo para cumplir tu reto. No necesitas leer datos ni hacer cálculos.',
    check: 'Guarda Program.cs, ejecuta dotnet run y observa la línea que imprimió tu programa. ¿Tiene exactamente las letras, el acento y los espacios que pide la misión?'
  },
  'cs-total': {
    tools: 'Console.ReadLine() obtiene una línea como string. decimal.Parse(texto, CultureInfo.InvariantCulture) permite tratarla como cantidad con punto decimal. Puedes guardar datos y resultados en variables; ToString("F2", CultureInfo.InvariantCulture) controla cómo se muestra un decimal.',
    path: 'El ejemplo convierte una sola línea y la imprime. Aquí llegan dos líneas: piensa qué operación falta entre convertirlas y mostrar el resultado. Decide si necesitas reutilizar una variable o conservar ambas cantidades. Puedes elegir nombres y organización propios.',
    check: 'Sigue a mano el caso 8.00 y 3.50. Después prueba dos ceros y cantidades con centavos. La terminal debe mostrar solo el número final con dos cifras decimales.'
  },
  'cs-budget': {
    tools: 'Lee y convierte cada cantidad como en la misión anterior. if y else separan dos caminos; una comparación entre números produce la condición. >= incluye la igualdad, mientras que > no la incluye.',
    path: 'Anota cuál entrada representa el presupuesto y cuál representa el gasto. Formula en palabras cuándo debe aparecer cada mensaje; luego traduce esa regla a una condición. Escribe una salida dentro de cada camino, sin imprimir ambos mensajes.',
    check: 'Ensaya un gasto menor, uno idéntico y uno mayor al presupuesto. El caso idéntico te dirá si elegiste correctamente el límite.'
  },
  'cs-many': {
    tools: 'int.Parse(Console.ReadLine()!) sirve para leer la cantidad de gastos. Un ciclo for o while puede repetir la lectura de cada importe. Una variable decimal declarada antes del ciclo puede conservar información entre vueltas.',
    path: 'Separa el trabajo en tres momentos: leer cuántos importes vienen, procesar exactamente esa cantidad y presentar el resultado. Dibuja dos vueltas: ¿qué valor llega a la segunda y qué valor es nuevo? Decide dónde inicializar cada variable.',
    check: 'Con cero gastos no deberías intentar leer un importe. Con un gasto, el ciclo debe dar una vuelta; con varios, comprueba que ninguna cantidad se pierde.'
  },
  'cs-categories': {
    tools: 'Un Dictionary<string, decimal> puede relacionar cada nombre con una cantidad; una lista también es válida si prefieres buscar manualmente. ContainsKey o TryGetValue ayudan a distinguir una clave nueva de una que ya apareció.',
    path: 'Por cada registro llegan dos líneas: categoría e importe. Antes de mostrar resultados, decide cómo conservar el total parcial asociado a cada nombre. Cuando vuelva una categoría, razona qué dato necesitas consultar y actualizar. Después recorre tus resultados para presentarlos.',
    check: 'Prueba dos gastos de la misma categoría y uno de otra. Debe haber una línea por categoría, aunque haya varios registros. Compara también nombres que solo difieren en mayúsculas.'
  },
  'cs-save': {
    tools: 'args permite leer palabras pasadas al iniciar el programa. File.Exists comprueba si ya hay un archivo; File.ReadAllText, File.WriteAllText y File.AppendAllText permiten leer, sustituir o agregar texto. Elige un formato que después puedas interpretar.',
    path: 'Primero distingue los dos comandos posibles a partir de args. Para agregar, piensa qué datos recibes y cómo conservarlos sin perder los anteriores. Para total, piensa cómo recuperar lo guardado y obtener una cantidad. Decide qué hacer si aún no existe el archivo.',
    check: 'Ejecuta agregar en un proceso y total en otro: la memoria del primer proceso ya no existe. Repite con dos registros y en una carpeta limpia. Revisa que solo aparezca el mensaje pedido por cada comando.'
  },
  'cpp-welcome': {
    tools: '#include <iostream> permite usar std::cout. Un programa C++ empieza en la función int main() y las instrucciones van dentro de sus llaves. std::cout puede enviar texto a la salida y "\\n" termina una línea.',
    path: 'Observa qué partes del ejemplo preparan el programa y cuál escribe el saludo. Conserva la estructura necesaria para compilar y decide qué mensaje exige tu reto. Guarda main.cpp antes de compilar.',
    check: 'Compila y ejecuta el binario desde la terminal. Si cambias el archivo, compila otra vez. Comprueba que la salida sea una sola línea con el texto solicitado.'
  },
  'cpp-range': {
    tools: 'std::cin >> variable lee enteros; un ciclo puede procesar N valores. Las variables declaradas antes del ciclo conservan su valor entre vueltas. Una comparación permite decidir cuándo actualizar un valor guardado.',
    path: 'Primero lee N. Piensa qué información sobre los valores anteriores necesitarás al recibir el siguiente. Decide cómo iniciar esa información para que funcione incluso con valores negativos. Puedes almacenar toda la serie o procesarla mientras llega.',
    check: 'Usa una serie de un solo elemento y otra formada solo por negativos. Sigue a mano el estado después de cada lectura y comprueba el orden de los dos valores que muestras.'
  },
  'py-welcome': {
    tools: 'Trabaja en main.py. print(...) muestra una línea; un texto literal va entre comillas. Los comentarios con # solo explican el archivo.',
    path: 'Mira el saludo del ejemplo y separa la herramienta de salida del mensaje. Conserva la forma de la instrucción y decide qué texto necesita tu registro. No hay que leer datos todavía.',
    check: 'Guarda main.py y ejecútalo con Python. La terminal debe mostrar solo una línea con las letras, espacios y acentos del contrato.'
  },
  'py-sessions': {
    tools: 'int(input()) interpreta una línea como entero. range(n) permite repetir n veces las instrucciones con sangría. Una variable creada antes del ciclo puede conservar un total entre vueltas.',
    path: 'Primero separa la cantidad de sesiones de sus duraciones. Dibuja dos vueltas y anota qué dato es nuevo y cuál debe sobrevivir. El ejemplo repite una acción, pero no acumula: tú decides cómo representar el resultado parcial.',
    check: 'Con N igual a cero no debes pedir más líneas. Con varias sesiones, sigue el total a mano y compara la única línea de salida con tu cálculo.'
  },
  'py-history': {
    tools: 'sys.argv contiene los argumentos de inicio. Path puede leer y escribir texto; Path.exists ayuda con la primera ejecución. int convierte los minutos recibidos. Puedes usar texto por líneas o JSON para guardar varias sesiones.',
    path: 'Distingue tres comandos antes de tocar el archivo. Para registrar, conserva lo anterior y añade una sesión. Para total e historial, recupera todas las sesiones y decide cómo presentarlas. Los índices visibles empiezan en uno.',
    check: 'En una carpeta vacía prueba total e historial. Después ejecuta registrar dos veces en procesos separados y consulta ambos resultados. Comprueba que ningún comando imprime texto extra.'
  },
  'js-welcome': {
    tools: 'Trabaja en app.js. console.log(...) muestra una línea y el texto que recibe va entre comillas. El punto y coma termina la instrucción.',
    path: 'Separa en el ejemplo la llamada que escribe de la frase que se muestra. Conserva la estructura necesaria y decide el mensaje de tu gestor. Todavía no necesitas fs ni argumentos.',
    check: 'Guarda app.js, ejecuta node app.js y compara la línea exacta que apareció con el contrato.'
  },
  'js-pending': {
    tools: 'fs.readFileSync(0, "utf8") obtiene toda la entrada como texto. split(/\\r?\\n/) separa líneas y Number transforma N en cantidad. Un ciclo puede visitar los N estados; === compara cada estado con una palabra.',
    path: 'El ejemplo lee N palabras y produce N resultados. Tu reto pide un solo número: piensa qué debes conservar entre vueltas y cuándo debe cambiar. No cuentes la primera línea como si fuera una tarea.',
    check: 'Prueba N igual a cero, todos los estados hechos y una mezcla. La salida debe ser solo el número de pendientes, sin títulos ni preguntas.'
  },
  'js-save': {
    tools: 'process.argv.slice(2) deja el comando y sus datos. fs.existsSync, fs.readFileSync y fs.writeFileSync sirven para recuperar y guardar el estado. JSON.parse y JSON.stringify son una opción para representar una colección de tareas.',
    path: 'Antes de cada comando, decide qué estado existe. Agregar crea una tarea pendiente; listar recorre todas en orden; completar cambia solo la tarea indicada. Conserva nombre y estado al escribir el archivo de nuevo. El índice que ve el usuario empieza en uno.',
    check: 'Ejecuta agregar y listar en procesos separados. Luego completa la primera de dos tareas y vuelve a listar: la segunda debe seguir pendiente. Prueba también listar en una carpeta limpia.'
  },
  ...advancedGuidance
};

module.exports = { guidance };
