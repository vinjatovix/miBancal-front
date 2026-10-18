# agro-front: contexto para agentes

## Exploración de código: CodeGraph primero

Este repo está indexado con CodeGraph (`.codegraph/`). Antes de usar `grep`, `find`, `Read`,
`cat` o cualquier otra herramienta para localizar o entender código, **MUST** consultarse
CodeGraph:

- Herramienta MCP `codegraph_explore` (si aparece como diferida, cargarla con la búsqueda de
  herramientas).
- Si el MCP no está disponible: `codegraph explore "<símbolos o pregunta>"` en la shell.

Solo se recurre a `grep`/`Read` cuando CodeGraph no cubre lo que se busca (por ejemplo,
documentos Markdown, YAML o archivos no indexados) o su respuesta es insuficiente.

## Documentos de referencia

- `.specify/memory/constitution.md`: principios y quality gates (prevalece sobre todo lo demás).
- `docs/context.md`: estado real del sistema.
- `docs/design.md`: diseño.
- `contracts/openapi.yaml`: contrato de la API (no se edita a mano).

## Convenciones de commits y Commitlint

Este repositorio valida commits estrictamente con Conventional Commits mediante Commitlint
(`commitlint.config.cjs`) tanto en local (Husky `commit-msg`) como en CI (`commitlint-github-action`).

- **Formato**: `<tipo>(<scope>): <asunto en imperativo, minúsculas, inglés>`
- **Tipos permitidos**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Límites de longitud**:
  - Cabecera (`header-max-length`): máximo **100** caracteres.
  - Líneas de cuerpo (`body-max-line-length`): máximo **100** caracteres por línea.
  - Líneas de pie (`footer-max-line-length`): máximo **100** caracteres por línea.
- **Regla estricta para el cuerpo de commits**:
  - Si el commit contiene cuerpo explicativo, **MUST** envolverse (wrap) a máximo 72–80 caracteres por línea.
  - **MUST NOT** enviarse párrafos largos continuos en una sola línea mediante `git commit -m`.
- **Validación previa obligatoria**:
  - Los entornos de ejecución de agentes CLI frecuentemente anulan `core.hooksPath`, por lo que el hook local de git puede no ejecutarse automáticamente.
  - El agente **MUST** validar siempre el mensaje completo antes de proponer o ejecutar un commit:
    ```bash
    cat << 'EOF' | npx commitlint
    <mensaje propuesto>
    EOF
    ```
