---
name: AImlearning
description: Panel de aprendizaje de programación integrado en VS Code.
colors:
  background: "var(--vscode-editor-background, #181b20)"
  surface: "var(--vscode-sideBar-background, #20242a)"
  foreground: "var(--vscode-editor-foreground, #e1e5ec)"
  muted: "var(--vscode-descriptionForeground, #b0b8c4)"
  border: "var(--vscode-panel-border, #3b414b)"
  accent: "var(--vscode-textLink-foreground, #78c5ed)"
  success: "var(--vscode-testing-iconPassed, #83c9a5)"
  button: "var(--vscode-button-background, #24658c)"
  button-foreground: "var(--vscode-button-foreground, #ffffff)"
typography:
  headline:
    fontFamily: "var(--vscode-font-family, 'Segoe UI', sans-serif)"
    fontSize: "clamp(26px, 3vw, 38px)"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-.025em"
  title:
    fontFamily: "var(--vscode-font-family, 'Segoe UI', sans-serif)"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "var(--vscode-font-family, 'Segoe UI', sans-serif)"
    fontSize: "14px"
    lineHeight: 1.65
  label:
    fontFamily: "var(--vscode-font-family, 'Segoe UI', sans-serif)"
    fontSize: "12px"
  micro:
    fontSize: "11px"
  supporting:
    fontSize: "13px"
  subsection:
    fontSize: "15px"
  goal:
    fontSize: "16px"
  sidebarBrand:
    fontSize: "17px"
  brand:
    fontSize: "18px"
  sidebarHeading:
    fontSize: "22px"
  code:
    fontFamily: "var(--vscode-editor-font-family, Consolas, monospace)"
    fontSize: "12px"
    lineHeight: 1.7
rounded:
  progress: "2px"
  control: "4px"
  button: "5px"
spacing:
  compact: "8px"
  control: "12px"
  body: "16px"
  section: "24px"
  major: "28px"
components:
  button-primary:
    backgroundColor: "{colors.button}"
    textColor: "{colors.button-foreground}"
    rounded: "{rounded.button}"
    padding: "8px 13px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.button}"
    padding: "8px 13px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    padding: "2px 0"
  input:
    backgroundColor: "var(--vscode-input-background, #23272e)"
    textColor: "var(--vscode-input-foreground, var(--fg))"
    rounded: "{rounded.control}"
    padding: "10px"
  navigation-tab:
    padding: "12px 2px"
    textColor: "{colors.muted}"
  mission:
    rounded: "{rounded.control}"
    padding: "12px 6px"
---

# Design System: AImlearning

## Overview

Panel operativo de aprendizaje dentro de VS Code. Los tokens nativos del editor son la autoridad visual: fondos, controles, tipografía, foco y estados siguen el tema del usuario. La jerarquía presenta misión, objetivo y acción antes del contenido de estudio.

**Key Characteristics:**

- Densidad de herramienta, lectura clara y controles explícitos.
- Ruta secuencial con estados disponibles, bloqueados y completados.
- Progreso y logros subordinados al trabajo de la misión.

## Colors

La paleta procede del tema activo; los colores de respaldo no fijan una identidad independiente. El acento identifica enlaces, ruta y progreso. Los controles principales usan el color de botón del editor. El éxito utiliza el token de pruebas superadas. Fondo, superficie, texto secundario y bordes separan regiones sin decorarlas. Selección, avisos, errores y alto contraste también siguen los tokens nativos.

## Typography

La interfaz hereda la familia de VS Code; los comandos usan la del editor. El título de misión domina la lectura; los títulos de sección y los subtítulos ordenan explicaciones y pasos. El objetivo usa 16 px, los subtítulos 15 px y los metadatos 11–12 px. Los números de progreso usan cifras tabulares. Párrafos y listas de aprendizaje se limitan a 74 caracteres por línea.

## Layout

La academia usa una ruta lateral de 248 px y contenido flexible con ancho máximo de 1100 px. El conmutador superior separa Misiones de Proyectos reales. La cabecera de misión agrupa título, metadatos, objetivo y «Crear mi proyecto» o «Abrir mi código». Debajo aparecen Aprende, Terminal, Profesor y Comprueba. La ruta comienza con seis misiones de bases comunes y continúa con nueve de C#, cinco de C++, tres de Python y tres de JavaScript; XP y logros acompañan la navegación.

Proyectos reales ofrece rutas independientes de tres proyectos para C# y C++. Cada ruta presenta un proyecto de interfaz, otro de base de datos y un proyecto final de GitHub que se desbloquea al completar los dos anteriores. El panel mantiene navegación, título, entregables y etapas; las pestañas Proyecto, Etapas, Terminal y Revisión conducen del plan a las evidencias sin mostrar la solución.

A 760 px o menos la ruta pasa a una fila de misiones desplazable sobre una sola columna. Los controles se ajustan en varias filas y el bloque de ajustes de IA se apila. La barra lateral real de VS Code muestra un resumen compacto con progreso y «Continuar aprendiendo», que abre la academia.

## Elevation & Depth

La interfaz es plana, sin sombras. Superficies del editor, separadores finos y selección del tema establecen profundidad. Los avisos transitorios aparecen sobre el contenido, cerca del borde inferior.

## Shapes

Controles y bloques de comandos tienen esquinas discretas; los indicadores de misión son círculos de 28 px. Las pestañas conservan bordes rectos y una línea inferior para la selección. Los iconos son SVG de trazo con texto visible o nombre accesible.

## Components

- **Acciones:** el botón principal de crear o abrir permanece junto al objetivo. Los botones secundarios conservan borde; los enlaces de documentación usan subrayado. Los controles no disponibles muestran su estado deshabilitado.
- **Ruta:** pasos numerados, candado o marca de completado, con estado accesible independiente del color. Los logros se despliegan bajo la ruta.
- **Pestañas:** selección explícita y navegación con flechas, Home y End. «Practicar en la terminal» activa Terminal y lleva el foco a su panel.
- **Formularios:** etiquetas visibles, campos de intento, pregunta y reflexión con borradores persistentes por misión. Las actualizaciones del host restauran el foco y la selección de texto cuando el control sigue disponible.
- **Terminal:** selector de sintaxis, explicación de cada comando y acción de copia. Abrir la terminal utiliza la terminal nativa de VS Code.
- **Comprobación:** resultados por caso, resumen y reflexión. El éxito recibe un acuse visual de medio segundo solo cuando no se solicita movimiento reducido. La reflexión se presenta como autoevaluación.
- **Proyectos reales:** las etapas muestran intento registrado y etapa activa también con texto y ARIA. La revisión permite cancelar procesos en curso; los errores al generar comandos incluyen una alternativa de terminal. Las evidencias locales se distinguen de las pruebas manuales y de cualquier estado remoto de GitHub.
- **Accesibilidad:** foco visible con contorno de 2 px y separación de 3 px; paneles y pestañas vinculados por ARIA; bordes adaptados a colores forzados.

## Do's and Don'ts

- Usar los tokens del tema de VS Code con sus fallbacks existentes.
- Mantener la acción de crear o abrir el código junto al objetivo.
- Acompañar estados con texto o iconos y conservar el foco al actualizar el panel.
- No añadir un botón de solución ni revelar respuestas en el panel.
- No incorporar fuentes externas, imágenes decorativas ni recursos remotos.
- No convertir XP y logros en la jerarquía principal.

## Enseñanza dentro del panel

Cada misión muestra un ejemplo completo de un problema distinto, con código, entrada, salida y explicación. Después presenta el contrato del reto y pasos concretos para comenzar sin incluir la implementación de la misión. La documentación oficial aparece al final como ampliación. El código de ejemplo tiene desplazamiento horizontal propio en paneles estrechos.

## Ruta de Git

La navegación principal distingue Misiones, Proyectos reales y Git. La ruta de Git conserva la misma estructura visual: progreso y etapas en el lateral, una acción siguiente visible, concepto antes de comandos, intento del alumno, pista condicionada y evidencia local. Los comandos se ofrecen para explorar y copiar; nunca se ejecutan desde el webview. El panel usa los colores y controles de VS Code, funciona en ancho reducido y evita presentar un workflow local como CI ya ejecutada.

## Conversación con el profesor

Chat de altura acotada en las misiones y etapas de proyecto, con encabezado del profesor y modelo, historial desplazable y compositor fuera del scroll. Mensajes del estudiante alineados a la derecha, profesor a la izquierda, superficies derivadas del tema nativo de VS Code. Errores dentro del chat para no tapar el compositor en el panel estrecho. El scroll sigue el final solo cuando el estudiante está allí; leer el historial conserva la posición.

## Primer recorrido de aprendizaje y práctica

La acción recomendada empieza en «Entender la idea» y lleva el foco al concepto y al ejemplo. El botón al final de la lección permite seguir hacia el intento o la preparación. Recordar una lectura no concede XP ni equivale a demostrar dominio.

La preparación de las misiones muestra cinco pasos, con una sola tarea activa: carpeta, confianza, herramienta, terminal y archivo. Cada tarea define el concepto, la acción y el resultado esperado; si falta una herramienta, muestra cómo instalarla o corregir su ruta. La terminal abre un perfil compatible con la guía sin enviar comandos. Las misiones existentes conservan sus comandos y ofrecen revisar la preparación. Los textos están disponibles en español e inglés.

## Ayuda conceptual y prioridad de conversación

El profesor admite preguntas conceptuales antes del intento, sin abrir pistas ni comprobar el reto. La conversación ocupa el primer espacio de trabajo del panel; el modelo y la conexión de IA pertenecen a su encabezado. Objetivo y siguiente paso se despliegan en la cabecera de misión. El intento guardado tiene un resumen breve y una acción explícita para editar; su formulario se pliega tras guardar y devuelve el foco al compositor.

Los mínimos del intento se anuncian antes del envío y un contador sigue la escritura. Los errores del formulario se asocian al campo mediante aria-describedby y aria-invalid; los errores del chat se reservan a sus operaciones. En ancho reducido la ruta se pliega con un botón cuyo aria-expanded refleja el estado. La altura del chat reserva espacio al compositor y al encabezado en los tamaños verificados.

## Espera y confirmaciones honestas

Las consultas de IA reservan una franja junto al compositor para el tiempo transcurrido y la cancelación. El contador se actualiza sin reconstruir la conversación y está oculto al lector de pantalla para evitar anuncios cada segundo. Cancelar produce un estado informativo distinto de un fallo de envío, conserva el borrador y devuelve el foco al compositor. La carga inicial de un modelo local se comunica como posibilidad.

El acierto conceptual confirma la coincidencia de una opción con un escenario. La reflexión ofrece otra situación para aplicar el concepto, presentada como autoevaluación sin calificación automática. Las versiones se reciben desde el manifiesto en todas las vistas.
