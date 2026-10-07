# Auditoría de UX y UI · AImlearning 0.15.0

Fecha: 5 de octubre de 2026. Método: revisión heurística y técnica de código y recorrido en navegador por un solo agente. Audiencia: principiante sin experiencia de programación ni familiaridad garantizada con VS Code. No es una prueba con participantes reales.

## Dictamen

La interfaz expresa un producto coherente: academia dentro de VS Code, ruta guiada, ejemplos, práctica propia y profesor que orienta. La lectura y los estados son consistentes. Para un principiante absoluto, la principal dificultad es el recorrido: se adelanta la petición de razonamiento, se acumulan pasos de preparación técnica y la ayuda queda físicamente lejos del punto de bloqueo. Mejorar ese acompañamiento tendría más impacto que añadir decoración.

## Valoración técnica orientativa

| Dimensión | Puntuación /4 | Evidencia y límite |
| --- | --- | --- |
| Accesibilidad | 3 | Etiquetas, foco visible, pestañas con teclado y estados accesibles. Los errores no se asocian al campo; no se comprobó con NVDA. |
| Rendimiento | 3 | Sin framework de frontend ni assets pesados en este flujo. Se reconstruye el DOM en cada actualización; no se midió latencia de render con todo el historial. |
| Adaptación al ancho | 2 | Sin desbordamiento horizontal en las vistas inspeccionadas. En 320 px, navegación y cabecera desplazan las acciones esenciales fuera de la primera pantalla. |
| Temas | 3 | Colores derivados de tokens de VS Code y composición coherente. Inspección oscura actual y captura clara previa de la misma versión; no todos los temas ni alto contraste. |
| Integridad de implementación | 3 | Sistema coherente, pero versión y contexto de producto desactualizados; dos avisos menores de escala. |
| **Total** | **14/20** | Base buena con debilidades concretas. No es una certificación WCAG ni una medida de usabilidad real. |

No se identificó un P0 en el alcance revisado. Se documentan 4 P1, 3 P2 y 1 P3. Los problemas de acompañamiento al principiante no se reducen a esta puntuación técnica.

## Recorrido desde cero

1. **Abrir la academia:** el objetivo de aprender sin escribir código al principio es claro. Se muestran misión, ruta, XP, secciones y siguiente paso a la vez. La acción más destacada conduce al profesor antes del contenido.
2. **Entender la lección:** entradas y salidas se explican con ejemplos cotidianos. Hay conceptos como contrato, umbral y sintaxis que agradecerían ejemplos inmediatos o un glosario contextual. El texto no es excesivo por sí mismo; el problema es que el flujo principal no garantiza que se lea antes del intento.
3. **Pedir ayuda:** se exige un texto largo para desbloquear el chat. Quien está perdido necesita ayuda para formular el intento, no una forma de saltarse el ejercicio.
4. **Completar las bases:** la opción correcta y la reflexión generan progreso. El texto de confirmación debe distinguir acierto de comprensión.
5. **Pasar a C#:** carpeta, confianza, SDK y terminal añaden decisiones. El botón para abrir el código y los comandos explicados ayudan, pero falta una preparación progresiva del entorno.
6. **Hablar con el profesor:** el chat mantiene el borrador en caso de fallo y respeta el scroll del historial. La posición del chat y de Conectar IA dentro de la página sigue siendo costosa.

## Hallazgos priorizados

### 1. [P1] El siguiente paso invita a responder antes de aprender

Ubicación: [media/app.js](/mnt/c/Users/rafao/Documents/Codex/2026-09-25/ayu/outputs/AImlearning/media/app.js:182).

**Evidencia:** En la primera apertura, la llamada principal «Ir al profesor» aparece antes de la lección. next-step.js decide el siguiente paso por el estado del intento, sin distinguir si se leyó o comprendió el concepto.

**Efecto en el principiante:** Alguien que no conoce programación puede seguir la acción destacada y encontrar un formulario en blanco antes de comprender qué debe pensar.

**Cambio recomendado:** Comenzar con «Entender la idea» y una microactividad de reconocer entrada/regla/salida. Después mostrar «Explicar mi intento». Evitar registrar la lectura como dominio: la secuencia orienta, no certifica.

Comando aplicable: `$impeccable onboard`.

### 2. [P1] El salto al entorno de desarrollo exige conocimientos nuevos

Ubicación: [media/app.js](/mnt/c/Users/rafao/Documents/Codex/2026-09-25/ayu/outputs/AImlearning/media/app.js:208).

**Evidencia:** La primera misión de código pide carpeta, confianza de VS Code, selección de PowerShell/CMD/bash y SDK. El contenido explica la terminal de forma general y ofrece comandos con propósito, pero la recuperación ante SDK ausente remite a instalación, reinicio y ajustes técnicos.

**Efecto en el principiante:** El alumno tiene que resolver el entorno antes de obtener su primera experiencia de éxito, con decisiones que no sabe evaluar.

**Cambio recomendado:** Añadir una preparación guiada por sistema: crear/abrir carpeta, reconocer la ventana Windows o WSL, detectar las herramientas y elegir la sintaxis de la terminal. Mostrar un paso cada vez, su propósito y el resultado esperado. Instalar el entorno no debe confundirse con resolver el ejercicio.

Comando aplicable: `$impeccable onboard`.

### 3. [P1] La ayuda inicial queda bloqueada y los errores no señalan el campo correcto

Ubicación: [src/extension.js](/mnt/c/Users/rafao/Documents/Codex/2026-09-25/ayu/outputs/AImlearning/src/extension.js:642).

**Evidencia:** Las bases exigen 40 caracteres para registrar el intento. Esa longitud no se anuncia al lado del campo. «No entiendo» se rechaza. Si el panel del profesor está abierto, cualquier error se coloca en el chat con el título «No se pudo enviar», incluido un fallo al registrar el intento.

**Efecto en el principiante:** El principiante puede creer que falló la IA o que debe inventar texto para conseguir ayuda. El error queda lejos del formulario que necesita corregir.

**Cambio recomendado:** Mantener el intento previo para las pistas del reto, pero ofrecer una acción «Necesito entender el concepto» y apoyos para formular el intento. Mostrar requisitos y validación junto al campo, con aria-describedby. Separar los errores del formulario de los del envío del chat. No proporcionar la solución.

Comando aplicable: `$impeccable clarify`.

### 4. [P1] El chat y su conexión quedan enterrados bajo la página

Ubicación: [media/app.js](/mnt/c/Users/rafao/Documents/Codex/2026-09-25/ayu/outputs/AImlearning/media/app.js:219).

**Evidencia:** En la vista inicial del profesor a 1280×1000, el chat comienza a y=793, el compositor a y=1301 y Conectar IA a y=1560. Después del intento, siguen a y=771, 1280 y 1539. A 320×800, el título comienza a y=588 y las pestañas a y=1013.

**Efecto en el principiante:** El chat tiene scroll propio, pero llegar a él exige otro scroll de página. La preparación del intento, la navegación y la cabecera ocupan el espacio de la conversación. La conexión no se descubre al entrar.

**Cambio recomendado:** Mover el estado del profesor y Conectar IA al encabezado del chat. Tras registrar el intento, resumirlo en un bloque editable compacto. En ancho reducido, plegar la ruta y reducir la cabecera. Dar altura al chat dentro del espacio disponible, con compositor visible al conversar.

Comando aplicable: `$impeccable layout`.

### 5. [P2] La espera del modelo no ofrece cancelación

Ubicación: [src/local-models.js](/mnt/c/Users/rafao/Documents/Codex/2026-09-25/ayu/outputs/AImlearning/src/local-models.js:68).

**Evidencia:** El transporte local espera hasta 120 segundos. Durante la consulta el compositor queda deshabilitado y no hay botón de cancelar la consulta del profesor. El indicador muestra pensamiento, sin distinguir carga inicial del modelo.

**Efecto en el principiante:** Una carga lenta puede parecer un bloqueo. La animación comunica actividad, pero el alumno no tiene control sobre la espera.

**Cambio recomendado:** Añadir cancelación de la petición, conservar el borrador y un estado de espera con tiempo transcurrido. Explicar que el servidor local puede estar cargando el modelo sin afirmar esa causa cuando no hay evidencia. Mantener el error explícito; no volver a textos preparados con IA conectada.

Comando aplicable: `$impeccable harden`.

### 6. [P2] El mensaje de éxito atribuye un razonamiento que no se evaluó

Ubicación: [src/extension.js](/mnt/c/Users/rafao/Documents/Codex/2026-09-25/ayu/outputs/AImlearning/src/extension.js:668).

**Evidencia:** «Tu decisión está bien fundamentada» aparece cuando la opción coincide con la esperada. learning.verifyFoundation solo comprueba que exista un intento de al menos 40 caracteres y que la opción sea correcta; no evalúa el contenido del razonamiento.

**Efecto en el principiante:** El alumno puede interpretar una selección acertada como validación de su comprensión. Esto importa especialmente en una aplicación que promete enseñar a pensar.

**Cambio recomendado:** Usar «La opción encaja con el escenario; ahora explica por qué». Añadir comprobaciones de transferencia con otra situación, sin exigir una redacción idéntica. Diferenciar respuesta correcta, explicación registrada y comprensión evaluada.

Comando aplicable: `$impeccable clarify`.

### 7. [P2] La versión y parte del contexto del producto están desactualizados

Ubicación: [media/app.js](/mnt/c/Users/rafao/Documents/Codex/2026-09-25/ayu/outputs/AImlearning/media/app.js:156).

**Evidencia:** El paquete declara 0.15.0, pero la interfaz muestra 0.13.1. PRODUCT.md afirma que el texto generado por modelos nunca se muestra, lo contrario del profesor generativo actual.

**Efecto en el principiante:** Dificulta saber si se instaló la actualización y puede hacer repetir instalaciones al usuario. El contexto desactualizado también puede orientar mal futuras decisiones de diseño.

**Cambio recomendado:** Leer la versión desde el manifiesto y actualizar el contexto del producto para describir el profesor generativo. No se corrigió como efecto lateral de esta auditoría.

Comando aplicable: `$impeccable clarify`.

### 8. [P3] La escala de radios no registra los valores nuevos del chat

Ubicación: [media/style.css](/mnt/c/Users/rafao/Documents/Codex/2026-09-25/ayu/outputs/AImlearning/media/style.css:251).

**Evidencia:** El detector encontró dos avisos design-system-radius por 8px en las líneas 251 y 257, fuera de la escala rounded de DESIGN.md. El radio es coherente con el chat; no se observó un defecto visual causado por él.

**Efecto en el principiante:** Es una desviación documental menor, no un obstáculo de aprendizaje.

**Cambio recomendado:** Documentar el radio de conversación en la escala para evitar avisos repetidos. No rediseñar el chat por este aviso.

Comando aplicable: `$impeccable polish`.

## Qué conservar

- Las bases previas al código y ejemplos cotidianos.
- La explicación dentro de la herramienta, con documentación adicional como ampliación.
- El intento propio y la evaluación del comportamiento en vez de exigir una implementación concreta.
- El progreso sin castigos por equivocarse o pedir pistas.
- Las etiquetas visibles, foco de teclado, temas nativos y estados de trabajo.
- El chat con scroll, mensajes diferenciados y conservación del borrador.
- La distinción entre orientación general sin IA y respuesta generativa con IA conectada.

## Orden recomendado de mejora

1. `$impeccable onboard`: recorrido inicial y preparación de carpeta/terminal/SDK.
2. `$impeccable clarify`: ayuda para formular intentos, errores junto al campo y confirmaciones honestas.
3. `$impeccable layout`: profesor visible, intento resumido y ruta compacta en panel estrecho.
4. `$impeccable harden`: espera cancelable y prueba con lector de pantalla del chat actualizado.
5. `$impeccable polish`: consistencia final y metadatos.

## Evidencia y límites

Se inspeccionaron ocho estados: primera apertura, profesor bloqueado, intento guardado, ancho reducido, lección reducida, preparación inicial de C#, terminal y espera de IA. El navegador usó el código de producción de la webview con estado y mensajes del host simulados. Las reglas de validación se comprobaron por lectura del código; el error correspondiente se reprodujo inyectando la notificación del host en el navegador. No se instaló ningún SDK, ejecutó código del alumno ni envió una consulta a la IA para esta auditoría.

El detector se ejecutó sobre media y terminó con código 2: dos avisos advisory de radio. No se detectaron otros problemas automáticamente; esto no prueba ausencia de fallos de UX o accesibilidad. Se conservaron los avisos como desviación documental verificada, sin tratarlos como una ruptura visual. No se inyectó un overlay del detector en el navegador. No se inició un servidor local; el navegador se cerró al terminar.

No se probaron NVDA, la sesión gráfica nativa del Extension Host, todos los temas, ampliación real del 200 % ni todos los proyectos. El reemplazo completo de app.innerHTML puede provocar anuncios repetidos de un log con aria-live; es un riesgo para verificar con lector de pantalla, no un fallo observado que se haya incluido en el recuento.

Las capturas y medidas están en `work/ux-audit/`, y el JSON del detector en `work/ux-audit-detector.json`, fuera del paquete de la extensión. No se modificaron la aplicación, su versión, la instalación, el progreso ni la configuración del usuario.

## Criterios para la siguiente validación

- El alumno puede identificar la primera acción y llegar al concepto antes de pedirle una explicación.
- Puede solicitar una explicación conceptual sin inventar un intento de 40 caracteres, manteniendo las pistas del reto condicionadas al esfuerzo.
- Los requisitos del formulario y sus errores se muestran junto al campo afectado.
- Puede llegar a su primer programa siguiendo pasos de entorno explicados, sin tener que adivinar su terminal.
- El profesor y la conexión de IA se encuentran con facilidad y el panel estrecho prioriza el trabajo actual.
- Una espera larga se puede cancelar sin perder el mensaje.
- El éxito no afirma haber evaluado un razonamiento si solo se comprobó una opción.
- Una prueba con principiantes reales y teclado/lector de pantalla verifica estos resultados antes de dar por resuelto el problema.

## Seguimiento de las prioridades altas

- **0.16.0:** se implementaron el concepto antes del intento y la preparación guiada de carpeta, confianza, herramienta, terminal y primer archivo (hallazgos 1 y 2).
- **0.17.0:** se implementaron ayuda conceptual previa al intento, mínimos/contador y errores junto al campo (hallazgo 3), y encabezado de profesor compacto, conexión de IA en el chat, intento resumido editable y ruta plegable en ancho reducido (hallazgo 4). La ayuda conceptual no registra un intento ni abre pistas del reto.

La validación de 0.17.0 incluye 62 pruebas de lógica y recorridos de navegador simulados en español/inglés, con compositor y conexión visibles a 1280×1000 y 320×800. Las pruebas no sustituyen una evaluación con principiantes reales ni una sesión de lector de pantalla; no se actualiza la puntuación heurística de la auditoría inicial. Los hallazgos de prioridad media y baja conservan su estado pendiente salvo cambios ya documentados. [Validación y límites](VALIDACION.md).

## Seguimiento de las prioridades medias · 7 de octubre de 2026

**0.18.0** implementa cancelación propagada al proveedor, contador y borrador conservado (hallazgo 5), confirmación conceptual limitada a la opción y preguntas en otros escenarios como autoevaluación (hallazgo 6), y versión del manifiesto en todas las vistas y PRODUCT.md acorde con el profesor generativo (hallazgo 7). Validado con 69 pruebas y recorridos de navegador simulados. La comprobación con lector de pantalla y usuarios reales sigue pendiente; no se recalcula la puntuación de la auditoría inicial. El hallazgo menor sobre la escala de radios conserva su estado.
