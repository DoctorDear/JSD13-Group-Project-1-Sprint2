/* ============================================================
   Zeta auth — shared behaviour
   Load with <script src="auth.js"></script> before page script.
   ============================================================ */
window.Auth = (function () {
  'use strict';

  /* Flip to false once the API is live. While true, every request()
     resolves after a short delay without touching the network. */
  const MOCK = true;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const KEYS = {
    pending:   'zj.pendingEmail',    // session: address awaiting verification
    last:      'zj.lastEmail',       // local:   last address used successfully
    verifyGap: 'zj.resendAt',        // local:   verification resend cooldown
    resetGap:  'zj.resetResendAt',   // local:   reset resend cooldown
  };

  const $  = (id) => document.getElementById(id);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------- storage (never throws in private mode) ---------- */
  function bag(name) {
    return {
      get(k)    { try { return window[name].getItem(k) || ''; } catch (_) { return ''; } },
      set(k, v) { try { window[name].setItem(k, v); } catch (_) {} },
      del(k)    { try { window[name].removeItem(k); } catch (_) {} },
    };
  }
  const local = bag('localStorage');
  const session = bag('sessionStorage');

  /* ---------- URL ---------- */
  const params = new URLSearchParams(location.search);
  const param = (k) => params.get(k);

  /* Only same-origin, path-relative destinations survive. */
  function safeNext(fallback) {
    const raw = params.get('next');
    const out = fallback || '/';
    if (!raw) return out;
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return out;   // scheme → external
    if (raw.startsWith('//') || raw.startsWith('\\')) return out;
    if (!raw.startsWith('/')) return out;
    if (/[\u0000-\u001F]/.test(raw)) return out;
    return raw;
  }
  const next = safeNext('/');
  const carry = encodeURIComponent(next);
  const to = (page) => page + '?next=' + carry;

  /* Remove a single-use token from the URL before it reaches history,
     a Referer header, or any analytics script reading location.search. */
  function stripToken() {
    const clean = location.pathname + (next !== '/' ? '?next=' + carry : '');
    history.replaceState(null, '', clean);
  }

  /* ---------- network ---------- */
  /* map turns status codes and body.code strings into boolean flags:
       request(url, body, { 401:'bad', email_unverified:'unverified' })
     → catch (err) { if (err.bad) … if (err.unverified) … } */
  async function request(url, body, map) {
    if (MOCK) {
      await new Promise((r) => setTimeout(r, 850));
      return { ok: true };
    }
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {}),
      });
    } catch (_) {
      throw Object.assign(new Error('network'), { network: true });
    }
    if (res.ok) return res.status === 204 ? {} : res.json().catch(() => ({}));

    const payload = await res.json().catch(() => ({}));
    const err = new Error(payload.code || String(res.status));
    err.status = res.status;
    err.code = payload.code || '';
    err.detail = payload.message || '';
    if (res.status === 429) err.retryAfter = Number(res.headers.get('Retry-After')) || 60;
    const flag = map && (map[payload.code] || map[res.status]);
    if (flag) err[flag] = true;
    throw err;
  }

  /* ---------- view switching ---------- */
  function views(selector) {
    const all = qsa(selector || '.state');
    return function show(id) { all.forEach((s) => (s.hidden = s.id !== id)); };
  }

  /* ---------- alerts ---------- */
  function alertBox(el) {
    const target = el.querySelector('[data-text]') || el;
    return {
      show(msg) { target.textContent = msg; el.hidden = false; },
      hide() { el.hidden = true; },
      flash(msg, ms) { this.show(msg); setTimeout(() => (el.hidden = true), ms || 6000); },
    };
  }

  /* ---------- buttons ---------- */
  function busy(btn, on) {
    btn.classList.toggle('is-loading', Boolean(on));
    if (on) btn.disabled = true;
  }

  /* ---------- fields ---------- */
  function togglePasswords(root) {
    qsa('.field__toggle', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const f = $(btn.dataset.target);
        const shown = f.type === 'text';
        f.type = shown ? 'password' : 'text';
        btn.textContent = shown ? 'Show' : 'Hide';
        btn.setAttribute('aria-label', shown ? 'Show password' : 'Hide password');
        f.focus();
      });
    });
  }

  function capsLock(input, hint) {
    const onKey = (e) => {
      if (typeof e.getModifierState !== 'function') return;
      hint.hidden = !e.getModifierState('CapsLock');
    };
    input.addEventListener('keydown', onKey);
    input.addEventListener('keyup', onKey);
    input.addEventListener('blur', () => (hint.hidden = true));
  }

  function emailField(input, hint, onChange) {
    const ok = () => EMAIL_RE.test(input.value.trim());
    input.addEventListener('input', () => {
      hint.hidden = true;
      input.classList.remove('is-error');
      if (onChange) onChange();
    });
    input.addEventListener('blur', () => {
      const bad = Boolean(input.value.trim()) && !ok();
      hint.textContent = bad ? 'Enter a valid email address.' : '';
      hint.hidden = !bad;
      input.classList.toggle('is-error', bad);
    });
    return { ok, value: () => input.value.trim(), el: input };
  }

  /* ---------- password strength ---------- */
  /* Keep in step with the server policy, or hydrate from GET /api/auth/policy. */
  const RULES = [
    { id: 'len',  label: 'At least 10 characters', test: (v) => v.length >= 10 },
    { id: 'case', label: 'Upper & lowercase',      test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
    { id: 'num',  label: 'A number',               test: (v) => /\d/.test(v) },
    { id: 'sym',  label: 'A symbol',               test: (v) => /[^\w\s]/.test(v) },
  ];
  const LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

  function strength(input, els, rules) {
    const set = rules || RULES;

    els.rules.innerHTML = '';
    set.forEach((rule) => {
      const li = document.createElement('li');
      li.className = 'rules__item';
      li.dataset.rule = rule.id;
      li.innerHTML = '<span class="rules__dot" aria-hidden="true"></span>' + rule.label;
      els.rules.appendChild(li);
    });

    function evaluate(v) {
      const passed = set.filter((r) => r.test(v)).map((r) => r.id);
      return { passed, score: passed.length, valid: passed.length === set.length };
    }

    function paint() {
      const v = input.value;
      const r = evaluate(v);
      set.forEach((rule) => {
        els.rules
          .querySelector('[data-rule="' + rule.id + '"]')
          .classList.toggle('is-met', r.passed.includes(rule.id));
      });
      els.meter.hidden = !v;
      els.fill.style.width = (r.score / set.length * 100) + '%';
      els.fill.dataset.score = r.score;
      els.label.textContent = v ? LABELS[r.score] : '';
      return r;
    }

    return { paint, valid: () => evaluate(input.value).valid };
  }

  function confirmField(first, second, hint) {
    const matches = () => second.value.length > 0 && first.value === second.value;
    second.addEventListener('blur', () => {
      const bad = second.value.length > 0 && !matches();
      hint.hidden = !bad;
      second.classList.toggle('is-error', bad);
    });
    return {
      matches,
      reset() { hint.hidden = true; second.classList.remove('is-error'); },
    };
  }

  /* ---------- resend cooldown (persisted, cross-tab) ---------- */
  function cooldown(key, seconds) {
    const left = () => {
      const until = Number(local.get(key) || 0);
      return Math.max(0, Math.ceil((until - Date.now()) / 1000));
    };
    const start = (s) => local.set(key, String(Date.now() + (s || seconds) * 1000));
    const clear = () => local.del(key);

    /* run() should handle its own success messaging and rethrow on failure.
       A thrown err.retryAfter extends the cooldown automatically. */
    function attach(btn, run) {
      const label = btn.querySelector('.btn__text');
      const base = label.textContent;
      let timer = null;

      const tick = () => {
        const n = left();
        if (n > 0) {
          btn.disabled = true;
          label.textContent = 'Resend in ' + n + 's';
        } else {
          btn.disabled = false;
          label.textContent = base;
          clearInterval(timer);
          timer = null;
        }
      };
      const sync = () => { tick(); if (!timer && left() > 0) timer = setInterval(tick, 1000); };

      btn.addEventListener('click', async () => {
        if (left() > 0) return;
        busy(btn, true);
        try {
          await run();
          start();
        } catch (err) {
          if (err.retryAfter) start(err.retryAfter);
        } finally {
          busy(btn, false);
          sync();
        }
      });

      window.addEventListener('storage', (e) => { if (e.key === key) sync(); });
      sync();
      return { sync, start: (s) => { start(s); sync(); } };
    }

    return { left, start, clear, attach };
  }

  /* ---------- redirect countdown ---------- */
  function countdown(el, seconds, template, done) {
    let n = seconds;
    const tick = () => {
      el.textContent = template(n);
      if (n <= 0) { clearInterval(t); done(); return; }
      n -= 1;
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }

  /* ---------- misc ---------- */
  const isDesktop = () => window.matchMedia('(min-width: 641px)').matches;

  return {
    MOCK, KEYS, EMAIL_RE, RULES, LABELS,
    $, qsa, local, session, param, next, carry, to, safeNext, stripToken,
    request, views, alertBox, busy,
    togglePasswords, capsLock, emailField, strength, confirmField,
    cooldown, countdown, isDesktop,
  };
})();