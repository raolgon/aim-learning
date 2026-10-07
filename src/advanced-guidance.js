'use strict';

const advancedGuidance = {
  'cs-validate': {
    tools: 'args contiene el comando y sus datos. decimal.TryParse con CultureInfo.InvariantCulture y un NumberStyles que no permita separadores de miles interpreta un importe con punto decimal; después comprueba su signo. Una función puede devolver si la validación tuvo éxito.',
    path: 'Conserva la lectura y el formato que ya funcionan. Antes de entrar en la parte que guarda, comprueba la cantidad de argumentos y el importe. Mantén separados los mensajes de error de la escritura para que un intento rechazado no cambie el archivo.',
    check: 'En una carpeta limpia agrega un gasto válido, intenta otro con texto y consulta total. Repite sin importe. El total debe permanecer igual tras cada rechazo.'
  },
  'cs-report': {
    tools: 'Carga los registros guardados. Dictionary<string, decimal> puede reunir importes por nombre; StringComparer.Ordinal distingue mayúsculas y permite ordenar claves de forma reproducible. ToString("F2", CultureInfo.InvariantCulture) presenta cada total.',
    path: 'Añade una rama para resumen sin cambiar agregar ni total. Para cada registro recuperado, identifica su categoría y actualiza el grupo correspondiente. Al final recorre los nombres ordenados y presenta una línea por grupo.',
    check: 'Consulta una bitácora vacía. Después registra Bus, Cafe y Bus y observa si aparecen exactamente dos líneas en orden. Prueba también Cafe y cafe.'
  },
  'cs-limit': {
    tools: 'File.Exists distingue una configuración ausente de un límite de cero. File.WriteAllText puede reemplazar el presupuesto anterior. Reutiliza la conversión decimal y el cálculo de total; compara el saldo antes de escoger el mensaje.',
    path: 'Para limite, valida el importe y guarda la nueva configuración. Para estado, primero decide si hay presupuesto; si lo hay, combina el límite recuperado con los gastos guardados. Separa la magnitud del saldo de la palabra Disponible o Excedido.',
    check: 'Ejecuta estado en una carpeta limpia, fija 10, agrega 10 y vuelve a consultar. Agrega 0.25 y consulta otra vez. Reemplaza el límite y verifica que los gastos no desaparecieron.'
  },
  'cpp-stats': {
    tools: 'std::cin lee N y las mediciones. Una función puede recibir valores o un estado de cálculo. long long sirve para acumular; convierte a double antes de dividir. Incluye <iomanip> para std::setprecision(2); junto con std::fixed controla el promedio mostrado.',
    path: 'Parte del análisis de extremos que ya hiciste. Decide qué estado adicional requiere la suma. Separa el cálculo de la presentación y comprueba qué tipo participa en la división final.',
    check: 'La serie 1, 2 debe producir un promedio con .50. Una serie negativa prueba el signo; una de un solo elemento prueba la inicialización.'
  },
  'cpp-median': {
    tools: 'Incluye <vector> para std::vector<int>, <algorithm> para std::sort y <iomanip> para std::setprecision(2). El vector conserva los N valores; el operador [] accede por índice desde cero. std::fixed da el formato decimal final.',
    path: 'Lee y conserva todas las mediciones. Después de ordenar, razona por separado el caso impar y el par: ¿cuántas posiciones centrales necesitas? Decide el tipo de cálculo antes de dividir los dos valores del caso par.',
    check: 'Prueba cinco valores desordenados, luego cuatro. Con -3 y -4 debes conservar media unidad negativa. Con N igual a uno solo existe una posición.'
  },
  'cpp-save': {
    tools: 'main(int argc, char* argv[]) recibe los argumentos iniciales. Incluye <fstream>: std::ofstream con std::ios::app permite agregar texto y std::ifstream lee lo guardado. Un acumulador y un contador bastan para el promedio; <iomanip> permite mostrar dos decimales.',
    path: 'Separa el comando agregar del comando resumen. Elige un archivo relativo y un registro sencillo por línea. Al consultar, trata la ausencia del archivo como una colección vacía; al agregar, conserva lo anterior.',
    check: 'Desde la terminal ejecuta resumen antes de crear el archivo. Después agrega dos valores en procesos separados y consulta el resumen en un tercero. Prueba también un valor negativo.'
  }
};

module.exports = { advancedGuidance };
