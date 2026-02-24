/*
 * ═══════════════════════════════════════════════════════════════════
 *  SEL ACHS · Dashboard de Productividad
 *  sel.engine.js — Motor de gráficos, tabs y utilidades
 *
 *  ► NO EDITAR por análisis.
 *    Solo si se agrega un nuevo tipo de gráfico o funcionalidad global.
 *
 *  Depende de: SEL (objeto de datos definido en sel.data.js)
 * ═══════════════════════════════════════════════════════════════════
 */

'use strict';

/* ══════════════════════════════════════════════════════════════════
   CONSTANTES DE ESTILO  (espejo de CSS variables para Chart.js)
   ══════════════════════════════════════════════════════════════════ */
const C = {
  az:    '#002A6C',
  bl:    '#348EFE',
  gr:    '#3a8c1a',
  mu:    'rgba(0,0,0,.32)',
  grid:  'rgba(0,0,0,.07)',
  bg:    '#E9EADD',
  red:   '#cc2200',
  green: '#00A550',
};
const FN = "'Segoe UI', system-ui, sans-serif";

// Color y mínimo de eje Y por territorio (se lee desde SEL.CONFIG si existe)
const TCOL = { norte: C.az, metro: C.bl, sur: C.gr };
const TMIN = { norte: 2600, metro: 3400, sur: 2100 };

/* ══════════════════════════════════════════════════════════════════
   HELPER: hex → rgba
   ══════════════════════════════════════════════════════════════════ */
function rgb(hex, a) {
  const [r, g, b] = [hex.slice(1,3), hex.slice(3,5), hex.slice(5,7)].map(h => parseInt(h, 16));
  return `rgba(${r},${g},${b},${a})`;
}

/* ══════════════════════════════════════════════════════════════════
   TABS — mostrar / ocultar slides y construir bajo demanda
   ══════════════════════════════════════════════════════════════════ */
const _built = {};

function showTab(i) {
  document.querySelectorAll('.slide').forEach((s, j) => s.classList.toggle('active', i === j));
  document.querySelectorAll('.tbtn').forEach((b, j) => b.classList.toggle('active', i === j));
  if (!_built[i]) { _built[i] = true; _buildTab(i); }
}

function _buildTab(i) {
  if (i === 0) { _buildGeneral(); }
  if (i === 1) { _buildTerrChart('norte'); _buildMix('norte'); _buildRanking('norte'); }
  if (i === 2) { _buildTerrChart('metro'); _buildMix('metro'); _buildRanking('metro'); }
  if (i === 3) { _buildTerrChart('sur');   _buildMix('sur');   _buildRanking('sur');   }
  if (i === 4) { _buildProy(); }
}

/* ══════════════════════════════════════════════════════════════════
   YEAR TOGGLE — activar / desactivar año de comparación
   ══════════════════════════════════════════════════════════════════ */
const _yrSel = { norte: 2025, metro: 2025, sur: 2025 };

function toggleYr(btn) {
  const ch    = btn.dataset.ch;
  const yr    = parseInt(btn.dataset.yr);
  const group = btn.closest('.ytgl');
  const wasOn = btn.classList.contains('on' + (yr % 100));

  group.querySelectorAll('.ybtn').forEach(b => b.className = 'ybtn');
  if (!wasOn) { btn.classList.add('on' + (yr % 100)); _yrSel[ch] = yr; }
  else        { _yrSel[ch] = null; }

  _buildTerrChart(ch);  // reconstruye el gráfico del territorio
}

/* ══════════════════════════════════════════════════════════════════
   DATASET FACTORIES
   ══════════════════════════════════════════════════════════════════ */
function _area(label, data, col, alpha = 0.18, dashed = false) {
  return {
    label, data,
    borderColor: col, backgroundColor: rgb(col, alpha),
    fill: true, tension: .35,
    borderWidth: dashed ? 1.5 : 2.5,
    pointBackgroundColor: col,
    pointRadius: dashed ? 3 : 4,
    borderDash: dashed ? [5, 4] : [],
    spanGaps: false,
  };
}

function _line(label, data, col, dashed = false) {
  return {
    label, data,
    borderColor: col, backgroundColor: 'transparent',
    fill: false, tension: .35,
    borderWidth: dashed ? 2 : 2.5,
    pointBackgroundColor: col,
    pointRadius: 4,
    borderDash: dashed ? [7, 4] : [],
    spanGaps: false,
  };
}

/* ══════════════════════════════════════════════════════════════════
   BASE OPTIONS para Chart.js (líneas de área y proyección)
   ══════════════════════════════════════════════════════════════════ */
function _baseOpts(yMin) {
  return {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { labels: { color: C.mu, font: { family: FN, size: 10 }, boxWidth: 10, padding: 10 } },
      tooltip: {
        backgroundColor: C.bg, borderColor: 'rgba(0,0,0,.1)', borderWidth: 1,
        titleColor: '#111', bodyColor: '#555', bodyFont: { family: FN, size: 10 },
        callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString('es-CL') ?? ''}` }
      },
      datalabels: { display: false }
    },
    scales: {
      x: { grid: { color: C.grid }, ticks: { color: C.mu, font: { family: FN, size: 9 } } },
      y: {
        grid: { color: C.grid }, min: yMin,
        ticks: { color: C.mu, font: { family: FN, size: 9 }, callback: v => v.toLocaleString('es-CL') }
      }
    }
  };
}

/* ══════════════════════════════════════════════════════════════════
   INSTANCIAS — para poder destruir antes de reconstruir
   ══════════════════════════════════════════════════════════════════ */
const _ch = {};

/* ──────────────────────────────────────────────────────────────────
   BUILD: TAB 0 — GENERAL
   Solo 2026, 3 territorios, etiquetas de datos ON para PNG/JPG
   ────────────────────────────────────────────────────────────────── */
function _buildGeneral() {
  const o = _baseOpts(2100);
  o.plugins.datalabels = {
    display: true,
    color:   ctx => [C.az, C.bl, C.gr][ctx.datasetIndex] || C.az,
    font:    { family: FN, size: 8, weight: 'bold' },
    anchor: 'end', align: 'top', offset: 1, clamp: true,
    formatter: v => v != null ? v.toLocaleString('es-CL') : ''
  };
  _ch.gen = new Chart('chartGeneral', {
    type: 'line',
    data: {
      labels: SEL.WEEKS,
      datasets: [
        _area('Norte', SEL.D.norte[2026], C.az, 0.20),
        _area('Metro', SEL.D.metro[2026], C.bl, 0.18),
        _area('Sur',   SEL.D.sur[2026],   C.gr, 0.20),
      ]
    },
    options: o
  });
}

/* ──────────────────────────────────────────────────────────────────
   BUILD: TABs 1-3 — TERRITORIO
   2026 siempre visible con etiquetas.
   Año de comparación opcional, se activa con el toggle.
   ────────────────────────────────────────────────────────────────── */
function _buildTerrChart(ch) {
  const col  = TCOL[ch];
  const ymin = TMIN[ch];
  const yr   = _yrSel[ch];
  const ds   = [];

  if (yr) ds.push(_area(String(yr), SEL.D[ch][yr], col, 0.07, true)); // comparación punteada
  ds.push(_area('2026', SEL.D[ch][2026], col, 0.22));                  // 2026 siempre sólido

  const idx = ds.length - 1; // índice del dataset 2026 (siempre el último)
  const o   = _baseOpts(ymin);
  o.plugins.datalabels = {
    display:   ctx => ctx.datasetIndex === idx,
    color:     col,
    font:      { family: FN, size: 8, weight: 'bold' },
    anchor: 'end', align: 'top', offset: 2, clamp: true,
    formatter: v => v != null ? v.toLocaleString('es-CL') : ''
  };

  const id = 'chart' + ch[0].toUpperCase() + ch.slice(1);
  if (_ch[ch]) _ch[ch].destroy();
  _ch[ch] = new Chart(id, { type: 'line', data: { labels: SEL.WEEKS, datasets: ds }, options: o });
}

/* ──────────────────────────────────────────────────────────────────
   BUILD: MIX COBRO — barras 100% verticales apiladas
   Solo año en análisis (2026). Ley 16744 vs Cobro Cliente.
   ────────────────────────────────────────────────────────────────── */
function _buildMix(ch) {
  const m  = SEL.MIX[ch];
  const id = 'chartMix' + ch[0].toUpperCase() + ch.slice(1);

  _ch['mx' + ch] = new Chart(id, {
    type: 'bar',
    data: {
      labels: SEL.WEEKS,
      datasets: [
        { label: 'Ley 16744',      data: m.ag, backgroundColor: C.az },
        { label: 'Cobro Cliente',  data: m.cl, backgroundColor: C.bl },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: C.mu, font: { family: FN, size: 9 }, boxWidth: 8, padding: 8 } },
        tooltip: {
          backgroundColor: C.bg, borderColor: 'rgba(0,0,0,.1)', borderWidth: 1,
          titleColor: '#111', bodyColor: '#555',
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` }
        },
        datalabels: {
          display: true, color: 'white',
          font: { family: FN, size: 8, weight: 'bold' },
          formatter: v => v + '%', anchor: 'center', align: 'center'
        }
      },
      scales: {
        x: { stacked: true, grid: { color: C.grid }, ticks: { color: C.mu, font: { family: FN, size: 9 } } },
        y: {
          stacked: true, min: 0, max: 100, grid: { color: C.grid },
          ticks: { color: C.mu, font: { family: FN, size: 9 }, callback: v => v + '%' }
        }
      }
    }
  });
}

/* ──────────────────────────────────────────────────────────────────
   BUILD: RANKING — Dumbbell chart
   Dot blanco = 2025 · Dot color = 2026 · Línea conectora
   Etiqueta con Δ% al lado del dot 2026.
   ────────────────────────────────────────────────────────────────── */
function _buildRanking(ch) {
  const rk     = SEL.RK[ch];
  const all    = [...rk.top, ...rk.bot];
  const labels = all.map(r => r.n);
  const v25    = all.map(r => r.v25);
  const v26    = all.map(r => r.v26);
  const pcts   = all.map(r => +((r.v26 - r.v25) / r.v25 * 100).toFixed(1));
  const isUp   = pcts.map(p => p >= 0);
  const id     = 'chartRk' + ch[0].toUpperCase() + ch.slice(1);

  // Plugin inline que dibuja la línea conectora entre los dos dots
  const connPlugin = {
    id: 'conn',
    afterDatasetsDraw(chart) {
      const ctx2 = chart.ctx;
      const m0   = chart.getDatasetMeta(0);
      const m1   = chart.getDatasetMeta(1);
      m0.data.forEach((pt, i) => {
        const pt1 = m1.data[i];
        ctx2.save();
        ctx2.beginPath();
        ctx2.moveTo(pt.x, pt.y);
        ctx2.lineTo(pt1.x, pt1.y);
        ctx2.strokeStyle = isUp[i] ? 'rgba(0,165,80,.35)' : 'rgba(204,34,0,.35)';
        ctx2.lineWidth   = 2.5;
        ctx2.stroke();
        ctx2.restore();
      });
    }
  };

  const allVals = [...v25, ...v26];
  const xMin    = Math.min(...allVals) * 0.85;
  const xMax    = Math.max(...allVals) * 1.18;

  if (_ch['rk' + ch]) _ch['rk' + ch].destroy();
  _ch['rk' + ch] = new Chart(id, {
    type: 'scatter',
    data: {
      labels,
      datasets: [
        {
          label: '2025',
          data:  v25.map((v, i) => ({ x: v, y: i })),
          backgroundColor: 'white', borderColor: '#999', borderWidth: 2,
          pointRadius: 9, pointStyle: 'circle'
        },
        {
          label: '2026',
          data:  v26.map((v, i) => ({ x: v, y: i })),
          backgroundColor: ctx => isUp[ctx.dataIndex] ? C.green : C.red,
          borderColor: 'transparent',
          pointRadius: 11, pointStyle: 'circle'
        },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: C.mu, font: { family: FN, size: 9 }, boxWidth: 8, padding: 8 } },
        tooltip: {
          backgroundColor: C.bg, borderColor: 'rgba(0,0,0,.1)', borderWidth: 1,
          titleColor: '#111', bodyColor: '#555',
          callbacks: {
            title: items => all[items[0].dataIndex].n,
            label: ctx  => {
              const i = ctx.dataIndex, is26 = ctx.datasetIndex === 1;
              return is26
                ? ` 2026: ${v26[i].toLocaleString('es-CL')}  (${pcts[i] > 0 ? '+' : ''}${pcts[i]}%)`
                : ` 2025: ${v25[i].toLocaleString('es-CL')}`;
            }
          }
        },
        datalabels: {
          display:   ctx => ctx.datasetIndex === 1,
          color:     ctx => isUp[ctx.dataIndex] ? C.green : C.red,
          font:      { family: FN, size: 9, weight: 'bold' },
          anchor: 'end',
          align:  ctx => v26[ctx.dataIndex] >= v25[ctx.dataIndex] ? 'right' : 'left',
          offset: 5,
          formatter: (_, ctx) => {
            const p = pcts[ctx.dataIndex];
            return (p > 0 ? '+' : '') + p + '%';
          }
        }
      },
      scales: {
        x: {
          grid: { color: C.grid }, min: xMin, max: xMax,
          ticks: { color: C.mu, font: { family: FN, size: 9 }, callback: v => v.toLocaleString('es-CL') }
        },
        y: {
          reverse: true, min: -0.5, max: 3.5,
          grid: { color: C.grid },
          ticks: {
            color: C.mu, font: { family: FN, size: 10 },
            callback: v => Number.isInteger(v) && labels[v] ? labels[v] : ''
          }
        }
      }
    },
    plugins: [connPlugin]
  });
}

/* ──────────────────────────────────────────────────────────────────
   BUILD: TAB 4 — PROYECCIÓN  (PM3 semanas)
   ────────────────────────────────────────────────────────────────── */
function _buildProy() {
  const o = _baseOpts(2100);
  o.plugins.datalabels = { display: false };

  _ch.pr = new Chart('chartProy', {
    type: 'line',
    data: {
      labels: SEL.WEEKS_P,
      datasets: [
        _area('Norte Real',  SEL.PR.nR, C.az, 0.18),
        _area('Metro Real',  SEL.PR.mR, C.bl, 0.18),
        _area('Sur Real',    SEL.PR.sR, C.gr, 0.16),
        _line('Norte Proy.', SEL.PR.nP, C.az, true),
        _line('Metro Proy.', SEL.PR.mP, C.bl, true),
        _line('Sur Proy.',   SEL.PR.sP, C.gr, true),
      ]
    },
    options: o
  });
}

/* ══════════════════════════════════════════════════════════════════
   EXPORT  —  PNG transparente / JPG con fondo
   ══════════════════════════════════════════════════════════════════ */
function exportEl(id, name, fmt) {
  const el    = document.getElementById(id);
  const isPng = fmt === 'png';
  const hide  = el.querySelectorAll('.exp, .ytgl');

  hide.forEach(b => b.style.visibility = 'hidden');

  // PNG: quitar fondos para transparencia
  const saved = [];
  if (isPng) {
    [el, ...el.querySelectorAll('*')].forEach(node => {
      saved.push(node);
      node.style.setProperty('background-color', 'transparent', 'important');
      node.style.setProperty('background',       'transparent', 'important');
    });
  }

  html2canvas(el, { scale: 3, useCORS: true, backgroundColor: isPng ? null : '#E9EADD', logging: false })
    .then(cv => {
      saved.forEach(n => { n.style.removeProperty('background-color'); n.style.removeProperty('background'); });
      hide.forEach(b => b.style.visibility = 'visible');
      const a = document.createElement('a');
      a.download = `SEL_${name}_${new Date().toISOString().slice(0, 10)}.${isPng ? 'png' : 'jpg'}`;
      a.href     = cv.toDataURL(isPng ? 'image/png' : 'image/jpeg', isPng ? undefined : 0.95);
      a.click();
      _toast(`✅ ${name}.${fmt} descargado`);
    })
    .catch(() => {
      saved.forEach(n => { n.style.removeProperty('background-color'); n.style.removeProperty('background'); });
      hide.forEach(b => b.style.visibility = 'visible');
    });
}

/* ══════════════════════════════════════════════════════════════════
   COPY TABLE  — formateada para PPT / Word / Excel
   ══════════════════════════════════════════════════════════════════ */
function copyTable(id) {
  const el  = document.getElementById(id);
  const tbl = el.querySelector('table');
  if (!tbl) return;

  let h = '<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px">';
  tbl.querySelectorAll('tr').forEach((row, ri) => {
    const isH = !!row.closest('thead');
    const isT = row.classList.contains('tot');
    const isP = row.classList.contains('prj');
    const bg  = isH ? '#3F3F3F' : isT ? '#002A6C' : ri % 2 === 1 ? '#F4F4F4' : '#E4E4E4';
    const fc  = (isH || isT) ? '#fff' : isP ? '#999' : '#1a1a1a';
    h += '<tr>';
    row.querySelectorAll('th, td').forEach((cell, ci) => {
      const tag = isH ? 'th' : 'td';
      h += `<${tag} style="background:${bg};color:${fc};font-weight:${ci===0||isH||isT?'bold':'normal'};text-align:${ci===0?'left':'right'};padding:7px 11px;border:1px solid rgba(0,0,0,.08);white-space:nowrap;font-style:${isP?'italic':'normal'}">${cell.innerHTML}</${tag}>`;
    });
    h += '</tr>';
  });
  h += '</table>';

  navigator.clipboard
    .write([new ClipboardItem({ 'text/html': new Blob([h], { type: 'text/html' }) })])
    .then(() => {
      const btn = el.querySelector('.cp');
      if (btn) {
        btn.classList.add('ok'); btn.textContent = '✅';
        setTimeout(() => { btn.classList.remove('ok'); btn.textContent = '📋'; }, 2000);
      }
      _toast('✅ Tabla copiada — pega con Ctrl+V en PPT, Word o Excel');
    })
    .catch(() => _toast('Selecciona la tabla y usa Ctrl+C'));
}

/* ══════════════════════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════════════════════ */
function _toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ══════════════════════════════════════════════════════════════════
   INIT — arranca al cargar el DOM
   ══════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  Chart.register(ChartDataLabels);
  showTab(0);
});
