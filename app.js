(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const SESSIONS = window.DI_SESSIONS || [];
  const LIBS = window.DI_LIBS || [];
  const PKEY = 'di-progress-v1', POSKEY = 'di-flow-pos-v1';
  let progress = store.get(PKEY, {});
  const main = $('#main');
  const live = $('#live');
  const say = t => { live.textContent = ''; setTimeout(() => { live.textContent = t; }, 30); };
  const finePointer = matchMedia('(pointer:fine)').matches;

  /* ---------- items, flow and progress ---------- */
  const itemId = (sid, kind, i) => `${sid}:${kind}:${i}`;
  const flat = s => [
    ...s.cards.map((it, i) => ({ id: itemId(s.id, 'c', i), sid: s.id, kind: 'card', i, it })),
    ...s.quiz.map((it, i) => ({ id: itemId(s.id, 'q', i), sid: s.id, kind: 'quiz', i, it }))
  ];
  const allItems = () => SESSIONS.flatMap(flat);
  // cards and code questions of one session, alternated so the flow never runs 30 cards in a row
  const interleave = (a, b) => {
    const out = []; let i = 0, j = 0;
    while (i < a.length || j < b.length) {
      const ra = a.length ? i / a.length : 2, rb = b.length ? j / b.length : 2;
      if (ra <= rb) out.push(a[i++]); else out.push(b[j++]);
    }
    return out;
  };
  const FLOW = SESSIONS.flatMap(s => { const f = flat(s); return interleave(f.filter(x => x.kind === 'card'), f.filter(x => x.kind === 'quiz')); });
  const sessionOf = sid => SESSIONS.find(s => s.id === sid);
  const sessionStart = sid => Math.max(0, FLOW.findIndex(x => x.sid === sid));
  const getPos = () => Math.min(Math.max(store.get(POSKEY, 0) | 0, 0), FLOW.length);
  const setPos = i => store.set(POSKEY, i);
  const known = id => progress[id]?.last === 'r';
  const missed = id => progress[id]?.last === 'w';
  const record = (id, ok) => {
    const p = progress[id] || { r: 0, w: 0 };
    ok ? p.r++ : p.w++;
    p.last = ok ? 'r' : 'w'; p.t = Date.now();
    progress[id] = p; store.set(PKEY, progress);
  };
  const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
  const sessionStats = s => {
    const items = flat(s);
    return { n: items.length, known: items.filter(x => known(x.id)).length, missed: items.filter(x => missed(x.id)).length };
  };
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  /* ---------- code rendering ---------- */
  const TOK = /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(\b\d+(?:\.\d+)?(?:e\d+)?\b)|(\b(?:import|from|as|for|in|if|else|elif|while|def|class|return|lambda|and|or|not|True|False|None|print|with)\b)/g;
  const hlSeg = seg => esc(seg).replace(TOK, (m, c, s, n, k) =>
    c ? `<span class="c">${m}</span>` : s ? `<span class="s">${m}</span>` : n ? `<span class="n">${m}</span>` : `<span class="k">${m}</span>`);
  const slotHtml = (state, yours, correct) => {
    if (!state) return '<span class="slot" aria-label="blank">____</span>';
    if (state === 'ok') return `<span class="slot ok">${esc(correct)}</span>`;
    return `<span class="slot bad" aria-label="your answer">${esc(yours || ' ')}</span><span class="slot ok" aria-label="correct answer">${esc(correct)}</span>`;
  };
  const codeHtml = (code, state, yours, correct) =>
    `<pre class="code" tabindex="0">${code.split('____').map(hlSeg).join(slotHtml(state, yours, correct))}</pre>`;
  const inline = t => esc(t).replace(/`([^`]+)`/g, '<code>$1</code>');
  const norm = s => String(s).trim().replace(/\s+/g, '').replace(/"/g, "'").replace(/[;.]$/, '');
  const checkFill = (input, accepted) => accepted.map(norm).includes(norm(input));

  /* ---------- icons, theme, top bar ---------- */
  const icons = {
    chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    sun: '<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
  };
  const root = document.documentElement;
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const syncTheme = () => document.querySelectorAll('[data-theme-toggle]').forEach(b => { b.setAttribute('aria-pressed', String(isDark())); b.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode'); });
  const toggleTheme = () => { root.dataset.theme = isDark() ? 'light' : 'dark'; try { localStorage.setItem('di-theme', root.dataset.theme); } catch (e) {} syncTheme(); };
  const themeBtn = () => `<button class="tbtn" type="button" data-theme-toggle>${icons.sun}${icons.moon}</button>`;
  const brand = (cls = '') => `<a class="brand ${cls}" href="#/"><span class="brand-mark" aria-hidden="true"></span><span>Deriving Insights</span></a>`;
  const topbar = (left, right = '') => `<header class="top">${left}<span class="sp"></span>${right}${themeBtn()}</header>`;
  const bind = () => { main.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', toggleTheme)); syncTheme(); };

  /* ---------- start page ---------- */
  const viewStart = () => {
    const pos = getPos(), total = FLOW.length, done = pos >= total;
    const cur = FLOW[Math.min(pos, total - 1)], cs = sessionOf(cur.sid);
    const items = allItems(), m = items.filter(x => missed(x.id)).length;
    let h = topbar(brand(), `<a class="tlink" href="#/libs">Libraries</a>`);
    h += `<div class="wrap"><section class="hero s-${cs.id}">
      <span class="mono">Hult MBAN · Python · ${total} cards and questions</span>
      <h1 class="h1">Deriving Insights through Data with Python</h1>
      <p class="lede">One screen at a time, from Session 1 to A2: a concept card, then a code question, and so on. Wrong answers show the correct one and why. Your place is remembered.</p>
      <div class="cont">
        <a class="btn primary big" href="#/flow">${done ? 'Start over' : pos ? 'Continue' : 'Start'} <kbd>Enter</kbd></a>
        <div class="cont-meta">${done ? `<b>All ${total} done.</b> Start over keeps your results.` : pos ? `<b>${pos} of ${total}</b> · next up <em>Session ${esc(cs.n)}</em>, ${esc(cs.title)}` : `<b>${total}</b> screens · about 2 hours in total, or a session at a time`}</div>
      </div>
      <div class="prog"><i style="width:${pct(pos, total)}%"></i></div>
    </section>
    <section class="cps"><h2 class="h2">Jump to a session</h2><p>Starts the flow at that session. The color follows you through it.</p><div>`;
    for (const s of SESSIONS) {
      const st = sessionStats(s);
      h += `<a class="cp s-${s.id}" href="#/flow/${s.id}"><span class="cp-n">${esc(s.n)}</span><span><div class="cp-t">${esc(s.title)}</div><div class="cp-s">${esc(s.sub)}</div></span><span class="cp-m"><span><b>${st.known}</b> of ${st.n} right</span><span class="meter"><i style="width:${pct(st.known, st.n)}%"></i></span></span></a>`;
    }
    h += `</div></section>
    <div class="actions"><a class="btn" href="#/mistakes">Review mistakes ${m ? `<span class="badge">${m}</span>` : ''}</a><a class="btn" href="#/mix">Mixed drill, 20 random</a><button class="btn quiet" type="button" data-reset>Reset everything</button></div></div>`;
    main.innerHTML = h; bind();
    $('[data-reset]').addEventListener('click', () => {
      if (!confirm('Clear every result and go back to the first screen?')) return;
      progress = {}; store.set(PKEY, progress); setPos(0); route();
    });
  };

  const viewLibs = () => {
    let h = topbar(brand(), `<a class="tlink" href="#/">${icons.back}Start page</a>`);
    h += `<div class="wrap"><h1 class="h1">Libraries used in the course</h1><p class="lede">What each one is for, how it is imported, and every call the notebooks used. Nothing here is outside the course.</p>`;
    for (const l of LIBS) {
      h += `<section class="lib" id="lib-${l.id}"><div class="lib-h"><h2 class="h2">${esc(l.name)}</h2><span class="chips">${l.sessions.map(n => { const s = SESSIONS.find(x => x.n === n); return `<span class="chip ${s ? 's-' + s.id : ''}">S${esc(n)}</span>`; }).join('')}</span></div>
        <p class="lib-what">${esc(l.what)}</p>${codeHtml(l.imp)}
        <div class="calls">${l.calls.map(([c, w]) => `<div class="cc">${esc(c)}</div><div class="cw">${esc(w)}</div>`).join('')}</div></section>`;
    }
    main.innerHTML = h + '</div>'; bind();
  };

  /* ---------- runner ---------- */
  let run = null;
  const startRun = cfg => {
    run = { items: cfg.items, i: cfg.i || 0, results: [], title: cfg.title, back: cfg.back || '#/', backLabel: cfg.backLabel || 'Start page', flow: !!cfg.flow, mixed: !!cfg.mixed, interstitial: null, revealed: false, answered: false, picked: null, typed: '' };
    renderRun();
  };
  const current = () => run.items[run.i];
  const next = () => {
    const prev = current();
    run.i++; run.revealed = false; run.answered = false; run.picked = null; run.typed = '';
    if (run.flow) {
      setPos(run.i);
      const cur = run.items[run.i];
      if (!cur || cur.sid !== prev.sid) run.interstitial = prev.sid;
    }
    renderRun();
  };
  const answerCard = ok => { const x = current(); record(x.id, ok); run.results.push({ x, ok }); say(ok ? 'Marked as known' : 'Marked as missed'); next(); };
  const answerQuiz = (ok, picked, typed) => { const x = current(); record(x.id, ok); run.results.push({ x, ok }); run.answered = true; run.picked = picked; run.typed = typed; renderRun(); say(ok ? 'Correct' : 'Not right. The correct answer is shown.'); };
  const whyHtml = (ok, it) => {
    let corr = '';
    if (!ok && it.t === 'fill') corr = `<span class="corr">Correct: ${esc(it.a[0])}</span>`;
    if (!ok && it.t === 'mc') corr = `<span class="corr">Correct: ${esc(it.o[it.a])}</span>`;
    return `<div class="verdict ${ok ? 'ok' : 'bad'}" role="status">${ok ? icons.check : icons.x}<div><b>${ok ? 'Right' : 'Not quite'}</b>${corr}<p>${esc(it.why)}</p></div></div>`;
  };
  const kindLabel = x => x.kind === 'card' ? 'Concept' : x.it.t === 'fill' ? 'Fill the blank' : /print|return|shape|give|result/i.test(x.it.q) && x.it.code ? 'Read the code' : 'Pick one';
  const runTop = (sid, counter) => {
    const s = sessionOf(sid);
    return topbar(`<a class="tlink" href="${run.back}" title="Back (Esc)">${icons.back}<span>${esc(run.backLabel)}</span></a><span class="tsess s-${sid}"><i class="dot"></i><span><em>Session ${esc(s.n)}</em> · ${esc(s.title)}</span></span>`, `<span class="mono">${counter}</span>`)
      + `<div class="prog s-${sid}"><i style="width:${pct(run.i, run.items.length)}%"></i></div>`;
  };

  const renderRun = () => {
    if (!run) return;
    if (run.interstitial) return renderCheckpoint();
    const n = run.items.length;
    if (run.i >= n) return renderFinish();
    const x = current(), it = x.it;
    let body = `<div class="kind"><i class="dot"></i>${kindLabel(x)}${!run.flow ? ` · Session ${esc(sessionOf(x.sid).n)}` : ''}</div><h1 class="q">${inline(it.q)}</h1>`;
    let foot = '', hint = '';
    if (x.kind === 'card') {
      if (!run.revealed) {
        foot = `<button class="btn primary" type="button" data-act="reveal">Show answer <kbd>Space</kbd></button>`;
        hint = 'Say the answer out loud first, then reveal.';
      } else {
        body += `<div class="answer"><p>${inline(it.a)}</p>${it.code ? codeHtml(it.code) : ''}</div>`;
        foot = `<button class="btn" type="button" data-act="miss">Missed it <kbd>1</kbd></button><button class="btn primary" type="button" data-act="got">Got it <kbd>2</kbd></button>`;
      }
    } else if (it.t === 'mc') {
      if (it.code) body += codeHtml(it.code);
      body += `<div class="opts" role="group" aria-label="Options">` + it.o.map((o, i) => {
        let cls = 'opt', end = `<kbd>${i + 1}</kbd>`;
        if (run.answered) {
          if (i === it.a) { cls += ' ok'; end = `<span class="tag">${icons.check}Correct</span>`; }
          else if (i === run.picked) { cls += ' bad'; end = `<span class="tag">${icons.x}Your answer</span>`; }
          else { cls += ' dim'; end = ''; }
        }
        return `<button class="${cls}" type="button" data-opt="${i}" ${run.answered ? 'disabled' : ''}><span>${inline(o)}</span>${end}</button>`;
      }).join('') + '</div>';
      if (run.answered) { body += whyHtml(run.picked === it.a, it); foot = `<button class="btn primary" type="button" data-act="next">Next <kbd>Enter</kbd></button>`; }
      else hint = '<span class="kb">Press 1 to 4 to answer.</span>';
    } else {
      const ok = run.answered ? checkFill(run.typed, it.a) : null;
      body += codeHtml(it.code, run.answered ? (ok ? 'ok' : 'bad') : null, run.typed, it.a[0]);
      body += `<form class="fill" data-fill><label class="sr-only" for="fill-in">Missing piece</label><input id="fill-in" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Missing piece" value="${esc(run.typed)}" ${run.answered ? 'disabled' : ''}>${run.answered ? '' : '<button class="btn primary" type="submit">Check <kbd>Enter</kbd></button>'}</form>`;
      if (run.answered) { body += whyHtml(ok, it); foot = `<button class="btn primary" type="button" data-act="next">Next <kbd>Enter</kbd></button>`; }
      else hint = 'Quotes and spacing do not matter. Case does.';
    }
    main.innerHTML = runTop(x.sid, `${run.i + 1} / ${n}`) + `<div class="stage s-${x.sid}"><article class="card">${body}<div class="card-foot"><span class="sp"></span>${foot}</div>${hint ? `<div class="hint${hint.startsWith('<span class="kb"') ? ' kb' : ''}">${hint}</div>` : ''}</article></div>`;
    bind();
    const inp = $('#fill-in'); if (inp && !run.answered) { if (finePointer) inp.focus(); }
    else { const b = $('[data-act]'); if (b && run.answered) b.focus({ preventScroll: true }); }
    main.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => act(b.dataset.act)));
    main.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => pick(+b.dataset.opt)));
    const f = $('[data-fill]'); if (f) f.addEventListener('submit', e => { e.preventDefault(); submitFill(); });
  };
  const act = a => {
    if (!run) return;
    if (a === 'reveal') { run.revealed = true; renderRun(); const b = $('[data-act="got"]'); if (b) b.focus({ preventScroll: true }); }
    else if (a === 'miss') answerCard(false);
    else if (a === 'got') answerCard(true);
    else if (a === 'next') next();
    else if (a === 'continue') { run.interstitial = null; renderRun(); }
  };
  const pick = i => { if (!run || run.answered) return; const it = current().it; answerQuiz(i === it.a, i, ''); };
  const submitFill = () => { if (!run || run.answered) return; const v = $('#fill-in').value; if (!v.trim()) return; answerQuiz(checkFill(v, current().it.a), null, v); };

  // between two sessions of the flow: how the session just finished went, and what comes next
  const renderCheckpoint = () => {
    const sid = run.interstitial, s = sessionOf(sid);
    const rs = run.results.filter(r => r.x.sid === sid), ok = rs.filter(r => r.ok).length, bad = rs.filter(r => !r.ok);
    const nx = run.items[run.i], ns = nx ? sessionOf(nx.sid) : null;
    const st = sessionStats(s);
    let h = runTop(sid, `${run.i} / ${run.items.length}`) + `<div class="stage s-${sid}"><article class="card"><div class="kind"><i class="dot"></i>Session ${esc(s.n)} done</div>
      <h1 class="q">${esc(s.title)}</h1>
      <div class="score"><b>${ok} / ${rs.length}</b><span>right this sitting · ${st.known} of ${st.n} right overall</span></div>`;
    if (bad.length) {
      h += `<div class="miss"><h3>Missed just now, with the correct answer</h3>`;
      for (const { x } of bad) {
        const it = x.it;
        const ans = x.kind === 'card' ? it.a : it.t === 'fill' ? `Correct: \`${it.a[0]}\`. ${it.why}` : `Correct: ${it.o[it.a]}. ${it.why}`;
        h += `<div class="miss-row"><div class="mq">${inline(it.q)}</div><div class="ma">${inline(ans)}</div></div>`;
      }
      h += '</div>';
    }
    if (ns) h += `<div class="nextup s-${ns.id}"><i class="dot"></i><span>Next up: <b>Session ${esc(ns.n)}, ${esc(ns.title)}</b></span></div>`;
    h += `<div class="card-foot"><span class="sp"></span><a class="btn" href="#/">Stop for now</a><button class="btn primary" type="button" data-act="continue">${ns ? 'Continue' : 'See the result'} <kbd>Enter</kbd></button></div></article></div>`;
    main.innerHTML = h; bind();
    $('[data-act="continue"]').focus({ preventScroll: true });
    main.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => act(b.dataset.act)));
    say(`Session ${s.n} done. ${ok} of ${rs.length} right.`);
  };

  const renderFinish = () => {
    const n = run.results.length, ok = run.results.filter(r => r.ok).length, bad = run.results.filter(r => !r.ok);
    const last = run.items[run.items.length - 1], sid = last ? last.sid : SESSIONS[0].id;
    let h = runTop(sid, 'done') + `<div class="stage s-${sid}"><article class="card"><div class="kind"><i class="dot"></i>${run.flow ? 'Course complete' : 'Result'}</div>
      <h1 class="q">${esc(run.title)}</h1><div class="score"><b>${ok} / ${n}</b><span>${bad.length ? `${bad.length} to review` : 'all right, nothing to review'}</span></div>`;
    if (bad.length && !run.flow) {
      h += `<div class="miss"><h3>Missed, with the correct answer</h3>`;
      for (const { x } of bad) {
        const it = x.it;
        const ans = x.kind === 'card' ? it.a : it.t === 'fill' ? `Correct: \`${it.a[0]}\`. ${it.why}` : `Correct: ${it.o[it.a]}. ${it.why}`;
        h += `<div class="miss-row"><div class="mq">${inline(it.q)}</div><div class="ma">${inline(ans)}</div></div>`;
      }
      h += '</div>';
    }
    h += `<div class="card-foot"><span class="sp"></span>${bad.length ? '<a class="btn" href="#/mistakes">Review mistakes</a>' : ''}${run.flow ? '' : '<button class="btn" type="button" data-act="again">Run again</button>'}<a class="btn primary" href="#/">Start page</a></div></article></div>`;
    main.innerHTML = h; bind();
    if (run.flow) setPos(0);
    const cfg = { title: run.title, back: run.back, backLabel: run.backLabel, mixed: run.mixed }, items = run.items;
    main.querySelectorAll('[data-act="again"]').forEach(b => b.addEventListener('click', () => startRun({ ...cfg, items })));
    say(`Finished. ${ok} of ${n} right.`);
  };

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = e.target && e.target.tagName;
    if (!run) { if (e.key === 'Enter' && (location.hash === '' || location.hash === '#/') && tag !== 'A' && tag !== 'BUTTON') { e.preventDefault(); location.hash = '#/flow'; } return; }
    if (e.key === 'Escape') { location.hash = run.back; return; }
    const go = f => { e.preventDefault(); f(); };   // preventDefault stops the focused button from also firing a click
    if (run.interstitial) { if (e.key === 'Enter') go(() => act('continue')); return; }
    const x = run.items[run.i]; if (!x) return;
    const inInput = tag === 'INPUT';
    if (x.kind === 'card') {
      if (e.key === ' ' && !run.revealed) go(() => act('reveal'));
      else if (run.revealed && e.key === '1') go(() => act('miss'));
      else if (run.revealed && e.key === '2') go(() => act('got'));
    } else if (x.it.t === 'mc') {
      if (!run.answered && /^[1-4]$/.test(e.key)) go(() => pick(+e.key - 1));
      else if (run.answered && e.key === 'Enter') go(() => act('next'));
    } else if (run.answered && e.key === 'Enter' && !inInput) go(() => act('next'));
  });

  /* ---------- router ---------- */
  const route = () => {
    const h = location.hash || '#/';
    run = null;
    window.scrollTo(0, 0);
    if (h === '#/') return viewStart();
    if (h === '#/libs') return viewLibs();
    if (h === '#/flow') { const pos = getPos(); return startRun({ items: FLOW, i: pos >= FLOW.length ? 0 : pos, title: 'The whole course', flow: true }); }
    let m = h.match(/^#\/(?:flow|s)\/([a-z0-9]+)/);
    if (m) {
      const s = sessionOf(m[1]); if (!s) { location.hash = '#/'; return; }
      const i = sessionStart(s.id); setPos(i);
      return startRun({ items: FLOW, i, title: 'The whole course', flow: true });
    }
    if (h === '#/mistakes') {
      const items = allItems().filter(x => missed(x.id));
      if (!items.length) { main.innerHTML = topbar(brand(), `<a class="tlink" href="#/">${icons.back}Start page</a>`) + `<div class="wrap"><h1 class="h1">Mistakes</h1><p class="lede">Everything you marked missed or answered wrong, across every session. Answer it right once and it leaves this list.</p><div class="empty">Nothing missed yet.</div></div>`; bind(); return; }
      return startRun({ title: 'Mistakes', items: shuffle(items), mixed: true });
    }
    if (h === '#/mix') return startRun({ title: 'Mixed drill', items: shuffle(allItems()).slice(0, 20), mixed: true });
    location.hash = '#/';
  };
  window.addEventListener('hashchange', route);
  route();
})();
