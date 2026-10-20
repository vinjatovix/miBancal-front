export const TWEMOJI_PRIMARY_MAPPING: Record<string, string> = {
  admin_panel_settings: '1f6e1',
  arrow_forward: '27a1',
  arrow_upward: '2b06',
  auto_awesome: '1f31f',
  bar_chart: '1f4ca',
  biotech: '1f9ec',
  bolt: '26a1',
  calendar_today: '1f4c5',
  clear_all: '1f9f9',
  close: '274c',
  content_cut: '2702',
  crisis_alert: '1f6a8',
  dangerous: '2620',
  delete: '1f5d1',
  description: '1f4c4',
  eco: '1f33f',
  edit_note: '1f4dd',
  explore: '1f9ed',
  extension: '1f9e9',
  grain: '1f33e',
  hourglass_top: '23f3',
  label: '1f3f7',
  layers: '1fab4',
  link: '1f517',
  local_florist: '1f33c',
  lock: '1f510',
  login: '1f511',
  mail: '2709',
  menu_book: '1f4da',
  microscope: '1f52c',
  movie: '1f3ac',
  person: '1f464',
  person_add: '1f195',
  potted_plant: '1f331',
  psychiatry: '1fad8',
  public: '1f30d',
  push_pin: '1f4cc',
  recycling: '267b',
  repeat: '1f502',
  restaurant: '1f37d',
  save: '1f4be',
  schedule: '23f0',
  science: '1f9ea',
  search: '1f50d',
  settings: '2699',
  spa: '1f33f',
  straighten: '1f4cf',
  sunny: '2600',
  sync_alt: '2194',
  thermostat: '1f321',
  warning: '26a0',
  water_drop: '1f4a7',
  yard: '1f3e1'
};

export const TWEMOJI_ALIASES: Record<string, string> = {
  dna: 'biotech',
  skull: 'dangerous',
  dining: 'restaurant',
  tag: 'label',
  cross_mark: 'close',
  droplet: 'water_drop',
  sun: 'sunny',
  memo: 'edit_note',
  herb: 'eco',
  seedling: 'potted_plant',
  sheaf_of_rice: 'grain',
  books: 'menu_book',
  letter: 'mail',
  envelope: 'mail',
  shield: 'admin_panel_settings',
  pending_actions: 'hourglass_top'
};

export const CUSTOM_GLYPHS: Record<string, string> = {
  check:
    '<path fill="currentColor" d="M31.25 7.42a2.5 2.5 0 0 0-3.53 0L13.88 21.25l-5.6-5.6a2.5 2.5 0 1 0-3.54 3.53l7.37 7.37a2.5 2.5 0 0 0 3.54 0l15.6-15.6a2.5 2.5 0 0 0 0-3.53z"/>',
  check_circle:
    '<path fill="currentColor" d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2zm8.75 11.75-10.5 10.5a1.5 1.5 0 0 1-2.12 0l-4.5-4.5a1.5 1.5 0 1 1 2.12-2.12l3.44 3.44 9.44-9.44a1.5 1.5 0 0 1 2.12 2.12z"/>',
  content_copy:
    '<rect x="12" y="12" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><path d="M6 24V8a2 2 0 0 1 2-2h16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>',
  copy: '<rect x="12" y="12" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5"/><path d="M6 24V8a2 2 0 0 1 2-2h16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>',
  tick: '<path fill="currentColor" d="M31.25 7.42a2.5 2.5 0 0 0-3.53 0L13.88 21.25l-5.6-5.6a2.5 2.5 0 1 0-3.54 3.53l7.37 7.37a2.5 2.5 0 0 0 3.54 0l15.6-15.6a2.5 2.5 0 0 0 0-3.53z"/>',
  visibility:
    '<path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M4 18C7.5 11 12.5 8 18 8s10.5 3 14 10c-3.5 7-8.5 10-14 10S7.5 25 4 18Z"/><circle cx="18" cy="18" r="4.5" fill="none" stroke="currentColor" strokeWidth="2.5"/>',
  visibility_off:
    '<path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M4 18C7.5 11 12.5 8 18 8s10.5 3 14 10c-3.5 7-8.5 10-14 10S7.5 25 4 18Z"/><circle cx="18" cy="18" r="4.5" fill="none" stroke="currentColor" strokeWidth="2.5"/><path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="m6 6 24 24"/>'
};

export const TWEMOJI_MAPPING: Record<string, string> = {
  ...TWEMOJI_PRIMARY_MAPPING,
  ...Object.fromEntries(
    Object.entries(TWEMOJI_ALIASES).map(([alias, target]) => [
      alias,
      TWEMOJI_PRIMARY_MAPPING[target]
    ])
  )
};

export function extractSvgInner(svgContent: string): string {
  const match = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  if (!match?.[1]) {
    throw new Error('No SVG inner markup found');
  }
  return match[1].trim();
}
