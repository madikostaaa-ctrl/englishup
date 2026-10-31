'use strict';
const app = document.getElementById('app');
const GOAL = 30;
const PAL = [['#58cc02','#46a302'],['#1cb0f6','#1899d6'],['#ce82ff','#a560d9'],['#ff9600','#d67d00'],['#ff4b4b','#d33'],['#2bc4a0','#1e9c80'],['#ff86d0','#d964ab'],['#4b7bff','#3860d6'],['#e0a800','#b38600'],['#a1887f','#7d6258']];
// 25 уровней опыта, как были в Duolingo
const XPL = [0,60,120,200,300,450,750,1125,1650,2250,3000,3900,4900,6000,7500,9000,10500,12000,13500,15000,17000,19000,22500,26000,30000];
const STAGES = [
  { id: 'A1', name: 'Начальный', from: 10, to: 29 },
  { id: 'A2', name: 'Элементарный', from: 30, to: 59 },
  { id: 'B1', name: 'Средний', from: 60, to: 89 },
  { id: 'B2', name: 'Выше среднего', from: 90, to: 129 },
  { id: 'C1', name: 'Продвинутый', from: 130, to: 160 },
];
const GAPS = [1, 3, 7, 14, 30, 60, 120]; // дни между повторениями
const GOOD = ['Верно! 🎉','Отлично!','Так держать!','Супер!','Точно в цель!','Блестяще!'];
const BAD = ['Ничего, бывает','Почти!','Запомни этот ответ','Не сдавайся!'];
const EMPTY = { xp: 0, streak: 0, last: '', done: {}, daily: { d: '', xp: 0 }, mistakes: [], perfect: 0, blitz: 0, memory: 0, sound: true, badges: {}, skip: 0, placed: false, srs: {}, sets: {}, voa: {} };
let S;
try { S = Object.assign({}, EMPTY, JSON.parse(localStorage.getItem('englishup2') || '{}')); } catch (e) { S = Object.assign({}, EMPTY); }
const save = () => { try { localStorage.setItem('englishup2', JSON.stringify(S)); } catch (e) {} };

STAGES.forEach(s => { s.units = []; s.phrases = []; });
const KEY = {}; // en → { item, unit }
// id — порядок добавления, он не меняется и хранится в прогрессе; после сортировки разделы идут по ступеням
UNITS.forEach((u, i) => { u.id = i; u.lvl = u.lvl || 'A1'; u.si = STAGES.findIndex(s => s.id === u.lvl); });
UNITS.sort((a, b) => a.si - b.si);
const indexUnit = u => {
  u.phrases.forEach(p => { p.si = u.si; KEY[p[0]] = KEY[p[0]] || { item: p, unit: u }; });
  u.words.forEach(w => { KEY[w[0]] = KEY[w[0]] || { item: w, unit: u }; });
};
UNITS.forEach((u, i) => {
  STAGES[u.si].units.push(i);
  STAGES[u.si].phrases.push(...u.phrases);
  indexUnit(u);
});
// разделы вкладки «Цель» идут за основным путём: они открыты сразу и не влияют на прогресс по ступеням
const MAIN = UNITS.length;
GOAL_TRACKS.forEach((t, ti) => t.units.forEach((u, i) => {
  u.id = 1000 + ti * 100 + i; u.lvl = 'B1'; u.si = 2; u.ui = UNITS.push(u) - 1;
  indexUnit(u);
}));
const SETS = SENTENCES.map((s, i) => {
  const u = { title: 'Набор ' + (i + 1), si: i < 34 ? 1 : i < 60 ? 2 : 3, words: [], phrases: s };
  indexUnit(u);
  return u;
});

const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rnd = a => a[Math.random() * a.length | 0];
const norm = s => s.toLowerCase().replace(/[’`]/g, "'").replace(/[.,!?;:—]/g, '').replace(/\s+/g, ' ').trim();
const strip = s => s.replace(/[.,!?;:]/g, '');
// don't и do not считаются одним ответом
const expand = s => norm(s).replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'cannot').replace(/n't\b/g, ' not').replace(/'m\b/g, ' am').replace(/'re\b/g, ' are').replace(/'ve\b/g, ' have').replace(/'ll\b/g, ' will');
const pick = (pool, ex, n) => shuffle(pool.filter(x => x !== ex)).slice(0, n);
const dayStr = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
const dailyXp = () => S.daily.d === dayStr(new Date()) ? S.daily.xp : 0;
const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
function lev(a, b) {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(row[j] + 1, cur[j - 1] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    row = cur;
  }
  return row[b.length];
}

/* ---------- Прогресс по курсу ---------- */
const doneKey = (ui, p) => UNITS[ui].id + '-' + p;
const skipIdx = () => Math.max(0, UNITS.findIndex(u => u.id === S.skip));
const doneOf = (ui, p) => S.done[doneKey(ui, p)] || (ui < skipIdx() ? 1 : 0);
function curUnit() {
  for (let i = 0; i < MAIN; i++) if (![0, 1, 2].every(p => doneOf(i, p))) return i;
  return MAIN - 1;
}
function score() {
  const si = UNITS[curUnit()].si, st = STAGES[si];
  const left = st.units.reduce((n, u) => n + [0, 1, 2].filter(p => doneOf(u, p)).length, 0);
  return Math.round(st.from + (st.to - st.from) * left / (st.units.length * 3));
}
const levelOf = xp => { let l = 0; while (l + 1 < XPL.length && xp >= XPL[l + 1]) l++; return l + 1; };

/* ---------- Интервальное повторение ---------- */
function srsMark(key, ok) {
  if (!key) return;
  const t = today(), c = S.srs[key];
  if (!ok) S.srs[key] = { b: 0, d: t + 1 };
  else if (!c) S.srs[key] = { b: 0, d: t + GAPS[0] };
  else if (c.d <= t) { const b = Math.min(c.b + 1, GAPS.length - 1); S.srs[key] = { b, d: t + GAPS[b] }; }
}
const dueKeys = () => Object.keys(S.srs).filter(k => S.srs[k].d <= today() && KEY[k]);

/* ---------- Звук, речь, эффекты ---------- */
let AC;
function tone(freqs, dur, type) {
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    freqs.forEach((f, i) => {
      const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + i * dur;
      o.type = type || 'sine'; o.frequency.value = f; o.connect(g); g.connect(AC.destination);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.02);
    });
  } catch (e) {}
}
const sfx = { ok: () => tone([660, 880], 0.1), bad: () => tone([220, 160], 0.14, 'sawtooth'), win: () => tone([523, 659, 784, 1047], 0.14), tap: () => tone([520], 0.04) };
const vib = n => { try { navigator.vibrate && navigator.vibrate(n); } catch (e) {} };

function speak(text, rate) {
  if (!text || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = rate || 0.9;
  speechSynthesis.speak(u);
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function confetti() {
  const c = document.createElement('canvas');
  c.className = 'confetti'; c.width = innerWidth; c.height = innerHeight;
  document.body.appendChild(c);
  const x = c.getContext('2d'), cols = ['#58cc02', '#1cb0f6', '#ffc800', '#ff4b4b', '#ce82ff'];
  const ps = Array.from({ length: 130 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.6, vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4, s: 6 + Math.random() * 7, c: rnd(cols), r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3 }));
  let f = 0;
  (function a() {
    x.clearRect(0, 0, c.width, c.height);
    ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); x.restore(); });
    if (++f < 220) requestAnimationFrame(a); else c.remove();
  })();
}

/* ---------- Опыт, уровни, награды ---------- */
const BADGES = [
  ['first', '🌱', 'Первый шаг', 'Пройди первый урок', () => Object.keys(S.done).length >= 1],
  ['perfect', '💎', 'Без ошибок', 'Пройди урок без единой ошибки', () => S.perfect >= 1],
  ['streak3', '🔥', 'Огонь', 'Занимайся 3 дня подряд', () => S.streak >= 3],
  ['streak30', '🌋', 'Месяц подряд', 'Занимайся 30 дней подряд', () => S.streak >= 30],
  ['lvl12', '🥇', 'Уровень 12', 'Набери 3900 XP', () => S.xp >= 3900],
  ['unit', '🏅', 'Раздел пройден', 'Пройди все 3 урока раздела', () => UNITS.some((u, i) => [0, 1, 2].every(p => S.done[doneKey(i, p)]))],
  ['b1', '🎓', 'Ступень B1', 'Дойди до среднего уровня', () => UNITS[curUnit()].si >= 2],
  ['c1', '👑', 'Ступень C1', 'Дойди до продвинутого уровня', () => UNITS[curUnit()].si >= 4],
  ['blitz', '⚡', 'Молния', 'Набери 15 очков в Блице', () => S.blitz >= 15],
  ['memory', '🧠', 'Память слона', 'Пройди Memory за 14 ходов', () => S.memory > 0 && S.memory <= 14],
];
function checkBadges() {
  BADGES.forEach(b => { if (!S.badges[b[0]] && b[4]()) { S.badges[b[0]] = 1; toast(b[1] + ' Награда: ' + b[2] + '!'); } });
}
function addXp(n) {
  const before = levelOf(S.xp);
  S.xp += n;
  const d = dayStr(new Date());
  if (S.daily.d !== d) S.daily = { d, xp: 0 };
  S.daily.xp += n;
  if (levelOf(S.xp) > before) toast('🎊 Новый уровень: ' + levelOf(S.xp) + '!');
  checkBadges(); save();
}
function touchStreak() {
  const today = dayStr(new Date()), y = new Date(); y.setDate(y.getDate() - 1);
  if (S.last !== today) { S.streak = S.last === dayStr(y) ? S.streak + 1 : 1; S.last = today; }
}

/* ---------- Вкладки ---------- */
let tab = 'learn', firstScroll = true;
try { history.scrollRestoration = 'manual'; } catch (e) {}
function tabbar() {
  return '<nav class="tabs">' + [['learn', '🏠', 'Учиться'], ['goal', '🎯', 'Цель'], ['games', '🎮', 'Игры'], ['me', '🏆', 'Профиль']].map(t =>
    `<button class="${tab === t[0] ? 'on' : ''}" onclick="setTab('${t[0]}')"><span>${t[1]}</span>${t[2]}</button>`).join('') + '</nav>';
}
function setTab(t) { stopGames(); tab = t; sfx.tap(); render(); window.scrollTo(0, 0); }
function render() {
  if (!S.placed) return welcome();
  tab === 'learn' ? home() : tab === 'goal' ? goals() : tab === 'games' ? games() : profile();
}

function welcome() {
  app.innerHTML = `<div class="lesson"><div class="result"><div class="big pop">🦊</div><h2>Какой у вас уровень английского?</h2><p>Тест займёт пару минут и подберёт уроки под вас, чтобы не начинать с простых слов.</p></div><div class="foot"><button class="btn" onclick="placement()">Я уже знаю английский — пройти тест</button><p></p><button class="btn blue" onclick="S.placed=true;save();render()">Начинаю с нуля</button></div></div>`;
}

function home() {
  const dx = dailyXp(), due = dueKeys().length, cur = curUnit();
  let html = `<div class="top"><span class="logo">🦊 ${STAGES[UNITS[cur].si].id} · ${score()}</span><span class="stats"><span>🔥 ${S.streak}</span><span>⭐ ${S.xp}</span></span></div><div class="path">`;
  html += `<div class="goal"><div class="fox">🦊</div><div style="flex:1"><div class="gt">${dx >= GOAL ? 'Цель дня выполнена! 🎉' : 'Цель дня: ' + dx + ' / ' + GOAL + ' XP'}</div><div class="progress"><div style="width:${Math.min(100, dx / GOAL * 100)}%"></div></div></div></div>`;
  if (due) html += `<button class="gcard review" style="--c:#ff9600" onclick="startReview()"><b>🧠</b><div><h3>Пора повторить: ${due}</h3><p>Эти слова скоро забудутся — закрепите их сейчас</p></div></button>`;
  let prev = true, k = 0;
  UNITS.slice(0, MAIN).forEach((u, ui) => {
    const [c, cd] = PAL[ui % PAL.length], st = STAGES[u.si];
    if (st.units[0] === ui) {
      const ahead = ui > cur;
      html += `<div class="stage"><b>${st.id}</b> ${st.name}${ahead ? `<button onclick="startJump(${u.si})">⏩ Перейти сюда</button>` : ''}</div>`;
    }
    html += `<div class="unit-head" style="background:${c};box-shadow:0 5px 0 ${cd}"><small>Раздел ${ui + 1} · ${u.lvl}</small>${u.icon} ${u.title}</div><div class="nodes">`;
    [0, 1, 2].forEach(p => {
      const d = doneOf(ui, p), locked = !prev, isCur = !locked && !d;
      const off = Math.round(Math.sin(k++ * 1.2) * 60);
      html += `<div class="nrow" style="transform:translateX(${off}px)">${isCur ? '<div class="start">СТАРТ</div>' : ''}<button class="node ${d ? 'done' : ''} ${locked ? 'locked' : ''} ${isCur ? 'cur' : ''}" style="--c:${c};--cd:${cd}" ${locked ? 'disabled' : ''} onclick="startLesson(${ui},${p})">${locked ? '🔒' : d ? '✓' : ['★', '💬', '🏆'][p]}</button><div class="stars">${'⭐'.repeat(S.done[doneKey(ui, p)] || 0)}</div></div>`;
      prev = !!d;
    });
    html += '</div>';
  });
  html += '</div>' + tabbar();
  app.innerHTML = html;
  if (firstScroll) { firstScroll = false; setTimeout(() => { const n = document.querySelector('.node.cur'); if (n) n.scrollIntoView({ block: 'center' }); }, 50); }
}

/* ---------- Вкладка «Цель» ---------- */
function goals() {
  const nextSet = SETS.findIndex((s, i) => !S.sets[i]), doneSets = Object.keys(S.sets).length;
  const nextVoa = VOA.findIndex((v, i) => !S.voa[i]), doneVoa = Object.keys(S.voa).length;
  let html = `<div class="top"><span class="logo">🎯 Цель</span><span class="stats"><span>🔥 ${S.streak}</span><span>⭐ ${S.xp}</span></span></div><div class="path pr">
    <p class="intro">Понимать сериалы и свободно общаться в чате на стриме. Разделы открыты сразу, идите в любом порядке.</p>`;
  html += `<div class="gsec"><h3>📺 Видеоуроки</h3><p>Курс Let's Learn English: живая речь актёров с текстом. Пройдено ${doneVoa} из ${VOA.length}</p>
    ${nextVoa >= 0 ? `<button class="btn" onclick="openVoa(${nextVoa})">${VOA[nextVoa].t}</button>` : ''}
    <details><summary>Все уроки</summary>${VOA.map((v, i) => `${!i || VOA[i - 1].g !== v.g ? `<h4>${v.g}</h4>` : ''}<button class="vrow" onclick="openVoa(${i})">${S.voa[i] ? '✅' : '▶️'} ${v.t}</button>`).join('')}</details></div>`;
  html += `<div class="gsec"><h3>💬 Живые фразы</h3><p>Реальные разговорные фразы: сказать, услышать, записать. Пройдено наборов ${doneSets} из ${SETS.length}</p>
    ${nextSet >= 0 ? `<button class="btn blue" onclick="startSet(${nextSet})">${SETS[nextSet].title}</button>` : ''}</div>`;
  GOAL_TRACKS.forEach(t => {
    html += `<div class="gsec"><h3>${t.icon} ${t.title}</h3><p>${t.note}</p>${t.units.map(u => `<div class="urow"><span>${u.icon} ${u.title}</span><div>${[0, 1, 2].map(p => `<button class="${S.done[doneKey(u.ui, p)] ? 'on' : ''}" onclick="startLesson(${u.ui},${p})">${S.done[doneKey(u.ui, p)] ? '✓' : ['★', '💬', '🏆'][p]}</button>`).join('')}</div></div>`).join('')}</div>`;
  });
  html += `<div class="gsec"><h3>🍿 Как смотреть сериалы</h3>${WATCH_STEPS.map(s => `<p><b>${s[0]}.</b> ${s[1]}</p>`).join('')}<h4>Что ещё посмотреть</h4>${WATCH_LINKS.map(l => `<p><a href="${l[1]}" target="_blank" rel="noopener">${l[0]}</a><br><small>${l[2]}</small></p>`).join('')}</div>`;
  html += `<p class="hint">Видео и тексты: <a href="https://learningenglish.voanews.com/" target="_blank" rel="noopener">VOA Learning English</a>. Фразы: <a href="sentence-credits.html" target="_blank">Tatoeba</a></p></div>`;
  app.innerHTML = html + tabbar();
}

function startSet(i) {
  sfx.tap();
  const P = SETS[i].phrases, kinds = SETS[i].si < 2 ? [0, 'say', 5, 1, 0, 3] : [0, 5, 'say', 4, 3, 1];
  const qs = shuffle(P).slice(0, 12).map((p, k) => { const t = kinds[k % kinds.length]; return t === 'say' ? (canSpeak() ? speakQ(p) : phraseQ(p, 5, P)) : phraseQ(p, t, P); });
  newLesson(qs, { practice: true, bonus: true, set: i });
  question();
}

function openVoa(i) {
  const v = VOA[i];
  stopGames();
  app.innerHTML = `<div class="lesson"><div class="bar"><button class="x" onclick="render()">✕</button><h2 style="margin:0;flex:1">${v.t}</h2></div>
    ${v.v ? `<video class="vid" controls playsinline preload="none" src="${v.v}"></video>` : ''}
    ${v.a ? `<p class="sub">Только звук:</p><audio class="aud" controls preload="none" src="${v.a}"></audio>` : ''}
    <p class="sub">Сначала посмотрите без текста, потом с текстом, а затем тренируйте диалог.</p>
    <details class="dlg"><summary>Показать диалог</summary>${v.l.map(l => `<p><b>${l[0]}:</b> ${l[1]}</p>`).join('')}</details>
    <p class="hint"><a href="https://learningenglish.voanews.com${v.u}" target="_blank" rel="noopener">Источник: VOA Learning English</a></p>
    <div class="foot"><button class="btn" onclick="startVoa(${i})">Тренировать диалог</button></div></div>`;
  window.scrollTo(0, 0);
}
function startVoa(i) {
  // реплики без учебных вставок ведущего, средней длины: их удобно повторить и записать
  const lines = VOA[i].l.filter(l => !/bot/i.test(l[0]) && l[1].split(' ').length >= 3 && l[1].split(' ').length <= 12 && /^[\x20-\x7e]+$/.test(l[1]));
  const pool = shuffle(lines).slice(0, 8).map(l => { const p = [l[1], '']; p.si = 2; return p; });
  if (!pool.length) return render();
  const qs = pool.map((p, k) => {
    const q = k % 3 === 0 && canSpeak() ? speakQ(p) : phraseQ(p, k % 3 === 1 ? 5 : 2, pool);
    q.key = '';
    return q;
  });
  newLesson(qs, { practice: true, bonus: true, voa: i });
  question();
}

/* ---------- Генерация заданий ---------- */
const slug = w => w[0].replace(/ /g, '-');
const hasPhoto = w => PHOTOS.has(slug(w));
// настоящее фото, а если его нет — эмодзи или свой рисунок
const photo = (w, cls) => hasPhoto(w) ? `<img class="${cls}" src="img/${slug(w)}.jpg" alt="">` : w[2] || '';
const hint = w => hasPhoto(w) ? photo(w, 'th') + ' ' : w[2] ? w[2] + ' ' : '';
const speakQ = item => ({ type: 'speak', key: item[0], prompt: item[0], sub: item[1], say: item[0], answer: item[0] });
// картинка без подписи: нужно самому вспомнить слово и сказать его
function picSayQ(w) {
  const scene = KEY[w[0]].unit.scene;
  return { type: 'speak', pic: photo(w, 'ph'), key: w[0], head: scene ? 'Что он делает?' : 'Что на картинке?', answer: scene ? 'He is ' + w[0] : w[0], kw: scene ? w[0] : '', audio: scene ? 'He is ' + w[0] : w[0] };
}
const addPics = (qs, W, n) => { if (W.every(w => w[2])) shuffle(W).slice(0, n).forEach(w => qs.push(picSayQ(w))); };
function wordQ(w, kind, pool) {
  if (kind === 4 && !w[2]) kind = 1;
  const o = (n, i) => pick(pool, w, n).map(x => x[i]);
  switch (kind) {
    case 0: return { type: 'choice', key: w[0], head: 'Переведите на русский', prompt: hint(w) + w[0], say: w[0], answer: w[1], options: shuffle([w[1], ...o(3, 1)]) };
    case 1: return { type: 'choice', key: w[0], head: 'Переведите на английский', prompt: hint(w) + w[1], audio: w[0], answer: w[0], options: shuffle([w[0], ...o(3, 0)]) };
    case 2: return { type: 'listen', key: w[0], say: w[0], answer: w[0], options: shuffle([w[0], ...o(3, 0)]) };
    case 3: return { type: 'type', key: w[0], prompt: hint(w) + w[1], audio: w[0], answer: w[0] };
    default: return { type: 'pic', key: w[0], say: w[0], prompt: w[0], answer: photo(w, 'ph'), options: shuffle([photo(w, 'ph'), ...pick(pool.filter(x => x[2]), w, 3).map(x => photo(x, 'ph'))]) };
  }
}
function phraseQ(p, kind, pool) {
  const words = p[0].split(' '), same = STAGES[p.si].phrases;
  if (kind === 1) return { type: 'choice', key: p[0], head: 'Переведите на русский', prompt: p[0], say: p[0], answer: p[1], options: shuffle([p[1], ...pick(pool, p, 3).map(x => x[1])]) };
  if (kind === 4) return { type: 'sent', key: p[0], prompt: p[1], audio: p[0], answer: p[0] };
  if (kind === 5) return { type: 'sent', key: p[0], head: 'Напишите, что услышали', say: p[0], answer: p[0] };
  if (kind === 3) {
    const long = words.map((w, i) => strip(w).length >= 4 ? i : -1).filter(i => i >= 0);
    const idx = rnd(long.length ? long : words.map((w, i) => i));
    const ans = strip(words[idx]).toLowerCase(), m = words[idx].match(/[.,!?;:]*$/)[0];
    const others = [...new Set(same.flatMap(x => x[0].split(' ').map(strip)).map(x => x.toLowerCase()).filter(x => x.length >= 3 && x !== ans))];
    const shown = words.map((w, i) => i === idx ? '_____' + m : w).join(' ');
    return { type: 'choice', key: p[0], head: 'Вставьте пропущенное слово', prompt: shown, sub: p[1], audio: p[0], answer: ans, full: p[0], options: shuffle([ans, ...shuffle(others).slice(0, 3)]) };
  }
  const extra = [...new Set(shuffle(same.filter(x => x !== p).flatMap(x => x[0].split(' '))).filter(x => !words.includes(x)))].slice(0, 2);
  const q = { type: 'build', key: p[0], answer: p[0], audio: p[0], tiles: shuffle([...words, ...extra]) };
  if (kind === 2) { q.head = 'Что вы слышите?'; q.say = p[0]; }
  else { q.head = 'Составьте предложение'; q.prompt = p[1]; }
  return q;
}
const matchQ = words => { const ps = shuffle(words).slice(0, 5); return { type: 'match', pairs: ps, answer: ps.map(x => x[0]).join(', ') }; };

// чем выше ступень, тем меньше подсказок и больше письма
function buildLesson(ui, part) {
  const W = UNITS[ui].words, P = UNITS[ui].phrases, si = UNITS[ui].si, hard = si >= 2, qs = [];
  const pics = UNITS[ui].pics;
  if (part === 0) {
    const ws = shuffle(W), kinds = hard && !pics ? [0, 2, 1, 3, 0, 3, 2, 1] : [4, 0, 2, 3, 1, 4, 2, 0];
    ws.slice(0, 8).forEach((w, i) => qs.push(wordQ(w, kinds[i], W)));
    qs.splice(4, 0, matchQ(W));
    qs.push(wordQ(ws[8], 3, W));
    if (canSpeak()) qs.splice(7, 0, speakQ(ws[9]));
    addPics(qs, W, pics ? 3 : 1);
    return qs;
  }
  if (part === 1) {
    const kinds = hard ? [0, 3, 2, 4, 3] : [0, 3, 2, 1, 0];
    shuffle(P).forEach((p, i) => qs.push(phraseQ(p, kinds[i], P)));
    shuffle(W).slice(0, 4).forEach((w, i) => qs.push(wordQ(w, (si >= 3 ? [3, 3, 2, 1] : [2, 1, 3, 0])[i], W)));
    if (canSpeak()) shuffle(P).slice(0, 2).forEach(p => qs.push(speakQ(p)));
    addPics(qs, W, pics ? 3 : 1);
    return shuffle(qs);
  }
  qs.push(matchQ(W));
  shuffle(P).slice(0, 3).forEach(p => qs.push(phraseQ(p, 3, P)));
  shuffle(P).slice(0, 2).forEach(p => qs.push(phraseQ(p, 2, P)));
  if (hard) shuffle(P).slice(0, 2).forEach(p => qs.push(phraseQ(p, 4, P)));
  shuffle(W).slice(0, 3).forEach(w => qs.push(wordQ(w, 3, W)));
  shuffle(W).slice(0, 2).forEach(w => qs.push(wordQ(w, hard ? 2 : 4, W)));
  if (canSpeak()) { const ps = shuffle(P); qs.push(speakQ(ps[0]), speakQ(ps[1]), speakQ(rnd(W))); }
  addPics(qs, W, pics ? 4 : 2);
  return shuffle(qs);
}

/* ---------- Говорение ---------- */
// NO_MIC задаёт страница там, где микрофон запрещён площадкой
const SR = window.NO_MIC ? null : window.SpeechRecognition || window.webkitSpeechRecognition;
const canSpeak = () => !!SR && !S.noMic;
const DIGITS = { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten' };
// распознавание часто пишет gonna как going to, поэтому сравниваем полные формы
const SHORT = { gonna: 'going to', wanna: 'want to', gotta: 'got to', kinda: 'kind of', sorta: 'sort of', dunno: 'do not know', lemme: 'let me', gimme: 'give me', "y'know": 'you know' };
const spokenWords = s => expand(s).replace(/\b\d+\b/g, d => DIGITS[d] || d).replace(/[a-z']+/g, w => SHORT[w] || w).split(' ').filter(Boolean);
// небольшие расхождения прощаются: распознавание не идеально, особенно с акцентом
function spokenOk(alts, target) {
  const t = spokenWords(target);
  return alts.some(a => {
    const w = spokenWords(a);
    const hit = t.filter(x => w.some(y => y === x || ((x.length >= 4 || t.length === 1) && lev(x, y) <= 1))).length;
    return hit / t.length >= (t.length <= 2 ? 1 : 0.75);
  });
}
let rec = null;
function micStop() { if (rec) { const r = rec; rec = null; r.onend = r.onerror = r.onresult = null; try { r.abort(); } catch (e) {} } }
function micStatus(text, cls) {
  const m = document.getElementById('mic'), s = document.getElementById('micsay');
  if (m) m.classList.toggle('on', cls === 'on');
  if (s) s.textContent = text;
}
function micStart() {
  if (L.checked) return;
  if (rec) { rec.stop(); return; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  let alts = [], ended = false, timer;
  const r = new SR();
  r.lang = 'en-US'; r.interimResults = true; r.continuous = false; r.maxAlternatives = 5;
  const stopSoon = ms => { clearTimeout(timer); timer = setTimeout(() => { if (rec === r) r.stop(); }, ms); };
  r.onresult = e => {
    alts = [];
    for (const res of e.results) for (let i = 0; i < res.length; i++) alts.push(res[i].transcript);
    const best = Array.from(e.results).map(x => x[0].transcript).join(' ');
    alts.push(best);
    micStatus('Слышу: ' + best, 'on');
    stopSoon(1500); // Safari на iPhone сам не всегда замечает конец фразы
  };
  r.onerror = e => {
    clearTimeout(timer); rec = null; ended = true;
    micStatus(e.error === 'not-allowed' || e.error === 'service-not-allowed'
      ? 'Нет доступа к микрофону. Откройте приложение в Safari и разрешите микрофон и распознавание речи.'
      : e.error === 'no-speech' ? 'Ничего не услышал. Нажмите и скажите ещё раз.' : 'Не получилось распознать. Попробуйте ещё раз.');
  };
  r.onend = () => {
    clearTimeout(timer);
    if (ended) return;
    rec = null;
    if (!alts.length) return micStatus('Ничего не услышал. Нажмите и скажите ещё раз.');
    micResult(alts);
  };
  rec = r;
  try { r.start(); micStatus('Говорите…', 'on'); stopSoon(8000); }
  catch (e) { rec = null; micStatus('Микрофон занят. Попробуйте ещё раз.'); }
}
function micResult(alts) {
  const q = L.queue[0];
  micStatus('');
  if (spokenOk(alts, q.answer) || (q.kw && alts.some(a => spokenWords(a).includes(q.kw)))) return resolve(true);
  L.tries = (L.tries || 0) + 1;
  if (L.tries >= 3) return micPass('Не страшно, вернёмся к этому в повторении.');
  const clue = q.pic ? ` Подсказка: начинается на «${(q.kw || q.answer)[0]}».` : '';
  micStatus(`Услышал: «${alts[alts.length - 1]}». Попытка ${L.tries + 1} из 3.${clue}`);
  sfx.bad(); vib(40);
}
// говорение не отнимает жизни: микрофон и шум — не вина ученика
function micPass(msg) {
  micStop();
  const q = L.queue[0];
  L.checked = true; L.correct++; L.queue.shift();
  document.getElementById('fb').innerHTML = `<div class="fb note"><span class="m">🦊</span><div><b>${msg}</b>${q.pic ? '<div>Правильно: ' + q.answer + '</div>' : ''}</div></div>`;
  if (q.pic) setTimeout(() => speak(q.audio), 200);
  const pg = document.getElementById('pg'); if (pg) pg.style.width = L.correct / L.total * 100 + '%';
  document.querySelector('.foot .skip').remove();
  const go = document.createElement('button');
  go.id = 'go'; go.className = 'btn'; go.textContent = 'Продолжить'; go.onclick = check;
  document.querySelector('.foot').appendChild(go);
  save();
}
function micOff() {
  S.noMic = true; save();
  L.queue.filter((q, i) => i && q.type === 'speak' && !q.pic).forEach(q => { L.queue.splice(L.queue.indexOf(q), 1); L.total--; });
  micPass('Говорение выключено. Включить его можно в профиле.');
}

// вопрос по уже изученному: чем лучше слово запомнено, тем сложнее задание
function reviewQ(key, box) {
  const { item, unit } = KEY[key];
  if (item.length === 2 && unit.phrases.includes(item)) {
    const kinds = box <= 1 ? [0, 1] : unit.si >= 2 ? [2, 3, 4] : [2, 3];
    return phraseQ(item, rnd(kinds), unit.phrases);
  }
  return wordQ(item, rnd(box <= 1 ? [0, 1] : box <= 3 ? [1, 2, 3] : [3]), unit.words);
}

/* ---------- Урок ---------- */
let L = null;
function newLesson(qs, extra) {
  L = Object.assign({ queue: qs, total: qs.length, correct: 0, hearts: 5, mistakes: 0, combo: 0, best: 0, xp: 0, sel: [], chosen: null, checked: false }, extra);
}
function startLesson(ui, part) {
  sfx.tap();
  newLesson(buildLesson(ui, part), { ui, part });
  part === 0 ? learnScreen() : question();
}
function startReview() {
  const keys = shuffle(dueKeys()).slice(0, 12);
  if (!keys.length) return render();
  newLesson(keys.map(k => reviewQ(k, S.srs[k].b)), { practice: true });
  question();
}
function startPractice() {
  const keys = shuffle(S.mistakes.filter(k => KEY[k])).slice(0, 8);
  if (!keys.length) { S.mistakes = []; save(); return games(); }
  newLesson(keys.map(k => reviewQ(k, 2)), { practice: true });
  question();
}
function startPicGame() {
  const pool = UNITS.slice(0, curUnit() + 1).flatMap(u => u.words).filter(w => w[2]);
  newLesson(shuffle(pool).slice(0, 10).map(picSayQ), { practice: true, picGame: true });
  question();
}
function startJump(si) {
  const units = STAGES[si - 1].units, qs = [];
  shuffle(units).concat(shuffle(units)).slice(0, 12).forEach((u, i) => {
    const un = UNITS[u];
    qs.push(i % 3 === 2 ? phraseQ(rnd(un.phrases), rnd([3, 0]), un.phrases) : wordQ(rnd(un.words), rnd([0, 1, 3]), un.words));
  });
  newLesson(qs, { jump: si, hearts: 3 });
  question();
}

function bar() {
  return `<div class="bar"><button class="x" onclick="quit()">✕</button><div class="progress"><div id="pg" style="width:${L.correct / L.total * 100}%"></div></div><span class="hearts" id="hr">❤️ ${L.hearts}</span></div>`;
}
function ask(msg, yes) {
  const d = document.createElement('div');
  d.className = 'ask';
  d.innerHTML = `<div><p>${msg}</p><button class="btn red" id="askY">Да</button><p></p><button class="btn blue" id="askN">Отмена</button></div>`;
  document.body.appendChild(d);
  d.querySelector('#askN').onclick = () => d.remove();
  d.querySelector('#askY').onclick = () => { d.remove(); yes(); };
}
function quit() {
  ask('Выйти из урока? Прогресс урока потеряется.', () => { speechSynthesis && speechSynthesis.cancel(); micStop(); L = null; render(); });
}
function resetAll() {
  ask('Стереть весь прогресс?', () => { try { localStorage.removeItem('englishup2'); } catch (e) {} location.reload(); });
}

function learnScreen() {
  const u = UNITS[L.ui];
  const tip = u.tip ? `<div class="tip"><b>💡 Подсказка</b>${u.tip}</div>` : '';
  app.innerHTML = `<div class="lesson">${bar()}<h2>${u.icon} Новые слова<br><small>Нажимайте на карточки, чтобы услышать</small></h2>${tip}<div class="cards">${u.words.map((w, i) =>
    `<button class="card" onclick="speak(UNITS[${L.ui}].words[${i}][0]);this.classList.add('seen')">${w[2] ? `<b>${photo(w, 'ph')}</b>` : ''}<span>${w[0]}</span><small>${w[1]}</small></button>`).join('')}</div><div class="foot"><button class="btn" onclick="question()">Начать урок</button></div></div>`;
}

function question() {
  const q = L.queue[0];
  if (!q) return finish();
  L.sel = []; L.chosen = null; L.checked = false; L.mp = {}; L.mdone = 0; L.tries = 0;
  micStop();
  if (q.type === 'speak' && !canSpeak()) {
    // без микрофона картинку называют письменно
    if (q.pic) L.queue[0] = Object.assign({}, q, { type: 'type' }); else { L.queue.shift(); L.total--; }
    return question();
  }
  const spk = q.say ? '<button class="spk" onclick="speak(L.queue[0].say)">🔊</button><button class="spk slow" onclick="speak(L.queue[0].say,0.55)">🐢</button>' : '';
  const inp = `<input class="txt" id="inp" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="Ответ" oninput="document.getElementById('go').disabled=!this.value.trim()">`;
  let body = '';
  if (q.type === 'choice' || q.type === 'listen') {
    body = `<h2>${q.type === 'listen' ? 'Что вы слышите?' : q.head}</h2><div class="prompt">${q.type === 'listen' ? spk : spk + '<span>' + q.prompt + '</span>'}</div>${q.sub ? '<p class="sub">' + q.sub + '</p>' : ''}`;
    body += `<div class="opts">${q.options.map((o, i) => `<button class="opt" id="o${i}" onclick="choose(${i})">${o}</button>`).join('')}</div>`;
  } else if (q.type === 'pic') {
    body = `<h2>Выберите картинку</h2><div class="prompt">${spk}<span>${q.prompt}</span></div><div class="opts pics">${q.options.map((o, i) => `<button class="opt" id="o${i}" onclick="choose(${i})">${o}</button>`).join('')}</div>`;
  } else if (q.type === 'type') {
    body = `<h2>${q.head || 'Напишите по-английски'}</h2>${q.pic ? `<div class="pic">${q.pic}</div>` : `<div class="prompt"><span>${q.prompt}</span></div>`}${inp}`;
  } else if (q.type === 'sent') {
    body = `<h2>${q.head || 'Переведите предложение'}</h2><div class="prompt">${spk}<span>${q.prompt || ''}</span></div>${inp}`;
  } else if (q.type === 'build') {
    body = `<h2>${q.head}</h2><div class="prompt">${spk}<span>${q.say ? '' : q.prompt}</span></div><div class="answer" id="ans"></div><div class="tiles" id="tiles"></div>`;
  } else if (q.type === 'speak') {
    body = q.pic ? `<h2>${q.head}</h2><div class="pic">${q.pic}</div>` : `<h2>Скажите вслух</h2><div class="prompt">${spk}<span>${q.prompt}</span></div><p class="sub">${q.sub || ''}</p>`;
    body += `<button class="mic" id="mic" onclick="micStart()">🎤</button><p class="micsay" id="micsay">${q.pic ? 'Нажмите на микрофон и скажите по-английски' : 'Нажмите на микрофон и произнесите'}</p>`;
  } else {
    L.ml = shuffle(q.pairs); L.mr = shuffle(q.pairs);
    body = `<h2>Найдите пары</h2><div class="match"><div>${L.ml.map((w, i) => `<button class="opt" id="l${i}" onclick="mtap('l',${i})">${hint(w)}${w[0]}</button>`).join('')}</div><div>${L.mr.map((w, i) => `<button class="opt" id="r${i}" onclick="mtap('r',${i})">${w[1]}</button>`).join('')}</div></div>`;
  }
  const btn = q.type === 'speak'
    ? `<div class="skip"><button class="btn blue" onclick="micPass('Хорошо, идём дальше.')">Сейчас не могу говорить</button><p></p><button class="linkbtn" onclick="micOff()">Выключить говорение</button></div>`
    : q.type === 'match' ? '' : '<button class="btn" id="go" disabled onclick="check()">Проверить</button>';
  app.innerHTML = `<div class="lesson">${bar()}${body}<div class="foot"><div id="fb"></div>${btn}</div></div>`;
  if (q.type === 'build') renderTiles();
  if (q.say) setTimeout(() => speak(q.say), 300);
}

function choose(i) {
  if (L.checked) return;
  sfx.tap();
  L.chosen = i;
  document.querySelectorAll('.opt').forEach((b, j) => b.classList.toggle('sel', j === i));
  document.getElementById('go').disabled = false;
}

function renderTiles() {
  const q = L.queue[0];
  document.getElementById('ans').innerHTML = L.sel.map(i => `<button class="tile" onclick="untile(${i})">${q.tiles[i]}</button>`).join('');
  document.getElementById('tiles').innerHTML = q.tiles.map((t, i) => `<button class="tile ${L.sel.includes(i) ? 'used' : ''}" onclick="tile(${i})">${t}</button>`).join('');
  document.getElementById('go').disabled = !L.sel.length;
}
function tile(i) { if (L.checked) return; sfx.tap(); L.sel.push(i); renderTiles(); }
function untile(i) { if (L.checked) return; L.sel = L.sel.filter(x => x !== i); renderTiles(); }

function mtap(side, i) {
  if (L.checked) return;
  const el = document.getElementById(side + i);
  if (el.classList.contains('gone')) return;
  if (side === 'l') speak(L.ml[i][0]); else sfx.tap();
  if (L.mp[side] !== undefined) document.getElementById(side + L.mp[side]).classList.remove('sel');
  L.mp[side] = i; el.classList.add('sel');
  if (L.mp.l === undefined || L.mp.r === undefined) return;
  const a = L.ml[L.mp.l], b = L.mr[L.mp.r], la = document.getElementById('l' + L.mp.l), rb = document.getElementById('r' + L.mp.r);
  L.mp = {};
  if (a === b) {
    [la, rb].forEach(e => { e.classList.remove('sel'); e.classList.add('ok'); setTimeout(() => e.classList.add('gone'), 350); });
    sfx.ok();
    if (++L.mdone === L.queue[0].pairs.length) setTimeout(() => resolve(true), 500);
  } else {
    [la, rb].forEach(e => { e.classList.remove('sel'); e.classList.add('bad'); setTimeout(() => e.classList.remove('bad'), 500); });
    sfx.bad(); vib(80);
    srsMark(a[0], false);
    L.hearts--; L.mistakes++; L.combo = 0; updHearts();
    if (L.hearts <= 0) { L.checked = true; setTimeout(failed, 700); }
  }
}

function updHearts() { const h = document.getElementById('hr'); if (h) h.textContent = '❤️ ' + L.hearts; }

function check() {
  if (L.checked) return next();
  const q = L.queue[0], typed = q.type === 'type' || q.type === 'sent';
  let user;
  if (q.options) user = q.options[L.chosen];
  else if (typed) user = document.getElementById('inp').value;
  else user = L.sel.map(i => q.tiles[i]).join(' ');
  const a = expand(user), b = expand(q.answer);
  let ok = a === b || (!!q.kw && a.split(' ').includes(q.kw)), typo = false;
  if (!ok && typed) {
    const lim = b.length >= 14 ? 2 : b.length >= 5 ? 1 : 0; // опечатка не считается ошибкой
    if (lim && lev(a, b) <= lim) { ok = true; typo = true; }
  }
  if (q.options) document.querySelectorAll('.opt').forEach((el, j) => {
    if (q.options[j] === q.answer) el.classList.add('ok'); else if (j === L.chosen) el.classList.add('bad');
  });
  if (typed) document.getElementById('inp').blur();
  resolve(ok, typo);
}

function resolve(ok, typo) {
  const q = L.queue[0];
  L.checked = true;
  let extra = '';
  if (q.key) srsMark(q.key, ok);
  if (ok) {
    if (q.pairs) q.pairs.forEach(w => srsMark(w[0], true));
    L.correct++; L.combo++; L.best = Math.max(L.best, L.combo); L.xp += L.combo >= 3 ? 3 : 2;
    L.queue.shift();
    if (L.practice && q.key) S.mistakes = S.mistakes.filter(k => k !== q.key);
    if (typo) extra = `<div>Опечатка, правильно: ${q.answer}</div>`;
    else if (L.combo >= 3) extra = `<div>🔥 Комбо x${L.combo}!</div>`;
    sfx.ok(); vib(20);
  } else {
    L.hearts--; L.mistakes++; L.combo = 0;
    L.queue.push(L.queue.shift());
    if (q.key && !S.mistakes.includes(q.key)) { S.mistakes.push(q.key); S.mistakes = S.mistakes.slice(-40); }
    sfx.bad(); vib(80);
    const sc = document.querySelector('.lesson'); sc.classList.add('shake'); setTimeout(() => sc.classList.remove('shake'), 400);
  }
  save();
  const shown = q.type === 'pic' ? q.answer + ' ' + q.prompt : q.full || q.answer;
  document.getElementById('fb').innerHTML = ok
    ? `<div class="fb ok"><span class="m">🦊</span><div><b>${rnd(GOOD)}</b>${extra}</div></div>`
    : `<div class="fb bad"><span class="m">🦊</span><div><b>${rnd(BAD)}</b><div>Правильно: ${shown}</div></div></div>`;
  const pg = document.getElementById('pg'); if (pg) pg.style.width = L.correct / L.total * 100 + '%';
  updHearts();
  const skip = document.querySelector('.foot .skip'); if (skip) skip.remove();
  let go = document.getElementById('go');
  if (!go) { go = document.createElement('button'); go.id = 'go'; go.className = 'btn'; go.onclick = check; document.querySelector('.foot').appendChild(go); }
  go.textContent = 'Продолжить'; go.disabled = false; go.classList.toggle('red', !ok);
  const a = q.audio || q.say;
  if (a) setTimeout(() => speak(a), 200);
}

function next() { L.hearts <= 0 ? failed() : question(); }

function failed() {
  speechSynthesis && speechSynthesis.cancel();
  const again = L.set !== undefined ? `startSet(${L.set})` : L.voa !== undefined ? `startVoa(${L.voa})` : L.jump ? `startJump(${L.jump})` : L.picGame ? 'startPicGame()' : L.practice ? 'startReview()' : `startLesson(${L.ui},${L.part})`;
  app.innerHTML = `<div class="lesson"><div class="result"><div class="big sad">🦊💔</div><h2>${L.jump ? 'Пока не получилось' : 'Жизни закончились'}</h2><p>Повторение — это путь к успеху. Попробуйте ещё раз, это бесплатно.</p></div><div class="foot"><button class="btn" onclick="${again}">Попробовать снова</button><p></p><button class="btn red" onclick="L=null;render()">На главную</button></div></div>`;
}

function finish() {
  if (L.jump) {
    const first = STAGES[L.jump].units[0];
    if (first > skipIdx()) S.skip = UNITS[first].id;
    touchStreak(); addXp(20); sfx.win(); confetti();
    app.innerHTML = `<div class="lesson"><div class="result"><div class="big pop">⏩</div><h2>Ступень ${STAGES[L.jump].id} открыта!</h2><div class="nums"><div>⭐ +20 XP</div><div>🎓 ${score()}</div></div></div><div class="foot"><button class="btn" onclick="L=null;firstScroll=true;render()">Продолжить</button></div></div>`;
    return;
  }
  const perfect = L.mistakes === 0, stars = perfect ? 3 : L.mistakes <= 2 ? 2 : 1;
  const gain = L.xp + (L.practice && !L.bonus ? 0 : 10) + (perfect ? 5 : 0);
  if (L.set !== undefined) S.sets[L.set] = Math.max(S.sets[L.set] || 0, stars);
  if (L.voa !== undefined) S.voa[L.voa] = Math.max(S.voa[L.voa] || 0, stars);
  if (!L.practice) {
    const key = doneKey(L.ui, L.part);
    S.done[key] = Math.max(S.done[key] || 0, stars);
    if (perfect) S.perfect++;
  }
  touchStreak(); addXp(gain);
  sfx.win(); confetti();
  const msg = perfect ? 'Идеально! Ни одной ошибки!' : stars === 2 ? 'Очень хорошо!' : 'Урок пройден!';
  app.innerHTML = `<div class="lesson"><div class="result"><div class="big pop">🦊🎉</div><h2>${msg}</h2><div class="starsbig">${[1, 2, 3].map(i => `<span class="${i <= stars ? 'on' : ''}" style="animation-delay:${i * 0.25}s">⭐</span>`).join('')}</div><div class="nums"><div>⭐ +${gain} XP</div><div>🔥 комбо ${L.best}</div><div>🎓 ${score()}</div></div></div><div class="foot"><button class="btn" onclick="L=null;render()">Продолжить</button></div></div>`;
}

document.addEventListener('keydown', e => {
  const go = document.getElementById('go');
  if (e.key === 'Enter' && L && go && !go.disabled) check();
});

/* ---------- Тест уровня ---------- */
const PN = 14; // вопросов в тесте
let T = null;
function placement() {
  sfx.tap();
  T = { pos: 1, n: 0, used: new Set() };
  placeQ();
}
function placeQ() {
  if (T.n >= PN) return placeEnd();
  const si = Math.round(T.pos), units = STAGES[si].units;
  let q, item, tries = 0;
  do {
    const u = UNITS[rnd(units)], usePhrase = Math.random() < 0.4;
    item = rnd(usePhrase ? u.phrases : u.words);
    q = usePhrase ? phraseQ(item, 3, u.phrases) : wordQ(item, rnd([0, 1]), u.words);
  } while (T.used.has(item[0]) && ++tries < 20);
  T.used.add(item[0]); T.q = q;
  app.innerHTML = `<div class="lesson"><div class="bar"><button class="x" onclick="T=null;render()">✕</button><div class="progress"><div style="width:${T.n / PN * 100}%"></div></div><span class="hearts">${T.n + 1}/${PN}</span></div><h2>${q.head}</h2><div class="prompt"><span>${q.prompt}</span></div>${q.sub ? '<p class="sub">' + q.sub + '</p>' : ''}<div class="opts">${q.options.map((o, i) => `<button class="opt" onclick="placeTap(${i})">${o}</button>`).join('')}</div><div class="foot"><button class="btn blue" onclick="placeTap(-1)">Не знаю</button></div></div>`;
}
function placeTap(i) {
  const ok = i >= 0 && T.q.options[i] === T.q.answer;
  sfx.tap();
  const step = T.n < 4 ? 1 : T.n < 9 ? 0.5 : 0.25;
  T.pos = Math.max(0, Math.min(4, T.pos + (ok ? step : -step)));
  T.n++;
  placeQ();
}
function placeEnd() {
  const si = Math.floor(T.pos + 0.001), st = STAGES[si];
  T = { si };
  sfx.win(); confetti();
  app.innerHTML = `<div class="lesson"><div class="result"><div class="big pop">🎓</div><h2>Ваш уровень: ${st.id}</h2><p>${st.name}. Оценка английского около ${st.from}.</p></div><div class="foot"><button class="btn" onclick="placeApply(${st.units[0]})">Начать с ${st.id}</button><p></p>${si ? '<button class="btn blue" onclick="placeApply(0)">Начать с самого начала</button>' : ''}</div></div>`;
}
function placeApply(u) {
  S.skip = UNITS[u].id; S.placed = true; T = null; firstScroll = true; tab = 'learn';
  checkBadges(); save(); render();
}

/* ---------- Игры ---------- */
let G = null;
function stopGames() { if (G && G.timer) clearInterval(G.timer); G = null; }
// слова текущего раздела и трёх предыдущих — по уровню ученика
const gamePool = () => { const c = curUnit(); return UNITS.slice(Math.max(0, c - 3), c + 1).flatMap(u => u.words); };

function games() {
  const due = dueKeys().length;
  app.innerHTML = `<div class="top"><span class="logo">🎮 Игры</span><span class="stats"><span>⭐ ${S.xp}</span></span></div><div class="path gm">
    <button class="gcard ${due ? '' : 'off'}" style="--c:#2bc4a0" onclick="${due ? 'startReview()' : ''}"><b>🧠</b><div><h3>Умное повторение</h3><p>${due ? 'Пора повторить: ' + due : 'Сегодня всё повторено. Новые слова вернутся в нужный день'}</p></div></button>
    <button class="gcard" style="--c:#1cb0f6" onclick="startPicGame()"><b>🖼️</b><div><h3>Назови картинку</h3><p>10 картинок: скажите, что на них или что делает человек</p></div></button>
    <button class="gcard" style="--c:#ff9600" onclick="blitz()"><b>⚡</b><div><h3>Блиц</h3><p>45 секунд: переводи как можно больше слов. Рекорд: ${S.blitz}</p></div></button>
    <button class="gcard" style="--c:#ce82ff" onclick="memory()"><b>🃏</b><div><h3>Memory</h3><p>Найди пары слов и значений. Рекорд: ${S.memory ? S.memory + ' ходов' : '—'}</p></div></button>
    <button class="gcard ${S.mistakes.length ? '' : 'off'}" style="--c:#ff4b4b" onclick="${S.mistakes.length ? 'startPractice()' : ''}"><b>🔁</b><div><h3>Работа над ошибками</h3><p>${S.mistakes.length ? 'Слов для повторения: ' + S.mistakes.length : 'Ошибок пока нет — так держать!'}</p></div></button>
    <p class="hint">Игры используют слова вашего текущего уровня</p></div>` + tabbar();
}

function gameBar(label) {
  return `<div class="bar"><button class="x" onclick="setTab('games')">✕</button><div class="progress"><div id="tb" style="width:100%;background:var(--blue)"></div></div><span class="hearts" id="sc">${label}</span></div>`;
}

function blitz() {
  stopGames();
  G = { pool: gamePool(), score: 0, t: 45, over: false };
  app.innerHTML = `<div class="lesson">${gameBar('⚡ 0')}<div id="bq"></div></div>`;
  G.timer = setInterval(() => {
    G.t--;
    const tb = document.getElementById('tb'); if (tb) tb.style.width = Math.max(0, G.t) / 45 * 100 + '%';
    if (G.t <= 0) endBlitz();
  }, 1000);
  blitzQ();
}
function blitzQ() {
  const w = rnd(G.pool), dir = Math.random() < 0.5;
  G.cur = w; G.lock = false;
  const opts = shuffle([w, ...pick(G.pool, w, 3)]);
  document.getElementById('bq').innerHTML = `<div class="prompt big">${hint(w) + (dir ? w[0] : w[1])}</div><div class="opts">${opts.map(o => `<button class="opt" onclick="blitzTap(this,${G.pool.indexOf(o)})">${dir ? o[1] : o[0]}</button>`).join('')}</div>`;
}
function blitzTap(el, i) {
  if (!G || G.lock || G.over) return;
  G.lock = true;
  const ok = G.pool[i] === G.cur;
  el.classList.add(ok ? 'ok' : 'bad');
  if (ok) { G.score++; sfx.ok(); } else { G.t = Math.max(0, G.t - 3); sfx.bad(); vib(60); }
  document.getElementById('sc').textContent = '⚡ ' + G.score;
  setTimeout(() => { if (!G || G.over) return; G.t <= 0 ? endBlitz() : blitzQ(); }, ok ? 250 : 600);
}
function endBlitz() {
  if (!G || G.over) return;
  G.over = true; clearInterval(G.timer);
  const sc = G.score, rec = sc > S.blitz;
  if (rec) S.blitz = sc;
  touchStreak(); addXp(sc); sfx.win(); if (rec || sc >= 10) confetti();
  app.innerHTML = `<div class="lesson"><div class="result"><div class="big pop">⚡</div><h2>${rec ? 'Новый рекорд!' : 'Время вышло!'}</h2><div class="nums"><div>Очки: ${sc}</div><div>Рекорд: ${S.blitz}</div><div>⭐ +${sc}</div></div></div><div class="foot"><button class="btn" onclick="blitz()">Ещё раз</button><p></p><button class="btn red" onclick="setTab('games')">Назад</button></div></div>`;
}

function memory() {
  stopGames();
  const pool = shuffle(gamePool()).slice(0, 6);
  G = { cards: shuffle(pool.flatMap(w => [{ w, t: 'e' }, { w, t: 'w' }])), open: [], moves: 0, matched: 0, lock: false };
  app.innerHTML = `<div class="lesson"><div class="bar"><button class="x" onclick="setTab('games')">✕</button><h2 style="margin:0;flex:1">Memory</h2><span class="hearts" id="mv">Ходы: 0</span></div><div class="mgrid">${G.cards.map((c, i) => `<button class="mcard" id="c${i}" onclick="memTap(${i})">❓</button>`).join('')}</div><p class="hint">Найдите слово и его значение</p></div>`;
}
function memTap(i) {
  if (!G || G.lock) return;
  const c = G.cards[i], el = document.getElementById('c' + i);
  if (el.classList.contains('up')) return;
  const emo = c.t === 'e' && c.w[2];
  el.classList.add('up', emo ? 'emo' : 'word'); el.innerHTML = c.t === 'e' ? photo(c.w, 'ph') || c.w[1] : c.w[0];
  if (c.t === 'w') speak(c.w[0]); else sfx.tap();
  G.open.push(i);
  if (G.open.length < 2) return;
  const [a, b] = G.open; G.open = []; G.moves++;
  document.getElementById('mv').textContent = 'Ходы: ' + G.moves;
  if (G.cards[a].w === G.cards[b].w) {
    ['c' + a, 'c' + b].forEach(id => document.getElementById(id).classList.add('hit'));
    sfx.ok();
    if (++G.matched === 6) setTimeout(endMemory, 700);
  } else {
    G.lock = true; sfx.bad();
    setTimeout(() => {
      if (!G) return;
      [a, b].forEach(j => { const e = document.getElementById('c' + j); e.classList.remove('up', 'emo', 'word'); e.textContent = '❓'; });
      G.lock = false;
    }, 800);
  }
}
function endMemory() {
  if (!G) return;
  const mv = G.moves, rec = !S.memory || mv < S.memory;
  if (rec) S.memory = mv;
  touchStreak(); addXp(10); sfx.win(); confetti();
  app.innerHTML = `<div class="lesson"><div class="result"><div class="big pop">🃏</div><h2>${rec ? 'Новый рекорд!' : 'Все пары найдены!'}</h2><div class="nums"><div>Ходов: ${mv}</div><div>Рекорд: ${S.memory}</div><div>⭐ +10</div></div></div><div class="foot"><button class="btn" onclick="memory()">Ещё раз</button><p></p><button class="btn red" onclick="setTab('games')">Назад</button></div></div>`;
}

/* ---------- Профиль ---------- */
function profile() {
  const lvl = levelOf(S.xp), max = lvl >= XPL.length, from = XPL[lvl - 1], to = max ? from : XPL[lvl];
  const st = STAGES[UNITS[curUnit()].si], lessons = Object.keys(S.done).length, known = Object.keys(S.srs).length;
  app.innerHTML = `<div class="top"><span class="logo">🏆 Профиль</span></div><div class="path pr">
    <div class="lvl"><div class="fox big">🦊</div><h2>Уровень ${lvl} из ${XPL.length}</h2><div class="progress"><div style="width:${max ? 100 : (S.xp - from) / (to - from) * 100}%"></div></div><small>${max ? 'Максимальный уровень!' : (S.xp - from) + ' / ' + (to - from) + ' XP до уровня ' + (lvl + 1)}</small></div>
    <div class="score"><b>${score()}</b><div>Оценка английского<br><small>${st.id} · ${st.name}. Шкала от 10 до 160</small></div></div>
    <div class="grid3"><div><b>🔥 ${S.streak}</b>дней подряд</div><div><b>⭐ ${S.xp}</b>XP всего</div><div><b>📚 ${known}</b>слов и фраз</div><div><b>✅ ${lessons}</b>уроков</div><div><b>⚡ ${S.blitz}</b>рекорд блица</div><div><b>🧠 ${dueKeys().length}</b>на повтор</div></div>
    <h3>Награды</h3><div class="badges">${BADGES.map(b => `<div class="badge ${S.badges[b[0]] ? '' : 'lock'}"><span>${b[1]}</span><b>${b[2]}</b><small>${b[3]}</small></div>`).join('')}</div>
    <h3>Настройки</h3><button class="opt" onclick="placement()">🎯 Пройти тест уровня заново</button><p></p>
    <button class="opt" onclick="S.sound=!S.sound;save();profile()">${S.sound ? '🔊 Звуки включены' : '🔇 Звуки выключены'}</button><p></p>
    ${SR ? `<button class="opt" onclick="S.noMic=!S.noMic;save();profile()">${S.noMic ? '🔕 Говорение выключено' : '🎤 Говорение включено'}</button><p></p>` : '<p class="hint">🎤 Этот браузер не поддерживает распознавание речи</p>'}
    <button class="opt" onclick="resetAll()">🗑️ Сбросить прогресс</button>
    <p class="hint"><a href="credits.html" target="_blank">Авторы фотографий</a></p></div>` + tabbar();
}

try { if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {}
render();
