---
name: maintainer-review
description: Revisa los archivos en stage o seleccionados actuando como Staff/Principal Engineer y principal maintainer del proyecto. Aplica un rigor exhaustivo en diseño, arquitectura, seguridad, performance, TS soundness y testing de comportamiento.
---

# Maintainer Review

Este skill aplica una revisión de código ultra-rigurosa de nivel **Staff/Principal Engineer**, enfocada en la filosofía de diseño del proyecto, resiliencia sistémica, seguridad integral, performance de alto impacto y testing enfocado a comportamiento.

## Flujo de trabajo

0. **Contextualización de la Arquitectura y Entorno de Ejecución (CRÍTICO):**
   - **Identificar el tipo de software:** Determina si el codebase es una **librería/utilidad para desarrolladores** (ej. librerías de aserción ejecutadas localmente o en CI, como `pure-openapi-assert`) o un **servicio/aplicación de producción** (SaaS, servidores expuestos).
   - **Ajustar el foco y severidad de la revisión:** No sobrediseñes soluciones para problemas inexistentes en el contexto real.
     - _Para librerías/utilidades de desarrollo (en memoria/locales):_
       - **No hay consumo directo en producción ni atacantes externos:** Evita proponer validaciones de control de acceso (AuthZ), inyecciones de base de datos SQL/NoSQL en inputs de usuario, o patrones de corte de red (Circuit Breakers) en dependencias locales.
       - **Foco real:** Rigor del tipado TypeScript, compatibilidad con módulos ES (importaciones explícitas `.js`), performance extrema en caliente/frío, prevención de recursión infinita (Cycle Tracker), protección contra memory leaks en el test runner (FIFOCache), y testing de comportamiento robusto.

1. **Obtener el código:**
   - Ejecuta `git diff --staged` para leer exactamente los cambios en el área de preparación.
   - Si no hay cambios en stage, solicita educadamente al usuario qué archivos o diff desea revisar.

2. **Evaluación de Diseño y Arquitectura:**
   - **Buenas Prácticas e Idiomaticidad:** ¿Sigue los estándares y convenciones del ecosistema (TS/JS/etc.) y los patrones establecidos en el proyecto actual?
   - **Encapsulamiento y Acoplamiento (Aumento de Superficie Pública):** ¿Se están exportando tipos, interfaces, clases, métodos o endpoints que deberían ser privados, locales o internos? Evita a toda costa la sobreexposición.
   - **Complejidad Accidental y Abstracción Prematura:** ¿El código es simple, claro y auto-explicativo? ¿O introduce abstracciones complejas sin una necesidad justificada?

3. **Seguridad, Privacidad y Cumplimiento (Security & Privacy):**
   - **Saneamiento e Inyección:** _(Aplica si el sistema persiste datos o ejecuta comandos)_ Inspecciona flujos de datos en búsqueda de inyecciones SQL/NoSQL, inyección de comandos o manipulación insegura de paths de archivos. (No aplica a librerías puras en memoria).
   - **Fuga de Información Crítica (Leakage):** Verifica que ningún dato sensible (PII, tokens, contraseñas, claves de API, secretos de entorno o estructuras internas confidenciales) se exponga en respuestas de error o se imprima en logs.
   - **ReDoS (Regular Expression Denial of Service):** Analiza expresiones regulares complejas aplicadas sobre inputs para prevenir bloqueos por CPU (crítico en servidores y en librerías que parsean/validan inputs dinámicos).
   - **Autorización Granular (AuthZ):** _(Aplica solo a servicios con identidades y roles)_ Confirma que todo nuevo endpoint o función expuesta valide de forma explícita y no eludible el contexto de permisos de la identidad que lo invoca. (No aplica a librerías de desarrollo).

4. **Resiliencia, Concurrencia y Manejo de Errores:**
   - **Silenciamiento de Excepciones (Error Swallowing):** Detección de bloques `try/catch` vacíos, capturas que solo loggean el error sin propagarlo adecuadamente, o falta de un plan de recuperación/fallback seguro.
   - **Liberación Incondicional de Recursos (Leaks):** Garantiza que descriptores de archivos, streams, timers, sockets o conexiones se limpien de forma incondicional dentro de bloques `finally` o destructores ante cualquier flujo de excepción.
   - **Backoff y Circuit Breakers:** _(Aplica a dependencias y APIs de red)_ Asegura que las llamadas a dependencias o APIs externas utilicen reintentos inteligentes (con backoff exponencial) o mecanismos de corte para evitar la degradación de cascada en el sistema. (No aplica a utilidades que no consumen red en producción).

5. **Performance, Escalabilidad y Eficiencia:**
   - **Complejidad Algorítmica y N+1 queries:** Identifica operaciones con orden de complejidad temporal ineficiente ($O(n^2)$ o mayor) en procesamiento de colecciones, o queries de base de datos repetitivas en bucles. _(Para librerías en memoria, enfoca el análisis en la complejidad de CPU sobre estructuras de datos y árboles/ASTs)_.
   - **Bloqueo del Event Loop (I/O Síncrono):** Detección de llamadas bloqueantes (como `fs.readFileSync`) en hilos principales/Event Loop que degraden la concurrencia del servidor. _(En librerías de testeo local, la lectura síncrona en frío puede permitirse en inicialización si se cachea, pero debe evitarse en flujos en caliente)_.
   - **Procesamiento Eficiente en Memoria (Streams):** Asegura que no se lean archivos masivos o colecciones gigantes directamente a memoria si pueden ser procesados a través de paginación o streams.

6. **Tipado y Solidez Estática en TypeScript (Soundness):**
   - **Escape Hatches Inseguros (`any`, `as`, `ts-ignore`):** Audita aserciones de tipo forzadas o anulaciones de chequeo estático que enmascaren inconsistencias en tiempo de ejecución.
   - **Exhaustiveness Checking (Chequeo Exhaustivo):** Exige el uso de patrones como el tipo `never` en bloques `switch/case` o uniones discriminadas para garantizar que futuras extensiones del tipo requieran actualización obligatoria del código afectado.
   - **Conversiones de Tipos Débiles:** Evita conversiones implícitas débiles o asunciones incorrectas al interactuar con métodos nativos sobrecargados.

7. **Análisis de Testing (Implementación vs. Comportamiento):**
   - **Resiliencia ante Refactors:** Evalúa si los tests prueban la especificación del comportamiento (el _qué_ hace y qué devuelve) en lugar de acoplarse estrechamente a detalles internos de implementación (spies de métodos privados, orden exacto de llamadas internas no semánticas).
   - **Tests de Mutación Mental (Falsabilidad):** Analiza si los tests propuestos fallarían de manera efectiva si se altera intencionalmente la lógica de negocio subyacente. Si un cambio lógico crítico mantiene el test en verde, el test no es falsable.
   - **Aislamiento y Determinismo (Anti-Flakiness):** Identifica dependencias de la zona horaria local, estado compartido mutable global entre suites, orden aleatorio de ejecución de tests o dependencias implícitas de red/I/O no mockeadas de manera determinista.

8. **Criterios de Rigor de Misión Crítica (Nivel Staff):**
   - **Falsabilidad lógica e inversión de orden (Shadowing/Enmascaramiento):** ¿Hay colecciones o búsquedas cuyos elementos, de cambiar de orden, harían que una condition genérica o comodín coincida antes que una exacta?
   - **Robustez de flujo ante excepciones (Truncamiento):** Si una línea arroja una excepción, ¿bloquea efectos secundarios críticos que debían ejecutarse sí o sí?
   - **Eficiencia de memoria y redundancia en inicializaciones:** ¿Hay propiedades inmutables (`readonly`) inicializadas inline y luego sobreescritas/re-asignadas en el constructor?
   - **Pruebas de regresión:** Exige la inclusión de casos de prueba que repliquen directamente el caso de borde o bug corregido para blindar el sistema contra futuras regresiones.
   - **Validación Estructural vs Fragilidad de Strings:** (Especial para utilidades de validación y aserciones). ¿Se está evaluando el tipo o estructura de un error comprobando subcadenas en su mensaje (`.includes('string')`) en lugar de usar códigos de error estructurados, metadatos, o tipos concretos? Esto causa falsos positivos/negativos severos cuando el payload real contiene dichos textos.
   - **Coerción y Mutación Ciega (Zero-Bypass):** En lógicas de transformación de datos (coerción de inputs HTTP, normalización), ¿existen rutas de ejecución donde una restricción excluyente (ej. `not` o ramas negativas) o anidada se omita por completo y se aplique coerción asumiendo el tipo base? Esto genera validaciones exitosas sobre datos que debían ser inválidos (falsos positivos).
   - **Pérdida de Contexto Polimórfico en Composiciones (Anidamiento):** En estructuras complejas (ej. composiciones anidadas en un `allOf` que contienen un `oneOf`), ¿se pierde el contexto del candidato evaluado provocando que restricciones globales aplicadas posteriormente (como un `not`) sobreescriban e invaliden la selección inicial correcta?

9. **Feedback Accionable y Estilo:**
   - Proporciona un reporte directo, conciso y de alta señal técnica, ordenado por nivel de severidad (Crítico, Sugerencia, Buenas Prácticas).
   - Acompaña cada recomendación de un ejemplo concreto de refactorización (`Antes` vs. `Después`).
   - Evita rodeos o lenguaje excesivamente diplomático que diluya la precisión del feedback técnico.
