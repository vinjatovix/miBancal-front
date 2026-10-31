import type { PaginatedResponse } from '../../../src/types/api';
import type { Family } from '../../../src/types/Family';

export const listFamiliesResponse: PaginatedResponse<Family> = {
  data: [
    {
      id: 'd0a3b923-c1ac-4796-afa4-1c801ff1a4a3',
      slug: 'Amaryllidaceae',
      name: 'amarilidáceas',
      aliases: [
        'familia del ajo',
        'familia del narciso',
        'familia de la amarillis'
      ],
      scientificName: 'Amaryllidaceae',
      shortDescription:
        'Son plantas herbáceas, perennes, mayormente bulbosas (a veces rizomatosas), con hojas basales, lineales o acintadas. Sus flores son vistosas, actinomorfas o ligeramente zigomorfas, dispuestas en umbelas o pseudoumbelas sobre un escapo. Tienen 6 tépalos y 6 estambres, con ovario ínfero en la mayoría de sus miembros.',
      highlights: [
        'Incluye especies muy populares como el ajo (Allium sativum), la cebolla (Allium cepa), los narcisos (Narcissus) y las amarilis.',
        'Algunas especies producen alcaloides como la galantamina, usada en el tratamiento del Alzheimer.',
        'Sus flores son muy apreciadas en jardinería por su belleza y fragancia.',
        'La subfamilia Allioideae es responsable del olor característico del ajo y la cebolla, gracias a compuestos de azufre.'
      ],
      extra: {
        order: 'Asparagales',
        subfamilies: ['Agapanthoideae', 'Allioideae', 'Amaryllidoideae'],
        distribution:
          'Distribuida por todo el mundo, con mayor diversidad en regiones tropicales, subtropicales y templadas cálidas. Centros de biodiversidad importantes en África del Sur, América del Sur (especialmente los Andes) y la región mediterránea.',
        speciesCount: 1650
      },
      metadata: {
        createdAt: new Date('2026-05-11T21:05:48.475Z'),
        createdBy: 'register1',
        updatedAt: new Date('2026-05-11T21:05:48.475Z'),
        updatedBy: 'register1'
      }
    },
    {
      id: 'a1d5f8e2-b3c7-4e1a-9f2a-5c9b8d7e1f3a',
      slug: 'Apiaceae',
      name: 'apiáceas',
      aliases: [
        'umbelíferas',
        'familia del apio',
        'familia de la zanahoria',
        'familia del perejil'
      ],
      scientificName: 'Apiaceae',
      shortDescription:
        'Son plantas herbáceas, anuales, bienales o perennes, muchas veces aromáticas. Tienen tallos generalmente huecos (fístulos) y hojas alternas, profundamente divididas (pinnadas o bipinnadas), con vainas abrazadoras. Sus flores pequeñas se agrupan en umbelas compuestas. El fruto es un esquizocarpo que se divide en dos mericarpos.',
      highlights: [
        'Incluye hortalizas fundamentales: zanahoria (Daucus carota), apio (Apium graveolens), perejil (Petroselinum crispum), hinojo (Foeniculum vulgare).',
        'Fuente de especias: comino (Cuminum cyminum), anís (Pimpinella anisum), cilantro (Coriandrum sativum), eneldo (Anethum graveolens).',
        'Contienen aceites esenciales responsables de sus aromas y propiedades.',
        'Algunas especies son altamente tóxicas, como la cicuta (Conium maculatum) y la hierba del diablo (Oenanthe crocata).'
      ],
      extra: {
        order: 'Apiales',
        subfamilies: ['Apioideae', 'Saniculoideae', 'Hydrocotyloideae'],
        distribution:
          'Distribuida por todo el mundo, con mayor diversidad en las regiones templadas del hemisferio norte. Presente en hábitats variados, desde prados y bordes de caminos hasta zonas húmedas y montañas.',
        speciesCount: 3800
      },
      metadata: {
        createdAt: new Date('2026-05-11T21:30:35.425Z'),
        createdBy: 'register1',
        updatedAt: new Date('2026-05-11T21:30:35.425Z'),
        updatedBy: 'register1'
      }
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 1,
    totalItems: 2
  }
};
