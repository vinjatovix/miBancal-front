const CHECKED_ATTRIBUTES = new Set([
  'aria-label',
  'alt',
  'title',
  'placeholder',
  'aria-description',
  'aria-valuetext',
  'aria-roledescription'
]);

const CHECKED_TEXT_PROPS = new Set([
  'label',
  'message',
  'description',
  'heading',
  'text'
]);

const MEASUREMENT_UNITS = [
  'mm',
  'cm',
  'm',
  'km',
  'mg',
  'g',
  'kg',
  'ml',
  'l',
  'h',
  'min',
  's',
  'ha',
  '°C',
  'ºC'
];

const MEASUREMENT_UNIT_PATTERN = new RegExp(
  `(?<!\\p{L})(?:${[...MEASUREMENT_UNITS]
    .sort((a, b) => b.length - a.length)
    .join('|')})(?!\\p{L})`,
  'gu'
);

const LETTER = /\p{L}/u;

const CHILD_PARENTS = new Set(['JSXElement', 'JSXFragment']);

const LITERAL_TEXT_READERS = {
  Literal: (node) => (typeof node.value === 'string' ? [node.value] : []),
  TemplateLiteral: (node) =>
    node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw),
  ConditionalExpression: (node) => [
    ...findLiteralTexts(node.consequent),
    ...findLiteralTexts(node.alternate)
  ],
  LogicalExpression: (node) => [
    ...findLiteralTexts(node.left),
    ...findLiteralTexts(node.right)
  ],
  TSAsExpression: (node) => findLiteralTexts(node.expression),
  TSSatisfiesExpression: (node) => findLiteralTexts(node.expression),
  TSNonNullExpression: (node) => findLiteralTexts(node.expression),
  BinaryExpression: (node) =>
    node.operator === '+'
      ? [...findLiteralTexts(node.left), ...findLiteralTexts(node.right)]
      : []
};

function isLinguistic(text) {
  return LETTER.test(text.replace(MEASUREMENT_UNIT_PATTERN, ''));
}

function findLiteralTexts(expression) {
  const read = LITERAL_TEXT_READERS[expression.type];
  return read ? read(expression) : [];
}

function hasLinguisticText(expression) {
  return findLiteralTexts(expression).some(isLinguistic);
}

function attributeName(node) {
  return node.name.type === 'JSXIdentifier' ? node.name.name : undefined;
}

function isCheckedAttribute(name) {
  return CHECKED_ATTRIBUTES.has(name) || CHECKED_TEXT_PROPS.has(name);
}

function attributeExpression(value) {
  if (!value) {
    return undefined;
  }
  return value.type === 'JSXExpressionContainer' ? value.expression : value;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Exige que todo texto de interfaz salga del diccionario'
    },
    schema: [],
    messages: {
      hardcodedText: 'Texto de interfaz fuera del diccionario. Usa t().',
      hardcodedAttribute:
        'Texto fuera del diccionario en «{{attribute}}». Usa t().'
    }
  },

  create(context) {
    return {
      JSXText(node) {
        if (isLinguistic(node.value)) {
          context.report({ node, messageId: 'hardcodedText' });
        }
      },

      JSXExpressionContainer(node) {
        if (
          CHILD_PARENTS.has(node.parent.type) &&
          hasLinguisticText(node.expression)
        ) {
          context.report({ node, messageId: 'hardcodedText' });
        }
      },

      JSXAttribute(node) {
        const attribute = attributeName(node);
        if (!isCheckedAttribute(attribute)) {
          return;
        }
        const expression = attributeExpression(node.value);
        if (expression && hasLinguisticText(expression)) {
          context.report({
            node,
            messageId: 'hardcodedAttribute',
            data: { attribute }
          });
        }
      }
    };
  }
};
