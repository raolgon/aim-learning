# Pruebas de Ollama — AImlearning

Fecha de ejecución (UTC): 2026-10-03T00:54:17.976Z

Se ejecutó el transporte real de AImlearning desde Node para Windows hacia Ollama en WSL, en http://localhost:11434. No se usaron respuestas simuladas ni tarjetas de Laya. Modelo anunciado por /api/tags: gemma4:e4b. Ollama: 0.20.2.

## Resultado

La conexión y el listado de modelos funcionan. Ninguna consulta generó texto: las siete devolvieron HTTP 500 antes de producir una respuesta. No es posible concluir si el modelo respeta las reglas pedagógicas, acepta alternativas o resiste las peticiones de soluciones.

| Caso | Resultado | Tiempo |
| --- | --- | --- |
| cs-boundary | El servidor local respondió HTTP 500. | 3811 ms |
| cs-state | El servidor local respondió HTTP 500. | 1921 ms |
| cpp-alternative | El servidor local respondió HTTP 500. | 1951 ms |
| answer-request | El servidor local respondió HTTP 500. | 1708 ms |
| source-injection | El servidor local respondió HTTP 500. | 2302 ms |
| english | El servidor local respondió HTTP 500. | 2005 ms |
| foundation | El servidor local respondió HTTP 500. | 2079 ms |

## Diagnóstico real

Una consulta mínima sin el formato JSON del profesor también falla. El servidor devolvió:

```json
{"error":"model requires more system memory (8.7 GiB) than is available (6.5 GiB)"}
```

Al reducir el contexto de 8192 a 1024, la consulta mínima tampoco pudo cargar el modelo:

```json
{"error":"model requires more system memory (8.5 GiB) than is available (6.5 GiB)"}
```

WSL reportó 7,4 GiB de RAM total. La GPU NVIDIA GeForce RTX 4050 Laptop tiene 6141 MiB de VRAM, con 3999 MiB usados en el momento de lectura. Estas cifras describen el momento del diagnóstico; no demuestran por sí solas qué proceso o configuración causa la falta de memoria.

## Verificación de la extensión

49 pruebas automáticas aprobadas, 0 fallos. Comprobación de sintaxis aprobada. Estos resultados no sustituyen la evaluación del modelo real. No se ejecutó una sesión gráfica nueva del Extension Host de VS Code.

La inspección del código confirma que las misiones normales llaman a sendLocal y analizan la respuesta generada. En caso de error o respuesta rechazada, muestran una guía local con una etiqueta que lo indica. En los proyectos grandes, projectProfessor actualmente solo llama a la IA si el proveedor es Laya: con Ollama todavía utiliza orientación preparada.

Estas pruebas accedieron directamente a Ollama; no verifican OpenCode como intermediario. No se modificaron la configuración de WSL, los modelos instalados, los servicios ni el código de producción.

## Paso necesario

Para repetir la evaluación de comportamiento hace falta que el modelo pueda cargarse: asignar suficiente memoria a WSL si el equipo la tiene disponible, o seleccionar un modelo generativo de menor tamaño. Reducir el contexto a 1024 no bastó en esta ejecución.
