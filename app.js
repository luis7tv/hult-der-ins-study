(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const SESSIONS = window.DI_SESSIONS || [];
  const LEARN = window.DI_LEARN || {};
  const LIBS = window.DI_LIBS || [];
  const PKEY = 'di-progress-v2';
  let progress = store.get(PKEY, {});
  const main = $('#main');
  const live = $('#live');
  const say = t => { live.textContent = ''; setTimeout(() => { live.textContent = t; }, 30); };
  const finePointer = matchMedia('(pointer:fine)').matches;

  /* ---------- motion (GSAP when loaded, nothing when reduced motion or offline) ---------- */
  const G = window.gsap || null;
  const ST = window.ScrollTrigger || null;
  const M = !!G && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (G && ST) G.registerPlugin(ST);
  const anim = {
    enter(card) {
      if (!M || !card) return;
      G.from(card, { y: 20, autoAlpha: 0, duration: .5, ease: 'expo.out' });
      const kids = card.querySelectorAll('[data-stagger] > *');
      if (kids.length) G.from(kids, { y: 10, autoAlpha: 0, duration: .45, stagger: .045, ease: 'power2.out', delay: .08 });
    },
    leave(card, cb) { if (!M || !card) return cb(); G.to(card, { y: -16, autoAlpha: 0, duration: .22, ease: 'power2.in', onComplete: cb }); },
    pulse(el) { if (M && el) G.fromTo(el, { scale: 1 }, { scale: 1.025, duration: .14, yoyo: true, repeat: 1, ease: 'power1.inOut' }); },
    shake(el) { if (M && el) G.fromTo(el, { x: 0 }, { keyframes: [{ x: -7 }, { x: 7 }, { x: -4 }, { x: 4 }, { x: 0 }], duration: .36, ease: 'none' }); },
    in(el) { if (M && el) G.from(el, { y: 10, autoAlpha: 0, duration: .32, ease: 'power2.out' }); },
    count(el, to) { if (!el) return; if (!M) { el.textContent = to; return; } const o = { v: 0 }; G.to(o, { v: to, duration: .9, ease: 'power2.out', snap: { v: 1 }, onUpdate: () => { el.textContent = Math.round(o.v); } }); },
    page(root) { if (!M) return; const kids = root.querySelectorAll('[data-rise]'); if (kids.length) G.from(kids, { y: 18, autoAlpha: 0, duration: .6, stagger: .07, ease: 'expo.out' }); },
    learn(root) {
      if (!M || !ST) return;
      root.querySelectorAll('.lsec').forEach(sec => {
        if (sec.getBoundingClientRect().top < innerHeight * .9) return;   // already on screen: show it, no reveal
        G.from(sec, { y: 24, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: sec, start: 'top 96%', end: 'top 82%', scrub: true } });
      });
    },
    killScroll() { if (ST) ST.getAll().forEach(t => t.kill()); }
  };

  /* ---------- items and progress ---------- */
  const itemId = (sid, i) => `${sid}:q:${i}`;
  const quizItems = s => s.quiz.map((it, i) => ({ id: itemId(s.id, i), sid: s.id, i, it }));
  const mastered = id => progress[id]?.last === 'r';
  const record = (id, res) => {
    const p = progress[id] || { r: 0, w: 0, s: 0 };
    p[res] = (p[res] || 0) + 1; p.last = res; p.t = Date.now();
    progress[id] = p; store.set(PKEY, progress);
  };
  const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
  const sStats = s => { const q = quizItems(s); return { n: q.length, right: q.filter(x => mastered(x.id)).length }; };
  const sessionOf = sid => SESSIONS.find(s => s.id === sid);
  const sIndex = sid => SESSIONS.findIndex(s => s.id === sid);
  const nextWork = fromIdx => { for (let k = fromIdx; k < SESSIONS.length; k++) if (quizItems(SESSIONS[k]).some(x => !mastered(x.id))) return SESSIONS[k]; return null; };
  const totals = () => { const all = SESSIONS.flatMap(quizItems); return { n: all.length, right: all.filter(x => mastered(x.id)).length }; };

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
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    fwd: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    skip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l9 7-9 7V5zM17 5v14"/></svg>',
    sun: '<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
  };
  const root = document.documentElement;
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const syncTheme = () => document.querySelectorAll('[data-theme-toggle]').forEach(b => { b.setAttribute('aria-pressed', String(isDark())); b.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode'); });
  const toggleTheme = () => { root.dataset.theme = isDark() ? 'light' : 'dark'; try { localStorage.setItem('di-theme', root.dataset.theme); } catch (e) {} syncTheme(); };
  const themeBtn = () => `<button class="tbtn" type="button" data-theme-toggle>${icons.sun}${icons.moon}</button>`;
  const brand = () => `<a class="brand" href="#/" aria-label="Deriving Insights, start page"><span class="brand-mark" aria-hidden="true"></span><span class="brand-t">Deriving Insights</span></a>`;
  const tnav = on => `<nav class="tnav" aria-label="Sections"><a href="#/learn" class="${on === 'learn' ? 'on' : ''}">Learn</a><a href="#/interpret" class="${on === 'interpret' ? 'on' : ''}">Interpret</a><a href="#/quiz" class="${on === 'quiz' ? 'on' : ''}">Quiz</a></nav>`;
  const topbar = (left, right = '') => `<header class="top">${left}<span class="sp"></span>${right}${themeBtn()}</header>`;
  const bind = () => { main.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', toggleTheme)); syncTheme(); };
  const learnLast = () => store.get('di-learn-last', SESSIONS[0].id);

  /* ---------- start page ---------- */
  const viewStart = () => {
    const t = totals(), nw = nextWork(0), qs = nw || SESSIONS[0];
    const ls = sessionOf(learnLast()) || SESSIONS[0];
    let h = topbar(brand(), `<a class="tlink" href="#/learn/libs">Libraries</a>`);
    h += `<div class="wrap"><section class="hero">
      <span class="mono" data-rise>Hult MBAN · Python · Sessions 1 to 7</span>
      <h1 class="h1" data-rise>Deriving Insights through Data with Python</h1>
      <p class="lede" data-rise>Learn explains every notebook section in plain words. Interpret shows how to read each output and write the business side. Quiz asks one code question per screen; see the answer or skip whenever you want, and it comes back until you get it right.</p>
      <div class="doors">
        <a class="door s-${ls.id}" href="#/learn/${ls.id}" data-rise><span class="door-k"><i class="dot"></i>Learn</span><b>Read the sessions</b><p>Each section of the notebooks explained simply, with the code next to it.</p><span class="door-f"><span>Session ${esc(ls.n)}, ${esc(ls.title)}</span><span class="btn primary">Open ${icons.fwd}</span></span></a>
        <a class="door" href="#/interpret" data-rise><span class="door-k"><i class="dot"></i>Interpret</span><b>Read the numbers for the business</b><p>What each output means and the three sentences the course wants at the end, with charts from the course data.</p><span class="door-f"><span>${(window.DI_INTERPRET || { sections: [] }).sections.length} sections · 7 charts</span><span class="btn primary">Open ${icons.fwd}</span></span></a>
        <a class="door s-${qs.id}" href="#/quiz" data-rise><span class="door-k"><i class="dot"></i>Quiz</span><b>${t.right ? 'Continue the quiz' : 'Start the quiz'}</b><p>${t.n} code questions. Skip, see the answer, or answer. Everything you did not get right comes back.</p><span class="door-f"><span><b>${t.right}</b> of ${t.n} right · next Session ${esc(qs.n)}</span><span class="btn primary">${t.right ? 'Continue' : 'Start'} ${icons.fwd}</span></span></a>
      </div>
    </section>
    <section class="cps" data-rise><h2 class="h2">Sessions</h2><p>Read a session, then quiz it. The color follows you through each one.</p><div>`;
    for (const s of SESSIONS) {
      const st = sStats(s);
      h += `<div class="cp s-${s.id}"><span class="cp-n">${esc(s.n)}</span><span><div class="cp-t">${esc(s.title)}</div><div class="cp-s">${esc(s.sub)}</div></span><span class="cp-a"><span class="cp-m"><span><b>${st.right}</b>/${st.n}</span><span class="meter"><i style="width:${pct(st.right, st.n)}%"></i></span></span><a class="btn" href="#/learn/${s.id}">Learn</a><a class="btn primary" href="#/quiz/${s.id}">Quiz</a></span></div>`;
    }
    h += `</div></section><div class="actions"><button class="btn quiet" type="button" data-reset>Reset quiz results</button></div></div>`;
    main.innerHTML = h; bind();
    anim.page(main);
    $('[data-reset]').addEventListener('click', () => {
      if (!confirm('Clear every quiz result?')) return;
      progress = {}; store.set(PKEY, progress); route();
    });
  };

  /* ---------- article pages: learn and interpret ---------- */
  const secHtml = (sec, i) => {
    let b = `<section class="lsec" id="sec-${i}"><h2><span class="n">${i + 1}</span><span>${esc(sec.h)}</span></h2>`;
    b += (sec.p || []).map(p => `<p>${inline(p)}</p>`).join('');
    if (sec.code) b += codeHtml(sec.code);
    if (sec.img) b += `<figure class="fig"><img src="${sec.img.src}" alt="${esc(sec.img.alt)}" loading="lazy" width="${sec.img.w || 2000}" height="${sec.img.h || 1080}">${sec.img.cap ? `<figcaption>${inline(sec.img.cap)}</figcaption>` : ''}</figure>`;
    if (sec.say) b += `<div class="say"><b>${esc(sec.say.t || 'Say it like this')}</b>${sec.say.lines.map(l => `<p>${inline(l)}</p>`).join('')}</div>`;
    if (sec.ex) b += `<div class="ex"><b>${esc(sec.ex.from)}</b>${sec.ex.lines.map(l => `<p>${inline(l)}</p>`).join('')}</div>`;
    if (sec.list) b += `<ul class="pts">${sec.list.map(l => `<li>${inline(l).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}</ul>`;
    return b + '</section>';
  };
  const mountArticle = (h, strip) => {
    main.innerHTML = h.replace('<div class="learn', strip + '<div class="learn'); bind();
    main.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { const el = document.getElementById(b.dataset.go); if (el) el.scrollIntoView({ behavior: M ? 'smooth' : 'auto', block: 'start' }); }));
    anim.page(main.querySelector('.lhead'));
    anim.learn(main);
    // active section for the rail and the strip, independent of motion settings
    const links = main.querySelectorAll('[data-go]');
    const setActive = id => links.forEach(b => { const on = b.dataset.go === id; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }); }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
      main.querySelectorAll('.lsec').forEach(sec => io.observe(sec));
    }
    if (ST && M) ST.refresh();
  };
  const viewInterpret = () => {
    const I = window.DI_INTERPRET || { intro: '', sections: [] };
    let h = topbar(brand() + tnav('interpret'), `<span class="tsess"><i class="dot"></i><span><em>Interpret</em><span class="tt"> · the business side</span></span></span>`);
    h += `<div class="learn"><article class="article"><header class="lhead"><span class="mono" data-rise><em>Interpret</em> · ${I.sections.length} sections · every output the course produces</span><h1 class="h1" data-rise>Reading the numbers for the business</h1><p class="lede" data-rise>${esc(I.intro)}</p></header>`;
    I.sections.forEach((sec, i) => { h += secHtml(sec, i); });
    h += `<div class="lcta"><a class="btn ghost" href="#/learn">${icons.back}Learn</a><span class="sp"></span><a class="btn primary" href="#/quiz">Quiz ${icons.fwd}</a></div></article>
      <aside class="rail" aria-label="On this page"><span class="mono">Interpret</span>${I.sections.map((sec, i) => `<button type="button" data-go="sec-${i}">${esc(sec.h)}</button>`).join('')}<a class="btn primary" href="#/quiz">Quiz</a></aside></div>`;
    const strip = `<nav class="lnav" aria-label="Sections">${I.sections.map((sec, i) => `<button type="button" data-go="sec-${i}" title="${esc(sec.h)}">${i + 1}</button>`).join('')}</nav>`;
    mountArticle(h, strip);
  };

  /* ---------- learn ---------- */
  const viewLearn = s => {
    const L = LEARN[s.id] || { intro: '', sections: [] };
    store.set('di-learn-last', s.id);
    const idx = sIndex(s.id), prev = SESSIONS[idx - 1], next = SESSIONS[idx + 1];
    let h = topbar(brand() + tnav('learn'), `<span class="tsess s-${s.id}"><i class="dot"></i><span><em>S<span class="tt">ession </span>${esc(s.n)}</em><span class="tt"> · ${esc(s.title)}</span></span></span>`);
    h += `<div class="learn s-${s.id}"><article class="article">
      <header class="lhead"><span class="mono" data-rise><em>Session ${esc(s.n)}</em> · ${L.sections.length} sections · ${s.cards.length} quick-review points</span><h1 class="h1" data-rise>${esc(s.title)}</h1><p class="lede" data-rise>${esc(L.intro || s.sub)}</p></header>`;
    L.sections.forEach((sec, i) => { h += secHtml(sec, i); });
    h += `<section class="lsec review" id="review"><h2><span class="n">${L.sections.length + 1}</span><span>Quick review</span></h2><p>Every point from this session as a question and its answer. Cover the answer, say it, check.</p>`;
    for (const c of s.cards) h += `<div class="qa"><b>${inline(c.q)}</b><p>${inline(c.a)}</p>${c.code ? codeHtml(c.code) : ''}</div>`;
    h += `</section><div class="lcta">${prev ? `<a class="btn ghost" href="#/learn/${prev.id}">${icons.back}Session ${esc(prev.n)}</a>` : ''}<a class="btn ghost" href="#/interpret">How to read these outputs</a><span class="sp"></span>${next ? `<a class="btn" href="#/learn/${next.id}">Session ${esc(next.n)}: ${esc(next.title)} ${icons.fwd}</a>` : ''}<a class="btn primary" href="#/quiz/${s.id}">Quiz Session ${esc(s.n)} ${icons.fwd}</a></div></article>
      <aside class="rail" aria-label="On this page"><span class="mono">Session ${esc(s.n)}</span>${L.sections.map((sec, i) => `<button type="button" data-go="sec-${i}">${esc(sec.h)}</button>`).join('')}<button type="button" data-go="review">Quick review</button><a class="btn primary" href="#/quiz/${s.id}">Quiz this session</a></aside></div>`;
    // phone and tablet: a sticky strip of section numbers instead of the rail
    const strip = `<nav class="lnav s-${s.id}" aria-label="Sections">${L.sections.map((sec, i) => `<button type="button" data-go="sec-${i}" title="${esc(sec.h)}">${i + 1}</button>`).join('')}<button type="button" data-go="review" title="Quick review">Review</button></nav>`;
    mountArticle(h, strip);
  };

  const viewLibs = () => {
    let h = topbar(brand() + tnav('learn'), `<a class="tlink" href="#/">${icons.back}<span>Start page</span></a>`);
    h += `<div class="wrap"><h1 class="h1">Libraries used in the course</h1><p class="lede">What each one is for, how it is imported, and every call the notebooks used.</p>`;
    for (const l of LIBS) {
      h += `<section class="lib" id="lib-${l.id}"><div class="lib-h"><h2 class="h2">${esc(l.name)}</h2><span class="chips">${l.sessions.filter(n => SESSIONS.some(x => x.n === n)).map(n => { const s = SESSIONS.find(x => x.n === n); return `<a class="chip s-${s.id}" href="#/learn/${s.id}">S${esc(n)}</a>`; }).join('')}</span></div>
        <p class="lib-what">${esc(l.what)}</p>${codeHtml(l.imp)}
        <div class="calls">${l.calls.map(([c, w]) => `<div class="cc">${esc(c)}</div><div class="cw">${esc(w)}</div>`).join('')}</div></section>`;
    }
    main.innerHTML = h + '</div>'; bind();
  };

  /* ---------- quiz ---------- */
  let run = null;
  const startQuiz = s => {
    const items = quizItems(s);
    let queue = items.filter(x => !mastered(x.id));
    const practice = queue.length === 0;
    if (practice) queue = items.slice();
    run = { s, queue, i: 0, practice, reask: {}, results: [], state: 'ask', picked: null, typed: '' };
    store.set('di-quiz-last', s.id);
    lastProg = practice ? 0 : pct(sStats(s).right, items.length);
    renderQ(true);
  };
  const cur = () => run.queue[run.i];
  // every question that was not answered right goes to the back of the queue, until it is
  const requeue = x => { run.reask[x.id] = (run.reask[x.id] || 0) + 1; run.queue.push(x); return true; };
  let lastProg = 0;
  const toast = t => {
    const old = $('.toast'); if (old) old.remove();
    const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = t; document.body.appendChild(el);
    if (M) { G.fromTo(el, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .3, ease: 'power2.out' }); G.to(el, { autoAlpha: 0, y: 8, duration: .3, delay: 1.6, ease: 'power2.in', onComplete: () => el.remove() }); }
    else setTimeout(() => el.remove(), 1900);
  };
  const sessionRight = () => { const st = sStats(run.s); return run.practice ? run.results.filter(r => r.ok).length : st.right; };
  const outcome = res => {   // 'r' right, 'w' wrong, 's' saw the answer, 'k' skipped
    const x = cur();
    if (res !== 'k') record(x.id, res);
    const back = res === 'r' ? false : requeue(x);
    run.results.push({ x, res, ok: res === 'r', back, first: !(run.reask[x.id] > (back ? 1 : 0)) });
  };
  const advance = () => {
    anim.leave($('.card'), () => {
      run.i++; run.state = 'ask'; run.picked = null; run.typed = '';
      if (run.i >= run.queue.length) renderCheckpoint(); else renderQ(true);
    });
  };
  const whyHtml = (kind, it) => {
    const corr = it.t === 'fill' ? `<span class="corr">Correct: ${esc(it.a[0])}</span>` : `<span class="corr">Correct: ${esc(it.o[it.a])}</span>`;
    if (kind === 'ok') return `<div class="verdict ok" role="status">${icons.check}<div><b>Right</b><p>${esc(it.why)}</p></div></div>`;
    if (kind === 'bad') return `<div class="verdict bad" role="status">${icons.x}<div><b>Not quite</b>${corr}<p>${esc(it.why)}</p><small>This one comes back later in the session.</small></div></div>`;
    return `<div class="verdict info" role="status">${icons.eye}<div><b>Here is the answer</b>${corr}<p>${esc(it.why)}</p><small>You will get this question again before the session ends.</small></div></div>`;
  };
  const kindLabel = it => it.t === 'fill' ? 'Fill the blank' : /print|return|shape|give|result/i.test(it.q) && it.code ? 'Read the code' : 'Pick one';
  const quizTop = () => {
    const s = run.s, st = sStats(s), right = sessionRight(), left = run.queue.length - run.i;
    return topbar(brand() + tnav('quiz'), `<span class="tsess s-${s.id}"><i class="dot"></i><span><em>S<span class="tt">ession </span>${esc(s.n)}</em><span class="tt"> · ${esc(s.title)}</span></span></span><span class="tcount"><b>${right}</b><span class="tt"> of </span><span class="ts">/</span>${st.n}<span class="tt"> right</span> · ${left}<span class="tt"> to go</span><span class="ts"> left</span></span>`)
      + `<div class="prog s-${s.id}"><i style="width:${pct(right, st.n)}%"></i></div>`;
  };
  const tweenProg = () => {
    const bar = $('.prog i'); if (!bar) return;
    const now = parseFloat(bar.style.width) || 0;
    if (M && now !== lastProg) G.fromTo(bar, { width: lastProg + '%' }, { width: now + '%', duration: .6, ease: 'power2.out' });
    lastProg = now;
  };

  const renderQ = fresh => {
    const x = cur(), it = x.it, seen = run.state;
    const back = (run.reask[x.id] || 0) > 0;
    let body = `<div class="kind"><i class="dot"></i>${kindLabel(it)}${back ? '<span class="back">Again</span>' : ''}</div><h1 class="q">${inline(it.q)}</h1>`;
    let foot = '', hint = '';
    if (it.t === 'mc') {
      if (it.code) body += codeHtml(it.code);
      body += `<div class="opts" role="group" aria-label="Options" data-stagger>` + it.o.map((o, i) => {
        let cls = 'opt', end = `<kbd>${i + 1}</kbd>`;
        if (seen !== 'ask') {
          if (i === it.a) { cls += ' ok'; end = `<span class="tag">${icons.check}${seen === 's' ? 'Answer' : 'Correct'}</span>`; }
          else if (i === run.picked) { cls += ' bad'; end = `<span class="tag">${icons.x}Your answer</span>`; }
          else { cls += ' dim'; end = ''; }
        }
        return `<button class="${cls}" type="button" data-opt="${i}" ${seen !== 'ask' ? 'disabled' : ''}><span>${inline(o)}</span>${end}</button>`;
      }).join('') + '</div>';
      if (seen !== 'ask') body += whyHtml(seen === 'r' ? 'ok' : seen === 'w' ? 'bad' : 'info', it);
      else hint = '<span class="kb">1 to 4 to answer · S to skip · A to see the answer</span>';
    } else {
      const state = seen === 'ask' ? null : seen === 'w' ? 'bad' : 'ok';
      body += codeHtml(it.code, state, run.typed, it.a[0]);
      body += `<form class="fill" data-fill><label class="sr-only" for="fill-in">Missing piece</label><input id="fill-in" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Missing piece" value="${esc(run.typed)}" ${seen !== 'ask' ? 'disabled' : ''}>${seen === 'ask' ? '<button class="btn primary" type="submit">Check <kbd>Enter</kbd></button>' : ''}</form>`;
      if (seen !== 'ask') body += whyHtml(seen === 'r' ? 'ok' : seen === 'w' ? 'bad' : 'info', it);
      else hint = 'Quotes and spacing do not matter. Case does.';
    }
    if (seen === 'ask') foot = `<button class="btn ghost" type="button" data-act="skip">${icons.skip}Skip <kbd>S</kbd></button><button class="btn" type="button" data-act="see">${icons.eye}See answer <kbd>A</kbd></button><span class="sp"></span>`;
    else foot = `<span class="sp"></span><button class="btn primary" type="button" data-act="next">Next ${icons.fwd} <kbd>Enter</kbd></button>`;
    main.innerHTML = quizTop() + `<div class="stage s-${x.sid}"><article class="card">${body}<div class="card-foot">${foot}</div>${hint ? `<div class="hint${hint.startsWith('<span class="kb"') ? ' kb' : ''}">${hint}</div>` : ''}</article></div>`;
    bind(); tweenProg();
    if (fresh) anim.enter($('.card'));
    else { anim.in($('.verdict')); }
    const inp = $('#fill-in'); if (inp && seen === 'ask') { if (finePointer) inp.focus(); }
    else if (seen !== 'ask') {
      const b = $('[data-act="next"]');
      if (b) { b.focus({ preventScroll: true }); const r = b.getBoundingClientRect(); if (r.bottom > innerHeight - 12) b.scrollIntoView({ behavior: M ? 'smooth' : 'auto', block: 'end' }); }
    }
    main.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => act(b.dataset.act)));
    main.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => pick(+b.dataset.opt)));
    const f = $('[data-fill]'); if (f) f.addEventListener('submit', e => { e.preventDefault(); submitFill(); });
  };
  const settle = (res, picked, typed) => {
    outcome(res); run.state = res; run.picked = picked; run.typed = typed || '';
    renderQ(false);
    const it = cur().it;
    if (res === 'r') { anim.pulse($('.opt.ok') || $('.verdict')); say('Correct'); }
    else if (res === 'w') { anim.shake($('.opt.bad') || $('.fill')); say('Not right. The correct answer is shown. It comes back later.'); }
    else { anim.pulse($('.opt.ok') || $('pre.code .slot.ok')); say('Answer shown. It comes back later.'); }
    void it;
  };
  const act = a => {
    if (!run) return;
    if (a === 'next' && run.state !== 'ask') advance();
    else if (a === 'skip' && run.state === 'ask') { outcome('k'); toast('Skipped. It comes back later.'); say('Skipped. It comes back later.'); advance(); }
    else if (a === 'see' && run.state === 'ask') settle('s', null, '');
    else if (a === 'continue') renderNextSession();
  };
  const pick = i => { if (!run || run.state !== 'ask') return; settle(i === cur().it.a ? 'r' : 'w', i, ''); };
  const submitFill = () => { if (!run || run.state !== 'ask') return; const v = $('#fill-in').value; if (!v.trim()) { anim.shake($('.fill')); return; } settle(checkFill(v, cur().it.a) ? 'r' : 'w', null, v); };

  const renderCheckpoint = () => {
    const s = run.s, st = sStats(s);
    const ids = [...new Set(run.results.map(r => r.x.id))];
    const firstTry = ids.filter(id => { const r = run.results.find(q => q.x.id === id); return r && r.ok; }).length;
    const cameBack = ids.filter(id => { const rs = run.results.filter(q => q.x.id === id); return !rs[0].ok && rs[rs.length - 1].ok; }).length;
    const stillOpen = ids.filter(id => { const rs = run.results.filter(q => q.x.id === id); return !rs[rs.length - 1].ok; });
    const nx = nextWork(sIndex(s.id) + 1), tot = totals();
    let h = quizTop() + `<div class="stage s-${s.id}"><article class="card"><div class="kind"><i class="dot"></i>Session ${esc(s.n)} ${stillOpen.length ? 'paused' : 'complete'}</div>
      <h1 class="q">${esc(s.title)}</h1>
      <div class="score"><b><span data-count>0</span> / ${st.n}</b><span>right in this session · <b>${tot.right}</b> of ${tot.n} across the course</span></div>
      <div class="tri" data-stagger><div class="ok"><b>${firstTry}</b><span>right first time</span></div><div><b>${cameBack}</b><span>came back, then right</span></div><div class="${stillOpen.length ? 'bad' : ''}"><b>${stillOpen.length}</b><span>still open</span></div></div>`;
    if (stillOpen.length) {
      h += `<div class="miss"><h3>Still open, with the answer. They come back next time you continue.</h3>`;
      for (const id of stillOpen) { const it = run.results.find(q => q.x.id === id).x.it; h += `<div class="miss-row"><div class="mq">${inline(it.q)}</div><div class="ma">${inline(it.t === 'fill' ? `Correct: \`${it.a[0]}\`. ${it.why}` : `Correct: ${it.o[it.a]}. ${it.why}`)}</div></div>`; }
      h += '</div>';
    }
    if (nx) h += `<div class="nextup s-${nx.id}"><i class="dot"></i><span>Next up: <b>Session ${esc(nx.n)}, ${esc(nx.title)}</b> · ${nx.quiz.length} questions</span></div>`;
    else h += `<div class="nextup"><i class="dot"></i><span><b>Every session is done.</b> Start any session again from the start page to practice.</span></div>`;
    h += `<div class="card-foot"><a class="btn ghost" href="#/learn/${s.id}">${icons.back}Read Session ${esc(s.n)}</a><span class="sp"></span><a class="btn" href="#/">Start page</a>${nx ? `<button class="btn primary" type="button" data-act="continue">Continue ${icons.fwd} <kbd>Enter</kbd></button>` : `<a class="btn primary" href="#/quiz/${s.id}">Practice again</a>`}</div></article></div>`;
    main.innerHTML = h; bind(); tweenProg();
    run.state = 'check'; run.next = nx;
    anim.enter($('.card'));
    anim.count($('[data-count]'), sStats(s).right);
    const b = $('[data-act="continue"]'); if (b) b.focus({ preventScroll: true });
    main.querySelectorAll('[data-act]').forEach(x => x.addEventListener('click', () => act(x.dataset.act)));
    say(`Session ${s.n} ${stillOpen.length ? 'paused' : 'complete'}. ${sStats(s).right} of ${st.n} right.`);
  };
  const renderNextSession = () => { const nx = run && run.next; if (nx) { location.hash = `#/quiz/${nx.id}`; } else location.hash = '#/'; };

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = e.target && e.target.tagName;
    if (!run) { if (e.key === 'Enter' && (location.hash === '' || location.hash === '#/') && tag !== 'A' && tag !== 'BUTTON') { e.preventDefault(); location.hash = '#/quiz'; } return; }
    if (e.key === 'Escape') { location.hash = '#/'; return; }
    const go = f => { e.preventDefault(); f(); };
    if (run.state === 'check') { if (e.key === 'Enter' && tag !== 'A') go(() => act('continue')); return; }
    const inInput = tag === 'INPUT';
    if (run.state !== 'ask') { if (e.key === 'Enter') go(() => act('next')); return; }
    if (!inInput && (e.key === 's' || e.key === 'S')) return go(() => act('skip'));
    if (!inInput && (e.key === 'a' || e.key === 'A')) return go(() => act('see'));
    if (cur().it.t === 'mc' && /^[1-4]$/.test(e.key)) go(() => pick(+e.key - 1));
  });

  /* ---------- router ---------- */
  const route = () => {
    const h = location.hash || '#/';
    run = null; anim.killScroll();
    window.scrollTo(0, 0);
    if (h === '#/') return viewStart();
    if (h === '#/learn') { location.hash = `#/learn/${learnLast()}`; return; }
    if (h === '#/learn/libs') return viewLibs();
    if (h === '#/interpret') return viewInterpret();
    let m = h.match(/^#\/learn\/([a-z0-9]+)$/);
    if (m) { const s = sessionOf(m[1]); if (!s) { location.hash = '#/'; return; } return viewLearn(s); }
    if (h === '#/quiz') { const s = nextWork(0) || sessionOf(store.get('di-quiz-last', SESSIONS[0].id)) || SESSIONS[0]; return startQuiz(s); }
    m = h.match(/^#\/(?:quiz|flow|s)\/([a-z0-9]+)/);
    if (m) { const s = sessionOf(m[1]); if (!s) { location.hash = '#/'; return; } return startQuiz(s); }
    location.hash = '#/';
  };
  window.addEventListener('hashchange', route);
  route();
})();
