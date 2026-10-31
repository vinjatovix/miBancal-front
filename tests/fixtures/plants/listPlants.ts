import type { PaginatedResponse } from '../../../src/types/api';
import type { Plant } from '../../../src/types/Plants/Plant';

export const listPlantsResponse: PaginatedResponse<Plant> = {
  data: [
    {
      id: '678efda2-ac3d-4623-81cd-fc1d0ab80315',
      identity: {
        name: {
          primary: 'perejil',
          aliases: ['prixel', 'perexil', 'petroselino']
        },
        scientificName: 'petroselinum crispum',
        family: 'a1d5f8e2-b3c7-4e1a-9f2a-5c9b8d7e1f3a'
      },
      traits: {
        lifecycle: 'biennial',
        size: {
          height: {
            min: 20,
            max: 40
          },
          spread: {
            min: 20,
            max: 20
          }
        },
        spacingCm: {
          min: 20,
          max: 20
        },
        ecological: {
          edible: true,
          toxic: true,
          toxicityNotes:
            'En grandes cantidades puede ser abortivo; evitar en el embarazo.'
        }
      },
      phenology: {
        sowing: {
          seedsPerHole: {
            min: 5,
            max: 6
          },
          germinationDays: {
            min: 14,
            max: 28
          },
          months: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          methods: {
            direct: {
              depthCm: {
                min: 0.5,
                max: 1
              }
            }
          }
        },
        flowering: {
          months: [4, 5, 6, 7, 8, 9],
          pollination: {
            type: 'insect',
            agents: ['abejas', 'otros insectos polinizadores']
          }
        },
        harvest: {
          months: [3, 4, 5, 6, 7, 8, 9, 10, 11],
          description:
            'Cosecha a partir de 2-3 meses. Cortar hojas desde la base sin dañar el crecimiento central.'
        }
      },
      knowledge: {
        watering: {
          frequency: 'daily',
          conditions: [
            'Mantener suelo húmedo pero no encharcado',
            'Evitar sequía prolongada',
            'Preferible riego constante'
          ]
        },
        light: {
          hoursMin: 4,
          type: 'partial_shade',
          preference: 'all_day'
        },
        pruning: [
          {
            type: 'maintenance',
            intensity: 'moderate',
            seasons: ['spring', 'summer'],
            frequencyPerYear: 6,
            bestPractices: [
              'Cortar hojas desde la base',
              'No eliminar más de 1/3 de la planta',
              'Estimular rebrote continuo'
            ]
          }
        ],
        propagation: {
          methods: {
            seed: {
              seasons: ['spring', 'summer'],
              bestPractices: [
                'Semilla con germinación lenta',
                'Macerar semillas 24h antes de siembra',
                'Preferible siembra directa',
                'Evitar trasplante por raíz sensible'
              ]
            }
          }
        },
        ecology: {
          strategicBenefits: [
            'Atrae polinizadores y depredadores',
            'Repelente natural de babosas',
            'Planta acompañante en huerto',
            'Adaptación a climas fríos'
          ]
        },
        notes: [
          'Resiste heladas, ideal para Galicia',
          'No tolera bien el trasplante',
          'Germinación lenta (14-28 días)',
          'Compatible con tomate, cebolla, espárrago y zanahoria',
          'Incompatible con lechuga, apio, puerro y guisante',
          'No repetir cultivo en el mismo lugar antes de 4 años',
          'Prefiere semisombra en verano',
          'Apto para macetas o cultivo bajo árboles'
        ],
        soil: {
          ph: {
            min: 6,
            max: 7.5
          },
          availableDepthCm: {
            min: 30,
            max: 40
          }
        },
        resources: [
          {
            type: 'image',
            url: 'https://example.org/plants/perejil.jpg'
          }
        ],
        rootSystem: {
          type: 'taproot',
          depthCm: {
            min: 20,
            max: 40
          },
          spreadCm: {
            min: 15,
            max: 25
          }
        }
      },
      image: {
        url: 'https://example.org/plants/perejil.jpg'
      },
      metadata: {
        createdAt: new Date('2026-05-12T00:56:03.658Z'),
        createdBy: 'register1',
        updatedAt: new Date('2026-05-12T00:56:03.658Z'),
        updatedBy: 'register1'
      },
      status: 'ACTIVE',
      likesCount: 0,
      deletedAt: null
    },
    {
      id: 'ba109916-f032-45d0-8781-34f8482e53ac',
      identity: {
        name: {
          primary: 'cola de caballo',
          aliases: ['equiseto', 'pinillo', 'Equisetum arvense']
        },
        scientificName: 'equisetum arvense',
        family: 'ecfe4e91-1da9-4eb6-9d1d-d0a315e765f4'
      },
      traits: {
        lifecycle: 'perennial',
        size: {
          height: {
            min: 30,
            max: 70
          },
          spread: {
            min: 30,
            max: 40
          }
        },
        spacingCm: {
          min: 30,
          max: 40
        },
        ecological: {
          toxic: true,
          toxicityNotes:
            'Contiene tiaminasa; no consumir cruda ni en grandes cantidades.'
        }
      },
      phenology: {
        sowing: {
          seedsPerHole: {
            min: 1,
            max: 1
          },
          germinationDays: {
            min: 1,
            max: 12
          },
          months: [3, 4, 5, 6, 9, 10, 11],
          methods: {
            direct: {
              depthCm: {
                min: 0,
                max: 5
              }
            }
          }
        },
        flowering: {
          months: [3, 4],
          pollination: {
            type: 'self',
            agents: []
          }
        },
        harvest: {
          months: [6, 7],
          description:
            'Cosecha de tallos estériles verdes en junio-julio, antes de que se oscurezcan completamente, preferiblemente al mediodía.'
        }
      },
      knowledge: {
        watering: {
          frequency: 'weekly',
          conditions: [
            'Riego demandante sin encharcar',
            'Prefiere suelos húmedos, bien drenados'
          ]
        },
        light: {
          hoursMin: 4,
          type: 'full_sun',
          preference: 'morning'
        },
        pruning: [
          {
            type: 'maintenance',
            intensity: 'light',
            seasons: ['summer'],
            frequencyPerYear: 1,
            bestPractices: ['Controlar la expansión por rizomas']
          }
        ],
        propagation: {
          methods: {
            division: {
              seasons: ['spring', 'summer'],
              bestPractices: [
                'División de rizomas en primavera u otoño',
                'Cultivar preferiblemente en maceta o con barreras físicas'
              ]
            }
          }
        },
        ecology: {
          strategicBenefits: [
            'Repelente natural de plagas',
            'Estimula las defensas de otras plantas',
            'Usada como fungicida natural (purín fermentado)'
          ]
        },
        resources: [
          {
            type: 'image',
            url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Equisetum_arvense_stems.jpg/300px-Equisetum_arvense_stems.jpg'
          },
          {
            type: 'video',
            url: 'https://www.youtube.com/watch?v=nhtp2y49Hoo'
          },
          {
            type: 'video',
            url: 'https://www.youtube.com/watch?v=g2yQYIRQV7k'
          },
          {
            type: 'article',
            url: 'https://www.example.com/cola-de-caballo-beneficios-propiedades-usos'
          }
        ],
        notes: [
          'Muy invasiva por su sistema rizomatoso extenso',
          'Ideal en suelos húmedos, arenosos o arcillosos',
          'Usada en agricultura biodinámica como preparado 508',
          'Compatible con plantas que necesiten protección contra hongos',
          'Incompatible con plantas que requieran suelos secos',
          'Evitar replantar en el mismo lugar antes de 3 años'
        ],
        soil: {
          ph: {
            min: 6.5,
            max: 7.5
          },
          availableDepthCm: {
            min: 30,
            max: 50
          }
        },
        rootSystem: {
          type: 'rhizome',
          depthCm: {
            min: 10,
            max: 15
          },
          spreadCm: {
            min: 30,
            max: 40
          }
        }
      },
      image: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Equisetum_arvense_stems.jpg/300px-Equisetum_arvense_stems.jpg'
      },
      metadata: {
        createdAt: new Date('2026-05-15T02:43:14.809Z'),
        createdBy: 'register1',
        updatedAt: new Date('2026-05-15T02:43:14.809Z'),
        updatedBy: 'register1'
      },
      status: 'ACTIVE',
      likesCount: 5,
      deletedAt: null
    }
  ],
  pagination: {
    page: 1,
    limit: 25,
    totalPages: 1,
    totalItems: 2
  }
};
