'use strict';

// Ejemplos completos de problemas distintos de los retos. Ningún ejemplo
// implementa el contrato de su misión.
const advancedExamples = {
  'cs-validate': {
    intro: 'Este ejemplo valida una edad antes de mostrarla. Usa TryParse para decidir sin lanzar una excepción por una entrada esperable.',
    code: 'string texto = Console.ReadLine() ?? "";\nif (int.TryParse(texto, out int edad) && edad >= 0)\n{\n    Console.WriteLine($"Edad: {edad}");\n}\nelse\n{\n    Console.WriteLine("Edad no válida");\n}',
    input: '12', output: 'Edad: 12',
    explanation: 'TryParse informa si pudo interpretar el texto y entrega el número en edad. La comparación de rango es una decisión adicional. Tu bitácora necesita validar dinero y argumentos antes de tocar un archivo.',
    steps: ['Identifica qué datos llegan con agregar y cuáles son obligatorios.', 'Antes de escribir, separa el camino válido de los caminos rechazados.', 'Prueba un comando incompleto y un importe inválido; consulta luego el total en un proceso nuevo.']
  },
  'cs-report': {
    intro: 'Este ejemplo cuenta votos por color y ordena los nombres. No lee archivos ni agrupa importes.',
    code: 'var votos = new Dictionary<string, int> { ["azul"] = 2, ["rojo"] = 1 };\nvotos["rojo"] += 1;\nforeach (string color in votos.Keys.OrderBy(x => x, StringComparer.Ordinal))\n{\n    Console.WriteLine($"{color}: {votos[color]}");\n}',
    input: '', output: 'azul: 2\nrojo: 2',
    explanation: 'El diccionario conserva un conteo por clave. La ordenación se aplica a las claves antes de mostrar los datos. Tu misión debe cargar gastos persistentes y sumar importes por categoría.',
    steps: ['Consulta qué información guardaste en la misión anterior y cómo volver a leerla.', 'Dibuja una tabla de categorías y totales parciales para tres gastos.', 'Ordena los nombres de los grupos y compara la salida con una bitácora vacía.']
  },
  'cs-limit': {
    intro: 'Este programa guarda y recupera un nombre de usuario. Ilustra configuración persistente sin calcular presupuesto.',
    code: 'string ruta = "usuario.txt";\nFile.WriteAllText(ruta, "Ada");\nConsole.WriteLine(File.ReadAllText(ruta));',
    input: '', output: 'Ada',
    explanation: 'WriteAllText reemplaza la configuración previa; ReadAllText la recupera. En tu reto, el presupuesto y los gastos tienen usos distintos. Decide cómo distinguir un valor cero de un archivo inexistente.',
    steps: ['Escribe en palabras los estados posibles: sin límite, disponible y excedido.', 'Decide qué guardar al fijar o reemplazar el límite y qué leer al consultar estado.', 'Ensaya el caso sin archivo, la igualdad exacta y un exceso de un centavo.']
  },
  'cpp-stats': {
    intro: 'Este programa separa una función para calcular el cuadrado de un número. Tu analizador necesitará otras operaciones y tipos.',
    code: '#include <iostream>\n\nlong long cuadrado(int valor)\n{\n    return 1LL * valor * valor;\n}\n\nint main()\n{\n    int entrada;\n    std::cin >> entrada;\n    std::cout << cuadrado(entrada) << "\\n";\n}',
    input: '12', output: '144',
    explanation: 'La función recibe un entero y devuelve un resultado. 1LL hace que la multiplicación se realice con un tipo amplio. En tu reto, decide cómo representar suma y promedio por separado.',
    steps: ['Anota qué información debes conservar mientras lees la serie.', 'Piensa qué cálculo merece una función y qué datos recibe.', 'Prueba una serie cuyo promedio tenga .50 y otra de valores negativos.']
  },
  'cpp-median': {
    intro: 'Este ejemplo ordena tres palabras. Muestra cómo usar un vector y sort, pero no calcula una mediana.',
    code: '#include <algorithm>\n#include <iostream>\n#include <string>\n#include <vector>\n\nint main()\n{\n    std::vector<std::string> nombres = {"Zoe", "Ada", "Luz"};\n    std::sort(nombres.begin(), nombres.end());\n    for (const auto& nombre : nombres) std::cout << nombre << "\\n";\n}',
    input: '', output: 'Ada\nLuz\nZoe',
    explanation: 'sort reordena el vector. Las posiciones se numeran desde cero. En tu misión, ordenar mediciones es un paso; después necesitas localizar el centro y presentar un número con dos decimales.',
    steps: ['Escribe una serie impar y una par en papel; ordénalas.', 'Ubica las posiciones centrales con índices que comienzan en cero.', 'Prueba dos valores negativos cuya mediana termine en .50.']
  },
  'cpp-save': {
    intro: 'Este ejemplo agrega una nota a un archivo y luego la muestra. Tu analizador deberá recuperar números entre procesos y calcular un promedio.',
    code: '#include <fstream>\n#include <iostream>\n#include <string>\n\nint main()\n{\n    { std::ofstream salida("notas.txt", std::ios::app); salida << "Revisar datos\\n"; }\n    std::ifstream entrada("notas.txt");\n    std::string linea;\n    while (std::getline(entrada, linea)) std::cout << linea << "\\n";\n}',
    input: '', output: 'Revisar datos',
    explanation: 'El modo app añade sin reemplazar el contenido previo. El archivo se abre desde el directorio de trabajo. Tu reto necesita interpretar argumentos, guardar mediciones y recuperar todas para resumirlas.',
    steps: ['Distingue los argumentos de inicio de la entrada estándar.', 'Decide un formato de archivo sencillo que puedas volver a leer.', 'Ejecuta dos procesos de agregar y un tercero de resumen en la misma carpeta.']
  }
};

module.exports = { advancedExamples };
