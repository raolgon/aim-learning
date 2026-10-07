'use strict';

const advancedMissions = [
  {
    id: 'cs-validate', track: 'csharp', title: 'Un registro confiable', topic: 'Validación y funciones', xp: 220,
    goal: 'Amplía tu bitácora: rechaza importes inválidos antes de modificar los gastos guardados.',
    requirements: ['Conserva agregar Categoria Importe y total de la misión anterior.', 'Si agregar recibe una categoría pero no un importe, muestra Uso: agregar Categoria Importe.', 'Si el importe no es un decimal no negativo con punto decimal, muestra Importe inválido.', 'Un intento rechazado no debe alterar los datos guardados; el programa termina normalmente y no imprime texto adicional.', 'Las categorías de esta misión no contienen espacios.'],
    lesson: 'Validar significa separar los datos aceptables de los que no deben cambiar el estado. En una aplicación con archivos, el orden importa: primero interpreta y comprueba, después escribe. Una función pequeña puede expresar esa regla y devolver si fue posible obtener un importe válido. La ruta de error también merece pruebas.',
    concepts: ['decimal.TryParse permite intentar convertir sin depender de una excepción para un error esperado. CultureInfo.InvariantCulture fija el punto decimal y NumberStyles permite decidir qué separadores aceptar.', 'Una función con parámetros y valor de retorno puede separar la validación del guardado. El nombre debe contar qué decisión representa.', 'Antes de escribir en disco, comprueba la cantidad de argumentos y el rango del valor.'],
    question: '¿En qué momento exacto puedes asegurar que un comando agregar no cambiará el archivo?',
    reflection: 'Describe el orden entre validar y escribir. ¿Cómo comprobaste que un intento inválido no dañó un registro anterior?',
    hints: ['Ensaya agregar con un importe escrito como palabra. ¿A qué parte del programa llega?', 'Compara el archivo o el total antes y después de un intento inválido.', '¿La conversión depende de la configuración regional de Windows? Prueba un valor con punto decimal.'],
    docs: 'https://learn.microsoft.com/es-es/dotnet/api/system.decimal.tryparse',
    tests: [
      { name: 'Faltan datos', steps: [{ args: ['agregar', 'Cafe'], expected: 'Uso: agregar Categoria Importe' }, { args: ['total'], expected: '0.00' }] },
      { name: 'Texto inválido sin efectos', steps: [{ args: ['agregar', 'Bus', '8.25'], expected: 'Guardado' }, { args: ['agregar', 'Cafe', 'mucho'], expected: 'Importe inválido' }, { args: ['total'], expected: '8.25' }] },
      { name: 'Negativos y coma rechazados', steps: [{ args: ['agregar', 'Cafe', '-1'], expected: 'Importe inválido' }, { args: ['agregar', 'Cafe', '1,5'], expected: 'Importe inválido' }, { args: ['agregar', 'Cafe', '0'], expected: 'Guardado' }, { args: ['total'], expected: '0.00' }] }
    ]
  },
  {
    id: 'cs-report', track: 'csharp', title: 'Entiende tus gastos', topic: 'Agrupación y diseño de funciones', xp: 250,
    goal: 'Añade el comando resumen: muestra cuánto se ha gastado en cada categoría guardada.',
    requirements: ['Conserva agregar, total y la validación de la misión anterior.', 'resumen muestra una línea por categoría con formato Categoria: 0.00.', 'Ordena las categorías alfabéticamente con comparación ordinal; distingue mayúsculas de minúsculas.', 'En una bitácora vacía, resumen no muestra ninguna línea.', 'Muestra solo el informe, sin título ni mensajes extra.'],
    lesson: 'Un informe lee datos ya guardados, los agrupa y los presenta. Si separas lectura, agrupación y formato, puedes probar cada decisión con casos pequeños. Un diccionario puede acumular por clave; ordenar las claves hace que la salida sea previsible. La comparación ordinal evita que el orden cambie con la cultura del equipo.',
    concepts: ['Dictionary relaciona una categoría con su total. Una clave repetida modifica un grupo existente, no crea otra línea.', 'StringComparer.Ordinal y el ordenamiento permiten un resultado reproducible.', 'Extraer funciones para cargar datos, agrupar y presentar reduce la cantidad de decisiones mezcladas en el comando principal.'],
    question: '¿Qué cambia cuando una categoría aparece por tercera vez y qué debe quedar igual en el informe?',
    reflection: 'Explica cómo separaste los datos guardados del informe. ¿Qué prueba demuestra que no duplicas categorías?',
    hints: ['Registra Cafe, Bus y Cafe. ¿Cuántas líneas debe producir resumen?', '¿Estás ordenando registros individuales o los nombres de los grupos?', 'Prueba dos nombres que solo difieran en mayúsculas.'],
    docs: 'https://learn.microsoft.com/es-es/dotnet/api/system.collections.generic.dictionary-2',
    tests: [
      { name: 'Informe vacío', steps: [{ args: ['resumen'], expected: '' }] },
      { name: 'Agrupa y ordena', steps: [{ args: ['agregar', 'Bus', '8.25'], expected: 'Guardado' }, { args: ['agregar', 'Cafe', '2.50'], expected: 'Guardado' }, { args: ['agregar', 'Bus', '1.75'], expected: 'Guardado' }, { args: ['resumen'], expected: 'Bus: 10.00\nCafe: 2.50' }] },
      { name: 'Mayúsculas distintas', steps: [{ args: ['agregar', 'cafe', '1'], expected: 'Guardado' }, { args: ['agregar', 'Cafe', '2'], expected: 'Guardado' }, { args: ['resumen'], expected: 'Cafe: 2.00\ncafe: 1.00' }] }
    ]
  },
  {
    id: 'cs-limit', track: 'csharp', title: 'Presupuesto que permanece', topic: 'Estado persistente y reglas de negocio', xp: 280,
    goal: 'Permite fijar un presupuesto y consultar el saldo teniendo en cuenta todos los gastos guardados.',
    requirements: ['Conserva los comandos anteriores.', 'limite Importe guarda o reemplaza un presupuesto no negativo y muestra Límite guardado.', 'estado muestra Sin límite si nunca se guardó un presupuesto.', 'Con un presupuesto, estado muestra Disponible: 0.00 si el saldo es cero o positivo; si se superó, muestra Excedido: 0.00 con la diferencia positiva.', 'Usa dos decimales y punto decimal. El presupuesto debe sobrevivir entre ejecuciones en el mismo directorio.'],
    lesson: 'El gasto total y el presupuesto son datos relacionados, pero tienen ciclos de vida distintos: los gastos se agregan y el presupuesto se reemplaza. Guardarlos de forma independiente puede simplificar el diseño. Al calcular el saldo, razona primero con casos de igualdad y exceso; el texto de salida representa el estado, no solo el número.',
    concepts: ['Una ruta de archivo relativa se resuelve desde el directorio actual; un archivo separado puede representar una configuración que cambia.', 'Puedes reutilizar la función que carga gastos y la que valida importes.', 'Las pruebas de frontera distinguen disponible cero de excedido y una primera ejecución sin configuración.'],
    question: '¿Cómo distinguirías un presupuesto de cero de uno que nunca se ha configurado?',
    reflection: 'Explica dónde guardaste el presupuesto y cómo comprobaste que reemplazarlo no borra los gastos.',
    hints: ['Empieza en una carpeta vacía: ¿qué debe responder estado antes de fijar un límite?', 'Fija un límite, ejecuta el programa de nuevo y consulta estado.', 'Prueba un gasto exactamente igual al límite y otro que lo supere por un centavo.'],
    docs: 'https://learn.microsoft.com/es-es/dotnet/standard/io/how-to-read-text-from-a-file',
    tests: [
      { name: 'Sin configuración', steps: [{ args: ['estado'], expected: 'Sin límite' }] },
      { name: 'Igualdad y exceso', steps: [{ args: ['limite', '10'], expected: 'Límite guardado' }, { args: ['agregar', 'Bus', '10'], expected: 'Guardado' }, { args: ['estado'], expected: 'Disponible: 0.00' }, { args: ['agregar', 'Cafe', '0.25'], expected: 'Guardado' }, { args: ['estado'], expected: 'Excedido: 0.25' }] },
      { name: 'Reemplazar sin borrar gastos', steps: [{ args: ['agregar', 'Cafe', '3.50'], expected: 'Guardado' }, { args: ['limite', '4'], expected: 'Límite guardado' }, { args: ['estado'], expected: 'Disponible: 0.50' }, { args: ['limite', '2'], expected: 'Límite guardado' }, { args: ['estado'], expected: 'Excedido: 1.50' }, { args: ['total'], expected: '3.50' }] }
    ]
  },
  {
    id: 'cpp-stats', track: 'cpp', title: 'Más que extremos', topic: 'Funciones y tipos numéricos', xp: 180,
    goal: 'Amplía el análisis de mediciones: muestra menor, mayor, suma y promedio de una serie de enteros.',
    requirements: ['Lee N entre 1 y 1000, seguido de N enteros entre -1000000 y 1000000.', 'Muestra una sola línea con menor mayor suma promedio, separados por espacios.', 'El promedio debe tener exactamente dos decimales y punto decimal.', 'La suma debe conservar el signo; no imprimas etiquetas ni líneas extra.'],
    lesson: 'Un análisis puede producir varios resultados de la misma serie. Una función permite dar nombre a un cálculo y decidir qué datos necesita. Los tipos enteros conservan sumas exactas dentro de su rango; para el promedio debes decidir cuándo pasar a una división no entera. La precisión de salida se controla por separado.',
    concepts: ['Una función puede recibir datos por parámetros y devolver un resultado. Extraer el cálculo principal facilita revisarlo.', 'long long ofrece un rango amplio para acumulaciones; una división entre enteros elimina la parte fraccionaria.', 'std::fixed y std::setprecision controlan la presentación del promedio.'],
    question: '¿Qué valor se perdería si divides la suma entre N usando solo enteros?',
    reflection: 'Describe qué partes separaste en funciones y cómo evitaste perder la fracción del promedio.',
    hints: ['Sigue a mano la serie 1 y 2: el promedio no es entero.', 'Comprueba el tipo de la suma antes de dividir.', 'Prueba una serie de un solo valor negativo.'],
    docs: 'https://learn.microsoft.com/en-us/cpp/standard-library/iomanip-functions',
    tests: [
      { name: 'Promedio fraccionario', input: '2\n1 2\n', expected: '1 2 3 1.50' },
      { name: 'Con negativos', input: '3\n-8 -2 -5\n', expected: '-8 -2 -15 -5.00' },
      { name: 'Un valor', input: '1\n7\n', expected: '7 7 7 7.00' },
      { name: 'Suma grande', input: '3\n1000000 1000000 1000000\n', expected: '1000000 1000000 3000000 1000000.00' }
    ]
  },
  {
    id: 'cpp-median', track: 'cpp', title: 'El centro de la serie', topic: 'vector, ordenamiento y algoritmos', xp: 220,
    goal: 'Muestra la mediana de N mediciones enteras.',
    requirements: ['Lee N entre 1 y 1000, seguido de N enteros.', 'La mediana es el valor central de la serie ordenada; con N par es el promedio de los dos valores centrales.', 'Muestra solo la mediana con exactamente dos decimales y punto decimal.', 'No alteres la interpretación de los valores negativos.'],
    lesson: 'La mediana depende del orden de los datos, a diferencia de los extremos y la suma. Para hallarla necesitas conservar valores o usar una estrategia más avanzada. std::vector permite guardar la serie y std::sort ordenarla. El caso par exige razonar sobre dos posiciones y evitar que una división entera descarte media unidad.',
    concepts: ['std::vector contiene una secuencia de tamaño variable y ofrece acceso por índice.', 'std::sort reorganiza un rango; el índice central depende de si N es par o impar.', 'Convierte al tipo apropiado antes de dividir para conservar el .50 cuando corresponde.'],
    question: 'Después de ordenar cuatro valores, ¿cuáles son los dos que definen el centro?',
    reflection: 'Explica por qué tu algoritmo necesita conservar u ordenar datos y cómo probaste una cantidad par.',
    hints: ['Escribe cuatro números desordenados y ordénalos a mano antes de pensar en índices.', 'Prueba dos números cuya suma sea impar.', 'Con un solo dato, ¿qué índice existe?'],
    docs: 'https://learn.microsoft.com/en-us/cpp/standard-library/algorithm',
    tests: [
      { name: 'Cantidad impar', input: '5\n9 1 4 7 2\n', expected: '4.00' },
      { name: 'Cantidad par', input: '4\n8 1 3 2\n', expected: '2.50' },
      { name: 'Dos negativos', input: '2\n-3 -4\n', expected: '-3.50' },
      { name: 'Un solo dato', input: '1\n-7\n', expected: '-7.00' }
    ]
  },
  {
    id: 'cpp-save', track: 'cpp', title: 'Mediciones que permanecen', topic: 'Archivos y aplicación CLI', xp: 280,
    goal: 'Convierte el analizador en una herramienta de terminal que conserva mediciones entre ejecuciones.',
    requirements: ['agregar VALOR guarda un entero entre -1000000 y 1000000 y muestra Guardado.', 'resumen muestra dos líneas: Cantidad: N y Promedio: 0.00.', 'Sin mediciones, resumen muestra Cantidad: 0 y Promedio: 0.00.', 'Guarda los datos en un archivo del directorio de trabajo actual; el formato es libre.', 'Cada comprobación parte de una carpeta vacía y comparte esa carpeta entre sus pasos.'],
    lesson: 'Un proceso termina, pero un archivo puede conservar su información. En C++, main puede recibir argc y argv; esos argumentos llegan al inicio, mientras std::cin lee la entrada estándar después. std::ofstream escribe y std::ifstream lee archivos. Antes de calcular el promedio, piensa qué ocurre si todavía no existe el archivo.',
    concepts: ['argc y argv representan la cantidad y los valores de los argumentos de inicio.', 'std::ifstream y std::ofstream permiten leer y escribir archivos; el modo de apertura determina si agregas o sustituyes.', 'Una función para cargar mediciones evita repetir la lógica cuando agregas y cuando consultas el resumen.'],
    question: '¿Dónde buscará el segundo proceso las mediciones que guardó el primero?',
    reflection: 'Describe el archivo elegido, la primera ejecución vacía y cómo comprobaste que dos procesos comparten los datos.',
    hints: ['Ejecuta resumen antes de agregar: ¿tu programa presupone que el archivo ya existe?', 'Distingue argv de std::cin: ¿cómo llega el nombre del comando?', 'Agrega un valor, termina el proceso y consulta desde otro proceso en la misma carpeta.'],
    docs: 'https://learn.microsoft.com/en-us/cpp/standard-library/fstream',
    tests: [
      { name: 'Primera apertura', steps: [{ args: ['resumen'], expected: 'Cantidad: 0\nPromedio: 0.00' }] },
      { name: 'Datos persistentes', steps: [{ args: ['agregar', '5'], expected: 'Guardado' }, { args: ['agregar', '8'], expected: 'Guardado' }, { args: ['resumen'], expected: 'Cantidad: 2\nPromedio: 6.50' }] },
      { name: 'Valores con signo', steps: [{ args: ['agregar', '-4'], expected: 'Guardado' }, { args: ['agregar', '0'], expected: 'Guardado' }, { args: ['resumen'], expected: 'Cantidad: 2\nPromedio: -2.00' }] }
    ]
  }
];

module.exports = { advancedMissions };
