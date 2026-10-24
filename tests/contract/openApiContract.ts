import { Ajv, type ErrorObject, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { parse } from 'yaml';
import source from '../../contracts/openapi.yaml?raw';
import { convertBooleanExclusiveBounds } from './booleanExclusiveBounds';

export type ContractViolation = {
  readonly location: string;
  readonly message: string;
};

type HttpMethod = 'get' | 'post' | 'patch' | 'delete';

type ParameterObject = {
  readonly in: string;
  readonly name: string;
  readonly style?: string;
  readonly schema?: { readonly type?: string };
};

type ResolvedParameter = {
  readonly parameter: ParameterObject;
  readonly schemaPointer: string;
};

type Reference = { readonly $ref: string };

type OpenApiDocument = {
  readonly paths: Record<
    string,
    Partial<
      Record<
        HttpMethod,
        { readonly parameters?: ReadonlyArray<ParameterObject | Reference> }
      >
    >
  >;
  readonly components: {
    readonly parameters: Record<string, ParameterObject>;
  };
};

type QueryValue = string | string[] | { [key: string]: QueryValue };

type QueryTree = Record<string, QueryValue>;

const DOCUMENT_ID = 'openapi.json';
const PATH_TEMPLATE_SEGMENT = /\{[^}]+\}/g;
const DEEP_OBJECT_KEY = /^([^[\]]+)((?:\[[^[\]]*\])+)$/;
const BRACKET_SEGMENT = /\[([^[\]]*)\]/g;

const contract = parse(source) as OpenApiDocument;
convertBooleanExclusiveBounds(contract);
const ajv = new Ajv({ strict: false, coerceTypes: true, allErrors: true });
addFormats(ajv);
ajv.addSchema(contract, DOCUMENT_ID);

function escapePointer(segment: string): string {
  return segment.replaceAll('~', '~0').replaceAll('/', '~1');
}

function isReference(value: ParameterObject | Reference): value is Reference {
  return '$ref' in value;
}

function resolveParameter(
  entry: ParameterObject | Reference,
  inlinePointer: string
): ResolvedParameter {
  if (!isReference(entry)) {
    return { parameter: entry, schemaPointer: `${inlinePointer}/schema` };
  }
  const name = entry.$ref.split('/').at(-1) ?? '';
  return {
    parameter: contract.components.parameters[name],
    schemaPointer: `/components/parameters/${escapePointer(name)}/schema`
  };
}

function queryParameters(
  path: string,
  method: HttpMethod
): Map<string, ResolvedParameter> {
  const operationPointer = `/paths/${escapePointer(path)}/${method}`;
  const entries = contract.paths[path][method]?.parameters ?? [];
  const resolved = entries.map((entry, index) =>
    resolveParameter(entry, `${operationPointer}/parameters/${index}`)
  );
  return new Map(
    resolved
      .filter(({ parameter }) => parameter.in === 'query')
      .map((item) => [item.parameter.name, item])
  );
}

function appendValue(current: QueryValue | undefined, value: string) {
  if (current === undefined) return value;
  if (Array.isArray(current)) return [...current, value];
  if (typeof current === 'string') return [current, value];
  return current;
}

function setDeep(tree: QueryTree, segments: string[], value: string) {
  const [head, ...rest] = segments;
  if (rest.length === 0) {
    tree[head] = appendValue(tree[head], value);
    return;
  }
  const child = tree[head];
  const next: QueryTree =
    typeof child === 'object' && !Array.isArray(child) ? child : {};
  tree[head] = next;
  setDeep(next, rest, value);
}

function splitKey(key: string): { name: string; segments: string[] } | null {
  const match = DEEP_OBJECT_KEY.exec(key);
  if (!match) return null;
  const segments = [...match[2].matchAll(BRACKET_SEGMENT)].map((m) => m[1]);
  return { name: match[1], segments };
}

function parseQuery(search: URLSearchParams): {
  trees: Map<string, QueryTree>;
  flat: Map<string, QueryValue>;
} {
  const trees = new Map<string, QueryTree>();
  const flat = new Map<string, QueryValue>();
  for (const [key, value] of search) {
    const deep = splitKey(key);
    if (deep) {
      const tree = trees.get(deep.name) ?? {};
      setDeep(tree, deep.segments, value);
      trees.set(deep.name, tree);
    } else {
      flat.set(key, appendValue(flat.get(key), value));
    }
  }
  return { trees, flat };
}

function toViolation(name: string, error: ErrorObject): ContractViolation {
  return {
    location: `query.${name}${error.instancePath}`,
    message: `${error.message ?? 'invalid'} ${JSON.stringify(error.params)}`
  };
}

const validators = new Map<string, ValidateFunction>();

function validatorFor(schemaPointer: string): ValidateFunction {
  const cached = validators.get(schemaPointer);
  if (cached) return cached;
  const validator = ajv.compile({
    type: 'object',
    properties: { value: { $ref: `${DOCUMENT_ID}#${schemaPointer}` } }
  });
  validators.set(schemaPointer, validator);
  return validator;
}

function validateValue(
  name: string,
  value: QueryValue,
  schemaPointer: string
): ContractViolation[] {
  const validate = validatorFor(schemaPointer);
  if (validate({ value })) return [];
  return (validate.errors ?? []).map((error) =>
    toViolation(name, {
      ...error,
      instancePath: error.instancePath.replace(/^\/value/, '')
    })
  );
}

function formValue(parameter: ParameterObject, value: QueryValue): QueryValue {
  if (parameter.schema?.type === 'array' && typeof value === 'string') {
    return value.split(',');
  }
  return value;
}

function validateDeepObjects(
  trees: Map<string, QueryTree>,
  declared: Map<string, ResolvedParameter>
): ContractViolation[] {
  return [...trees].flatMap(([name, tree]) => {
    const resolved = declared.get(name);
    if (resolved?.parameter.style !== 'deepObject') {
      return [
        { location: `query.${name}`, message: 'not a declared deepObject' }
      ];
    }
    return validateValue(name, tree, resolved.schemaPointer);
  });
}

function validateFlat(
  flat: Map<string, QueryValue>,
  declared: Map<string, ResolvedParameter>
): ContractViolation[] {
  return [...flat].flatMap(([name, value]) => {
    const resolved = declared.get(name);
    if (!resolved || resolved.parameter.style === 'deepObject') {
      return [
        {
          location: `query.${name}`,
          message: 'not declared as a plain parameter'
        }
      ];
    }
    return validateValue(
      name,
      formValue(resolved.parameter, value),
      resolved.schemaPointer
    );
  });
}

function pathMatcher(template: string): RegExp {
  const escaped = template.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(PATH_TEMPLATE_SEGMENT, '[^/]+')}$`);
}

function findDeclaredPath(
  requested: string,
  method: HttpMethod
): string | undefined {
  return Object.keys(contract.paths).find(
    (template) =>
      contract.paths[template][method] !== undefined &&
      pathMatcher(template).test(requested)
  );
}

export function validateRequest(
  method: HttpMethod,
  url: string
): ContractViolation[] {
  const parsed = new URL(url, 'http://contract.test');
  const requested = decodeURIComponent(parsed.pathname);
  const path = findDeclaredPath(requested, method);
  if (!path) {
    return [
      { location: 'path', message: `${method} ${requested} is not declared` }
    ];
  }
  const declared = queryParameters(path, method);
  const { trees, flat } = parseQuery(parsed.searchParams);
  return [
    ...validateDeepObjects(trees, declared),
    ...validateFlat(flat, declared)
  ];
}

export function validateSchema(
  name: string,
  value: unknown
): ContractViolation[] {
  const schemaPointer = `/components/schemas/${escapePointer(name)}`;
  const validate = validatorFor(schemaPointer);
  if (validate({ value })) return [];
  return (validate.errors ?? []).map((error) => {
    const basePath = error.instancePath.replace(/^\/value/, '');
    const additional =
      typeof error.params?.additionalProperty === 'string'
        ? `/${error.params.additionalProperty}`
        : '';
    const location = `${basePath}${additional}` || '/';
    return {
      location,
      message: `${error.message ?? 'invalid'} ${JSON.stringify(error.params)}`
    };
  });
}
