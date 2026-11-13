---
name: review-staged-and-fix
description: Orquesta la revisión exhaustiva de cambios en stage ejecutando sin omisiones maintainer-review y code-review-skill, consolidando un informe conjunto, filtrándolo mediante receiving-code-review con rigor técnico y aplicando y verificando los cambios necesarios.
---

# Review Staged and Fix

Este skill orquesta un pipeline completo de aseguramiento de calidad sobre los archivos actualmente preparados en Git (`stage`). Ejecuta dos revisiones en profundidad (`maintainer-review` y `code-review-skill`), sintetiza un informe conjunto, somete cada observación al filtro escéptico de `receiving-code-review`, y finalmente aplica y valida los cambios pertinentes.

## Filosofía de Operación

- **Cero Pereza (Zero-Laziness):** Ambos análisis de revisión son obligatorios y exhaustivos. Queda terminantemente prohibido omitir alguno de los dos revisores, resumir superficialmente con un "todo se ve bien", o asumir que uno cubre al otro.
- **Doble Perspectiva:**
  - `maintainer-review`: Rigor Staff/Principal Engineer (arquitectura, robustez de flujo, TS soundness, resiliencia, seguridad real al entorno, testing de comportamiento y falsabilidad).
  - `code-review-skill`: Calidad de código, anti-patrones de diseño y React 19/TS, reutilización de helpers del proyecto, legibilidad y convenciones locales (AAA estricto, `it.each`).
- **Escepticismo Técnico (`receiving-code-review`):** Las recomendaciones de los revisores no se aplican a ciegas ni con acuerdos complacientes. Se contrastan contra la realidad del codebase, se descartan alucinaciones o violaciones de YAGNI, y solo se implementa lo técnicamente justificado.
- **Implementación y Validación Cerrada:** Cada cambio aceptado se implementa quirúrgicamente y se verifica ejecutando el pipeline de tipos, linters y tests del proyecto.
- **Test Theatre:** Cada cambio se somete a pruebas rigurosas, asegurando que los tests no solo pasen, sino que también reflejen correctamente el comportamiento esperado y la robustez del código. Solo tests que aporten valor. Nada de Theatre for show.

---

## Flujo de Trabajo

```
[0. Git Stage Discovery] -> ¿Hay cambios en stage?
           │
           ├─ NO ──> Detener y avisar al usuario.
           │
           └─ SÍ ──> Obtener diff completo (`git diff --cached`)
                         │
                         ▼
        ┌──────────────────────────────────────────┐
        │ 1. DOBLE REVISIÓN EXHAUSTIVA             │
        │    A) maintainer-review (Staff/Principal)│
        │    B) code-review-skill (Quality & Idiom)│
        └──────────────────────────────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────────────┐
        │ 2. INFORME CONJUNTO (Joint Report)       │
        │    Consolidación, severidad y snippets   │
        └──────────────────────────────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────────────┐
        │ 3. EVALUACIÓN ESCÉPTICA                  │
        │    receiving-code-review:                │
        │    Validación real, YAGNI y pushbacks    │
        └──────────────────────────────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────────────┐
        │ 4. IMPLEMENTACIÓN QUIRÚRGICA             │
        │    Bloqueantes -> Simples -> Complejos   │
        │    Tests con estricto AAA                │
        └──────────────────────────────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────────────┐
        │ 5. VALIDACIÓN DEL REPOSITORIO            │
        │    typecheck -> lint -> tests            │
        └──────────────────────────────────────────┘
```

---

### Fase 0: Extracción y Detección de Cambios en Stage

1. Ejecutar:
   ```bash
   git diff --cached --name-status
   ```
2. **Condición de Parada Temprana:** Si la salida está vacía, no hay nada en stage.
   - Detener el proceso de inmediato.
   - Informar al usuario: _"No se encontraron archivos en stage (`git add`). Por favor agrega a stage los cambios que deseas revisar antes de ejecutar este skill."_
3. Si hay archivos en stage:
   - Extraer el diff completo con números de línea y contexto:
     ```bash
     git diff --cached
     ```
   - Si se requiere contexto complementario de módulos o tests adyacentes, explorar los símbolos o archivos afectados.

---

### Fase 1: Doble Revisión Exhaustiva ("Sin Pereza")

Ambas revisiones son obligatorias y deben ejecutarse analizando cada fragmento modificado.

#### 1.1 Perspectiva A: `maintainer-review` (Staff / Principal Engineer)

Auditar los cambios bajo los criterios de `maintainer-review`:

1. **Contexto Arquitectónico y Runtime:** Adaptar el análisis al stack real (Frontend SPA React 19 + TypeScript + Vite). No inventar escenarios ajenos (ej. inyecciones SQL en cliente o autorización de servidor innecesaria).
2. **Diseño y Acoplamiento:** Superficie pública mínima. ¿Se están exportando funciones, interfaces o estados que deberían ser internos al módulo?
3. **Seguridad y Privacidad:** Exposición accidental de datos sensibles o variables en logs o errores, inputs sin control con riesgo de ReDoS.
4. **Resiliencia y Manejo de Errores:** Prohibido el silenciamiento de errores (`catch` vacíos o que solo loguean sin propagar ni recuperar estado), limpieza garantizada de timers, observers o listeners.
5. **Performance:** Renders innecesarios, re-creación innecesaria de objetos pesados en loops de render, complejidad temporal evitable ($O(n^2)$ o superior).
6. **TypeScript Soundness:** Prohibido el uso de hacks (`any`, aserciones forzadas `as Type`, `@ts-ignore`). Exigir exhaustiveness checking (`never` en branches) y tipado preciso.
7. **Testing de Comportamiento:**
   - Resiliencia ante refactors: ¿Los tests prueban qué hace el componente/función o se acoplan a la implementación interna?
   - Falsabilidad: ¿Los tests fallarían si rompemos intencionalmente la lógica de negocio?
   - Determinismo y aislamiento: Sin estado mutable compartido ni timers dependientes de entorno.
8. **Criterios Staff de Misión Crítica:**
   - Enmascaramiento de condiciones por orden de evaluación.
   - Truncamiento de flujo por excepciones no controladas.
   - Validación estructural frente a fragilidad de strings (no comparar mensajes de error por texto libre si hay códigos estructurados o tipos).
   - Inclusión obligatoria de tests de regresión ante corrección de bugs o casos borde.

#### 1.2 Perspectiva B: `code-review-skill` (Calidad, Idiomaticidad y Anti-patrones)

Auditar los cambios bajo las directrices de `code-review-skill`:

1. **React 19 & TypeScript Idiomático:**
   - Correctitud de hooks, dependencias de efectos y ciclo de vida.
   - Prevención de estado redundante o derivado recalculado erróneamente en el estado.
   - Correctitud de props, inmutabilidad y eventos.
2. **Anti-patrones Universales:**
   - _Parameter Sprawl:_ Demasiados parámetros sueltos en funciones.
   - _Leaky Abstractions:_ Lógica de detalle que se fuga a componentes de nivel superior.
   - _Nested Conditionals:_ Condicionales anidados que reducen la legibilidad frente a guard clauses tempranos.
   - _Reutilización:_ Verificar si ya existen utilidades o componentes compartidos en el proyecto (`src/shared/`, `src/components/`, etc.) antes de duplicar código.
3. **Convenciones del Proyecto (`GEMINI.md`):**
   - **Patrón AAA Estricto (Arrange-Act-Assert):** Cada bloque `it`/`test` prueba exactamente un comportamiento con progresión limpia Arrange, Act, Assert.
   - **Tests Parametrizados:** Preferencia por `it.each` al validar múltiples valores o casos sobre una misma lógica.
   - **Expresividad sobre Comentarios:** Eliminar comentarios inline obvios que describen "qué" hace el código en favor de nombres expresivos y diseño semántico.

---

### Fase 2: Consolidación del Informe Conjunto

Unificar y desduplicar las observaciones de ambos revisores en un informe estructurado:

````markdown
## Informe Conjunto de Code Review (Stage)

### Resumen de Inspección

- Archivos analizados: [lista de archivos en stage]
- Total de hallazgos: [N] (🔴 Críticos: X, 🟡 Importantes: Y, 🟢 Nits: Z)

### Hallazgos

#### [ID-01] [🔴 blocking / 🟡 important / 🟢 nit] Título corto del hallazgo

- **Origen:** maintainer-review | code-review-skill | ambos
- **Ubicación:** `src/path/to/file.ts:línea`
- **Problema:** Explicación técnica precisa del defecto o riesgo.
- **Propuesta:**
  ```typescript
  // Antes
  ...
  // Propuesta
  ...
  ```
````

````

---

### Fase 3: Evaluación Escéptica (`receiving-code-review`)

Adoptar el rol de receptor del review. Aplicar escepticismo técnico sin complacencias:
- **Prohibido:** Frases complacientes ("¡Tienes toda la razón!", "¡Excelente punto!").
- **Para cada hallazgo del informe conjunto:**
  1. **Verificar contra la realidad del codebase:** ¿La propuesta rompe contratos, tipos o tests existentes? ¿Asumió el revisor un comportamiento erróneo?
  2. **Chequeo YAGNI:** ¿El revisor está pidiendo una abstracción prematura o soporte para un caso que no existe?
  3. **Alineación con la arquitectura:** ¿Respeta las pautas del proyecto?
- **Dictamen por cada hallazgo:**
  - `[ACEPTADO]`: Válido técnicamente. Pasa a implementación.
  - `[RECHAZADO / PUSHBACK]`: Se descarta con argumento técnico objetivo y fundamentado en el código.
  - `[ADAPTADO]`: Se acepta el problema de fondo pero se ajusta la solución a la solución idiomática del repositorio.

Presentar una tabla de dictamen concisa:
| ID | Veredicto | Motivo Técnico / Alcance de la solución |
|---|---|---|
| H-01 | ACEPTADO | Previene render innecesario y tipa exhaustivamente el handler. |
| H-02 | RECHAZADO | Viola YAGNI; el helper sugerido ya se gestiona mediante el hook nativo del router. |

---

### Fase 4: Aplicación Quirúrgica de Cambios

Implementar los cambios aceptados y adaptados siguiendo el orden:
1. **Bloqueantes / Críticos:** Corrección de bugs lógicos, fugas o tipos rotos.
2. **Simples:** Nombres, importaciones, simplificaciones de funciones.
3. **Complejos y Tests:** Refactors de mayor escala y suites de prueba.

**Reglas de Modificación:**
- Aplicar ediciones quirúrgicas con la herramienta de edición adecuada (`replace` o `write_file`).
- Si se corrige o expande lógica, actualizar o añadir tests que verifiquen el nuevo comportamiento siguiendo estrictamente el patrón AAA y sin comentarios obvios.
- No modificar código fuera del perímetro de los archivos involucrados en la revisión.

---

### Fase 5: Validación y Reporte Final

1. **Ejecutar Batería de Comprobaciones:**
   - Comprobación de tipos:
     ```bash
     npm run typecheck
     ```
   - Linter:
     ```bash
     npm run lint
     ```
   - Tests relevantes:
     ```bash
     npx vitest run <archivos-de-test-afectados>
     ```
2. Si alguna comprobación falla, diagnosticar la causa y corregir inmediatamente hasta que todas las pruebas y validaciones pasen en verde.
3. **Resumen de Cierre:**
   - Listado de archivos modificados durante la aplicación.
   - Resumen de hallazgos resueltos vs. observaciones descartadas con su justificación técnica.
   - Confirmación del estado verde de tipos, linter y tests.
   - Recordatorio al usuario de que los cambios se encuentran en el working tree listos para su inspección antes de volver a hacer `git add`.
````
