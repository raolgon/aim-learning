# AImlearning

[English documentation](README.en.md) · 0.18.0

Tu código. Tu razonamiento. Tu siguiente paso.

Extensión de VS Code en español para aprender con proyectos, misiones y un profesor que orienta sin dar soluciones. La ruta inicial contiene **6 misiones sin código** sobre comprensión del problema, descomposición, datos, decisiones y repetición, pruebas y buenas prácticas. Después se abren **9 misiones de C#, 5 de C++, 3 de Python y 3 de JavaScript**. Incluye además seis proyectos reales guiados; el currículo experto completo todavía no está desarrollado.

## Instalar

1. En VS Code de escritorio (1.96 o posterior), abre **Extensiones**.
2. Menú **… → Instalar desde VSIX…** y selecciona `aimlearning-0.18.0.vsix`.
3. Ejecuta **AImlearning: Abrir academia** desde la paleta de comandos, o usa el icono lateral.
4. Empieza la ruta **Antes del código**. Esta etapa no requiere carpeta, compilador ni terminal.
5. Al completar las bases, elige C#, C++, Python o JavaScript. Lee el ejemplo y pulsa **Ya revisé el ejemplo · preparar mi práctica**. El recorrido te guía para abrir una carpeta, revisar su confianza, comprobar la herramienta, abrir la terminal y crear tu primer archivo.

C# requiere [SDK de .NET 8 o posterior](https://learn.microsoft.com/es-es/dotnet/core/install/), no solo el runtime. El framework se elige según el SDK instalado. La primera compilación puede necesitar Internet para restaurar dependencias. C++ requiere GCC o Clang con C++17, disponible como `g++` o configurado en `aimlearning.cppCompiler`. En Windows también puedes usar [VS Code con WSL](https://code.visualstudio.com/docs/remote/wsl).

Python requiere un intérprete Python 3 y JavaScript requiere [Node.js](https://nodejs.org/en/download). La extensión comprueba su versión antes de crear el primer proyecto. Puedes indicar las rutas de los ejecutables en `aimlearning.pythonPath` y `aimlearning.nodePath`. Por defecto usa `python` en Windows, `python3` en Linux/WSL y `node` para JavaScript. En una ventana VS Code conectada a WSL, usa intérpretes instalados en WSL; en una ventana Windows, usa los de Windows.

No se instalan compiladores ni intérpretes ni se cambia la configuración del sistema. Los ajustes de herramientas aceptan nombres o rutas de ejecutables, sin argumentos.

## Cómo se aprende

La etapa **Antes del código** enseña a identificar entradas, reglas y resultados; dividir una tarea; distinguir datos y estado; razonar sobre condiciones y repeticiones; probar casos normales y de frontera; y trabajar con nombres claros, cambios pequeños, revisión de diferencias y cuidado con secretos. Cada misión presenta un ejemplo cotidiano distinto del reto. Escribes tu razonamiento antes de comprobar una decisión; si no encaja, recibes una pista y puedes volver a intentarlo. La respuesta esperada permanece en la lógica de la extensión y no se envía al panel antes de tu intento. Tu reflexión cierra la misión y desbloquea la siguiente. Las bases se guardan localmente para tus distintas carpetas; el progreso de las rutas de código se conserva por carpeta, pero las rutas de código esperan a que completes las bases.

Después, en las misiones de lenguaje:

1. **Aprende:** explicación, ejemplo completo de otro problema, contrato del reto y un puente que muestra qué herramientas de código usar, cómo conectarlas y qué comprobar. La documentación oficial sirve para profundizar.
2. **Terminal:** primero prepara tu entorno con una tarea a la vez. Después muestra comandos explicados para PowerShell, CMD o bash/zsh. La preparación abre un perfil compatible; cambiar posteriormente el selector de sintaxis solo cambia la guía. Puedes usar la terminal de VS Code o copiar comandos a la del sistema. Copiar nunca ejecuta el comando.
3. **Profesor:** puedes pedir una explicación conceptual antes del intento. Para orientación sobre el reto o pistas, registra tu idea y lo que intentaste; pedir ayuda no resta puntos.
4. **Comprueba:** compila C#/C++ o revisa la sintaxis de Python/JavaScript y ejecuta pruebas en una terminal de tarea. Escribe tu reflexión y completa la misión.

Las misiones siguientes reutilizan tu propio código en carpetas separadas. Solo se crean archivos inexistentes; el profesor nunca modifica tus fuentes. Los contratos evolucionan: adapta tu programa anterior y evita imprimir texto adicional que no se pida.

La bitácora de C# continúa después de guardar gastos: valida importes y argumentos sin modificar datos al rechazar un intento, agrupa gastos por categoría en un informe y conserva un presupuesto que permite consultar el saldo. La ruta C++ continúa con funciones para calcular estadísticas, una mediana que exige ordenar datos y una herramienta de terminal que conserva mediciones entre procesos. Tú eliges estructura, formato de archivo y organización; el verificador acepta implementaciones diferentes que cumplan el contrato.

Python comienza con salida básica, continúa con datos leídos de la entrada estándar y termina con una bitácora de sesiones que usa argumentos (`registrar`, `total`, `historial`) y conserva datos entre ejecuciones. JavaScript sigue la misma progresión con un gestor de tareas: `agregar`, `listar` y `completar`. La extensión muestra el camino y los contratos; tú eliges cómo implementar y guardar los datos.

## Tu siguiente paso y preparación del entorno

La academia empieza con **Entender la idea**: lee el concepto y el ejemplo antes de explicar tu intento. **Ya revisé el ejemplo** recuerda dónde continuar, pero no concede XP, no comprueba conocimientos ni completa la misión. Esa marca se conserva al abrir otra carpeta. Después muestra una acción concreta según tu avance: registrar un intento, comprobarlo, reflexionar o continuar con otra misión. En proyectos, te guía desde la comprobación de herramientas hasta la estructura, las etapas y la revisión. El botón abre la parte adecuada sin resolver el reto por ti. Si aún no tienes carpeta de práctica, te ofrece abrir una; si un proyecto está bloqueado, te lleva a su requisito previo.

Para tu primera misión con código, **Preparar mi entorno** ofrece cinco pasos: carpeta, confianza, herramienta, terminal y archivo. Cada paso explica qué hacer y qué resultado esperar. La comprobación identifica el sistema de esta ventana (Windows, macOS, Linux o WSL), consulta la versión y, en C++, comprueba C++17 sin generar un programa. Puedes cancelar la comprobación. Si falta la herramienta, verás la guía de instalación y el acceso a su ruta en ajustes. La terminal guiada abre PowerShell en Windows, zsh en macOS o bash en Linux/WSL, sin enviar comandos. Después creas los archivos iniciales sin solución y sigues con los comandos explicados. Las misiones con archivos existentes conservan su guía y permiten revisar la preparación.

Antes de crear un proyecto real, pulsa **Comprobar herramientas** en **Proyecto**. AImlearning prueba las herramientas del entorno donde corre la extensión: .NET SDK para C#, Windows para Windows Forms, CMake y compilador para C++, Qt 6 Widgets o SQLite3 según el proyecto, y CTest y Git para el proyecto final. Verás cada resultado y una indicación para corregir lo que falte. Vuelve a comprobarlo tras instalar herramientas o cambiar sus rutas; esta revisión inicial no sustituye compilar el proyecto completo. Si VS Code está conectado a WSL, instala allí las herramientas de C++ que usarás desde esa ventana.

VS Code también muestra una guía de bienvenida de tres pasos: abrir la academia, completar las bases y preparar una carpeta de práctica. Puedes encontrarla en **Introducción: Abrir tutoriales** dentro de VS Code.

## Git antes de GitHub

Después de las bases comunes, abre **Git** en la cabecera de AImlearning. La ruta es independiente del lenguaje y tiene cuatro etapas: observar el estado y crear un commit, trabajar en una rama propia, producir y resolver un conflicto, y preparar localmente una propuesta de pull request y un workflow de CI. La extensión crea solo `aimlearning-projects/git-practice/mensaje.txt` y `RETO.md`; tú ejecutas `git init`, editas, haces commits y decides cómo fusionar. No crea un remoto ni hace `push`.

Cada etapa explica el concepto, propone comandos para explorar y pide que registres lo que intentaste antes de dar una pista o comprobar. La comprobación observa el repositorio local: primer commit y árbol limpio, diferencia real entre ramas, conflicto observado antes de resolverlo y commit de fusión, y archivos de propuesta y workflow confirmados. La última etapa inspecciona la estructura del workflow, pero **no ejecuta GitHub Actions ni valida el PR en GitHub**. Obtendrás 120 XP una sola vez al completar las cuatro etapas; entonces los proyectos finales con GitHub podrán desbloquearse si terminaste también los proyectos de interfaz y base de datos del lenguaje elegido. El progreso de Git se guarda por carpeta de práctica.

Si Git solicita tu identidad antes del primer commit, la etapa muestra cómo configurarla solo en ese repositorio. Si trabajas en WSL, usa Git dentro de WSL. Puedes cambiar el ejecutable con `aimlearning.gitPath`.

## Proyectos reales

Abre **Proyectos reales** en la cabecera de la academia. Es una ruta separada de las misiones. Hay tres proyectos por lenguaje: los dos primeros se desbloquean al completar los conceptos intermedios de C# o C++; el tercero se desbloquea al completar esos dos proyectos y la ruta local de Git. Puedes explorar los requisitos de un proyecto bloqueado, pero no crear sus archivos hasta prepararte.

| Lenguaje | Interfaz gráfica | Base de datos | Proyecto final con GitHub |
| --- | --- | --- | --- |
| C# | Control de gastos de escritorio con Windows Forms | API de inventario con ASP.NET Core y SQLite | Servicio de incidencias con pruebas, pull request y GitHub Actions |
| C++ | Monitor de mediciones con Qt Widgets y CMake | Catálogo persistente con SQLite C API | Biblioteca de análisis con CMake, CTest, pull request y GitHub Actions |

La extensión crea una estructura que abre o compila, un `RETO.md` y una guía de terminal. No implementa las operaciones del proyecto. En **Etapas** registras tus decisiones y pruebas antes de pedir una pista. El profesor local usa tu pregunta, tu intento y el primer error o resultado de pruebas disponible para orientar con preguntas, sin escribir la solución. Las notas, fuentes y resultados de estos proyectos permanecen locales; la conexión de IA sigue disponible para las misiones de aprendizaje.

En **Revisión**, AImlearning compila la versión actual. En las API, el catálogo SQLite y la biblioteca C++ también ejecuta al menos tres pruebas que tú escribes en `tests/` con .NET Test o CTest. El reto propone tres casos que esas pruebas deberían cubrir; la extensión comprueba cantidad y resultado, pero no puede demostrar que tus pruebas cubran realmente esos casos. En los proyectos GUI, ejecutas tres casos en la ventana y registras el resultado y lo que observaste; esa evidencia es manual. Si cambias el código, debes repetir la revisión y las observaciones manuales. Para completar siguen haciendo falta tus tres etapas, una reflexión y cambios propios respecto de la estructura inicial.

Windows Forms requiere ejecutar VS Code y .NET en Windows. Qt Widgets requiere Qt 6, CMake y un compilador C++17; el proyecto de base de datos C++ requiere además SQLite3 con encabezados de desarrollo. La API C# requiere añadir `Microsoft.Data.Sqlite` cuando construyas la capa de datos. La pestaña **Terminal** explica los comandos; si CMake o CTest están en otra ruta, usa `aimlearning.cmakePath` o `aimlearning.ctestPath`.

Los proyectos finales usan Git y una cuenta propia de GitHub. Tú decides qué subir y cuándo crear la rama y el pull request; AImlearning no publica ni hace push. Su revisión local comprueba compilación, pruebas, archivos de workflow, commit, remoto y forma del enlace de PR. No consulta GitHub para confirmar si el PR existe o si Actions terminó bien. Consulta [GitHub Docs](https://docs.github.com/en/get-started/using-git/about-git) para los pasos de publicación y revisión.

## Profesor y tutor de IA

La guía local se usa únicamente cuando no hay IA conectada. Puedes conectar un tutor de IA desde el encabezado del chat de cuatro formas:

- **Ollama local:** AImlearning consulta `http://127.0.0.1:11434/api/tags`, muestra los modelos descargados y usa `/api/chat` con salida JSON. Inicia Ollama y descarga un modelo antes de conectar.
- **Servidor local compatible con OpenAI:** para LM Studio, llama.cpp, vLLM y otros servidores que ofrecen `/v1/models` y `/v1/chat/completions`. La dirección predeterminada es `http://127.0.0.1:1234/v1`, pero puedes cambiar el puerto. Si usas OpenCode con Ollama o LM Studio, conecta AImlearning a ese mismo servidor: no se conecta a la sesión ni al agente de OpenCode.
- **Modelo de VS Code:** usa un proveedor ya configurado en el editor.
- **OpenAI API:** usa una clave propia. Para OpenAI, selecciona GPT-6 Luna o GPT-6 Sol; la clave se introduce en un campo oculto y se guarda con `SecretStorage` de VS Code, nunca en el proyecto ni en `workspaceState`. Desconectar OpenAI borra la clave guardada por AImlearning. Su uso puede generar cargos independientes de una suscripción a ChatGPT. AImlearning no puede usar automáticamente la sesión de esta conversación de Codex.

En Ollama puedes comprobar los modelos con `ollama list` y descargar uno con `ollama pull NOMBRE_DEL_MODELO`. Para LM Studio, carga el modelo y activa el servidor local antes de conectar. Consulta las guías oficiales de [Ollama](https://docs.ollama.com/api/chat) y [LM Studio](https://lmstudio.ai/docs/developer/openai-compat/models) para ampliar la configuración.

AImlearning solo acepta direcciones HTTP de `localhost`, `127.0.0.1` o `[::1]` para los servidores locales. Al conectar solo consulta la lista de modelos; no envía código hasta que pidas orientación o una pista. La conexión local evita enviar datos directamente a OpenAI, pero un servidor configurado como proxy puede reenviarlos: comprueba cómo está configurado tu proveedor o tu modelo de OpenCode.

Al pedir orientación sobre tu intento o una pista con IA conectada se envían al proveedor elegido el intento, la pregunta, un resumen de las pruebas, los últimos turnos y hasta 12 000 caracteres de los fuentes de la misión o proyecto. No se envía el resto del espacio de trabajo. La solicitud a OpenAI usa Responses API, salida JSON estructurada y `store: false`; no habilita herramientas del modelo. Mientras la IA trabaja, el profesor muestra un turno «Estoy pensando en tu intento» con una animación discreta (sin movimiento si así lo prefieres en el sistema). El tutor señala una observación concreta, un paso pequeño y una pregunta. Se rechazan respuestas con fragmentos de código o formato no válido y se muestra un error sin sustituirlas por una guía local. La IA puede equivocarse y el filtro no garantiza detectar toda solución expresada en lenguaje natural; comprueba siempre tu razonamiento y tus pruebas.

La conexión con modelos de VS Code depende de un proveedor compatible y del permiso que solicite VS Code. Si la llamada falla, se muestra el error para volver a intentar. Para usar las guías generales, desconecta la IA. Las respuestas se guardan en el progreso local de la carpeta para continuar la conversación. El tutor no modifica archivos ni ejecuta código; la pestaña **Comprueba** sigue encargándose de compilar y probar.

## Progreso y pruebas

El progreso de las bases se guarda localmente para todas tus carpetas. El progreso de C#, C++, Python y JavaScript se guarda por carpeta y no sigue al proyecto si lo mueves. XP, rango y logros combinan ambos avances en la carpeta actual. Las misiones crean archivos en `aimlearning-projects/<mision>` y los proyectos reales en `aimlearning-projects/real-projects/<proyecto>`. Completar otra vez no duplica XP. Pedir pistas o fallar no resta puntos; no hay vidas ni rachas punitivas.

Las pruebas verifican casos específicos, no corrección universal. Para completar, el código debe coincidir con la versión comprobada. Las ejecuciones usan carpetas temporales limpias, límites de tiempo y de salida. **No son un sandbox de seguridad**: el código se ejecuta con los permisos del usuario. Puedes cancelar la comprobación desde el panel o cerrando la tarea.

## Desarrollar

No hay dependencias de ejecución ni compilación de la propia extensión.

```sh
node --test test/*.test.js
```

Abre esta carpeta en VS Code y pulsa F5 para iniciar un Extension Development Host. Distribución local: no está publicada en Marketplace. Para publicar, elige primero un publisher propio.

Ampliaciones previstas: depurador, pruebas propias, objetos, SQL y APIs en C#; RAII, CMake, memoria y concurrencia en C++. Deben añadirse con proyectos y contenido pedagógico revisado.

Referencias: [Webviews](https://code.visualstudio.com/api/extension-guides/webview), [tareas](https://code.visualstudio.com/api/extension-guides/task-provider), [modelos de VS Code](https://code.visualstudio.com/api/extension-guides/ai/language-model).

## Español e inglés

El selector **Idioma / Language** en la cabecera y en el panel lateral cambia entre Español y English. También puedes configurar `aimlearning.language` en los ajustes de VS Code. La preferencia se conserva al cerrar VS Code.

Se traducen las lecciones, proyectos, práctica de Git, guías y las nuevas respuestas del profesor. Tu progreso, notas, código y conversaciones anteriores se conservan. Los comandos, nombres de archivo y salidas literales del contrato no cambian: escribe exactamente lo que pide el ejercicio, aunque esté en español. La documentación oficial sigue siendo material complementario.

Los nombres de comandos y ajustes nativos siguen el idioma de VS Code; el selector de la academia controla el contenido de aprendizaje por separado.

## Profesor generativo

Con una IA conectada, la orientación y las pistas de misiones, proyectos y Git provienen del modelo. El intento registrado sigue siendo obligatorio. Si la IA falla, devuelve texto vacío o incumple las reglas comprobadas, se muestra el error y no se añade una respuesta preparada al diálogo. El historial anterior se conserva.

Laya selecciona textos preparados y no genera respuestas; ya no se ofrece como proveedor del profesor. Si quedó una selección antigua de Laya, conecta un modelo generativo. El informe de Laya corresponde a la versión 0.13.1.

## Ollama con Gemma

La conexión desactiva el razonamiento interno de Ollama para reservar el límite de tokens a la respuesta del profesor. `gemma4:e2b` se probó desde Windows hacia WSL. [Resultados y límites de las pruebas](INFORME-OLLAMA-E2B.md). Selecciona **Conectar IA → Ollama local** y el modelo `gemma4:e2b`. La versión 0.14.0 también conecta el profesor de los proyectos y las pistas de Git al modelo generativo.

## Chat con el profesor

Las misiones y etapas de proyecto incluyen un chat con historial desplazable y el cuadro de mensaje debajo. Tus mensajes se muestran a la derecha y las guías del profesor a la izquierda. Enter envía; Shift+Enter añade una línea. El mensaje aparece mientras el profesor piensa. Al recibir la respuesta, el cuadro se limpia; si hay un error, conserva el texto y muestra el problema dentro del chat.

Al leer mensajes anteriores, el chat conserva tu posición. **Ir al último mensaje** vuelve al final. Se conservan hasta 200 mensajes por misión o proyecto; el modelo sigue recibiendo solo los seis turnos recientes. El intento previo y las reglas pedagógicas permanecen vigentes.

## Ayuda antes del intento y conversación visible

**Necesito entender el concepto** abre el profesor con una pregunta editable. Puedes enviarla sin carpeta, código ni intento previo en las lecciones desbloqueadas. Sin IA, la ayuda usa la lección y su ejemplo; con IA, la explicación la genera el modelo conectado. Esta consulta envía la pregunta, la lección, el ejemplo y los últimos mensajes conceptuales, sin añadir automáticamente el contrato del reto, pruebas, archivos o el diálogo sobre su implementación. Las reglas del profesor siguen prohibiendo dar la solución. Los fallos de IA muestran un error; no sustituyen la explicación por una respuesta preparada.

Las pistas del reto y su comprobación siguen requiriendo un intento. El formulario anuncia el mínimo (40 caracteres en las bases, 15 en las misiones de código), ofrece preguntas para empezar y muestra un contador. Un error aparece junto al campo, conserva el borrador y se distingue de los fallos de envío del chat. Registrar el intento no certifica que sea correcto.

En **Profesor**, la misión mantiene un encabezado compacto y el objetivo se puede desplegar. El chat muestra el modelo o la orientación general y **Conectar IA** en su encabezado. El intento guardado se resume y puede revisarse o editarse; tras guardarlo, el foco vuelve al compositor. En paneles estrechos, **Ver mi ruta** permite abrir la navegación sin ocupar permanentemente el espacio de conversación.

## Espera cancelable y cierre de las bases

Mientras un tutor de IA responde, verás el tiempo de espera y **Cancelar consulta**, también en proyectos y pistas de Git. Cancelar conserva el mensaje y permite enviarlo otra vez. AImlearning propaga la cancelación al proveedor y descarta una respuesta tardía; el servidor puede seguir calculando si no atiende la desconexión. No se añade una respuesta preparada. La indicación sobre carga inicial de modelos locales describe una posibilidad, no un diagnóstico del servidor.

En las bases, acertar confirma que **la opción encaja con ese escenario**; no afirma haber evaluado tu razonamiento. Después aparece una pregunta con otra situación para que expliques cómo aplicarías el concepto. Esa explicación forma parte de tu reflexión y se guarda como autoevaluación, sin calificación automática ni nuevos bloqueos de progreso. La versión del panel proviene del manifiesto, tanto en Misiones como en Proyectos y Git.
