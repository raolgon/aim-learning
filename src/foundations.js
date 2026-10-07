'use strict';

// Actividades previas al código. La elección esperada permanece en el host;
// el webview solo recibe las opciones y el escenario.
const foundations = [
  {
    id: 'base-contract', transferQuestion: 'Una biblioteca quiere avisar cuándo vence un préstamo. ¿Qué dato y qué regla aclararías antes de diseñar el aviso?', track: 'foundations', kind: 'foundation', title: 'Entender el problema', topic: 'Entradas, reglas y resultados', xp: 40,
    goal: 'Aprende a describir lo que recibe una herramienta, qué reglas aplica y qué resultado debe entregar, antes de elegir un lenguaje.',
    lesson: 'Programar empieza por precisar el problema. Una entrada es información que llega; una regla explica qué hacer con ella; una salida es lo que la persona observa. El contrato también aclara límites y situaciones especiales. Si falta una regla, conviene preguntar o explicitar una suposición antes de construir.',
    concepts: ['Separa los datos de entrada del resultado esperado. No confundas el resultado con los pasos para obtenerlo.', 'Anota las reglas y los límites con ejemplos concretos. Un caso ambiguo no se arregla eligiendo una sintaxis.', 'Expresa el contrato de modo que otra persona pueda comprobarlo sin conocer tu implementación.'],
    example: { title: 'Ejemplo: préstamo de un libro', situation: 'Una biblioteca recibe la fecha de devolución y los días de préstamo permitidos. Quiere informar si una devolución llegó tarde.', reasoning: 'Antes de decidir cómo calcularlo, hay que aclarar desde qué fecha se cuentan los días y qué pasa justo en el último día permitido.', takeaway: 'Una regla precisa permite distinguir un resultado correcto de una interpretación distinta.' },
    challenge: { situation: 'Una tienda quiere mostrar el precio final de un pedido. Recibe el precio de los productos y ofrece envío gratis a partir de cierto importe.', prompt: '¿Qué pregunta aclararías primero para definir un resultado comprobable?', options: [{ id: 'a', label: '¿Qué color tendrá el botón de comprar?' }, { id: 'b', label: '¿El umbral se calcula antes o después de aplicar descuentos?' }, { id: 'c', label: '¿Qué lenguaje usarás para escribirlo?' }], answer: 'b', retryHint: 'Vuelve a distinguir una decisión visual o técnica de una regla que cambia el precio final.' },
    question: '¿Qué datos, regla y resultado puedes identificar en el pedido? ¿Qué información todavía falta?',
    reflection: 'Explica una ambigüedad del pedido y cómo la aclararías antes de construir la herramienta.',
    hints: ['Piensa en dos personas que podrían calcular precios distintos con la misma descripción.', '¿Qué dato o regla cambiaría el importe final?', 'Formula una pregunta que permita comprobar el resultado de un pedido concreto.'],
    docs: 'https://teachcomputing.org/curriculum/key-stage-3/algorithms-part-1/computational-thinking'
  },
  {
    id: 'base-steps', transferQuestion: 'Tienes que organizar una excursión. ¿Cómo dividirías el trabajo y qué paso depende de otro?', track: 'foundations', kind: 'foundation', title: 'Dividir y ordenar', topic: 'Descomposición y algoritmos', xp: 50,
    goal: 'Divide una tarea grande en partes pequeñas y describe una secuencia que otra persona pueda seguir sin adivinar pasos.',
    lesson: 'Descomponer significa separar una tarea en decisiones y acciones manejables. Un algoritmo es una secuencia finita de pasos claros; todavía no es código. Para diseñarlo, sigue un ejemplo pequeño a mano y pregunta qué ocurre cuando no hay elementos, cuando hay uno y cuando hay varios. La abstracción permite quedarse con los datos relevantes sin distraerse con detalles de presentación.',
    concepts: ['Nombra primero el objetivo de cada parte: obtener datos, aplicar reglas y comunicar el resultado.', 'Traza los pasos con un ejemplo pequeño. Si una persona debe adivinar qué sigue, el plan necesita más precisión.', 'Evita mezclar tareas independientes en un solo paso enorme; así podrás comprobar cada parte.'],
    example: { title: 'Ejemplo: preparar una mochila', situation: 'Para un viaje, una persona revisa destino, duración y clima; después elige objetos y comprueba que no falte lo esencial.', reasoning: 'Separar datos, elección y revisión evita empezar por una lista fija que no sirva para todos los destinos.', takeaway: 'Un plan puede expresarse en palabras antes de usar instrucciones de un lenguaje.' },
    challenge: { situation: 'Quieres resumir los gastos de una semana, incluidos los días sin gastos.', prompt: '¿Qué plan permite razonar sobre semanas con cero, uno o varios registros?', options: [{ id: 'a', label: 'Mostrar un total y después decidir qué gastos había.' }, { id: 'b', label: 'Leer los registros, calcular el total y presentar el resultado; probar también una semana vacía.' }, { id: 'c', label: 'Elegir primero los colores del informe y asumir que siempre hay gastos.' }], answer: 'b', retryHint: 'Sigue a mano una semana vacía. ¿Tu plan puede llegar al resultado sin inventar un registro?' },
    question: 'Si no existe ningún gasto, ¿qué pasos de tu plan todavía tienen sentido?',
    reflection: 'Describe las partes de tu plan para resumir gastos y cómo seguirías un ejemplo pequeño a mano.',
    hints: ['Divide el trabajo en obtener datos, transformarlos y mostrar un resultado.', '¿Puedes ejecutar mentalmente tu plan con una lista vacía?', 'Haz que cada paso tenga una entrada y un resultado claros.'],
    docs: 'https://teachcomputing.org/curriculum/key-stage-3/algorithms-part-1/computational-thinking'
  },
  {
    id: 'base-data', transferQuestion: 'Un formulario recibe un código postal y una cantidad de libros. ¿Qué significa cada dato y cómo decidirías representarlo?', track: 'foundations', kind: 'foundation', title: 'Pensar en datos', topic: 'Texto, números y estado', xp: 55,
    goal: 'Distingue cómo se representa un dato y qué información debe conservarse mientras avanzas por un problema.',
    lesson: 'Un dato puede representar texto, cantidad, una respuesta de sí o no, o una colección de elementos. Su apariencia no siempre indica su significado: “12” puede ser una etiqueta o una cantidad. Para calcular necesitas tratar las cantidades como números. El estado es la información que cambia o se conserva entre pasos; identificarlo antes de escribir código evita perder datos o mezclarlos.',
    concepts: ['Pregunta qué significa cada dato y qué operaciones tendrán sentido con él.', 'Distingue unir textos de sumar cantidades: el resultado esperado ayuda a elegir la interpretación.', 'Anota qué información se conserva y cuál cambia cuando procesas más de un elemento.'],
    example: { title: 'Ejemplo: tallas de camiseta', situation: 'Una tienda registra tallas como S, M y L y cuenta cuántas prendas hay de cada talla.', reasoning: 'La talla es una etiqueta aunque parezca ordenable; la cantidad de prendas sí es un número que puede sumarse.', takeaway: 'El significado del dato determina qué operaciones son válidas.' },
    challenge: { situation: 'Un formulario recibe “12” y “3” como texto, pero el usuario pidió el total de artículos.', prompt: '¿Qué decisión sobre los datos permite obtener el total solicitado?', options: [{ id: 'a', label: 'Unir los dos textos y mostrar “123”.' }, { id: 'b', label: 'Interpretar ambas entradas como cantidades y sumarlas.' }, { id: 'c', label: 'Ordenar los textos por longitud.' }], answer: 'b', retryHint: 'El resultado pedido es una cantidad. Compara qué significa unir símbolos y qué significa operar con cantidades.' },
    question: '¿Qué resultado obtendrías al unir los caracteres y cuál al sumar las cantidades? ¿Cuál corresponde al contrato?',
    reflection: 'Explica qué significado tienen las dos entradas y qué información conservarías si llegaran más cantidades.',
    hints: ['Un texto con cifras sigue siendo texto hasta que decidas interpretarlo como cantidad.', 'Piensa en el resultado de juntar símbolos frente a hacer una operación aritmética.', '¿Qué información necesitarías conservar para incluir un tercer artículo?'],
    docs: 'https://teachcomputing.org/curriculum/key-stage-3/algorithms-part-1/computational-thinking'
  },
  {
    id: 'base-flow', transferQuestion: 'Revisas una lista de préstamos para avisar solo los vencidos. ¿Dónde se repite una acción, dónde se decide y cuándo termina?', track: 'foundations', kind: 'foundation', title: 'Decidir y repetir', topic: 'Condiciones y ciclos sin sintaxis', xp: 55,
    goal: 'Reconoce cuándo una regla necesita elegir entre caminos y cuándo una acción debe repetirse para varios elementos.',
    lesson: 'Una decisión evalúa una condición y sigue un camino u otro. Una repetición aplica una acción a varios elementos o mientras se cumpla una regla. Ambas ideas existen antes de cualquier sintaxis. Para razonar bien, define qué ocurre justo en el límite de la condición, qué cambia en cada vuelta y cuándo termina el proceso.',
    concepts: ['Escribe la condición en una frase que pueda ser verdadera o falsa; identifica qué ocurre en cada caso.', 'Para una repetición, precisa qué elemento se procesa en cada vuelta y cómo sabes que terminaste.', 'Sigue a mano cero, una y varias vueltas. Revisa si el estado se conserva cuando hace falta.'],
    example: { title: 'Ejemplo: revisar invitaciones', situation: 'Una persona examina una lista de invitados y marca cada entrada como confirmada o pendiente.', reasoning: 'Repetir la revisión para cada persona es distinto de decidir qué marca corresponde a una entrada. La lista vacía no requiere ninguna revisión.', takeaway: 'Decisión y repetición resuelven preguntas diferentes y pueden combinarse.' },
    challenge: { situation: 'Una biblioteca revisa cada préstamo y señala si se devolvió después de la fecha límite.', prompt: '¿Qué descripción cubre todos los préstamos y decide el resultado de cada uno?', options: [{ id: 'a', label: 'Revisar solo el primer préstamo y marcar todos igual.' }, { id: 'b', label: 'Recorrer cada préstamo y, para cada uno, comparar su devolución con el límite.' }, { id: 'c', label: 'Mostrar primero los resultados y después mirar los préstamos.' }], answer: 'b', retryHint: 'Piensa qué se repite y qué decisión debe tomarse por separado para cada préstamo.' },
    question: '¿Qué ocurre si hay cero préstamos? ¿Y si uno está justo en la fecha límite?',
    reflection: 'Describe con palabras dónde hay una repetición, dónde hay una decisión y cómo termina la revisión.',
    hints: ['La misma regla debe aplicarse a cada préstamo, no solo al primero.', 'Dentro de cada vuelta hay una comparación con el límite.', 'Una lista vacía debe terminar sin inventar préstamos.'],
    docs: 'https://teachcomputing.org/curriculum/key-stage-3/algorithms-part-1/computational-thinking'
  },
  {
    id: 'base-tests', transferQuestion: 'Una actividad acepta personas desde los 12 años. ¿Qué casos elegirías para comprobar el límite y por qué?', track: 'foundations', kind: 'foundation', title: 'Comprobar una idea', topic: 'Casos normales y límites', xp: 60,
    goal: 'Aprende a elegir pruebas que descubran errores, especialmente en el punto donde cambia una regla.',
    lesson: 'Probar no consiste solo en repetir el ejemplo que ya funcionó. Antes de ejecutar, escribe qué esperas observar. Incluye un caso normal, el límite exacto y valores a ambos lados. Si el resultado no coincide, identifica primero cuál fue la entrada, qué esperabas y qué ocurrió. Una prueba aprobada aporta evidencia sobre ese caso; no demuestra que todas las entradas funcionen.',
    concepts: ['El resultado esperado se decide antes de observar la ejecución para evitar justificar un error después.', 'Los valores de frontera revelan comparaciones mal definidas: justo debajo, justo en y justo encima del límite.', 'Reduce un fallo a un caso pequeño y reproducible antes de cambiar varias cosas a la vez.'],
    example: { title: 'Ejemplo: entrada a un museo', situation: 'La entrada es gratuita para personas de 12 años o menos.', reasoning: 'Una persona de 8 años es un caso normal. Para revisar la frontera conviene pensar en 11, 12 y 13 años, y anotar el resultado esperado de cada uno.', takeaway: 'La frontera muestra si una regla incluye o excluye el valor exacto.' },
    challenge: { situation: 'Una tienda ofrece envío gratis si el importe alcanza 500.00 o más.', prompt: '¿Qué conjunto comprueba mejor el cambio de regla?', options: [{ id: 'a', label: '100.00, 200.00 y 300.00.' }, { id: 'b', label: '499.99, 500.00 y 500.01.' }, { id: 'c', label: '500.00, 500.00 y 500.00.' }], answer: 'b', retryHint: 'Busca un valor a cada lado del punto de cambio y el propio límite.' },
    question: '¿Qué esperarías para un importe justo menor, igual y justo mayor que el umbral?',
    reflection: 'Explica por qué tus casos detectan un error que un único ejemplo normal podría ocultar.',
    hints: ['Marca el punto exacto donde cambia el resultado.', 'Prueba el valor anterior, el valor exacto y el siguiente.', 'Antes de comprobar, escribe qué esperas en cada caso.'],
    docs: 'https://teachcomputing.org/curriculum/key-stage-3/algorithms-part-1/computational-thinking'
  },
  {
    id: 'base-practices', transferQuestion: 'Tu siguiente cambio rompe una función que ayer trabajaba. ¿Qué evidencia guardarías y cómo encontrarías el cambio responsable?', track: 'foundations', kind: 'foundation', title: 'Trabajar con cuidado', topic: 'Buenas prácticas para cualquier lenguaje', xp: 70,
    goal: 'Adopta hábitos que hacen el trabajo claro, comprobable y fácil de mejorar, sin depender de C# o C++.',
    lesson: 'Un trabajo fácil de mantener explica su intención: nombres claros, pasos pequeños y decisiones documentadas cuando no son obvias. Cambiar una cosa a la vez ayuda a saber qué causó un fallo. Guarda versiones de tu trabajo, revisa las diferencias y repite las pruebas después de cambiarlo. No coloques claves ni datos privados en archivos que vayas a compartir. Pide a la IA orientación y revisa cualquier sugerencia con tu propio criterio.',
    concepts: ['Prefiere nombres que expliquen el propósito; una abreviatura solo ayuda si el equipo la entiende.', 'Haz cambios pequeños y comprueba el comportamiento antes de continuar. Registra por qué hiciste un cambio importante.', 'Protege secretos y datos personales. Antes de compartir, revisa qué archivos y cambios estás incluyendo.'],
    example: { title: 'Ejemplo: corregir una receta', situation: 'Una receta sale demasiado salada. Cambias sal, tiempo y temperatura a la vez y el siguiente intento sabe diferente.', reasoning: 'No sabrás qué ajuste causó la diferencia. Cambiar una variable, anotar el resultado y conservar la versión anterior facilita aprender.', takeaway: 'El mismo principio ayuda a revisar y mejorar proyectos de software.' },
    challenge: { situation: 'Vas a mejorar una herramienta que otra persona usará y quieres poder explicar el cambio.', prompt: '¿Qué forma de trabajar te deja evidencia y reduce errores evitables?', options: [{ id: 'a', label: 'Cambiar muchas cosas, omitir pruebas y compartir todos los archivos.' }, { id: 'b', label: 'Hacer un cambio pequeño, revisar diferencias, probar casos importantes y guardar una versión sin secretos.' }, { id: 'c', label: 'Aceptar cualquier propuesta de IA sin comprobar su efecto.' }], answer: 'b', retryHint: 'Piensa qué opción te permitiría explicar el cambio, repetir la comprobación y compartirlo sin exponer datos.' },
    question: '¿Cómo sabrías qué cambio produjo un fallo y qué revisarías antes de compartir el trabajo?',
    reflection: 'Elige dos hábitos que aplicarás en tu primer proyecto y explica cómo te ayudarán cuando algo falle.',
    hints: ['¿Podrías deshacer un cambio y explicar por qué lo hiciste?', '¿Qué información no debería entrar en un proyecto compartido?', 'Una sugerencia de IA también necesita revisión y pruebas.'],
    docs: 'https://code.visualstudio.com/docs/sourcecontrol/quickstart'
  }
];

module.exports = { foundations };
