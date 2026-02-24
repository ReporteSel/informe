/*
 * ═══════════════════════════════════════════════════════════════════
 *  SEL ACHS · Dashboard de Productividad
 *  sel.data.js — DATOS DEL ANÁLISIS
 *
 *  ► ESTE ES EL ÚNICO ARCHIVO QUE SE EDITA en cada análisis nuevo.
 *
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │  GUÍA RÁPIDA DE ACTUALIZACIÓN                                │
 *  │                                                              │
 *  │  A. SEL_CARD   → metadata para la tarjeta del índice home    │
 *  │                  (lo primero a actualizar, lo lee home.html) │
 *  │                                                              │
 *  │  B. SEL         → datos completos del dashboard              │
 *  │     1. META     → período, fecha, semanas evaluadas          │
 *  │     2. WEEKS    → etiquetas eje X                            │
 *  │     3. D        → prestaciones semanales por territorio      │
 *  │     4. MIX      → % cobro Agencia vs Cliente (año actual)    │
 *  │     5. YTD      → acumulados S1→última semana                │
 *  │     6. RK       → top 2 y bottom 2 centros                   │
 *  │     7. PR       → datos reales + proyección PM3              │
 *  └──────────────────────────────────────────────────────────────┘
 * ═══════════════════════════════════════════════════════════════════
 */

/* ════════════════════════════════════════════════════════════════════
   A. SEL_CARD — metadata para la tarjeta en home.html
   ════════════════════════════════════════════════════════════════════
   home.html busca esta variable con regex para construir la tarjeta
   sin cargar el HTML completo del reporte.
   ► Actualizar junto con los datos SEL abajo. */

const SEL_CARD = {
  titulo:    'Semana 7 · 2026',
  subtitulo: 'Análisis S2–S7',
  fecha:     '2026-02-21',

  kpis: {
    total:    64964,    // total prestaciones S2–S7 año actual
    totalComp:59432,    // mismo período año anterior
    pct:       9.3,     // Δ% vs año anterior
    s7:       10726,    // última semana evaluada (todos los territorios)
    s7Comp:    9616,    // misma semana año anterior
    s7Pct:    11.5,     // Δ% última semana
  },

  territorios: {
    norte: { total: 21501, pct:  7.5 },
    metro: { total: 26904, pct: 10.5 },
    sur:   { total: 16560, pct:  9.7 },
  },

  destacados: [
    { tipo: 'logro',  texto: 'Metro S4: pico histórico 4.764 prest. (+11.8%)' },
    { tipo: 'logro',  texto: 'Norte: Vallenar +19.9% · Copiapó +19.1%'       },
    { tipo: 'alerta', texto: 'S6 cae 3 años consecutivos — patrón estacional'  },
  ],
};

/* ════════════════════════════════════════════════════════════════════
   B. SEL — datos completos del dashboard
   ════════════════════════════════════════════════════════════════════ */

const SEL = {

  /* 1. META */
  META: {
    titulo:     'Productividad por Territorio',
    subtitulo:  '61 centros · 3 territorios · Semanas 2 a 7',
    badge:      'SEL ACHS · S2–S7 · 2026 vs 2025',
    periodoStr: 'Semanas 2 a 7',
    semInicio:  2,
    semFin:     7,
    anioActual: 2026,
    anioComp:   2025,
    fechaCorte: '2026-02-21',
  },

  /* 2. SEMANAS */
  WEEKS:   ['S2','S3','S4','S5','S6','S7'],
  WEEKS_P: ['S2','S3','S4','S5','S6','S7','S8','S9'],

  /* 3. D — prestaciones semanales */
  D: {
    norte: {
      2024: [3250, 3428, 2978, 3029, 2638, 2853],
      2025: [3132, 3715, 3365, 3344, 3218, 3218],
      2026: [3548, 3712, 3652, 3552, 3495, 3543],
    },
    metro: {
      2024: [3721, 3554, 3476, 3472, 3333, 3230],
      2025: [4215, 4268, 4263, 4022, 3719, 3856],
      2026: [4076, 4694, 4764, 4582, 4407, 4381],
    },
    sur: {
      2024: [2430, 2386, 2141, 2219, 2162, 2221],
      2025: [2617, 2567, 2549, 2387, 2437, 2543],
      2026: [2828, 2816, 2786, 2787, 2542, 2802],
    },
  },

  /* 4. MIX — % cobro por semana (solo año actual) */
  MIX: {
    norte: {
      ag: [25.6, 26.4, 25.4, 25.7, 24.9, 24.7],
      cl: [74.4, 73.6, 74.6, 74.3, 75.1, 75.3],
    },
    metro: {
      ag: [34.0, 32.1, 32.3, 31.8, 32.3, 31.3],
      cl: [66.0, 67.9, 67.7, 68.2, 67.7, 68.7],
    },
    sur: {
      ag: [32.7, 32.2, 33.3, 29.9, 33.0, 31.9],
      cl: [67.3, 67.8, 66.7, 70.1, 67.0, 68.1],
    },
  },

  /* 5. YTD — acumulado S1 → última semana evaluada */
  YTD: {
    norte: { ytd: 22001, ytdComp: 22574, pct: -2.5, lectura: 'S1 débil · S2–S7 🟢', nota: 'El período analizado crece. El acumulado se recuperará.' },
    metro: { ytd: 27426, ytdComp: 27542, pct: -0.4, lectura: 'En ruta 🟢',           nota: 'YTD casi igual a 2025 con S2–S7 muy superior.' },
    sur:   { ytd: 16872, ytdComp: 17328, pct: -2.6, lectura: 'S1 débil · S2–S7 🟢', nota: 'S1 2026 fue bajo, pero desde S2 supera consistentemente.' },
    total: { ytd: 66299, ytdComp: 67444, pct: -1.7 },
  },

  /* 6. RK — ranking top 2 y bottom 2 por territorio */
  RK: {
    norte: {
      avg: '+5.6%', n: 11,
      top: [{ n:'Vallenar',  v25:768,  v26:921  }, { n:'Copiapó',   v25:2088, v26:2487 }],
      bot: [{ n:'Illapel',   v25:817,  v26:788  }, { n:'Arica',     v25:1513, v26:1312 }],
    },
    metro: {
      avg: '+14.7%', n: 13,
      top: [{ n:'Los Andes', v25:1214, v26:2355 }, { n:'Las Condes', v25:1483, v26:2034 }],
      bot: [{ n:'San Antonio',v25:421, v26:404  }, { n:'La Calera',  v25:801,  v26:724  }],
    },
    sur: {
      avg: '+7.5%', n: 12,
      top: [{ n:'Pto. Montt',v25:1082, v26:1460 }, { n:'Osorno',    v25:564,  v26:703  }],
      bot: [{ n:'Castro',    v25:504,  v26:419  }, { n:'Coyhaique', v25:232,  v26:187  }],
    },
  },

  /* 7. PR — proyección PM3 */
  PR: {
    //          S2    S3    S4    S5    S6    S7    S8    S9
    nR: [3548, 3712, 3652, 3552, 3495, 3543, null, null],
    nP: [null, null, null, null, null, 3543, 3530, 3527],
    mR: [4076, 4694, 4764, 4582, 4407, 4381, null, null],
    mP: [null, null, null, null, null, 4381, 4390, 4386],
    sR: [2828, 2816, 2786, 2787, 2542, 2802, null, null],
    sP: [null, null, null, null, null, 2802, 2715, 2713],
  },

};
