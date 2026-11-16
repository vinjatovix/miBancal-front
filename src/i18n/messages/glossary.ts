import { registerMessages } from '../core/registry';

export const glossaryMessages = {
  glossary: {
    help_label: 'Qué significa {term}',
    close_label: 'Cerrar la explicación',
    terms: {
      edaphoclimatic: {
        term: 'edafoclimático',
        definition:
          'Es todo lo que une el suelo y el clima de un lugar: la tierra, la lluvia, el sol y la temperatura que rodean a la planta.'
      },
      phenology: {
        term: 'fenología',
        definition:
          'Es el calendario natural de la planta: cuándo brota, cuándo florece y cuándo da fruto a lo largo del año.'
      },
      pollination: {
        term: 'polinización',
        definition:
          'Es el paso del polen de una flor a otra, con ayuda de insectos o del viento, para que la planta forme semillas y frutos.'
      }
    }
  }
} as const;

registerMessages(glossaryMessages);
