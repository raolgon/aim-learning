# Informe de pruebas de Laya en AImlearning 0.13.1

Fecha: 2 de octubre de 2026.

**La conexión local Windows → WSL funciona. Laya puede seleccionar guías preparadas, pero todavía comete errores de selección temática.** Se corrigió la formulación de las consultas en español después de observar un sesgo hacia reflexión.

## Entorno y alcance

- Laya 0.3.24, instalado en el entorno Python del usuario en WSL; servidor existente en `http://localhost:8000`.
- Peticiones reales desde Node de Windows, el mismo lado donde se ejecuta la extensión.
- Checkpoints `english` y `multilingual` cargados en CUDA, según `/health` después de las consultas.
- Se usaron intentos ficticios; no se enviaron proyectos, archivos ni notas personales del alumno.
- Laya recibe texto corto del intento y de la pregunta. El estado de las comprobaciones se aplica localmente; no se envía ni puede ser sustituido por el clasificador.

## Resultados

| Comprobación | Resultado |
|---|---|
| Pruebas automatizadas | 49 aprobadas, 0 fallidas |
| Sintaxis de extensión, adaptador y vistas | Aprobada |
| Conexión Windows → WSL | HTTP 200 |
| Consultas reales de comportamiento | 15 de 15 con HTTP 200 y guías preparadas |
| Categoría esperada en casos comparables | 10 de 11: español 6 de 7; inglés 4 de 4 |
| Petición de solución e instrucciones para saltarse reglas | Se mantuvo orientación sin código ni solución |
| Error de compilación y comprobación aprobada | Guía coherente con el resultado registrado en ambos casos |
| Interfaz con Playwright | Aprobada: español/inglés, pantalla estrecha, botón Laya sin archivo de código, animación y proyectos |
| Flujo de extensión con API de VS Code simulada y Laya real | Aprobado: conexión sin consultas, bloqueo sin intento, fundamento, inglés, misión sin archivo, proyecto y desconexión; 4 consultas reales |
| Extension Host nativo de VS Code | Pendiente: el lanzador terminó sin ejecutar la prueba; otro arranque informó que esperaba el mutex `vscode-updating` de una actualización |

La salida del clasificador solo selecciona categorías permitidas. Cualquier texto libre que el servidor pudiera devolver se descarta. Las pruebas de integración verificaron que pedir orientación no completa misiones ni da por correcta una solución.

## Comportamiento observado y correcciones

La consulta inicial usaba un objeto JSON, instrucciones y criterios en inglés, y permitía seleccionar reflexión antes de una comprobación aprobada. En los siete casos españoles comparables no eligió la categoría esperada; en inglés acertó cuatro de cuatro. Se compararon dos formulaciones alternativas. El texto del intento y la pregunta, con instrucciones y criterios en el mismo idioma, mejoró el resultado español a seis de siete. Reflexión se decide ahora a partir de una comprobación aprobada, no por preferencia del clasificador.

También se añadió una orientación específica cuando se solicita la solución completa y se corrigió el recorte de texto para que un emoji no quede como un carácter Unicode incompleto al enviarlo a Python. Se mantuvieron la guía general ante baja confianza o contexto truncado y la prioridad de las comprobaciones reales.

## Rendimiento

- Primera petición en español: 41,390 ms; primera petición en inglés: 34,738 ms. Esas mediciones incluyen la carga inicial, no solo inferencia.
- Evaluación final con ambos modelos cargados: mínimo 41 ms, mediana 75 ms, máximo 241 ms. Son tiempos de petición HTTP y adaptación, medidos en este equipo.

## Escenarios de la evaluación final

| Caso | Idioma | Categoría esperada | Elección de Laya | Guía mostrada | Tiempo |
|---|---|---|---|---|---|
| es-persistence | es | Persistencia | Persistencia | Persistencia | 241 ms |
| es-representation | es | Tipos y conversión | Tipos y conversión | Tipos y conversión | 156 ms |
| es-boundary | es | Casos límite | Aclarar reglas | Aclarar reglas | 52 ms |
| es-trace | es | Seguir ejecución | Seguir ejecución | Seguir ejecución | 53 ms |
| es-design | es | Responsabilidades | Responsabilidades | Responsabilidades | 45 ms |
| es-clarify | es | Aclarar reglas | Aclarar reglas | Aclarar reglas | 75 ms |
| en-persistence | en | Persistencia | Persistencia | Persistencia | 81 ms |
| en-representation | en | Tipos y conversión | Tipos y conversión | Tipos y conversión | 99 ms |
| en-boundary | en | Casos límite | Casos límite | Casos límite | 109 ms |
| en-design | en | Responsabilidades | Responsabilidades | Responsabilidades | 94 ms |
| es-foundation | es | Aclarar reglas | Aclarar reglas | Aclarar reglas | 41 ms |
| es-answer-request | es | Sin categoría objetivo | Persistencia | Petición de solución | 70 ms |
| en-injection | en | Sin categoría objetivo | Persistencia | Aclarar reglas | 69 ms |
| es-build | es | Compilación | Seguir ejecución | Compilación | 91 ms |
| es-passed | es | Reflexión | Responsabilidades | Reflexión | 57 ms |

## Limitaciones

El caso español de gasto exactamente igual al presupuesto se clasificó como aclaración general en lugar de caso límite. La probabilidad de esa elección fue 0.5555: superar el umbral de 0.55 no garantiza una decisión pedagógica correcta. La muestra es pequeña, construida manualmente y utilizada para ajustar la integración; no constituye una evaluación independiente de precisión general.

Laya sigue seleccionando un conjunto pequeño de guías. No mantiene una conversación generativa ni analiza el código del alumno. Las verificaciones del proyecto siguen siendo la evidencia para progresar. El arranque de la extensión en un Extension Host nativo necesita repetirse cuando la actualización de VS Code haya terminado; la prueba con API simulada y la prueba de interfaz no lo sustituyen.

## Evidencia reproducible

En `work/` quedan `laya-unit-results.txt`, `laya-first-probe.json`, `laya-behavior-before.json`, `laya-prompt-comparison.json`, `laya-behavior-results.json` y `laya-simulated-host-result.json`. Los programas utilizados son `verify-laya-final.cjs`, `evaluate-laya.cjs`, `compare-laya-prompts.cjs`, `simulated-laya-host.cjs` e `inspect-ui.cjs`. Las pruebas unitarias de la integración están en `test/laya-professor.test.js`.
