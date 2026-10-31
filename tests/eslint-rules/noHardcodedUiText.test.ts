import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';

import noHardcodedUiText from '../../.eslint/rules/no-hardcoded-ui-text.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } }
  }
});

const CHECKED_ATTRIBUTES = [
  'aria-label',
  'alt',
  'title',
  'placeholder',
  'aria-description',
  'aria-valuetext',
  'aria-roledescription'
];

const CHECKED_TEXT_PROPS = [
  'label',
  'message',
  'description',
  'heading',
  'text'
];

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

const HARDCODED_TEXTS = [
  '<p>Hola</p>',
  "<p>{'Hola'}</p>",
  "<p>{ok ? 'Sí' : t('x')}</p>",
  "<p>{ok && 'Sí'}</p>",
  "<p>{a ?? 'Nada'}</p>",
  "<p>{a || 'Nada'}</p>",
  "<p>{'Hola ' + n}</p>",
  '<p>{`${n} plantas`}</p>',
  '<p>agro-front</p>',
  '<span>Google</span>',
  "<p>{'y'}</p>",
  "<p>{'Celsius'}</p>",
  "<p>{'mínimo'}</p>",
  "<p>{'Hola' as string}</p>",
  "<p>{'Hola' satisfies string}</p>",
  "<p>{ok ? 'Sí'! : t('x')}</p>"
];

const HARDCODED_ATTRIBUTES = [
  ...CHECKED_ATTRIBUTES.map((attribute) => ({
    code: `<button ${attribute}="Close" />`,
    attribute
  })),
  ...CHECKED_TEXT_PROPS.map((attribute) => ({
    code: `<InfoRow ${attribute}="Riego" />`,
    attribute
  })),
  { code: "<InfoRow label={'Riego'} />", attribute: 'label' },
  { code: '<ErrorView message={`Error ${c}`} />', attribute: 'message' }
];

const VALID_CODES = [
  '<p>{`${t} °C`}</p>',
  '<p>{`${t} ºC`}</p>',
  '<p>{min}–{max} cm</p>',
  "<p>{' · '}</p>",
  '<span>–</span>',
  "<p>{'/'}</p>",
  "<p>{' | '}</p>",
  "<p>{'123'}</p>",
  '<InfoRow value={`${min}-${max} cm`} />',
  '<p>{`${h} h`}</p>',
  ...MEASUREMENT_UNITS.map((unit) => `<p>{'6 ${unit}'}</p>`),
  "<InfoRow label={`${iconsMap.sun} ${t('a.b')}`} />",
  "<p>{'🌞'}</p>",
  '<p>{plant.name}</p>',
  '<img alt={plant.image.alt} />',
  "<button aria-label={t('common.drawer.close')} />",
  "<p>{tValue('g', v)}</p>",
  '<Badge variant="primary" />',
  '<Icon name="close" />',
  '<Link to="/plants" />',
  '<div className="x" />',
  '<div id="y" />',
  '<div data-testid="a-b" />',
  '<img alt="" />'
];

ruleTester.run('no-hardcoded-ui-text', noHardcodedUiText, {
  valid: VALID_CODES.map((code) => ({ code })),
  invalid: [
    ...HARDCODED_TEXTS.map((code) => ({
      code,
      errors: [{ messageId: 'hardcodedText', line: 1 }]
    })),
    ...HARDCODED_ATTRIBUTES.map(({ code, attribute }) => ({
      code,
      errors: [
        { messageId: 'hardcodedAttribute', line: 1, data: { attribute } }
      ]
    }))
  ]
});

describe('no-hardcoded-ui-text messages', () => {
  it('explains how to fix each finding', () => {
    expect(noHardcodedUiText.meta?.messages).toEqual({
      hardcodedText: 'Texto de interfaz fuera del diccionario. Usa t().',
      hardcodedAttribute:
        'Texto fuera del diccionario en «{{attribute}}». Usa t().'
    });
  });
});
