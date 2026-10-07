# Validación actual · AImlearning 0.18.0

69 pruebas automatizadas aprobadas. Las nuevas pruebas cubren cancelación de transporte local y OpenAI durante la lectura, timeout diferenciado de cancelación voluntaria, respuestas tardías/rechazos tardíos, cancelación del modelo de VS Code y liberación de su token. El controlador comprueba lecciones, ayuda conceptual, proyectos y pistas de Git: no guarda la respuesta cancelada, mantiene el estado, ignora identificadores de cancelación antiguos y permite reintentar. La confirmación conceptual no atribuye razonamiento evaluado ni completa la misión. Las seis bases incluyen preguntas sobre otras situaciones, como autoevaluación.

Playwright con estado y mensajes del host simulados: contador de espera, cancelación con teclado, borrador conservado incluso al repetir una pregunta ya enviada, reintento, aislamiento de cancelaciones antiguas, compositor visible a 320×800, preguntas nuevas de reflexión, versiones iguales en Misiones/Proyectos/Git y cancelación en Git. Español/inglés y capturas de escritorio/panel estrecho, temas oscuro/claro. Pasan las regresiones del chat y del recorrido anterior del profesor.

Los proveedores y VS Code se simularon; no se enviaron consultas reales ni se comprobó la detención del cálculo en Ollama u otro servidor. La extensión corta la espera y descarta resultados tardíos, pero un servidor puede seguir calculando. No se ejecutaron NVDA, una sesión gráfica nativa del Extension Host ni pruebas con participantes. Las respuestas a las preguntas de transferencia se guardan como reflexión, sin evaluación automática de su calidad.

---

# Validación anterior · AImlearning 0.17.0

62 pruebas automatizadas aprobadas. Las nuevas pruebas verifican ayuda conceptual previa al intento, guía preparada solo sin IA, respuesta generativa con IA, contexto limitado a lección/ejemplo/mensajes conceptuales, ausencia de contrato/código/pruebas en ese contexto, conservación del bloqueo de pistas y comprobaciones, rechazo de opciones reveladas, lecciones pendientes y errores dirigidos al campo del intento. El controlador usa VS Code y transporte simulados; no modifica el progreso del usuario.

Recorrido en Playwright con estados y mensajes del host simulados: preguntas conceptuales antes del intento, mínimos y contador, validación local y del host junto al campo, conservación del borrador, intento compacto editable, cierre tras guardar y foco al compositor, conexión en encabezado, ruta plegable, compositor visible en los tamaños 1280×1000 y 320×800 y textos en español/inglés. Capturas inspeccionadas en temas oscuro/claro. Pasan además las regresiones del chat y de la preparación guiada anterior. El detector de layout no informa hallazgos en el alcance revisado.

No se ejecutó una sesión gráfica nativa del Extension Host ni se enviaron consultas reales a modelos en esta actualización. No se probaron NVDA, todos los tamaños/temas ni usabilidad con participantes principiantes. El filtro y las instrucciones de IA no garantizan detectar toda solución expresada en lenguaje natural.

---

# Validación anterior · AImlearning 0.16.0

58 pruebas automatizadas aprobadas. Las nuevas pruebas cubren el concepto antes del intento, lectura sin XP ni verificación, conservación de la lectura al cambiar de carpeta, orden de preparación, herramientas/versiones incompatibles, compatibilidad C++17, cambios de configuración que invalidan la revisión, restricciones de confianza y apertura de una terminal con perfil explícito. Las pruebas del controlador usan la API de VS Code y el diagnóstico simulados; no modifican el progreso del usuario.

Recorrido comprobado en Playwright con estado y mensajes del host simulados: foco hacia la lección, lectura hacia el intento, carpeta sin espacio de trabajo previo, permiso de confianza, comprobación cancelable, recuperación cuando falta el SDK, terminal guiada, creación del primer archivo y conservación de los comandos de misiones existentes. Español e inglés, Windows/WSL como estados de interfaz y ancho de 320 px sin desbordamiento. Capturas inspeccionadas en tema oscuro. La regresión del chat pasa en tema oscuro/claro, escritorio/panel estrecho y ambos idiomas.

Estos resultados verifican lógica y webview en navegador. No se probó esta versión en una sesión gráfica nativa del Extension Host ni se instalaron herramientas o enviaron consultas a modelos de IA. La creación real de terminales en Windows, macOS y WSL queda pendiente de comprobación en esos entornos.

---

# Validación anterior · AImlearning 0.15.0

52 pruebas automatizadas aprobadas, incluidas las del profesor generativo y conservación de más de 20 mensajes. Sintaxis de los archivos modificados comprobada.

Prueba de chat en Playwright con estado y mensajes del host simulados: envío Enter/Shift+Enter, mensaje pendiente sin duplicarlo al recibir la respuesta, indicador de pensamiento, bloqueo durante la consulta, limpieza tras éxito, recuperación del borrador tras error, error dentro del chat, scroll con conservación de posición, botón para volver al final, seguimiento de nuevos mensajes al estar al final, misiones/proyectos, español/inglés y panel de 320 px sin desbordamiento horizontal. Capturas inspeccionadas en tema oscuro y claro, escritorio y panel estrecho. Estas comprobaciones validan la webview en navegador; no son una sesión nativa del Extension Host.

No se repitió la evaluación del modelo: se modificaron la interfaz y el límite del historial guardado, manteniendo el transporte generativo y el contexto de seis turnos.

---

# Validación anterior · AImlearning 0.14.0

52 pruebas automatizadas aprobadas. Las nuevas pruebas de control del profesor cubren orientación general sin IA, consultas generativas en misiones y proyectos, pistas generativas en misiones/proyectos/Git, intento obligatorio y errores de red/HTTP/respuestas vacías/opción conceptual revelada sin sustitución local. Las pruebas usan la API de VS Code simulada y transporte simulado para inyectar fallos.

Tres consultas adicionales reales Windows → Ollama en WSL con `gemma4:e2b` atravesaron los controladores de la extensión: orientación, pista y profesor de proyecto. El proyecto recibió el código de la carpeta aislada, no archivos del usuario. La API de VS Code fue simulada en esta prueba; no fue una sesión gráfica del Extension Host. Respuestas guardadas en `work/ai-routing-live-results.json` fuera del paquete.

Interfaz comprobada en navegador con estado simulado en español/inglés y panel estrecho. Se conserva el intento previo obligatorio, las reglas del profesor y el historial. Sin IA, se permiten guías preparadas; con IA, errores o respuestas rechazadas no añaden un reemplazo genérico al diálogo. Laya no se ofrece como profesor generativo. El filtrado y el prompt no garantizan detectar toda solución en lenguaje natural.

---

# Validación anterior · AImlearning 0.13.2

49 pruebas automatizadas aprobadas. Gemma `gemma4:e2b` generó 7/7 respuestas aceptadas con el transporte final Windows → Ollama en WSL. Se desactiva razonamiento interno para evitar respuestas vacías por agotamiento de tokens. [Resultados, tiempos y límites](INFORME-OLLAMA-E2B.md). No se probó una sesión gráfica del Extension Host.

---

# Validación anterior · AImlearning 0.13.1

49 pruebas automatizadas aprobadas. Evaluación con 15 consultas reales Windows → Laya en WSL, 10 de 11 categorías esperadas. Interfaz y flujo con API de VS Code simulada aprobados. Extension Host nativo pendiente por actualización de VS Code. [Informe completo](INFORME-LAYA.md).

---

## Historial anterior

# AImlearning 0.13.0 · integración de Laya

Se implementó el proveedor local de decisiones `/v1/systemone` y la selección de guías preparadas en misiones y proyectos. Guardar la dirección no realiza peticiones de red. No se inició Laya, no se ejecutaron pruebas, no se enviaron consultas ni se comprobó la conectividad, siguiendo la indicación del usuario. Las verificaciones de 0.12.0 siguientes corresponden a esa versión anterior.

# Validación de AImlearning 0.12.0

Fecha: 2 de octubre de 2026.

- 40 pruebas automatizadas aprobadas, incluidas seis pruebas nuevas de localización: contratos y código intactos, conservación del progreso y notas, reglas del profesor en inglés, vocabulario literal de ejercicios, documentos iniciales sin sobrescritura y preferencia transmitida a proveedores de IA.
- Cambio de idioma probado en el Extension Host real de VS Code: español → inglés → español, rechazo de valores inválidos, respuestas conceptuales ocultas y progreso conservado.
- Interfaz probada en ambos idiomas, escritorio y panel estrecho de 320 px: selector accesible, borradores conservados, pistas tras intento, sin desbordamiento ni errores JavaScript.
- Se revisan también los textos de los contratos que se muestran en inglés para evitar traducir por segunda vez sus salidas y comandos literales.
- Los mensajes y contratos del programa del alumno conservan su idioma original. Los diagnósticos nativos de compiladores y las conversaciones anteriores de IA se conservan.

