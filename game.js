// ¡SUBE EL DÓLAR! — Platanus Hack 26 Arcade (Venezuela)
// Deslízate hasta la salida antes de que la gráfica del dólar te alcance. 1P o versus 2P.

const W = 800, H = 600, T = 32, COLS = 15, MW = COLS * T, SPD = 26, NEED = 3, TQV = 15, MAXV = 3, FINAL = 30;
const STORE = 'sube-el-dolar-usd';

// DO NOT replace existing keys — they match the physical arcade cabinet wiring.
// To add local testing shortcuts, append extra keys to any array.
const CABINET_KEYS = {
  P1_U: ['w'], P1_D: ['s'], P1_L: ['a'], P1_R: ['d'],
  P1_1: ['u'], P1_2: ['i'], P1_3: ['o'], P1_4: ['j'], P1_5: ['k'], P1_6: ['l'],
  P2_U: ['ArrowUp'], P2_D: ['ArrowDown'], P2_L: ['ArrowLeft'], P2_R: ['ArrowRight'],
  P2_1: ['r'], P2_2: ['t'], P2_3: ['y'], P2_4: ['f'], P2_5: ['g'], P2_6: ['h'],
  START1: ['Enter'], START2: ['2']
};
const norm = k => k === ' ' ? 'space' : String(k || '').toLowerCase();
const K2A = {};
for (const [code, keys] of Object.entries(CABINET_KEYS)) for (const k of keys) K2A[norm(k)] = code;

const DIRS = { U: [1, 0], D: [-1, 0], L: [0, -1], R: [0, 1] };
const REV = { U: 'D', D: 'U', L: 'R', R: 'L' };
// S = escudo, M = Yummy (imán), F = Cashea (congela el dólar)
// Solo en versus: H = captahuellas (congela al rival), K = cobrador turbo, Q = cola (controles al revés)
const PW = { S: 0x3df2ff, M: 0xff4060, F: 0xc77dff, H: 0xff9f1a, K: 0x1f4fd8, Q: 0xff7eb6 };
const PWN = { S: '¡ESCUDO!', M: '¡YUMMY!', F: '¡CASHEALO!', H: '¡CAPTAHUELLAS!', K: '¡TE MANDÉ AL COBRADOR!', Q: '¡A HACER COLA!' };
const PAL = { Y: 0xffe14d, y: 0xfff3a8, k: 0x6b4a1a, m: 0x8a2be2, w: 0xffffff, r: 0xff3b6b, b: 0x111111, g: 0x9aa0b5, B: 0x1f4fd8, R: 0xe0202a, A: 0xffd21a, s: 0xe0a47c, h: 0x3a2618, G: 0x7d828c, d: 0x2b2f3a, n: 0xb5481c, O: 0x556b2f, P: 0x6b4a2a, p: 0x9a7448, W: 0xe8f0ff, c: 0x6fc8ff, q: 0xdfe8f0, S: 0xd9b25a, K: 0x3b2a1a };
const PAL2 = { ...PAL, Y: 0x7bd23a, y: 0xc4f58a, k: 0x2f5a12, m: 0xff7a00 };
const PL = [
  '..........kk',
  '.........yYk',
  '........yYY.',
  '.......yYYY.',
  '......yYYYY.',
  '..yyyyYYYYY.',
  '.ymmmmmmmYY.',
  'yYmwbmwbmY..',
  'yYmmmmmmmY..',
  '.YYYYrrYYY..',
  '..YYYYYYY...',
  '...kYYYk....'
];
// el Cobrador: gorra tricolor con 7 estrellas
const CP = [
  '...BBBBRR...',
  '..BwBwBBRR..',
  '.BBBwBwBBRR.',
  'ABBBBBBBBBR.',
  'BBBBBBBBBBh.',
  '..hsssssssh.',
  '..sbbssbbss.',
  '..sssssssss.',
  '..ssbwwwwbs.',
  '...swwwwws..',
  '....sssss...',
  '..GGGGGGGG..',
  '.GGGGGGGGGG.',
  '.sGGGGGGGGs.'
];
const CL1 = ['..dd....dd..', '..dd....dd..', '.bbb....bbb.'];
const CL2 = ['....dddd....', '...dd..dd...', '..bbb..bbb..'];
// el helicóptero del final
const HELI = ['GGGGGGGGGGGGGGGG', '.......GG.......', '...BBBBBBBB.....', '..BwwwBBBBBBBBBB', '.BBwwwBBBBBBB.BB', '..BBBBBBBBB.....', '...b......b.....', '..bbbbbbbbbbb...'];
// zancudo y bachaquero
const B1 = ['gg....gg', '.gg..gg.', '..bbbb..', '.brbbrb.', '..bbbb..', '...b.b..'];
const B2 = ['........', 'gggggggg', '..bbbb..', '.brbbrb.', '..bbbb..', '..b..b..'];
const K1 = ['b......b', '.b....b.', '.nnnnnn.', 'nnwnnwnn', '.nnnnnn.', 'b.b..b.b'];
const K2 = ['.b....b.', 'b......b', '.nnnnnn.', 'nnwnnwnn', '.nnnnnn.', '.b.bb.b.'];
// jefes (cada 3 pisos): el Comandante expropia paredes (o), el Pelucas tapa pasillos con el mazo (c),
// el Conductor hace desvíos (oc), la Llorona crea caminos falsos y mueve la pista (llora) y el Silbón
// apaga todo con su silbido y pinta salidas falsas (silba). Se deterioran: normal → demacrado → robot
const JEFES = [
  ['EL COMANDANTE', '¡EXPRÓPIESE!', [
    '..a.........', '...RRRRRR...', '..RRRRRRRRR.', '.RRRRRRRRRRR', '..hsssssssh.', '..seesssees.', '..svvsssvvs.',
    '..sssssssss.', '..ssbbbbbss.', '...sssssss..', '..OOOOOOOO..', '.OOAOOOOAOO.', '.OOOOOOOOOO.', '.sOOOOOOOOs.'], 'o'],
  ['LA LLORONA', '¡AY, MIS HIJOS!', [
    '..a.........', '...hhhhhh...', '..hhhhhhhh..', '.hhqqqqqqhh.', '.hhqeeqeeqhh', '.hhqvvqvvqhh', '.hhqcqqqcqhh',
    '.hhqqbbqqhh.', '.hh.qqqq.hh.', '.hhWWWWWWhh.', '.hWWWWWWWWh.', '.WWWWWWWWWW.', 'WWWWWWWWWWWW', 'W.W.W.WW.W.W'], 'llora'],
  ['EL PELUCAS', '¡CON EL MAZO DANDO!', [
    '..a.........', '..PPPPPPPP..', '.PPPPPPPPPP.', 'PPPpPPPPpPPP', 'P.hsssssshPP', '..seessees..', '..svvssvvs..',
    '..ssssssss..', '..sbbbbbbs..', '..ssswwsss..', '...ssssss...', '.GGGGGGGGGG.', 'GGGGGGGGGGGG', 'sGGGGGGGGGGs'], 'c'],
  ['EL SILBÓN', '♪ FIIIUUU ♪', [
    '..a.........', '....SSSS....', '..SSSSSSSS..', 'SSSSSSSSSSSS', '...ssssss...', '...seesse...', '...svvssv...',
    '...ssbbss...', '....ssss....', '..KKKKKK.ww.', '.KKKKKKKwww.', '.KKKKKKKwww.', '..KK..KK.w..', '..KK..KK....'], 'silba'],
  ['EL CONDUCTOR', '¡DESVÍO!', [
    '..a.........', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hsssssssshh', '..ssssssss..', '..seessees..', '..svvssvvs..',
    '..ssssssss..', '.sbbbbbbbbs.', '..sbbbbbbs..', '...ssssss...', '.AAAAAAAAAA.', '.BBBBBBBBBB.', 'sRRRRRRRRRRs'], 'oc']
];
const ETAPAS = [
  [{ s: 0xc68a5e, h: 0x1a1a1a, e: 0x111111, v: 0xc68a5e, a: null }, ''],
  [{ s: 0x9fae86, h: 0xbdbdbd, e: 0x3a0f0f, v: 0x6f7a5a, a: null }, ' (DEMACRADO)'],
  [{ s: 0x8e96a8, h: 0x4a505c, e: 0xff2020, v: 0x5a6070, a: 0xff2020, b: 0x222631 }, ' (VERSIÓN ROBOT)']
];
// cada 5 pisos cambia el lugar: nombre, pared, juntas, borde superior, neón
const THEMES = [
  ['TORRE DE DAVID', 0x241d45, 0x1a1534, 0x3b3372, 0xffc21a],
  ['METRO DE CARACAS', 0x7a3409, 0x4f2105, 0xb5520f, 0xffffff],
  ['SABANA GRANDE', 0x5a1f2b, 0x3d121b, 0x7d3040, 0xff3df2],
  ['EL ÁVILA', 0x1f4a2a, 0x14331c, 0x2f6b3c, 0x9cff6a]
];
const EVN = { DEV: '¡DEVALUACIONES SORPRESA!', ZAN: '¡ZANCUDERA!' };
const STORY = 'EL DÓLAR NO PARA DE SUBIR.\n\nPLATANITO TIENE QUE SUBIR LOS 30 PISOS DE\nLA TORRE DE DAVID HASTA EL HELICÓPTERO\nANTES DE QUE LA DEVALUACIÓN LO ALCANCE...\n\n...Y ANTES DE QUE EL COBRADOR DE LA\nGORRA LE COBRE LO QUE LE DEBE.\n\nTUS BOLÍVARES PIERDEN VALOR CADA SEGUNDO.';
const STORY2 = 'DOS PLÁTANOS. UNA SOLA TORRE.\n\nEL PRIMERO EN LLEGAR A LA SALIDA\nGANA LA RONDA. GANA EL PRIMERO EN GANAR 3.\n\nAGARRA LOS PODERES NARANJA, AZUL Y ROSADO\nPARA SABOTEAR A TU PANA.';
const TIPS = ['¡DESLÍZATE HASTA LA SALIDA!', 'EL COBRADOR SIGUE TU RASTRO', 'TUS BOLÍVARES SE DEVALÚAN: ¡APÚRATE!', 'CASHEA CONGELA EL DÓLAR', 'YUMMY TE TRAE LOS TEQUEÑOS', 'CRUZA A LOS ZANCUDOS DE LADO', 'ENCADENA MOVIMIENTOS: ¡COMBO!'];
// tutorial: mapa hecho a mano (de arriba a abajo) y pistas según dónde estés parado
const TUT = [
  '###############', '####E....######', '###############', '###############', '####P..o.F..###', '###########.###',
  '###########.###', '###########.###', '###########.###', '##......o...###', '##.#####^######', '##.############',
  '##.############', '##.############', '##..o...#######', '#######.#######', '#######.#######', '#######.#######',
  '#######.#######', '#######.#######', '###############', '###############'];
const TSTEP = [
  [2, 7, '▲ MUEVE EL JOYSTICK HACIA ARRIBA\nTE DESLIZAS HASTA CHOCAR CON UNA PARED'],
  [7, 7, '¡ESO! AHORA ◀\nCOME EL TEQUEÑO: SON BOLÍVARES'],
  [7, 2, '▲ SIGUE SUBIENDO'],
  [12, 2, '¡OJO! LOS CABLES SE PRENDEN 1 SEGUNDO\nCUANDO PASAS: ¡NO TE DEVUELVAS! ▶'],
  [12, 11, '¡LA GRÁFICA DEL DÓLAR SUBE!\n▲ NO TE QUEDES QUIETO'],
  [17, 11, '◀ MORADO = CASHEA: CONGELA EL DÓLAR\nEL ANILLO DE COLORES ES UN PORTAL: ¡ENTRA!'],
  [20, 8, '¡EL PORTAL TE TELETRANSPORTÓ!\nEL ANILLO TENUE MARCA DONDE LLEGAS. ◀ ¡A LA SALIDA!']];
const TEND = '¡LISTO, CHAMO!\n\nEL COBRADOR DE LA GORRA SIGUE TU RASTRO\nTUS BOLÍVARES SE DEVALÚAN: ¡APÚRATE!\nCABLES: AL PASAR SE PRENDEN 1 S. BICHOS: UN ROCE AVISA\nCADA 15 TEQUEÑOS GANAS UNA VIDA\nCADA 3 PISOS VIENE UN JEFE GIGANTE\n\nPODERES: CELESTE ESCUDO · ROJO YUMMY\nMORADO CASHEA';
// música: [tónica, bajo (semitonos), melodía (semitonos)]; null = silencio
const _ = null;
const SONGS = [
  [55, [0, _, 0, 12, _, 0, 3, _, 0, _, 0, 12, 10, _, 7, 5], [12, _, 15, _, 19, _, 15, 12, 10, _, 12, _, 7, _, 10, _]],
  [61.7, [0, 0, _, 0, 7, _, 0, _, 0, 0, _, 0, 10, _, 7, _], [7, 10, 12, _, 12, 10, 7, _, 5, 7, _, 3, 5, _, 0, _]],
  [49, [0, _, 12, 0, _, 12, 0, _, 5, _, 17, 5, _, 17, 7, _], [12, _, 14, 15, _, 14, 12, _, 17, _, 15, 14, _, 12, 10, _]],
  [65.4, [0, _, 7, 0, _, 7, 5, _, 12, 5, _, 12, 7, _, 14, 7], [12, 16, 19, 16, 12, 16, 17, 21, 24, 21, 17, 21, 19, 23, 26, 23]],
  [55, [0, 0, 1, 0, 0, 1, 0, 6, 0, 0, 1, 0, 3, 2, 1, 0], [24, _, 23, _, 24, _, 18, _, 24, _, 23, _, 22, 21, 20, 19]]
];

const rnd = n => Math.floor(Math.random() * n);
const isWall = ch => ch === '#' || ch === '^';
const open = ch => !isWall(ch);
const money = v => v.toFixed(2).replace('.', ',');
const bsf = v => String(Math.floor(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ---------- Nivel procedural ----------
// G: celdas por fila (fila 0 abajo), LK: 1 = camino abierto, 2 = pared tope (no se puede romper)
// EV: evento del piso, VS: versus, BACH: hay bachaqueros, GATE: la salida pide tequeños
let G, LK, walker, FLOOR, bats, PORT, LVL, TRAV, NODES, DEG, SPK, EV = '', VS = false, BACH = false, GATE = false;

// pegado a un cable pelado: tocarlo, aunque sea de pasada, electrocuta
function zap(r, c) { for (const [dr, dc] of Object.values(DIRS)) if (cell(r + dr, c + dc) === '^') return [r + dr, c + dc]; return null; }
function cell(r, c) { return c < 0 || c >= COLS || r < 0 || !G[r] ? '#' : G[r][c]; }
function row(r) { while (G.length <= r) { G.push(Array(COLS).fill('#')); LK.push(Array(COLS).fill(0)); } }

// Abre un deslizamiento de n celdas y fija la pared donde se detiene: el camino siempre es jugable
function carve(r, c, d, n) {
  const [dr, dc] = DIRS[d], cells = [];
  for (let i = 1; i <= n; i++) {
    const rr = r + dr * i, cc = c + dc * i;
    if (cc < 1 || cc > COLS - 2 || rr < FLOOR) return null;
    row(rr);
    if (LK[rr][cc] === 2) return null;
    cells.push([rr, cc]);
  }
  const sr = r + dr * (n + 1), sc = c + dc * (n + 1);
  row(sr);
  const [lr, lc] = cells[n - 1];
  if (open(G[sr][sc]) || G[lr][lc] === 'P' || !cells.some(([rr, cc]) => G[rr][cc] === '#')) return null;
  for (const [rr, cc] of cells) { if (G[rr][cc] === '#') G[rr][cc] = '.'; LK[rr][cc] = 1; }
  LK[sr][sc] = 2;
  return cells;
}

function step() {
  const w = walker;
  for (let t = 0; t < 60; t++) {
    const x = Math.random();
    const d = x < .42 ? 'U' : x < .68 ? 'L' : x < .94 ? 'R' : 'D';
    if (w.last && DIRS[d][0] === -DIRS[w.last][0] && DIRS[d][1] === -DIRS[w.last][1]) continue;
    const n = d === 'U' ? 2 + rnd(5) : d === 'D' ? 1 + rnd(2) : 1 + rnd(6);
    const cells = carve(w.r, w.c, d, n);
    if (!cells) continue;
    [w.r, w.c] = cells[cells.length - 1];
    w.last = d; w.stuck = 0; w.h.push([w.r, w.c]);
    if (w.h.length > 40) w.h.shift();
    if (Math.random() < .07) G[w.r][w.c] = 'o';
    if (Math.random() < .4) branch(cells, d);
    if (w.r > w.max) { w.max = w.r; w.np = 0; FLOOR = Math.max(1, w.max - 7); }
    if (++w.np < 80) return;
  }
  w.last = '';
  // Atascado: retomar desde un punto anterior del camino; si sigue encerrado, portal hacia arriba
  if (++w.stuck < 4 && w.np < 80) {
    const ok = w.h.filter(p => p[0] >= FLOOR);
    if (ok.length) { [w.r, w.c] = ok[rnd(ok.length)]; return; }
  }
  const r2 = w.max + 4, c2 = 1 + rnd(COLS - 2);
  G[w.r][w.c] = 'P'; PORT[w.r + ',' + w.c] = [r2, c2];
  row(r2 + 1); G[r2][c2] = ' '; LK[r2][c2] = 1;
  w.r = w.max = r2; w.c = c2; w.h = [[r2, c2]]; w.stuck = w.np = 0; FLOOR = Math.max(1, r2 - 7);
}

// Ramas laterales con premios (en versus también aparecen los poderes de sabotaje)
function branch(cells, d) {
  const [r, c] = cells[rnd(cells.length)];
  const bd = d === 'U' || d === 'D' ? (Math.random() < .5 ? 'L' : 'R') : (Math.random() < .7 ? 'U' : 'D');
  const b = carve(r, c, bd, 1 + rnd(4));
  if (!b) return;
  const [er, ec] = b[b.length - 1], x = Math.random(), pw = VS ? 'SMFHKQHKQ' : 'SMF';
  if (x < (VS ? .3 : .15)) G[er][ec] = pw[rnd(pw.length)];
  else if (x < .6) G[er][ec] = 'o';
}

// Cables pelados y zancudos (la zancudera duplica la plaga)
function decorate(r) {
  const p = Math.min(.1, .015 + LVL * .009), z = EV === 'ZAN';
  for (let c = 0; c < COLS; c++) {
    if (r < 6 || G[r][c] !== '#' || LK[r][c] === 2 || Object.values(PORT).some(([a, b]) => Math.abs(a - r) + Math.abs(b - c) < 2)) continue;
    if ((open(cell(r + 1, c)) || open(cell(r - 1, c)) || open(cell(r, c - 1)) || open(cell(r, c + 1))) && Math.random() < p) SPK.push([r, c]);
  }
  // zancudos y bachaqueros usan la dificultad de 2 pisos menos
  const e = Math.max(0, LVL - 2);
  if (r > 8 && Math.random() < Math.min(.6, (.2 + e * .04) * (z ? 1.5 : 1))) {
    const runs = [];
    for (let c = 1, s = -1; c < COLS; c++) {
      if (open(G[r][c]) && s < 0) s = c;
      else if (!open(G[r][c]) && s >= 0) { if (c - s >= 3) runs.push([s, c - 1]); s = -1; }
    }
    if (runs.length) { const [a, b] = runs[rnd(runs.length)]; bats.push({ r, a, b, x: a + rnd(b - a), v: (Math.random() < .5 ? -1 : 1) * Math.min(4, 1.5 + e * .2) * (z ? 1.3 : 1) }); }
  }
}

// Bachaqueros: patrullan de arriba a abajo en los pasillos verticales
function bachacos() {
  if (!BACH) return;
  for (let c = 1; c < COLS - 1; c++) for (let r = 6, s = -1; r <= walker.max + 1; r++) {
    if (open(cell(r, c)) && s < 0) s = r;
    else if (!open(cell(r, c)) && s >= 0) {
      if (r - s >= 4 && Math.random() < .2) bats.push({ vt: 1, c, a: s, b: r - 1, x: s + rnd(r - s), v: (Math.random() < .5 ? -1 : 1) * Math.min(3.5, 1.3 + Math.max(0, LVL - 2) * .15) });
      s = -1;
    }
  }
}

// Celdas por las que físicamente se puede pasar o parar desde estas posiciones
function phys(froms) {
  const q = [...froms], seen = new Set(q), cells = new Set(q);
  for (let i = 0; i < q.length; i++) {
    const [r, c] = q[i].split(',').map(Number);
    if (G[r][c] === 'E') continue;
    for (const d in DIRS) {
      const [dr, dc] = DIRS[d];
      let rr = r, cc = c;
      while (open(cell(rr + dr, cc + dc))) { rr += dr; cc += dc; cells.add(rr + ',' + cc); }
      if (rr === r && cc === c) continue;
      const pt = G[rr][cc] === 'P' && PORT[rr + ',' + cc];
      if (pt) { [rr, cc] = pt; cells.add(rr + ',' + cc); }
      const k = rr + ',' + cc;
      if (!seen.has(k)) { seen.add(k); q.push(k); }
    }
  }
  return cells;
}
// Todo pasillo al que no se puede entrar se vuelve pared (no cambia ningún deslizamiento)
function prune(froms) {
  const ok = phys(froms);
  for (let r = 0; r < G.length; r++) for (let c = 0; c < COLS; c++) if (open(G[r][c]) && !ok.has(r + ',' + c)) G[r][c] = '#';
}

// Celdas patrulladas: h = zancudos (horizontal), v = bachaqueros (vertical)
function batCells() {
  const h = new Set(), v = new Set();
  for (const z of bats) for (let i = z.a; i <= z.b; i++) z.vt ? v.add(i + ',' + z.c) : h.add(z.r + ',' + i);
  return { h, v };
}

// ¿Se puede llegar a la salida desde el inicio (BFS sobre deslizamientos)
// y desde cualquier punto alcanzable se puede volver a la salida (sin callejones sin salida)?
// Con bz: además sin detenerse en un pasillo patrullado ni recorrerlo a lo largo (cruzarlo sí vale).
// TRAV guarda las celdas por las que pasa algún movimiento válido.
function solvable(bz, from = '2,7') {
  const q = [from], back = { [from]: [] };
  let ex = null;
  TRAV = new Set(); NODES = q; DEG = {};
  for (let i = 0; i < q.length; i++) {
    const [r, c] = q[i].split(',').map(Number);
    if (G[r][c] === 'E') { ex = q[i]; continue; }
    for (const d in DIRS) {
      const [dr, dc] = DIRS[d], tr = [];
      let rr = r, cc = c, bad = false;
      while (open(cell(rr + dr, cc + dc))) {
        rr += dr; cc += dc; tr.push(rr + ',' + cc);
        if (bz && (dc ? bz.h : bz.v).has(rr + ',' + cc)) bad = true;
      }
      const k0 = rr + ',' + cc;
      if (bad || zap(rr, cc) || (bz && (bz.h.has(k0) || bz.v.has(k0))) || (rr === r && cc === c)) continue;
      tr.forEach(x => TRAV.add(x));
      const pt = G[rr][cc] === 'P' && PORT[k0];
      if (pt) { [rr, cc] = pt; if (bz && (zap(rr, cc) || bz.h.has(rr + ',' + cc) || bz.v.has(rr + ',' + cc))) continue; }
      DEG[q[i]] = (DEG[q[i]] || 0) + 1;
      const k = rr + ',' + cc;
      if (!back[k]) { back[k] = []; q.push(k); }
      back[k].push(q[i]);
    }
  }
  if (!ex) return false;
  const ok = new Set([ex]), s = [ex];
  while (s.length) for (const p of back[s.pop()]) if (!ok.has(p)) { ok.add(p); s.push(p); }
  return ok.size === q.length;
}

// Tequeños repartidos (uno cada ~7 filas) donde valen la pena: callejones con una sola salida
// (premio por desviarte) y celdas junto a cables (premio por arriesgarte). Siempre en la ruta segura.
function placeTeq() {
  for (const rw of G) for (let c = 0; c < COLS; c++) if (rw[c] === 'o') rw[c] = '.';
  solvable(batCells());
  const sc = new Map();
  for (const k of TRAV) sc.set(k, zap(...k.split(',').map(Number)) ? 2 : 0);
  for (const k of NODES) if (DEG[k] <= 1) sc.set(k, 3);
  const cand = [...sc].map(([k, v]) => [...k.split(',').map(Number), v + Math.random()]).filter(([r, c]) => r > 4 && G[r][c] === '.');
  for (let b = 5; b < walker.max; b += 7) {
    const band = cand.filter(([r]) => r >= b && r < b + 7);
    if (band.length) { const [r, c] = band.sort((x, y) => y[2] - x[2])[0]; G[r][c] = 'o'; }
  }
  // el portero necesita sus tequeños sí o sí
  let n = cand.filter(([r, c]) => G[r][c] === 'o').length;
  for (const [r, c] of cand.sort(() => Math.random() - .5)) { if (n >= NEED) break; if (G[r][c] === '.') { G[r][c] = 'o'; n++; } }
}

function newWorld(lvl, h) {
  do {
    G = []; LK = []; bats = []; SPK = []; PORT = {}; FLOOR = 1; LVL = lvl;
    walker = { r: 2, c: 7, max: 2, last: '', h: [[2, 7]], stuck: 0, np: 0 };
    row(3); G[2][7] = ' '; LK[2][7] = 1;
    while (walker.max < h) step();
    G[walker.r][walker.c] = 'E';
    row(walker.max + 2);
    for (let r = 0; r < walker.max; r++) decorate(r);
    bachacos();
  } while (!solvable());
  prune(['2,7']);
  // los cables pelados se ponen de a grupos y solo se quedan si sigue habiendo ruta segura
  for (let i = SPK.length - 1; i > 0; i--) { const j = rnd(i + 1); [SPK[i], SPK[j]] = [SPK[j], SPK[i]]; }
  // nunca dos cables juntos, ni de lado ni en diagonal (esquinas)
  const free = (r, c) => ![-1, 0, 1].some(a => [-1, 0, 1].some(b => cell(r + a, c + b) === '^'));
  for (let i = 0; i < SPK.length; i += 6) {
    const grp = [];
    for (const [r, c] of SPK.slice(i, i + 6)) if (free(r, c)) { G[r][c] = '^'; grp.push([r, c]); }
    if (!solvable()) {
      grp.forEach(([r, c]) => G[r][c] = '#');
      for (const [r, c] of grp) if (free(r, c)) { G[r][c] = '^'; if (!solvable()) G[r][c] = '#'; }
    }
  }
  // los enemigos nunca pueden tapar el camino: solo se quedan los que dejan una ruta segura
  const cand = bats;
  bats = [];
  // ni dentro de pasillos rellenados, ni a menos de 4 filas de otro enemigo
  const span = z => z.vt ? [z.a, z.b] : [z.r, z.r];
  for (const z of cand) {
    const [lo, hi] = span(z);
    if ([...Array(z.b - z.a + 1)].some((_, i) => z.vt ? !open(cell(z.a + i, z.c)) : !open(cell(z.r, z.a + i)))) continue;
    if (bats.some(o => { const [a, b] = span(o); return lo <= b + 4 && a <= hi + 4; })) continue;
    bats.push(z); if (!solvable(batCells())) bats.pop();
  }
  placeTeq();
  return walker.max;
}

// ---------- Audio (WebAudio, sin assets) ----------
let AC, NB, OUT;
function ac() {
  if (!AC) {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      OUT = AC.createDynamicsCompressor(); OUT.connect(AC.destination);
      NB = AC.createBuffer(1, AC.sampleRate * .5, AC.sampleRate);
      const d = NB.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { }
  }
  if (AC && AC.state === 'suspended') AC.resume();
}
function tone(f, d, type = 'square', v = .08, f2 = 0, t0 = 0) {
  if (!AC) return;
  const t = AC.currentTime + t0, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(g).connect(OUT); o.start(t); o.stop(t + d + .02);
}
function noise(d, v = .1, t0 = 0) {
  if (!AC) return;
  const t = AC.currentTime + t0, s = AC.createBufferSource(), g = AC.createGain();
  s.buffer = NB; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
  s.connect(g).connect(OUT); s.start(t); s.stop(t + d);
}

// ---------- Récords en dólares, en centavos (almacenamiento del gabinete, con respaldo local) ----------
function store() {
  if (window.platanusArcadeStorage) return window.platanusArcadeStorage;
  return {
    async get(k) { try { const v = localStorage.getItem(k); return v === null ? { found: false } : { found: true, value: JSON.parse(v) }; } catch (e) { return { found: false }; } },
    async set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
}
async function loadHS() {
  try {
    const r = await store().get(STORE);
    return r.found && Array.isArray(r.value) ? r.value.filter(h => h && typeof h.n === 'string' && typeof h.s === 'number').slice(0, 5) : [];
  } catch (e) { return []; }
}
function saveHS(h) { try { Promise.resolve(store().set(STORE, h)).catch(() => { }); } catch (e) { } }

function tex(s, key, rows, sc, pal = PAL) {
  const g = s.make.graphics({}, false);
  rows.forEach((rw, y) => [...rw].forEach((ch, x) => { if (pal[ch] != null) { g.fillStyle(pal[ch]); g.fillRect(x * sc, y * sc, sc, sc); } }));
  g.generateTexture(key, rows[0].length * sc, rows.length * sc); g.destroy();
}

// ---------- Fondo: Caracas de noche en pixel art ----------
const ridge = x => 70 + Math.sin(x * .006) * 30 + Math.sin(x * .023) * 10 + Math.abs(x - 470) * .13;
function bld(g, x, y, w, h, col) {
  g.fillStyle(col).fillRect(x, y, w, h);
  for (let yy = y + 6; yy < y + h - 6; yy += 8) for (let xx = x + 4; xx < x + w - 4; xx += 7)
    if (Math.random() < .35) g.fillStyle(Math.random() < .8 ? 0xffd27a : 0x9fe8ff, .9).fillRect(xx, yy, 3, 4);
}
function caracas(s) {
  const mk = (k, w, h, fn) => { const g = s.make.graphics({}, false); fn(g); g.generateTexture(k, w, h); g.destroy(); };
  // cielo nocturno con el resplandor naranja de la ciudad
  mk('sky', W, H, g => {
    const cs = [[11, 6, 38], [58, 22, 80], [255, 122, 61]];
    for (let y = 0; y < H; y += 6) {
      const t = y / H, i = t < .6 ? 0 : 1, k = i ? (t - .6) / .4 : t / .6, a = cs[i], b = cs[i + 1];
      g.fillStyle(Phaser.Display.Color.GetColor(...a.map((v, j) => Math.round(v + (b[j] - v) * k)))).fillRect(0, y, W, 6);
    }
    for (let i = 0; i < 90; i++) g.fillStyle(0xffffff, .2 + Math.random() * .8).fillRect(rnd(W), rnd(300), 2, 2);
    g.fillStyle(0xfff3c4).fillCircle(722, 86, 28);
    g.fillStyle(0xe8d9a0).fillCircle(712, 78, 6).fillCircle(734, 98, 4).fillCircle(730, 72, 3);
  });
  // El Ávila con el Hotel Humboldt y el teleférico
  mk('avila', W, 300, g => {
    const pts = [{ x: 0, y: 300 }];
    for (let x = 0; x <= W; x += 10) pts.push({ x, y: ridge(x) });
    pts.push({ x: W, y: 300 });
    g.fillStyle(0x1b2a48).fillPoints(pts, true);
    g.lineStyle(2, 0x2f4a70).strokePoints(pts.slice(1, -1));
    const hy = ridge(470);
    g.fillStyle(0x34466e).fillRect(462, hy - 50, 16, 52);
    g.fillStyle(0x34466e).fillRect(458, hy - 54, 24, 6);
    for (let j = 0; j < 6; j++) g.fillStyle(0xffe9a0).fillRect(465, hy - 44 + j * 7, 3, 3).fillRect(472, hy - 44 + j * 7, 3, 3);
    g.lineStyle(1, 0x9aa8c8, .7).lineBetween(40, 290, 455, hy - 4);
    for (let j = 1; j < 5; j++) { const t = j / 5; g.fillStyle(0xff4060).fillRect(40 + 415 * t - 3, 290 + (hy - 294) * t, 6, 5); }
  });
  // la ciudad: Parque Central y la Torre de David
  mk('city', W, 300, g => {
    for (let x = 0; x < W;) { const w = 22 + rnd(30), h = 50 + rnd(120); bld(g, x, 300 - h, w, h, [0x221a3f, 0x2a2050, 0x1d1736][rnd(3)]); x += w + rnd(4); }
    for (const x of [240, 292]) { bld(g, x, 40, 36, 260, 0x2b2a55); g.fillStyle(0x3d3b75).fillRect(x, 36, 36, 6); g.lineStyle(2, 0xff4060).lineBetween(x + 18, 36, x + 18, 14); }
    bld(g, 540, 60, 48, 240, 0x3a2f4f);
    g.lineStyle(3, 0xffc21a).lineBetween(560, 60, 560, 14).lineBetween(536, 18, 610, 18).lineBetween(604, 18, 604, 34);
  });
  // los barrios en los cerros, con sus ranchitos de colores
  mk('barrio', W, 220, g => {
    for (const [cx, rw] of [[80, 210], [730, 230]]) {
      g.fillStyle(0x140f24).fillEllipse(cx, 220, rw * 2, 280);
      for (let i = 0; i < 80; i++) {
        const x = cx + (Math.random() * 2 - 1) * rw * .9, top = 220 - Math.sqrt(Math.max(0, 1 - ((x - cx) / rw) ** 2)) * 135;
        const y = top + 4 + Math.random() * (210 - top);
        g.fillStyle([0xc0392b, 0xe67e22, 0xf1c40f, 0x2980b9, 0x8e44ad, 0x27ae60, 0xff7eb6][rnd(7)], .6).fillRect(x, y, 10, 7);
        if (Math.random() < .5) g.fillStyle(0xffe08a).fillRect(x + 4, y + 2, 2, 2);
      }
    }
  });
}

// ---------- Escena ----------
class Game extends Phaser.Scene {
  constructor() { super('g'); }

  create() {
    tex(this, 'p0', PL, 2); tex(this, 'p1', PL, 2, PAL2);
    tex(this, 'b1', B1, 4); tex(this, 'b2', B2, 4);
    tex(this, 'k1', K1, 4); tex(this, 'k2', K2, 4); tex(this, 'heli', HELI, 4);
    tex(this, 'c1', CP.concat(CL1), 2); tex(this, 'c2', CP.concat(CL2), 2);
    JEFES.forEach((j, i) => ETAPAS.forEach(([pal], e) => tex(this, 'j' + i + e, j[2], 2, { ...PAL, ...pal })));
    caracas(this);
    // cámara de fondo (Caracas) + dos cámaras de mundo (pantalla dividida en versus) + cámara de HUD encima
    const c0 = this.cameras.main, c1 = this.cameras.add(0, 0, W, H).setVisible(false);
    this.hc = this.cameras.add(0, 0, W, H);
    this.bc = this.cameras.add(0, 0, W, H);
    const cl = this.cameras.cameras;
    cl.unshift(cl.splice(cl.indexOf(this.bc), 1)[0]);
    this.cams = [c0, c1];
    this.bg = ['sky', 'avila', 'city', 'barrio'].map(k => this.bo(this.add.image(0, 0, k).setOrigin(0)));
    this.g = this.wo(this.add.graphics());
    this.spr = [0, 1].map(i => this.wo(this.add.image(0, 0, 'p' + i).setDepth(2).setVisible(false)));
    this.cps = [0, 1].map(() => this.wo(this.add.image(0, 0, 'c1').setDepth(2).setVisible(false)));
    this.cpt = [0, 1].map(() => this.wo(this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '13px', color: '#111', fontStyle: 'bold', backgroundColor: '#ffffff', padding: { x: 4, y: 2 } }).setOrigin(.5, 1).setDepth(4)));
    this.fx = this.wo(this.add.graphics().setDepth(3));
    this.fog = [0, 1].map(i => { const o = this.wo(this.add.graphics().setDepth(4.5)); this.cams[1 - i].ignore(o); return o; });
    this.jsp = this.wo(this.add.image(0, 0, 'j00').setScale(3).setDepth(5).setVisible(false));
    this.jsay = this.wo(this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '15px', color: '#111', fontStyle: 'bold', backgroundColor: '#ffe14d', padding: { x: 5, y: 3 } }).setOrigin(.5, 1).setDepth(6).setVisible(false));
    this.pt = this.wo(this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '16px', color: '#39ff6a', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 }).setOrigin(1, 1).setDepth(4));
    this.pop = this.wo(this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 }).setOrigin(.5).setDepth(4));
    this.bp = [];
    this.hg = this.ho(this.add.graphics());
    const sl = this.ho(this.add.graphics().setDepth(9));
    sl.fillStyle(0x000000, .18);
    for (let y = 0; y < H; y += 3) sl.fillRect(0, y, W, 1);
    const tx = (x, y, sz, col, al = 0) => this.ho(this.add.text(x, y, '', { fontFamily: 'monospace', fontSize: sz, color: col, fontStyle: 'bold', stroke: '#000', strokeThickness: 5, align: al ? 'center' : 'left', lineSpacing: 4 }).setOrigin(al, 0).setDepth(8));
    this.tL = tx(18, 24, '18px', '#ffe14d');
    this.tR = tx(W - 150, 24, '18px', '#39ff6a');
    this.tP = tx(W / 2, 572, '16px', '#39ff6a', .5);
    this.tT = tx(W / 2, 70, '52px', '#39ff6a', .5);
    this.tM = tx(W / 2, 230, '20px', '#ffffff', .5);
    this.tB = tx(W / 2, 470, '22px', '#ffe14d', .5);
    this.tp = this.ho(this.add.image(0, 0, 'p0').setScale(2).setDepth(8));
    this.hel = this.wo(this.add.image(0, 0, 'heli').setDepth(4).setVisible(false));
    this.tc = this.ho(this.add.image(0, 0, 'c1').setScale(2).setDepth(8).setFlipX(true));
    this.parts = []; this.hs = []; this.ps = []; this.th = THEMES[0];
    loadHS().then(h => { this.hs = h; if (this.st === 'title') this.title(); });
    const kd = e => {
      const c = K2A[norm(e.key)];
      if (!c) return;
      if (e.preventDefault) e.preventDefault();
      this.key(c, e.repeat);
    };
    window.addEventListener('keydown', kd);
    this.events.once('shutdown', () => window.removeEventListener('keydown', kd));
    this.title(); this.ask();
  }

  // objetos del mundo (cámaras de juego), del HUD (cámara de HUD) y del fondo (cámara de fondo)
  wo(o) { this.hc.ignore(o); this.bc.ignore(o); return o; }
  ho(o) { this.cams.forEach(c => c.ignore(o)); this.bc.ignore(o); return o; }
  bo(o) { this.cams.forEach(c => c.ignore(o)); this.hc.ignore(o); return o; }

  // parallax: mientras más subes, más se hunde la ciudad
  sky(h) {
    const [, a, c, b] = this.bg;
    a.y = 250 + Math.min(160, h * 1.5); c.y = 300 + Math.min(280, h * 3); b.y = 380 + Math.min(240, h * 5);
  }

  layout(m) {
    const [c0, c1] = this.cams;
    if (m === 2) {
      c0.setViewport(0, 0, 398, H).setZoom(.75);
      c1.setViewport(402, 0, 398, H).setZoom(.75).setVisible(true);
      this.tL.setPosition(12, 10).setFontSize(16); this.tR.setPosition(414, 10).setFontSize(16).setColor('#7bd23a');
    } else {
      c0.setViewport(0, 0, W, H).setZoom(1); c1.setVisible(false);
      this.tL.setPosition(18, 24).setFontSize(18); this.tR.setPosition(W - 150, 24).setFontSize(18).setColor('#39ff6a');
    }
  }

  // ----- estados -----
  title() {
    this.st = 'title'; this.mode = 1; this.layout(1); this.th = THEMES[0]; this.boss = false; this.tut = 0;
    EV = ''; VS = BACH = GATE = false;
    this.top = newWorld(3, 60); this.L = -99; this.ty = 0; this.parts = []; this.ps = []; this.ev = '';
    this.spr.forEach(s => s.setVisible(false)); this.cps.forEach(s => s.setVisible(false)); this.cpt.forEach(s => s.setText(''));
    this.tp.setVisible(true); this.tc.setVisible(true);
    this.tL.setText(''); this.tR.setText(''); this.tP.setText(''); this.pt.setText(''); this.pop.setText('');
    this.tT.setText('¡SUBE EL\nDÓLAR!').setY(50).setAlpha(1);
    let m = 'PLATANITO VS. LA DEVALUACIÓN\nSUBE LOS 30 PISOS DE LA TORRE DE DAVID\nY ESCAPA EN HELICÓPTERO\n\n— RÉCORDS EN DÓLARES —\n';
    this.hs.forEach((h, i) => m += `${i + 1}. ${h.n}  $${money(h.s / 100).padStart(8, ' ')}\n`);
    if (!this.hs.length) m += 'SIN RÉCORDS AÚN\n';
    this.tM.setText(m).setY(200);
    this.tB.setText('START 1 = 1 JUGADOR\nSTART 2 = VERSUS 2P').setY(470);
  }

  // al cargar la página: ¿primera vez jugando? (si nadie responde, sigue al título)
  ask() {
    this.st = 'ask'; this.aq = 0; this.dt = 15;
    this.tM.setText('').setY(200); this.drawAsk();
  }

  drawAsk() {
    this.tT.setText('¡SUBE EL\nDÓLAR!').setY(50).setAlpha(1);
    this.tM.setText('\n\n¿PRIMERA VEZ JUGANDO?\n\n' + (this.aq ? '  SÍ     [ NO ]' : '[ SÍ ]     NO  ') + '\n\n◀ ▶ ELIGE    BOTÓN OK').setY(200);
    this.tB.setText('');
  }

  tutorial() {
    this.tut = 1; this.mode = 1; this.layout(1);
    this.usd = 0; this.wins = [0, 0]; this.lvl = 1; this.tq = 0; this.nt = 0; this.mi = 0;
    this.tp.setVisible(false); this.tc.setVisible(false);
    this.level(false);
  }

  // pistas del tutorial según dónde aterrizas
  tutor() {
    const p = this.ps[0];
    if (!p || p.mv) return;
    const k = TSTEP.findIndex(([r, c]) => r === p.r && c === p.c);
    if (k < 0 || k === this.tstep) return;
    this.tstep = k;
    this.tB.setText(TSTEP[k][2]).setY(430).setAlpha(1);
    if (k >= 4 && !this.tutOn) { this.tutOn = true; this.L = p.fr - 9; }
    tone(880, .08, 'square', .05); tone(1320, .1, 'square', .05, 0, .08);
  }

  start(m) {
    this.tut = 0;
    this.mode = m; this.layout(m);
    this.usd = 0; this.wins = [0, 0]; this.lives = MAXV; this.tq = 0; this.lvl = 0; this.nt = 0; this.mi = 0;
    this.tp.setVisible(false); this.tc.setVisible(false);
    // la historia, letra por letra (cualquier botón la salta)
    this.st = 'story'; this.sn = 0; this.dt = 11;
    this.tT.setText(m === 2 ? 'VERSUS' : 'CARACAS, 2026').setY(60).setAlpha(1);
    this.tB.setText('');
    tone(220, .3, 'triangle', .06, 440);
  }

  level(next) {
    if (next) this.lvl++;
    const l = this.lvl, vs = this.mode === 2, tut = this.tut;
    // jefe cada 3 pisos, se turnan y se deterioran con cada vuelta
    const n = l / 3;
    this.boss = !tut && l % 3 === 0;
    // curva de dificultad: eventos desde el piso 4 (nunca junto a un jefe), bachaqueros y portero desde el 5
    this.ev = !tut && l >= 4 && !this.boss ? ['DEV', 'ZAN'][rnd(2)] : '';
    EV = this.ev; VS = vs; BACH = !tut && l >= (vs ? 6 : 7); GATE = !tut && !vs && l >= 5;
    this.gate = GATE;
    this.ji = this.boss ? (n - 1) % JEFES.length : -1; this.je = this.boss ? (n <= 2 ? 0 : n <= 5 ? 1 : 2) : 0;
    this.jt = 4; this.jw = null; this.ilu = null; this.jx = MW / 2; this.jy = -12 * T; this.jsayT = 0;
    this.jsp.setVisible(this.boss); if (this.boss) this.jsp.setTexture('j' + this.ji + this.je);
    this.th = THEMES[Math.floor((l - 1) / 5) % THEMES.length];
    if (tut) {
      G = TUT.slice().reverse().map(r => [...r]); LK = []; bats = []; PORT = { '17,4': [20, 8] };
      this.top = G.length - 2; this.lives = MAXV; this.tutOn = false; this.tstep = -1;
    } else this.top = newWorld(l, vs ? 28 + l * 8 : 30 + l * 12);
    this.L = tut ? -40 : -6; this.ca = {};
    G.forEach((rw, r) => rw.forEach((ch, c) => { if (ch === 'E') this.hx = [(c + .5) * T, -(r + 1.6) * T]; })); this.frz = 0; this.parts = []; this.bs = [0, 0];
    this.evT = 8; this.warn = false;
    this.ps = [];
    for (let i = 0; i < this.mode; i++) {
      const path = [];
      for (let r = -12; r <= 2; r++) path.push([r, 7]);
      this.ps.push({
        i, r: 2, c: 7, fr: 2, fc: 7, mv: null, t: 0, buf: null, chain: 0, landT: 0, sh: 0, mag: 0, inv: 2, sq: 0, dir: 'R', prev: [2, 7],
        teq: 0, fz: 0, rev: 0, zt: 0, zc: 0, zs: new Set(), inB: false, bc: 0, alive: true, trail: [], path, ch: { i: 0, d: tut ? 1e9 : .5, r: -12, c: 7, near: false, boost: 0 }, cy: -2.5 * T, cam: this.cams[i]
      });
      this.spr[i].setVisible(true).setAlpha(1); this.cps[i].setVisible(true);
    }
    this.st = 'play';
    this.tT.setText(tut ? 'TUTORIAL' : vs ? `RONDA ${l}` : l === FINAL ? '¡LA AZOTEA!' : `PISO ${l}/${FINAL}`).setY(120).setAlpha(1);
    this.tM.setText([l === FINAL && !vs ? 'EL HELICÓPTERO TE ESPERA ARRIBA' : this.th[0], this.boss ? `¡JEFE: ${JEFES[this.ji][0]}${ETAPAS[this.je][1]}!` : '', EVN[this.ev] || '', this.gate ? `EL PORTERO QUIERE ${NEED} TEQUEÑOS` : tut ? '' : TIPS[(l - 1) % TIPS.length]].filter(x => x).join('\n')).setY(190);
    this.tB.setText('');
    this.msg = 2.6;
    tone(440, .1, 'square', .06); tone(660, .1, 'square', .06, 0, .1); tone(880, .2, 'square', .06, 0, .2);
  }

  die(p) {
    if (!p.alive || this.st !== 'play') return;
    p.alive = false;
    this.spr[p.i].setVisible(false);
    this.burst(p.fr + .5, p.fc + .5, 40, [0xffe14d, 0xff3b6b, 0xffffff], 9);
    p.cam.shake(350, .02); p.cam.flash(150, 255, 60, 60);
    tone(400, .6, 'sawtooth', .12, 40); noise(.5, .2);
    if (this.mode === 1) {
      this.st = 'dead'; this.dt = 1.6; if (!this.tut) this.lives--;
      this.tT.setText('¡SE TE DEVALUÓ TODO!').setY(140).setAlpha(1);
      this.tM.setText(`PERDISTE Bs.${bsf(this.bs[0])}`).setY(210);
    } else if (!this.ps.some(q => q.alive)) this.endRound(-1);
  }

  // llegó a la salida: los bolívares se cambian a dólares a la tasa del momento
  exit(p) {
    this.burst(p.fr + .5, p.fc + .5, 50, [0x5dff7a, 0xffe14d, 0xffffff], 10);
    [523, 659, 784, 1046].forEach((f, i) => tone(f, .15, 'square', .07, 0, i * .1));
    if (this.mode === 2) return this.endRound(p.i);
    if (this.lvl === FINAL) {
      // ¡el final! Platanito se va en helicóptero con sus dólares
      const pr = this.price(), got = this.bs[0] / pr;
      this.usd += got + 1000; this.st = 'win'; this.dt = 9; this.hud();
      this.cams[0].stopFollow && this.cams[0].stopFollow();
      this.tT.setText('¡ESCAPASTE DE\nLA INFLACIÓN!').setY(70).setAlpha(1);
      this.tM.setText(`PLATANITO SE MONTÓ EN EL HELICÓPTERO\nY SE FUE A OTRO PAÍS CON SUS DÓLARES\n\n+$1000 DE PREMIO\nTOTAL $${money(this.usd)}`).setY(200);
      [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, .2, 'square', .08, 0, i * .14));
      return;
    }
    if (this.tut) {
      this.st = 'tutend'; this.tut = 0;
      this.tT.setText('').setAlpha(1); this.tM.setText(TEND).setY(110); this.tB.setText('BOTÓN PARA JUGAR').setY(500);
      return;
    }
    this.st = 'clear'; this.dt = 3;
    const pr = this.price(), got = this.bs[0] / pr, tip = this.lvl * (this.boss ? 3 : 1);
    this.usd += got + tip; this.hud();
    this.tT.setText(`¡PISO ${this.lvl + 1}!`).setY(120).setAlpha(1);
    this.tM.setText(`JUNTASTE Bs.${bsf(this.bs[0])}\nAL CAMBIO DE Bs.${money(pr)}\n\n= $${money(got)}  +$${tip} DE PROPINA\n\nTOTAL $${money(this.usd)}`).setY(190);
  }

  endRound(w) {
    this.st = 'round'; this.dt = 3;
    if (w >= 0) this.wins[w]++;
    const done = w >= 0 && this.wins[w] >= 3;
    this.tT.setText(w < 0 ? '¡NADIE ESCAPÓ!' : done ? `¡P${w + 1} CAMPEÓN!` : `¡GANA P${w + 1}!`).setY(140).setAlpha(1);
    this.tM.setText(`P1  ${this.wins[0]}  -  ${this.wins[1]}  P2`).setY(230);
    this.hud();
    if (done) { this.st = 'match'; this.dt = 6; this.tB.setText('START PARA SALIR').setY(470); }
  }

  over() {
    [523, 440, 349, 262].forEach((f, i) => tone(f, .25, 'square', .07, 0, i * .22));
    this.spr.forEach(s => s.setVisible(false).setAngle(0)); this.cps.forEach(s => s.setVisible(false)); this.cpt.forEach(s => s.setText('')); this.hel.setVisible(false);
    const h = this.hs, s = Math.round(this.usd * 100);
    if (s > 0 && (h.length < 5 || s > h[h.length - 1].s)) {
      this.st = 'entry'; this.ini = [0, 0, 0]; this.ip = 0; this.drawEntry();
    } else this.showOver();
  }

  showOver() {
    this.spr.forEach(s => s.setVisible(false)); this.cps.forEach(s => s.setVisible(false));
    this.st = 'over'; this.ot = 1; this.oa = 10;
    this.tT.setText(this.lvl >= FINAL ? '¡VENCISTE LA\nINFLACIÓN!' : '¡TE DEVALUASTE!').setY(this.lvl >= FINAL ? 90 : 140).setAlpha(1);
    this.tM.setText(`LLEGASTE AL PISO ${this.lvl}\n\nTOTAL      $${money(this.usd)}\nTASA FINAL Bs.${money(this.price())}`).setY(240);
    this.tB.setText('START PARA CONTINUAR').setY(470);
  }

  drawEntry() {
    const s = this.ini.map((v, i) => i === this.ip ? `[${String.fromCharCode(65 + v)}]` : ` ${String.fromCharCode(65 + v)} `).join('');
    this.tT.setText('¡NUEVO RÉCORD!').setY(140).setAlpha(1);
    this.tM.setText(`TOTAL  $${money(this.usd)}\n\nTUS INICIALES\n\n${s}\n\n▲▼ LETRA   BOTÓN OK`).setY(230);
    this.tB.setText('');
  }

  key(code, rep) {
    ac();
    const pi = code[1] === '2' ? 1 : 0, k = code.startsWith('START') ? 'S' : code[3] && 'UDLR'.includes(code[3]) ? code[3] : 'A';
    const st = this.st;
    if (st === 'play') {
      const p = this.ps[pi];
      if (p && p.alive && p.fz <= 0 && DIRS[k]) this.move(p, p.rev > 0 ? REV[k] : k);
      return;
    }
    if (rep) return;
    if (st === 'story') { if (k === 'A' || k === 'S') this.level(true); return; }
    if (st === 'ask') {
      if (k === 'L' || k === 'R' || k === 'U' || k === 'D') { this.aq ^= 1; this.dt = 15; tone(660, .04); this.drawAsk(); }
      else if (k === 'A' || k === 'S') { tone(880, .08); if (this.aq) this.title(); else this.tutorial(); }
      return;
    }
    if (st === 'tutend') { if (k === 'A' || k === 'S') this.start(1); return; }
    if (st === 'win') { if ((k === 'A' || k === 'S') && this.dt < 6) this.over(); return; }
    if (st === 'title') { if (code === 'START2') this.start(2); else if (k === 'S' || k === 'A') this.start(1); }
    else if (st === 'entry' && pi === 0) {
      if (k === 'U' || k === 'D') { this.ini[this.ip] = (this.ini[this.ip] + (k === 'U' ? 1 : 25)) % 26; tone(660, .04); }
      else if (k === 'L') { this.ip = Math.max(0, this.ip - 1); tone(330, .04); }
      else if (k === 'R' || k === 'A' || k === 'S') {
        if (this.ip < 2) { this.ip++; tone(880, .05); }
        else {
          this.hs.push({ n: this.ini.map(v => String.fromCharCode(65 + v)).join(''), s: Math.round(this.usd * 100) });
          this.hs.sort((a, b) => b.s - a.s); this.hs = this.hs.slice(0, 5); saveHS(this.hs);
          tone(660, .1, 'square', .06); tone(990, .2, 'square', .06, 0, .1);
          this.showOver(); return;
        }
      }
      this.drawEntry();
    }
    else if ((st === 'over' && this.ot <= 0 || st === 'match' && this.dt < 4.5) && (k === 'A' || k === 'S')) this.title();
  }

  // ----- jugador -----
  mult(p) { return Math.min(5, 1 + Math.floor(p.chain / 3)); }
  // la velocidad del dólar sube rápido al principio y se estabiliza (no crece sin límite)
  vel() { return this.tut ? .45 : .5 + 1.4 * (1 - Math.exp(-this.lvl / 8)); }
  price() { return 36.5 * Math.pow(1.18, this.lvl - 1) * (1 + .6 * Math.max(0, this.L + 6) / (this.top || 40)); }
  // los cables pelados están apagados; cuando pasas al lado se prenden 1 segundo
  spike(r, c) { return cell(r, c) === '^' && this.ca[r + ',' + c] > 0; }

  move(p, d) {
    if (p.mv) { p.buf = d; return; }
    const [dr, dc] = DIRS[d];
    let r = p.r, c = p.c;
    while (open(cell(r + dr, c + dc))) { r += dr; c += dc; }
    if (r === p.r && c === p.c) {
      if (cell(r + dr, c + dc) === '^') this.touch(p);
      else { p.cam.shake(50, .003); tone(90, .06, 'square', .05); }
      return;
    }
    const now = this.time.now / 1000;
    p.chain = now - p.landT < .35 ? p.chain + 1 : 0;
    p.prev = [p.r, p.c]; p.mv = d; p.tr = r; p.tc = c; p.t = 0; p.dir = d;
    tone(200, .08, 'triangle', .06, 600);
  }

  land(p) {
    const d = p.mv, [dr, dc] = DIRS[d];
    p.mv = null; p.t = 0; p.fr = p.r; p.fc = p.c; p.landT = this.time.now / 1000; p.sq = 1;
    if (!this.spike(p.r + dr, p.c + dc)) {
      tone(110, .05, 'square', .05); p.cam.shake(40, .002);
      this.burst(p.r + .5 + dr * .5, p.c + .5 + dc * .5, 5, [0xffe14d, 0xffffff], 3);
    }
    const pt = G[p.r][p.c] === 'P' && PORT[p.r + ',' + p.c];
    if (pt) {
      this.burst(p.r + .5, p.c + .5, 20, [0xb36bff, 0xffffff], 6);
      [p.r, p.c] = pt; p.fr = p.r; p.fc = p.c; p.trail = []; p.path.push([p.r, p.c]);
      this.burst(p.r + .5, p.c + .5, 20, [0xb36bff, 0xffffff], 6);
      tone(200, .4, 'sine', .1, 1600); p.cam.flash(120, 140, 60, 255);
    }
    if (G[p.r][p.c] === 'E') {
      if (!this.gate || p.teq >= NEED) return this.exit(p);
      // el portero no te deja pasar sin tequeños: te devuelve a donde estabas
      this.say(`¡EL PORTERO QUIERE TEQUEÑOS! ${p.teq}/${NEED}`, p.r, p.c, '#ff4040');
      [p.r, p.c] = p.prev; p.fr = p.r; p.fc = p.c; p.trail = []; p.buf = null; p.path.push([p.r, p.c]);
      p.cam.shake(120, .006); tone(160, .25, 'square', .07, 80);
      return;
    }
    if (p.buf) { const b = p.buf; p.buf = null; this.move(p, b); }
  }

  // cables junto a ti: los apagados se prenden 2 s al pasar; tocar uno ya prendido (volviendo) electrocuta
  touch(p) {
    const now = new Set();
    let hit = null;
    for (const [dr, dc] of Object.values(DIRS)) {
      const r = p.r + dr, c = p.c + dc, k = r + ',' + c;
      if (cell(r, c) !== '^') continue;
      now.add(k);
      if (p.zs.has(k)) continue;
      if (this.ca[k] > 0) hit = [r, c];
      else { this.ca[k] = 1; tone(1400, .12, 'sawtooth', .05, 300); }
    }
    p.zs = now;
    return hit ? this.hurt(p, hit[0], hit[1]) : true;
  }

  // devuelve true si sobrevivió (escudo)
  hurt(p, sr, sc) {
    if (p.inv > 0) return true;
    if (p.sh) {
      p.sh = 0; p.inv = 1;
      this.say('¡ESCUDO ROTO!', p.r, p.c, '#3df2ff');
      if (sr != null) G[sr][sc] = '#';
      p.cam.shake(150, .01);
      this.burst(p.fr + .5, p.fc + .5, 20, [0x3df2ff, 0xffffff], 7);
      tone(800, .3, 'square', .08, 100);
      return true;
    }
    this.die(p); return false;
  }

  say(t, r, c, col) {
    this.pop.setText(t).setPosition((c + .5) * T, -(r + 1.2) * T).setColor(col).setAlpha(1);
    this.popT = 1.4;
  }

  // los bolívares valen lo que valen: los precios suben piso a piso
  collect(p, r, c) {
    let ch = G[r] && G[r][c];
    const m = this.mult(p), k = Math.pow(1.18, this.lvl - 1);
    if (ch === '.') {
      G[r][c] = ' '; this.bs[p.i] += 10 * m * k;
      if (!this.dn || this.time.now - this.dn > 40) { tone(1200 + m * 120, .03, 'square', .025); this.dn = this.time.now; }
    } else if (ch === 'o') {
      G[r][c] = ' '; this.bs[p.i] += 100 * m * k; p.teq++;
      this.burst(r + .5, c + .5, 12, [0xffe14d, 0xfff3a8], 5);
      if (this.gate && p.teq <= NEED) this.say(`TEQUEÑO ${p.teq}/${NEED}`, r, c, '#ffe14d');
      // cada 15 tequeños, una vida extra (máximo 3); si ya tienes 3, el contador espera lleno
      if (this.mode === 1) {
        this.tq = Math.min(TQV, this.tq + 1);
        if (this.tq >= TQV && this.lives < MAXV) {
          this.tq = 0; this.lives++;
          this.say('¡VIDA EXTRA!', r, c, '#ff3b6b');
          [784, 988, 1175, 1568].forEach((f, i) => tone(f, .12, 'square', .07, 0, i * .08));
        }
      }
      tone(660, .06, 'square', .05); tone(880, .06, 'square', .05, 0, .06); tone(1320, .1, 'square', .05, 0, .12);
    } else if (PW[ch]) {
      G[r][c] = ' ';
      const q = this.ps[1 - p.i];
      if (ch === 'S') p.sh = 1;
      else if (ch === 'M') p.mag = 8;
      else if (ch === 'F') this.frz = 5;
      else if (q && q.alive && q.sh) { q.sh = 0; q.inv = 1; ch = 'B'; }
      else if (q && q.alive) {
        // sabotaje al rival
        if (ch === 'H') q.fz = 1.5; else if (ch === 'K') q.ch.boost = 4; else q.rev = 4;
        q.cam.flash(200, 255, 120, 40);
      }
      this.burst(r + .5, c + .5, 18, [PW[ch] || 0x3df2ff, 0xffffff], 6);
      this.say(PWN[ch] || '¡EL ESCUDO LO BLOQUEÓ!', r, c, '#' + (PW[ch] || 0x3df2ff).toString(16).padStart(6, '0'));
      tone(300, .3, 'square', .06, 1200);
    }
  }

  burst(r, c, n, cols, sp) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, v = Math.random() * sp;
      this.parts.push({ r, c, vr: Math.sin(a) * v, vc: Math.cos(a) * v, l: .4 + Math.random() * .5, col: cols[rnd(cols.length)] });
    }
  }

  upPlayer(p, dt) {
    if (p.mv) {
      const [dr, dc] = DIRS[p.mv];
      p.t += dt * SPD;
      while (p.mv && p.t >= 1) {
        p.t -= 1; p.r += dr; p.c += dc; this.collect(p, p.r, p.c); p.path.push([p.r, p.c]);
        if (!this.touch(p)) return;
        if (p.r === p.tr && p.c === p.tc) this.land(p);
      }
      if (p.mv) { p.fr = p.r + dr * p.t; p.fc = p.c + dc * p.t; }
      p.trail.push([p.fr, p.fc]);
    }
    if (p.trail.length > 8 || (!p.mv && p.trail.length)) p.trail.shift();
    if (!p.alive || this.st !== 'play') return;
    // quedarte parado junto a un cable prendido también te electrocuta
    if (p.zt > 0) p.zt -= dt;
    if (!p.mv) {
      if (!this.touch(p)) return;
      const on = [...p.zs].some(k => this.ca[k] > 0);
      if (on && (p.zc += dt) > .45 && !this.hurt(p)) return;
      if (!on) p.zc = 0;
    }
    if (p.mag > 0) {
      p.mag -= dt;
      for (let r = p.r - 2; r <= p.r + 2; r++) for (let c = p.c - 2; c <= p.c + 2; c++) if (G[r] && (G[r][c] === '.' || G[r][c] === 'o')) {
        this.collect(p, r, c); this.parts.push({ r: r + .5, c: c + .5, vr: (p.fr - r) * 4, vc: (p.fc - c) * 4, l: .2, col: 0xffe14d });
      }
    }
    if (p.inv > 0) p.inv -= dt;
    if (p.fz > 0) p.fz -= dt;
    if (p.rev > 0) p.rev -= dt;
    if (p.sq > 0) p.sq = Math.max(0, p.sq - dt * 6);
    // el Cobrador sigue tu rastro exacto (el jefe es más grande y más rápido)
    const ch = p.ch, pl = p.path.length - 1, hit = .6;
    if (ch.boost > 0) ch.boost -= dt;
    if (ch.d > 0) ch.d -= dt;
    else ch.i = Math.min(pl, ch.i + dt * (2.4 + 2.4 * (1 - Math.exp(-this.lvl / 6)) + (ch.boost > 0 ? 3 : 0) + Math.max(0, pl - ch.i - 30) * .2));
    const i0 = Math.floor(ch.i), a = p.path[i0], b = p.path[Math.min(pl, i0 + 1)], f = ch.i - i0;
    ch.r = a[0] + (b[0] - a[0]) * f; ch.c = a[1] + (b[1] - a[1]) * f;
    if (Math.abs(b[0] - a[0]) > 1 || Math.abs(b[1] - a[1]) > 1) { ch.r = f < .5 ? a[0] : b[0]; ch.c = f < .5 ? a[1] : b[1]; }
    ch.near = ch.d <= 0 && Math.abs(ch.r - p.fr) + Math.abs(ch.c - p.fc) < 4;
    if (ch.d <= 0 && Math.abs(ch.r - p.fr) < hit && Math.abs(ch.c - p.fc) < hit && this.hurt(p)) { ch.i = Math.max(0, ch.i - 10); ch.d = 1.5; }
    // zancudos y bachaqueros
    let nb = null;
    for (const z of bats) {
      const zr = z.vt ? z.x : z.r, zc = z.vt ? z.c : z.x;
      if (p.alive && Math.abs(zr - p.fr) < .7 && Math.abs(zc - p.fc) < .7) nb = z;
    }
    // zancudos y bachaqueros: la primera picada avisa; la segunda en 3 s, o quedarte pegado, te mata
    if (nb && p.alive) {
      if (!p.inB) {
        p.inB = true;
        if (p.zt > 0 || p.sh) { if (this.hurt(p)) nb.dead = 1; }
        else { p.zt = 3; this.say('¡PICADA!', p.r, p.c, '#ff4060'); p.cam.flash(80, 255, 60, 90); tone(900, .15, 'sawtooth', .05, 200); }
      }
      if (p.alive && (p.bc += dt) > .45 && this.hurt(p)) nb.dead = 1;
    } else { p.inB = false; p.bc = 0; }
    // la gráfica del dólar
    if (p.alive && this.L > p.fr + .35) { if (p.sh || p.inv > 0) { this.hurt(p); this.L = p.fr - 4; } else this.die(p); }
  }

  // ¿el mapa sigue siendo justo para cada jugador vivo desde donde está (o hacia donde se desliza)?
  fair() {
    const bz = batCells();
    return this.ps.filter(p => p.alive).every(p => {
      if (!solvable(bz, (p.mv ? p.tr : p.r) + ',' + (p.mv ? p.tc : p.c))) return false;
      if (!this.gate) return true;
      let n = p.teq;
      for (const k of TRAV) { const [r, c] = k.split(',').map(Number); if (G[r][c] === 'o') n++; }
      return n >= NEED;
    });
  }

  // la Llorona y el Silbón no rompen nada: engañan. El mapa real no cambia, solo lo que ves
  illude() {
    const al = this.ps.filter(p => p.alive), kd = JEFES[this.ji][3], m = new Map(), n = 6 + this.je * 4;
    if (!al.length) return;
    const p = al[rnd(al.length)];
    for (let t = 0; t < 400 && m.size < n * 2; t++) {
      const r = p.r - 2 + rnd(16), c = rnd(COLS), ch = cell(r, c), k = r + ',' + c;
      if (r < 1 || r >= this.top || m.has(k) || al.some(q => Math.abs(q.r - r) + Math.abs(q.c - c) < 2)) continue;
      const nb = open(cell(r + 1, c)) || open(cell(r - 1, c)) || open(cell(r, c - 1)) || open(cell(r, c + 1));
      // llora: paredes que parecen pasillos y pasillos que parecen paredes; silba: salidas y tequeños falsos
      if (ch === '#' && nb && c > 0 && c < COLS - 1) m.set(k, kd === 'llora' ? '.' : rnd(3) ? 'o' : 'E');
      else if (kd === 'llora' && (ch === '.' || ch === ' ')) m.set(k, '#');
    }
    this.ilu = { m, t: 4 + this.je, k: kd };
    const ph = JEFES[this.ji][1];
    this.jsayT = 2; this.jsay.setText(this.je === 2 ? ph.replace(/!|♪$/, '.EXE$&') : this.je ? '*COF COF* ' + ph.toLowerCase() : ph);
    if (kd === 'silba') [0, .25, .5].forEach(t => tone(1900, .22, 'sine', .07, 900, t));
    else [0, .4].forEach(t => tone(520, .5, 'triangle', .08, 300, t));
  }

  // el jefe elige qué romper delante de un jugador: las celdas parpadean en rojo antes del golpe
  plan() {
    const al = this.ps.filter(p => p.alive);
    if (!al.length) return;
    const kd = JEFES[this.ji][3];
    if (kd === 'llora' || kd === 'silba') return this.illude();
    const p = al[rnd(al.length)], bz = batCells(), cells = [], nn = 2 + this.je, t0 = performance.now();
    // presupuesto de 12 ms para no trabar el juego
    // el Comandante apunta el puño a tu pasillo (una mira roja: muévete o te pega)
    if (kd === 'o') cells.push([p.r, p.c, 'X']);
    const froms = al.map(q => (q.mv ? q.tr : q.r) + ',' + (q.mv ? q.tc : q.c));
    for (let t = 0; t < 120 && cells.length < nn + (kd === 'o') && performance.now() - t0 < 12; t++) {
      // abre bloques cerca de ti, incluso los del borde de la torre; tapar nunca cerca de un jugador
      const o = kd === 'o', r = p.r + (o ? rnd(9) - 1 : 2 + rnd(14)), c = o ? rnd(COLS) : 1 + rnd(COLS - 2), ch = cell(r, c), k = r + ',' + c;
      if (r < 1 || r >= this.top || (!o && al.some(q => Math.abs(q.r - r) + Math.abs(q.c - c) < 2)) || cells.some(x => x[0] === r && x[1] === c)) continue;
      const want = kd === 'oc' ? (cells.length % 2 ? 'c' : 'o') : kd;
      const nv = want === 'o' ? (ch === '#' ? ' ' : 0) : ((ch === '.' || ch === ' ') && !bz.h.has(k) && !bz.v.has(k) ? '#' : 0);
      if (!nv) continue;
      G[r][c] = nv;
      // lo que se abre tiene que quedar recorrible (nada de huecos sin entrada)
      if (this.fair() && (nv === '#' || phys(froms).has(k))) cells.push([r, c, nv]);
      G[r][c] = ch;
    }
    if (cells.length) { this.jw = { cells, t: 1.1 }; this.cams.forEach(c => c.visible && c.shake(1000, .003)); tone(60, 1, 'sawtooth', .06, 45); }
  }

  // el golpe: cada cambio se aplica solo si en este momento sigue siendo justo
  smash() {
    const w = this.jw;
    let hit = 0;
    this.jw = null;
    for (const [r, c, nv] of w.cells) {
      if (nv === 'X') {
        // el puño: si sigues ahí, te pega
        this.burst(r + .5, c + .5, 24, [0xff4040, 0xffc21a, 0xffffff], 9); hit++;
        for (const q of this.ps) if (q.alive && Math.abs(q.fr - r) < .8 && Math.abs(q.fc - c) < .8) this.hurt(q);
        continue;
      }
      const old = G[r][c];
      if (nv === '#' && this.ps.some(q => q.alive && Math.abs(q.r - r) + Math.abs(q.c - c) < 2)) continue;
      G[r][c] = nv;
      if (!this.fair()) { G[r][c] = old; continue; }
      hit++;
      this.burst(r + .5, c + .5, 14, nv === '#' ? [0x8a7f99, 0x5a4f6a, 0xffffff] : [0xff4040, 0xffc21a, 0xffffff], 7);
    }
    if (!hit) return;
    const ph = JEFES[this.ji][1];
    this.jsayT = 1.6;
    this.jsay.setText(this.je === 2 ? ph.replace('!', '.EXE!') : this.je ? '*COF COF* ' + ph.toLowerCase() : ph);
    // temblor fuerte con cada golpe
    this.cams.forEach(c => c.visible && c.shake(500, .022) && c.flash(90, 255, 200, 120));
    tone(90, .4, 'sawtooth', .14, 40); noise(.3, .25);
    // si se taparon pasillos, lo que quedó sin entrada se rellena
    if (JEFES[this.ji][3] !== 'o') prune(this.ps.filter(q => q.alive).map(q => (q.mv ? q.tr : q.r) + ',' + (q.mv ? q.tc : q.c)));
  }

  // ritmo del jefe: más rápido y más destructivo en cada etapa
  jefe(dt) {
    if (this.jsayT > 0) this.jsayT -= dt;
    if (this.ilu && (this.ilu.t -= dt) <= 0) this.ilu = null;
    if (this.ilu) return;
    if (this.jw) { if ((this.jw.t -= dt) <= 0 && !this.ps.some(p => p.alive && p.mv)) this.smash(); }
    else if ((this.jt -= dt) <= 0) { this.jt = 5.5 - this.je * 1.5; this.plan(); }
  }

  // evento del piso: devaluación sorpresa (con alarma)
  floorEv(dt) {
    if (this.ev !== 'DEV') return;
    this.evT -= dt;
    if (this.evT < 1.6 && !this.warn) { this.warn = true; this.tT.setText('¡ALERTA!').setY(120).setAlpha(1); this.msg = 1.6; }
    if (this.warn && Math.floor(this.evT * 6) % 2) tone(this.evT * 6 % 4 < 2 ? 880 : 660, .05, 'square', .03);
    if (this.evT <= 0) {
      const al = this.ps.filter(p => p.alive);
      if (al.length) this.L = Math.max(this.L, Math.min(this.L + 3, Math.min(...al.map(p => p.fr)) - 1));
      this.warn = false; this.evT = 10 + rnd(6);
      this.cams.forEach(c => c.visible && c.shake(400, .015));
      this.tT.setText('¡DEVALUACIÓN!').setY(120).setAlpha(1); this.tM.setText(''); this.msg = 1.2;
      tone(600, .6, 'sawtooth', .1, 80); noise(.4, .15);
    }
  }

  // ----- loop -----
  update(time, delta) {
    const dt = Math.min(delta / 1000, .05), st = this.st;
    if (st === 'title' || st === 'ask') {
      if (st === 'ask' && (this.dt -= dt) <= 0) this.title();
      this.ty += dt * 2;
      if (this.ty > this.top - 10) this.ty = 0;
      this.cams[0].centerOn(MW / 2, -(this.ty + 9) * T);
      const x = (time * .18) % (W + 300) - 100;
      this.tp.setPosition(x, 545 - Math.abs(Math.sin(time / 90)) * 6);
      this.tc.setPosition(x - 110, 545 - Math.abs(Math.sin(time / 80)) * 8).setTexture(Math.floor(time / 120) % 2 ? 'c1' : 'c2');
      this.tB.setAlpha(Math.floor(time / 450) % 2 ? 1 : .35);
    } else if (st === 'play') {
      for (const p of this.ps) if (p.alive && this.st === 'play') this.upPlayer(p, dt);
      bats = bats.filter(z => !z.dead);
      if (this.st === 'play') {
        for (const k in this.ca) if ((this.ca[k] -= dt) <= 0) delete this.ca[k];
        if (this.frz > 0) this.frz -= dt;
        else if (!this.tut || this.tutOn) this.L += this.vel() * dt;
        const al = this.ps.filter(p => p.alive);
        if (al.length && (!this.tut || this.tutOn)) this.L = Math.max(this.L, Math.min(...al.map(p => p.fr)) - 13);
        if (this.tut) this.tutor();
        this.floorEv(dt);
        if (this.boss) this.jefe(dt);
        if (this.msg > 0 && (this.msg -= dt) <= 0) { this.tT.setText(''); this.tM.setText(''); }
        this.hud();
      }
    } else if (st === 'win') {
      // las hélices suenan mientras despega
      if (Math.floor(time / 90) % 2) noise(.04, .03);
      if ((this.dt -= dt) <= 0) this.over();
    } else if (st === 'tutend') {
      this.tB.setAlpha(Math.floor(time / 450) % 2 ? 1 : .35);
    } else if (st === 'story') {
      const txt = this.mode === 2 ? STORY2 : STORY, n = Math.floor(this.sn += dt * 40);
      this.tM.setText(txt.slice(0, n)).setY(140);
      if (n < txt.length && n % 3 === 0) tone(700 + rnd(200), .02, 'square', .02);
      this.tB.setText(n >= txt.length ? 'BOTÓN PARA EMPEZAR' : '').setAlpha(Math.floor(time / 450) % 2 ? 1 : .35);
      if ((this.dt -= dt) <= 0) this.level(true);
    } else if (st === 'dead') {
      if ((this.dt -= dt) <= 0) { if (this.lives > 0) this.level(false); else this.over(); }
    } else if (st === 'clear' || st === 'round') {
      if ((this.dt -= dt) <= 0) this.level(true);
    } else if (st === 'match') {
      if ((this.dt -= dt) <= 0) this.title();
    } else if (st === 'over') {
      this.ot -= dt; this.tB.setAlpha(Math.floor(time / 450) % 2);
      if ((this.oa -= dt) <= 0) this.title();
    }
    if (st !== 'title') for (const p of this.ps) {
      const vh = H / p.cam.zoom, ty = Math.min(3 * T - vh / 2, Math.max(-(this.top + 2) * T + vh / 2, -(p.fr + .5) * T - vh * .18));
      p.cy += (ty - p.cy) * Math.min(1, dt * 5);
      p.cam.centerOn(MW / 2, p.cy);
    }
    for (const z of bats) {
      z.x += z.v * dt;
      if (z.x > z.b) { z.x = z.b; z.v = -z.v; } else if (z.x < z.a) { z.x = z.a; z.v = -z.v; }
    }
    for (const p of this.parts) { p.r += p.vr * dt; p.c += p.vc * dt; p.vr -= 8 * dt; p.l -= dt; }
    this.parts = this.parts.filter(p => p.l > 0);
    if (this.popT > 0) { this.popT -= dt; this.pop.y -= dt * 30; this.pop.setAlpha(Math.min(1, this.popT * 2)); }
    this.sky(st === 'title' || st === 'ask' ? this.ty : this.ps.length ? Math.max(0, ...this.ps.map(p => p.fr)) : 0);
    if ('play title ask tutend'.includes(this.st)) this.music();
    this.draw(time / 1000);
  }

  // una canción por zona (El Ávila suena a joropo), otra para los jefes y una tranquila en el título
  music() {
    if (!AC) return;
    const calm = this.st !== 'play', hot = !calm && (this.warn || this.ps.some(p => p.alive && (p.ch.near || p.fr - this.L < 4)));
    const [root, bass, lead] = SONGS[this.boss && !calm ? 4 : THEMES.indexOf(this.th)];
    const s = 60 / (calm ? 100 : hot ? 176 : 132 + Math.min(30, this.lvl * 2)) / 2, nf = (b, n) => b * Math.pow(2, n / 12);
    if (this.nt < AC.currentTime) this.nt = AC.currentTime + .05;
    while (this.nt < AC.currentTime + .12) {
      const i = this.mi++ % 16, t0 = this.nt - AC.currentTime;
      if (bass[i] != null) tone(nf(root, bass[i]), s * 1.6, 'triangle', calm ? .06 : .1, 0, t0);
      if (lead[i] != null && (!calm || i % 2 === 0)) tone(nf(root * 4, lead[i]), s * .9, 'square', calm ? .015 : .022, 0, t0);
      if (!calm) {
        if (i % 4 === 0) tone(150, .12, 'sine', .16, 40, t0);
        if (i % 8 === 4) noise(.08, .05, t0);
        if (i % 2) noise(.025, .018, t0);
      }
      this.nt += s;
    }
  }

  pows(p) {
    let r = '';
    if (p.zt > 0) r += '¡NO REPITAS!\n';
    if (p.sh) r += 'ESCUDO\n';
    if (p.mag > 0) r += `YUMMY ${Math.ceil(p.mag)}s\n`;
    if (this.frz > 0) r += `CASHEA ${Math.ceil(this.frz)}s\n`;
    if (p.fz > 0) r += '¡CONGELADO!\n';
    if (p.rev > 0) r += '¡EN LA COLA!\n';
    if (p.ch.boost > 0) r += 'COBRADOR TURBO\n';
    if (p.ch.near) r += '¡TE ALCANZA!\n';
    if (p.alive && p.fr - this.L < 4) r += '¡SUBE EL\nDÓLAR!\n';
    return r;
  }

  hud() {
    const pr = money(this.price());
    if (this.mode === 2) {
      const st = w => '★'.repeat(w) + '☆'.repeat(3 - w);
      this.ps.forEach(p => (p.i ? this.tR : this.tL).setText(`P${p.i + 1} ${st(this.wins[p.i])}  ${Math.max(0, p.r)}m\n${p.alive ? this.pows(p) : 'ELIMINADO'}`));
      this.tP.setText(`DÓLAR Bs.${pr}`);
      return;
    }
    const p = this.ps[0], m = this.mult(p), best = this.hs[0] ? this.hs[0].s / 100 : 0;
    this.tL.setText(`BOLÍVARES\nBs.${bsf(this.bs[0])}\n\nDÓLARES\n$${money(this.usd)}\n\nPISO ${this.lvl}/${FINAL}\n${'♥'.repeat(Math.max(0, this.lives))}\n+♥ ${this.tq}/${TQV}\n\n${m > 1 ? 'COMBO x' + m : ''}`);
    this.tR.setText(`TASA\nBs.${pr}\n\nRÉCORD\n$${money(Math.max(best, this.usd))}\n\n${this.gate ? `TEQUEÑOS ${Math.min(p.teq, NEED)}/${NEED}\n` : ''}${this.pows(p)}`);
    this.tP.setText('');
  }

  // ----- render -----
  draw(tm) {
    const g = this.g, f = this.fx, hg = this.hg, [, wc, lc, tc, ec] = this.th, th0 = this.th === THEMES[0];
    g.clear(); f.clear(); hg.clear();
    // filas visibles por cada cámara activa
    const rows = new Set();
    for (const cam of this.cams) if (cam.visible) {
      const vh = H / cam.zoom, cy = cam.midPoint.y;
      for (let r = Math.floor(-(cy + vh / 2) / T) - 1; r <= Math.floor(-(cy - vh / 2) / T) + 1; r++) rows.add(r);
    }
    const locked = this.gate && this.ps[0] && this.ps[0].teq < NEED, im = this.ilu && this.ilu.m, ll = im && this.ilu.k === 'llora',
      // con la Llorona, cada celda falsa titila mostrando por un instante lo que de verdad es
      glim = (r, c) => ll && im.has(r + ',' + c) && Math.sin(tm * 9 + r * 1.7 + c * 2.3) > .6,
      see = (r, c) => !glim(r, c) && im && im.get(r + ',' + c) || cell(r, c);
    const dest = new Set(Object.values(PORT).map(v => v.join(',')));
    for (const r of rows) {
      const y = -(r + 1) * T;
      for (let c = 0; c < COLS; c++) {
        const x = c * T, ch = see(r, c);
        if (isWall(ch)) {
          // bloques del lugar actual (Torre, Metro, Sabana Grande, Ávila)
          const o = r & 1 ? 8 : 22, hs = ((r * 73856093) ^ (c * 19349663)) >>> 0;
          g.fillStyle(wc, .93).fillRect(x, y, T, T);
          g.fillStyle(lc).fillRect(x, y + 15, T, 2).fillRect(x + o, y, 2, 15).fillRect(x + 30 - o, y + 17, 2, 15);
          g.fillStyle(tc).fillRect(x, y, T, 2);
          if (th0 && hs % 7 === 0) {
            // ventanas de la Torre: algunas con luz
            g.fillStyle(hs % 3 ? 0x110d22 : 0xffc96b, hs % 3 ? 1 : .55 + Math.sin(tm * 2 + hs) * .2).fillRect(x + 9, y + 6, 14, 18);
            g.fillStyle(lc).fillRect(x + 15, y + 6, 2, 18);
          } else if (!th0 && hs % 5 === 0) g.fillStyle(tc).fillRect(x + 4, y + 6, 24, 4);
          const sides = [open(see(r + 1, c)), open(see(r - 1, c)), open(see(r, c - 1)), open(see(r, c + 1))];
          const ct = ch === '^' && this.ca && this.ca[r + ',' + c], cs = ct > .3 || ct > 0 && Math.floor(tm * 12) % 2;
          g.fillStyle(ch === '^' ? (ct ? 0x2a2a2a : 0x555555) : ec);
          if (sides[0]) g.fillRect(x, y, T, 3);
          if (sides[1]) g.fillRect(x, y + T - 3, T, 3);
          if (sides[2]) g.fillRect(x, y, 3, T);
          if (sides[3]) g.fillRect(x + T - 3, y, 3, T);
          // prendido: chispas; apagado: cable gris quieto
          if (ch === '^') sides.forEach((s, i) => s && this.sparks(g, x, y, i, cs ? tm + r * 7 + c : 0, cs ? 1 : .5, cs ? 0 : 0x777777));
        } else {
          g.fillStyle(0x0a0618, .62).fillRect(x, y, T, T);
          if (ch === '.') g.fillStyle(0xffe14d).fillRect(x + 14, y + 14, 4, 4);
          else if (ch === 'o') {
            // tequeño
            const b = Math.sin(tm * 4 + r) * 2;
            g.fillStyle(0xd98a2b).fillRect(x + 6, y + 12 + b, 20, 8);
            g.fillStyle(0xf2b552).fillRect(x + 8, y + 12 + b, 16, 3);
            g.fillStyle(0xfff6d5).fillRect(x + 24, y + 13 + b, 4, 6);
          } else if (ch === 'P') {
            for (let i = 0; i < 3; i++) g.lineStyle(2, [0xb36bff, 0xff3df2, 0x3df2ff][i]).strokeCircle(x + 16, y + 16, 4 + ((tm * 12 + i * 4) % 12));
          } else if (ch === 'E') {
            // la salida: roja con candado mientras el portero espera sus tequeños
            const a = .6 + Math.sin(tm * 6) * .4;
            g.fillStyle(locked ? 0xff4040 : 0x5dff7a, .25 * a).fillRect(x - 4, y - 4, T + 8, T + 8);
            g.fillStyle(locked ? 0x8f1f1f : 0x1f8f3a).fillRect(x + 6, y + 2, 20, 28);
            g.fillStyle(locked ? 0xff4040 : 0x5dff7a).fillRect(x + 9, y + 5, 14, 22);
            if (this.lvl === FINAL && !this.tut) g.fillStyle(0x222631).fillCircle(x + 16, y + 16, 15).fillStyle(0xffe14d).fillRect(x + 9, y + 8, 3, 16).fillRect(x + 20, y + 8, 3, 16).fillRect(x + 12, y + 14, 8, 3);
            else if (locked) g.fillStyle(0xffe14d).fillRect(x + 12, y + 14, 8, 7).lineStyle(2, 0xffe14d).strokeRect(x + 13, y + 9, 6, 6);
            else g.fillStyle(0x0d0a1e).fillTriangle(x + 16, y + 8, x + 11, y + 16, x + 21, y + 16).fillRect(x + 14, y + 16, 4, 8);
          } else if (dest.has(r + ',' + c)) {
            g.lineStyle(2, 0xb36bff, .35 + Math.sin(tm * 4) * .15).strokeCircle(x + 16, y + 16, 12).strokeCircle(x + 16, y + 16, 6);
          }
          if (PW[ch]) {
            const s = 9 + Math.sin(tm * 6) * 2, cx = x + 16, cy = y + 16;
            g.fillStyle(PW[ch]).fillTriangle(cx - s, cy, cx + s, cy, cx, cy - s).fillTriangle(cx - s, cy, cx + s, cy, cx, cy + s);
            g.fillStyle(0xffffff).fillRect(cx - 2, cy - 2, 4, 4);
          }
        }
        if (glim(r, c)) f.fillStyle(0x9fe8ff, .35).fillRect(x, y, T, T);
      }
    }
    // zancudos (horizontal) y bachaqueros (vertical)
    let bi = 0;
    for (const z of bats) {
      const zr = z.vt ? z.x : z.r, zc = z.vt ? z.c : z.x;
      if (!rows.has(Math.floor(zr))) continue;
      if (!this.bp[bi]) this.bp[bi] = this.wo(this.add.image(0, 0, 'b1').setDepth(2));
      const fl = Math.floor(tm * (z.vt ? 10 : 20)) % 2;
      this.bp[bi++].setVisible(true).setPosition((zc + .5) * T, -(zr + .5) * T + (z.vt ? 0 : Math.sin(tm * 9 + z.r) * 3))
        .setTexture(z.vt ? (fl ? 'k1' : 'k2') : (fl ? 'b1' : 'b2')).setFlipX(!z.vt && z.v < 0).setAngle(z.vt ? (z.v > 0 ? -90 : 90) : 0);
    }
    for (; bi < this.bp.length; bi++) this.bp[bi].setVisible(false);
    // el silbido del Silbón apaga todo menos un círculo alrededor de cada jugador; el llanto mueve la pista
    const il = this.ilu && 'play dead'.includes(this.st) ? this.ilu.k : '';
    this.fog.forEach((o, i) => {
      o.clear();
      const p = this.ps[i];
      if (il === 'silba' && p) o.lineStyle(1600, 0x000000, .96).strokeCircle((p.fc + .5) * T, -(p.fr + .5) * T, 3.5 * T + 800);
    });
    this.cams.forEach(c => c.setRotation(il === 'llora' ? Math.sin(tm * 2.3) * .05 * (1 + this.je) : 0));
    // el jefe gigante flota sobre el mapa; las celdas que va a golpear parpadean en rojo
    const jon = this.boss && 'play dead clear round'.includes(this.st);
    this.jsp.setVisible(jon); this.jsay.setVisible(jon && this.jsayT > 0);
    if (jon) {
      const p = this.ps.find(q => q.alive) || this.ps[0], w = this.jw, bob = Math.sin(tm * 3) * 6;
      let tx = (p.fc + .5) * T + Math.sin(tm) * 60, ty = -(p.fr + 6.5) * T;
      if (w) {
        tx = (w.cells[0][1] + .5) * T; ty = -(w.cells[0][0] + 3) * T;
        for (const [r, c, nv] of w.cells) {
          if (nv === 'X') { const mx = (c + .5) * T, my = -(r + .5) * T, rr = 22 - (1.1 - w.t) * 10; f.lineStyle(3, 0xff2020).strokeCircle(mx, my, rr).lineBetween(mx - rr - 6, my, mx + rr + 6, my).lineBetween(mx, my - rr - 6, mx, my + rr + 6); continue; }
          f.fillStyle(0xff2020, .25 + Math.sin(tm * 25) * .15).fillRect(c * T, -(r + 1) * T, T, T).lineStyle(3, 0xff2020).strokeRect(c * T + 2, -(r + 1) * T + 2, T - 4, T - 4);
        }
      }
      this.jx += (Math.max(40, Math.min(MW - 40, tx)) - this.jx) * .08; this.jy += (ty - this.jy) * .08;
      this.jsp.setPosition(this.jx, this.jy + bob).setFlipX(Math.sin(tm) > 0);
      if (JEFES[this.ji][3] === 'c') {
        // el mazo
        const a = w ? Math.sin(tm * 20) * 10 : 0, mx = this.jx + 44, my = this.jy + bob - 10 + a;
        f.fillStyle(0x6b4a1a).fillRect(mx - 3, my, 6, 44).fillStyle(0x8a8f99).fillRect(mx - 16, my - 12, 32, 18);
      }
      // la versión robot echa humo
      if (this.je === 2 && Math.random() < .3) this.parts.push({ r: -this.jy / T + 1, c: this.jx / T, vr: 3, vc: Math.random() - .5, l: .6, col: 0x777777 });
      this.jsay.setPosition(this.jx, this.jy + bob - 46);
    }
    // el helicóptero: espera en la azotea del piso 30 y despega en el final
    const hv = !this.tut && this.lvl === FINAL && 'play dead clear win'.includes(this.st);
    this.hel.setVisible(hv);
    if (hv) {
      const [hx, hy] = this.hx, up = this.st === 'win' ? Math.max(0, 5 - this.dt) : 0;
      this.hel.setPosition(hx + up * up * 40, hy - up * up * 60 + Math.sin(tm * 6) * 3).setScale(1 + (Math.floor(tm * 20) % 2) * .04, 1);
      if (this.st === 'win') this.spr[0].setVisible(true).setPosition(hx + up * up * 40, hy + 30 - up * up * 60).setAngle(Math.sin(tm * 5) * 15);
    }
    // jugadores, estelas y perseguidores
    this.cpt.forEach(t => t.setVisible(false));
    for (const p of this.ps) {
      const px = (p.fc + .5) * T, py = -(p.fr + .5) * T, col = p.i ? 0x7bd23a : 0xffe14d;
      if (p.alive) {
        p.trail.forEach(([r, c], i) => f.fillStyle(col, i / 8 * .35).fillRect(c * T + 6, -(r + 1) * T + 6, 20, 20));
        const hz = p.mv === 'L' || p.mv === 'R', vt = p.mv === 'U' || p.mv === 'D', sq = p.sq * .25;
        if (p.zt > 0) this.spr[p.i].setTint(Math.floor(tm * 10) % 2 ? 0x7df9ff : 0xffffff); else this.spr[p.i].clearTint();
        this.spr[p.i].setPosition(px, py).setFlipX(p.dir === 'L')
          .setScale(hz ? 1.3 : vt ? .8 : 1 + sq, vt ? 1.3 : hz ? .8 : 1 - sq)
          .setAlpha(p.inv > 0 && Math.floor(tm * 20) % 2 ? .3 : 1);
        if (p.sh) f.lineStyle(2, 0x3df2ff, .6 + Math.sin(tm * 8) * .3).strokeCircle(px, py, 19);
        if (p.mag > 0) f.lineStyle(1, 0xff4060, .35).strokeCircle(px, py, 2.5 * T);
        if (p.fz > 0) f.fillStyle(0xbfefff, .45).fillRect(px - 16, py - 16, 32, 32);
        if (p.rev > 0) f.lineStyle(2, 0xff7eb6, .8).strokeRect(px - 17, py - 17, 34, 34);
      }
      const ch = p.ch, cx = (ch.c + .5) * T, cy = -(ch.r + .5) * T - 4;
      this.cps[p.i].setPosition(cx, cy - (ch.d > 0 ? 0 : Math.abs(Math.sin(tm * 14)) * 3)).setTexture(ch.d > 0 || Math.floor(tm * 10) % 2 ? 'c1' : 'c2').setFlipX(p.fc > ch.c).setAlpha(ch.d > 0 ? .6 : 1);
      if (ch.near && p.alive) f.lineStyle(2, 0xff3b3b, .5 + Math.sin(tm * 20) * .4).strokeCircle(cx, cy, 20);
      const lines = ['¡MI PLATA!', '¡PÁGAME!', '¡QUÉ MANGUANGUA!', '¡EPA, CHAMO!'];
      const say = ch.near && p.alive ? lines[Math.floor(tm / 1.5) % lines.length] : '';
      this.cpt[p.i].setText(say).setVisible(!!say).setPosition(cx, cy - 22);
    }
    for (const p of this.parts) f.fillStyle(p.col, Math.min(1, p.l * 2)).fillRect(p.c * T - 2, -p.r * T - 2, 4, 4);
    // la gráfica del dólar sube desde abajo
    if (this.st !== 'title') {
      const ly = -this.L * T, x0 = -4 * T, x1 = MW + 4 * T, fz = this.frz > 0, lc2 = fz ? 0xc77dff : 0x39ff6a;
      f.fillStyle(lc2, .12).fillRect(x0, ly - 28, x1 - x0, 28);
      f.fillStyle(fz ? 0x1d0b33 : 0x062b14, .95).fillRect(x0, ly, x1 - x0, 900);
      f.lineStyle(1, fz ? 0x5a2d8a : 0x1f7a3d, .7);
      for (let k = 0; k < 22; k++) f.lineBetween(x0, ly + 20 + k * 40, x1, ly + 20 + k * 40);
      for (let x = x0; x < x1; x += 64) f.lineBetween(x, ly + 10, x, ly + 900);
      f.lineStyle(4, lc2);
      let ox = x0, oy = ly;
      for (let x = x0, i = 0; x <= x1; x += 20, i++) {
        const y = ly - 8 + ((i * 37 + Math.floor(tm * 3)) % 13) - (i % 4 === 0 ? 10 : 0);
        f.lineBetween(ox, oy, x, y); ox = x; oy = y;
      }
      this.pt.setPosition(MW - 6, ly - 14).setText(`▲ Bs.${money(this.price())}`).setColor(fz ? '#c77dff' : '#39ff6a');
    }
    // HUD
    if (this.mode === 2 && this.st !== 'title') hg.fillStyle(0xffc21a).fillRect(398, 0, 4, H);
    else {
      hg.fillStyle(0x07020f, .5).fillRect(0, 0, 156, H).fillRect(644, 0, 156, H);
      hg.fillStyle(0xffc21a).fillRect(156, 0, 2, H).fillRect(642, 0, 2, H);
    }
    // alarma de devaluación: la pantalla parpadea en rojo
    if (this.warn && Math.floor(tm * 8) % 2) hg.fillStyle(0xff0000, .18).fillRect(0, 0, W, H);
    if ('title over entry match story ask tutend win'.includes(this.st)) hg.fillStyle(0x000000, .55).fillRect(0, 0, W, H);
  }

  // cables pelados: chispas eléctricas
  sparks(g, x, y, side, t, al = 1, col) {
    const p = (u, v) => side === 0 ? [x + u, y + v] : side === 1 ? [x + u, y + T - v] : side === 2 ? [x + v, y + u] : [x + T - v, y + u];
    g.lineStyle(2, col || (Math.floor(t * 15) % 3 ? 0x7df9ff : 0xffffff), al);
    for (let i = 0; i < 3; i++) {
      const u = i * 10 + 6, j = Math.sin(t * 40 + i * 2) * 4;
      const a = p(u, 2), b = p(u + j, -3), c = p(u - j, -8);
      g.lineBetween(a[0], a[1], b[0], b[1]).lineBetween(b[0], b[1], c[0], c[1]);
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO, width: W, height: H, parent: 'game-root', backgroundColor: '#07020f', pixelArt: true,
  audio: { noAudio: true }, scene: Game,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
});
