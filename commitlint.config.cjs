/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Tipos de Conventional Commits permitidos
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test'
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Asunto en imperativo, minúsculas, sin punto final
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case']
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],

    // Separación obligatoria entre cabecera, cuerpo y pie
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],

    // LÍMITES CRÍTICOS DE LONGITUD:
    // Header <= 100 caracteres
    'header-max-length': [2, 'always', 100],
    // Body: NINGUNA LÍNEA del cuerpo puede superar los 100 caracteres.
    // Se recomienda partir/envolver líneas (wrap) a 72-80 caracteres.
    'body-max-line-length': [2, 'always', 100],
    // Footer: NINGUNA LÍNEA del pie puede superar los 100 caracteres.
    'footer-max-line-length': [2, 'always', 100]
  }
};
