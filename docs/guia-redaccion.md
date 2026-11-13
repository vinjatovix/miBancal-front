# Guía de redacción y lenguaje claro

Esta guía define cómo escribir los textos de interfaz de agro-front para que cualquier persona los
entienda, sin formación agronómica. Cumple el criterio WCAG 3.1.5 (AAA): el texto debe poder leerse
con un nivel de educación secundaria obligatoria.

Es la referencia para redactar y revisar cadenas del diccionario i18n (`src/i18n/messages`). El gate
`npm run check:readability` comprueba de forma automática la parte medible (nivel de lectura y
cobertura de glosario).

## 1. Principios de lenguaje claro

- **Una idea por frase.** Frases cortas y directas. Si una frase tiene dos ideas, divídela en dos.
- **Palabras comunes.** Prefiere la palabra de uso diario frente a la técnica o culta
  («borrar» mejor que «eliminar permanentemente», «cambiar» mejor que «modificar»).
- **Voz activa y persona directa.** Habla a la persona de «tú» y dile qué hacer:
  «Revisa el formulario», no «El formulario debe ser revisado».
- **Sin relleno.** Quita muletillas y fórmulas vacías («con el fin de», «proceder a», «de forma
  permanente» cuando no aporta).
- **Positivo antes que negativo.** Di lo que sí ocurre o lo que hay que hacer.
- **Concreto.** Evita abstracciones; nombra la acción y el objeto reales.

## 2. Tono y persona

- Cercano, tranquilo y servicial. Ni infantil ni solemne.
- Trato de «tú». Nunca «usted» ni formas impersonales rebuscadas.
- En avisos de error, explica qué pasó y qué puede hacer la persona, sin culparla.
- Toda la interfaz va en castellano y pasa por `t()` (también `aria-label`, `alt`, `title` y
  `placeholder`).

## 3. Terminología técnica

- **Evítala si hay una palabra común equivalente.** No escribas «edafoclimático» si puedes decir
  «de suelo y clima».
- **Si el término técnico es necesario, explícalo en contexto.** Añádelo al glosario
  (`src/i18n/messages/glossary.ts`) y a la lista curada (`src/i18n/glossary/technicalTerms.ts`), y
  coloca el componente `TermHelp` en un único punto de acceso por término y pantalla (la primera
  aparición en orden de lectura o un punto de acceso claro de la sección).
- **Una sola definición por término**, reutilizada en todas las ayudas. La definición también cumple
  el nivel de lectura (INFLESZ ≥ 55) y no introduce nueva jerga sin explicar.
- No traduzcas ni reescribas el texto libre que llega del back; esas recomendaciones se gestionan en
  `agro-back`.

## 4. Nivel de lectura objetivo

- Índice **INFLESZ ≥ 55** (banda «normal / bastante fácil»), adaptación al castellano del índice de
  Flesch:

  `INFLESZ = 206.835 − 62.3 × (sílabas / palabras) − (palabras / frases)`

- Se aplica a las cadenas que forman al menos una frase completa (unas 10 palabras o más: mensajes,
  ayudas, descripciones). La microcopia corta (etiquetas de una o dos palabras) no se puntúa, pero
  sigue sujeta a la regla de jerga/glosario.
- Palancas para subir el índice: frases más cortas, menos palabras largas, dividir en dos frases.

## 5. Ejemplos

| Antes (incorrecto)                                                                                                                             | Después (correcto)                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| El formulario contiene errores o campos obligatorios pendientes de completar.                                                                  | Revisa el formulario: hay errores o faltan datos obligatorios.                                       |
| Introduce los datos botánicos y agronómicos para incorporar una nueva especie al catálogo.                                                     | Añade los datos de la planta para sumarla al catálogo.                                               |
| Esta planta fue modificada por otro usuario mientras la editabas. Para evitar sobrescribir información, debes recargar los datos actualizados. | Otra persona cambió esta planta mientras la editabas. Recarga la página para no perder esos cambios. |
| El slug solo puede contener letras minúsculas, números y guiones sencillos (máximo 120).                                                       | Usa solo letras minúsculas, números y guiones. Máximo 120 caracteres.                                |
| Selecciona o busca una planta para explorar sus relaciones y asociaciones ecológicas.                                                          | Elige o busca una planta para ver con cuáles se lleva bien o mal.                                    |

## 6. Lista de comprobación de revisión

Para cada cadena nueva o modificada:

- [ ] ¿Se entiende a la primera, sin conocimientos de agronomía?
- [ ] ¿Usa palabras de uso diario en lugar de términos cultos o técnicos evitables?
- [ ] ¿Las frases son cortas y expresan una sola idea?
- [ ] ¿Habla de «tú» y en voz activa?
- [ ] ¿Está en castellano y pasa por `t()` (incluidos `aria-label`, `alt`, `title`, `placeholder`)?
- [ ] Si conserva un término técnico, ¿tiene entrada en el glosario y una ayuda `TermHelp` accesible?
- [ ] Si forma una frase completa, ¿supera INFLESZ ≥ 55?
- [ ] ¿Pasa `npm run check:readability` sin hallazgos?
