// Главная «Полезные люди» — интерактив без библиотек.
// Модули совместимы с будущим переносом в Alpine.js (каждый — изолированный data-* компонент).

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Мобильное меню ---------- */
function initMenu() {
  const btn = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (!btn || !menu) return;
  const header = $('[data-header]');
  const set = (open) => {
    if (open) menu.style.setProperty('--menu-top', `${Math.max(0, header.getBoundingClientRect().bottom)}px`);
    btn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    $('[data-menu-icon="open"]', btn).hidden = open;
    $('[data-menu-icon="close"]', btn).hidden = !open;
    $('[data-menu-label]', btn).textContent = open ? 'Закрыть меню' : 'Открыть меню';
    document.documentElement.style.overflow = open ? 'hidden' : '';
    const fab = $('[data-fab]');
    if (fab) fab.classList.toggle('is-menu-open', open);
    // фон недоступен с клавиатуры, пока открыто меню
    ['main', 'footer', '[data-fab]'].forEach((sel) => $(sel)?.toggleAttribute('inert', open));
  };
  btn.addEventListener('click', () => set(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); }
  });
  window.matchMedia('(min-width: 1280px)').addEventListener('change', (e) => { if (e.matches) set(false); });
}


/* ---------- Hero B: окна и часы на башне ---------- */
function initCity() {
  const city = $('[data-city]');
  if (!city) return;
  const toggle = $('[data-motion-toggle]', city);   // кнопка паузы убрана по просьбе заказчика — код работает и без неё
  const clock = $('[data-clock]', city);
  const handH = clock && $('[data-hand="h"]', clock);
  const handM = clock && $('[data-hand="m"]', clock);
  let paused = false;
  let timer = null;

  // Текстура для «клонов» окон — ровно тот файл, который выбрал браузер для <img>
  const stage = $('[data-city-stage]', city);
  const photo = $('img', stage);
  const setSrc = () => stage.style.setProperty('--city-src', `url("${photo.currentSrc || photo.src}")`);
  if (photo.complete && photo.naturalWidth) setSrc(); else photo.addEventListener('load', setSrc);

  // Часы показывают текущее время Йошкар-Олы (UTC+3)
  const tick = () => {
    if (!handH) return;
    const parts = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const get = (t) => Number(parts.find((p) => p.type === t).value);
    const h = get('hour'); const m = get('minute'); const s = get('second');
    handM.setAttribute('transform', `rotate(${(m + s / 60) * 6} 50 50)`);
    handH.setAttribute('transform', `rotate(${((h % 12) + m / 60) * 30} 50 50)`);
  };
  const start = () => { tick(); if (!timer) timer = setInterval(tick, 1000); };
  const stop = () => { clearInterval(timer); timer = null; };

  const apply = () => {
    city.dataset.motion = paused ? 'paused' : 'playing';
    if (toggle) toggle.setAttribute('aria-pressed', String(paused));
    if (toggle) {
      $('[data-motion-icon="pause"]', toggle).hidden = paused;
      $('[data-motion-icon="play"]', toggle).hidden = !paused;
      $('[data-motion-label]', toggle).textContent = paused ? 'Включить анимацию' : 'Остановить анимацию';
    }
    paused ? stop() : start();
  };
  toggle?.addEventListener('click', () => { paused = !paused; apply(); });

  // При reduce-motion окна не мигают (CSS), часы стоят на текущем времени, кнопка не нужна
  const syncReduce = () => {
    if (toggle) toggle.hidden = reduceMQ.matches;
    if (reduceMQ.matches) { stop(); tick(); } else apply();
  };
  reduceMQ.addEventListener('change', syncReduce);
  syncReduce();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (!paused && !reduceMQ.matches) start();
  });
}

/* ---------- Заглушки разделов следующих этапов ---------- */
function initStubs() {
  const dialog = $('[data-stub-dialog]');
  if (!dialog) return;
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-stub]');
    if (!link) return;
    e.preventDefault();
    $('[data-stub-title]', dialog).textContent = link.dataset.stub;
    $('[data-stub-text]', dialog).textContent = 'Этот раздел появится на следующих этапах. Сейчас на согласовании только главная страница.';
    openDialog(dialog, link);
  });
}

/* ---------- Диалоги: native <dialog>, возврат фокуса ---------- */
const openers = new WeakMap();
function openDialog(dialog, opener) {
  openers.set(dialog, opener || document.activeElement);
  dialog.showModal();
}
function initDialogs() {
  $$('dialog').forEach((d) => {
    d.addEventListener('click', (e) => {
      if (e.target.closest('[data-dialog-close]') || e.target === d) d.close();
    });
    d.addEventListener('close', () => {
      const o = openers.get(d);
      if (o && typeof o.focus === 'function') o.focus();
    });
  });
}

/* ---------- Поиск ---------- */
function initSearch() {
  const form = $('[data-search]');
  if (!form) return;
  const err = $('[data-search-error]', form);
  // Вкладки «Купить / Новостройки» синхронизированы со списком «Тип недвижимости»
  const tabs = $$('[name="scope"]', form);
  const type = form.elements.type;
  tabs.forEach((t) => t.addEventListener('change', () => {
    if (t.value === 'new') type.value = 'new';
    else if (type.value === 'new') type.value = '';
  }));
  type.addEventListener('change', () => {
    const v = type.value === 'new' ? 'new' : '';
    tabs.forEach((t) => { t.checked = t.value === v; });
  });
  $$('[data-money]', form).forEach((input) => {
    input.addEventListener('input', () => {
      const digits = input.value.replace(/\D/g, '').slice(0, 10);
      input.value = digits ? Number(digits).toLocaleString('ru-RU') : '';
    });
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const num = (n) => Number((form.elements[n].value || '').replace(/\D/g, '')) || 0;
    const from = num('price_from'); const to = num('price_to');
    if (from && to && from > to) {
      err.textContent = 'Минимальная цена больше максимальной — поменяйте значения местами.';
      err.classList.remove('hidden');
      form.elements.price_to.setAttribute('aria-invalid', 'true');
      form.elements.price_to.focus();
      return;
    }
    err.classList.add('hidden');
    form.elements.price_to.removeAttribute('aria-invalid');
    const dialog = $('[data-stub-dialog]');
    const chosen = ['type', 'district', 'rooms']
      .map((n) => form.elements[n])
      .filter((el) => el.value)
      .map((el) => el.selectedOptions[0].textContent.trim());
    if (from) chosen.push(`от ${from.toLocaleString('ru-RU')} ₽`);
    if (to) chosen.push(`до ${to.toLocaleString('ru-RU')} ₽`);
    $('[data-stub-title]', dialog).textContent = 'Каталог объектов';
    $('[data-stub-text]', dialog).textContent = `Каталог с фильтрами и данными из CRM BISHOP подключим на этапе 2. ${chosen.length ? `Ваш запрос: ${chosen.join(', ')}.` : 'Сейчас будут показаны все объекты.'}`;
    openDialog(dialog, form.querySelector('[type="submit"]'));
  });
}

/* ---------- Объекты: «показать ещё» на мобильном ---------- */
function initObjectsMore() {
  const btn = $('[data-objects-more]');
  const grid = $('[data-objects]');
  if (!btn || !grid) return;
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    grid.classList.toggle('[&>*:nth-child(n+5)]:max-sm:hidden', !open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Свернуть' : 'Показать ещё 8 объектов';
    if (open) grid.children[4]?.querySelector('a')?.focus({ preventScroll: true });
  });
}

/* ---------- Карусель команды (crossfade, автосмена с паузой — WCAG 2.2.2) ---------- */
function initCarousel() {
  const root = $('[data-carousel]');
  if (!root) return;
  const viewport = $('[data-carousel-viewport]', root);
  const slides = $$('[data-slide]', root);
  const segs = $$('.seg', root);
  const toggle = $('[data-carousel-toggle]', root);
  const ms = 6000;
  let index = 0; let timer = null;
  let userPaused = reduceMQ.matches; let hoverPaused = false;

  $('[data-carousel-total]', root).textContent = slides.length;

  const render = () => {
    slides.forEach((s, i) => {
      const on = i === index;
      s.classList.toggle('is-active', on);
      s.toggleAttribute('aria-hidden', !on);
      const im = s.querySelector('img');
      if (on && im) im.loading = 'eager';
    });
    segs.forEach((g, i) => {
      g.classList.toggle('is-done', i < index);
      g.classList.remove('is-active');
      if (i === index) { void g.offsetWidth; g.classList.add('is-active'); }
    });
    $('[data-carousel-current]', root).textContent = index + 1;
  };
  const go = (i) => { index = (i + slides.length) % slides.length; render(); schedule(); };
  const playing = () => !userPaused && !hoverPaused && !document.hidden;
  function schedule() {
    clearTimeout(timer);
    viewport.dataset.playing = String(playing());
    if (playing()) timer = setTimeout(() => go(index + 1), ms);
  }
  const syncToggle = () => {
    toggle.setAttribute('aria-pressed', String(userPaused));
    $('[data-icon="pause"]', toggle).hidden = userPaused;
    $('[data-icon="play"]', toggle).hidden = !userPaused;
    $('[data-carousel-toggle-label]', root).textContent = userPaused ? 'Смотреть' : 'Пауза';
  };

  $('[data-carousel-prev]', root).addEventListener('click', () => go(index - 1));
  $('[data-carousel-next]', root).addEventListener('click', () => go(index + 1));
  toggle.addEventListener('click', () => { userPaused = !userPaused; syncToggle(); render(); schedule(); });
  root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hoverPaused = true; schedule(); } });
  root.addEventListener('pointerleave', () => { if (hoverPaused) { hoverPaused = false; render(); schedule(); } });
  root.addEventListener('focusin', () => { hoverPaused = true; schedule(); });
  root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) { hoverPaused = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  });

  // Свайп
  let x0 = null;
  viewport.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  viewport.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  });
  viewport.addEventListener('pointercancel', () => { x0 = null; });

  reduceMQ.addEventListener('change', (e) => { if (e.matches) { userPaused = true; syncToggle(); schedule(); } });
  syncToggle();
  render();
  schedule();
}

/* ---------- Формы заявок ---------- */
function formatPhone(value) {
  let d = value.replace(/\D/g, '');
  if (d.startsWith('8') || d.startsWith('7')) d = d.slice(1);
  d = d.slice(0, 10);
  if (!d) return '';
  const p = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)];
  let out = `+7 (${p[0]}`;
  if (d.length >= 3) out += ')';
  if (p[1]) out += ` ${p[1]}`;
  if (p[2]) out += `-${p[2]}`;
  if (p[3]) out += `-${p[3]}`;
  return out;
}

function initLeadForms() {
  $$('[data-phone]').forEach((input) => {
    input.addEventListener('input', () => { input.value = formatPhone(input.value); });
    input.addEventListener('focus', () => { if (!input.value) input.value = '+7 ('; });
    input.addEventListener('blur', () => { if (input.value === '+7 (') input.value = ''; });
  });

  $$('[data-lead-form]').forEach((form) => {
    const box = form.parentElement;
    const success = $('[data-lead-success]', box);
    const fields = $$('[required]', form);

    const validate = (el) => {
      let ok = el.type === 'checkbox' ? el.checked : el.value.trim().length > 0;
      if (ok && el.hasAttribute('data-phone')) ok = el.value.replace(/\D/g, '').length === 11;
      const err = document.getElementById(el.getAttribute('aria-describedby'));
      el.setAttribute('aria-invalid', String(!ok));
      if (err) { err.hidden = ok; err.textContent = ok ? '' : el.dataset.msg; }
      return ok;
    };
    fields.forEach((el) => {
      el.addEventListener(el.type === 'checkbox' ? 'change' : 'blur', () => {
        if (el.getAttribute('aria-invalid') === 'true' || el.type === 'checkbox') validate(el);
      });
      el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') validate(el); });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = fields.filter((el) => !validate(el));
      if (bad.length) { bad[0].focus(); return; }
      if (form.elements.website?.value) return; // honeypot
      const data = Object.fromEntries(new FormData(form));
      data.page = location.pathname;
      // Этап 2: POST /api/leads → админка + MAX. Здесь — только демонстрация состояния.
      const ti = $('[data-lead-intent]', success); if (ti) ti.textContent = data.intent || 'Консультация';
      form.hidden = true;
      success.classList.remove('hidden');
      success.focus();
    });

    $$('[data-lead-reset]', success).forEach((b) => b.addEventListener('click', () => {
      form.reset();
      fields.forEach((el) => el.removeAttribute('aria-invalid'));
      form.hidden = false;
      success.classList.add('hidden');
      form.querySelector('input:not([type=hidden]):not([type=radio])')?.focus();
    }));

    const dlg = form.closest('dialog');
    if (dlg) dlg.addEventListener('close', () => {
      if (!form.hidden) return;
      form.reset(); form.hidden = false; success.classList.add('hidden');
    });
  });
}

/* ---------- CTA с темой обращения → форма консультации ---------- */
function initIntents() {
  const modal = $('[data-lead-modal]');
  const titles = { 'Покупка': 'Подберём недвижимость', 'Продажа': 'Поможем продать', 'Консультация': 'Бесплатная консультация' };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-intent]');
    if (!a || !modal) return;
    e.preventDefault();
    const intent = a.dataset.intent;
    // Если открыто мобильное меню — закрываем его
    const menuBtn = $('[data-menu-toggle]');
    if (menuBtn?.getAttribute('aria-expanded') === 'true') menuBtn.click();
    const form = $('[data-lead-form="modal"]', modal);
    const radio = $(`input[name="intent"][value="${intent}"]`, form);
    if (radio) radio.checked = true;
    const title = $('[data-lead-title]', modal);
    if (title) title.textContent = titles[intent] || 'Оставьте заявку';
    openDialog(modal, a);
    setTimeout(() => $('#m-name', modal)?.focus(), 50);
  });
  // Смена темы внутри окна меняет заголовок
  $$('input[name="intent"]', modal || document).forEach((r) => r.addEventListener('change', () => {
    const title = $('[data-lead-title]', modal);
    if (title && r.checked) title.textContent = titles[r.value] || 'Оставьте заявку';
  }));
}

/* ---------- Блик на зелёных кнопках: запуск при появлении на экране ---------- */
function initSheen() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const timers = new WeakMap();
  // Появилась на экране — разводы плывут 4,8 с (меньше 5 с по WCAG 2.2.2) и плавно останавливаются на месте
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      clearTimeout(timers.get(target));
      target.classList.toggle('is-shining', isIntersecting);
      if (isIntersecting) timers.set(target, setTimeout(() => target.classList.remove('is-shining'), 4800));
    });
  }, { threshold: 0.9 });
  $$('.btn-primary').forEach((b) => io.observe(b));
}

/* ---------- Верхняя полоса: статус офиса по времени МСК (Йошкар-Ола = МСК) ---------- */
function initTopbar() {
  const bar = $('[data-topbar]');
  if (!bar) return;
  const status = $('[data-topbar-status]', bar);
  if (!status) return;                       // статус в строке сейчас не показывается
  let hours = {};
  try { hours = JSON.parse(bar.dataset.hours || '{}'); } catch (e) { return; }
  const days = ['в воскресенье', 'в понедельник', 'во вторник', 'в среду', 'в четверг', 'в пятницу', 'в субботу'];
  const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Moscow', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
  const hh = (h) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

  const update = () => {
    const p = Object.fromEntries(fmt.formatToParts(new Date()).map((x) => [x.type, x.value]));
    const day = wd[p.weekday];
    const now = Number(p.hour) + Number(p.minute) / 60;
    const today = hours[day];
    let open = false; let text;
    if (today && now >= today[0] && now < today[1]) {
      open = true; text = `Открыто до ${hh(today[1])}`;
    } else if (today && now < today[0]) {
      text = `Откроемся сегодня в ${hh(today[0])}`;
    } else {
      for (let i = 1; i <= 7; i += 1) {
        const d = (day + i) % 7;
        if (hours[d]) { text = `Откроемся ${i === 1 ? 'завтра' : days[d]} в ${hh(hours[d][0])}`; break; }
      }
    }
    if (text) { status.textContent = text; status.title = text; }
    bar.dataset.open = String(open);
  };
  update();
  setInterval(update, 60000);

  // «Перезвоним вам» открывает то же окно, что и круглая кнопка
  const btn = $('[data-callback-open]', bar);
  const dialog = $('[data-callback]');
  if (btn && dialog) btn.addEventListener('click', () => openDialog(dialog, btn));
}

/* ---------- Фото дома: дрейф облаков — пауза (WCAG 2.2.2) и остановка вне экрана ---------- */
function initSky() {
  const fig = $('[data-sky]');
  if (!fig) return;
  const btn = $('[data-sky-toggle]', fig);
  if (btn) btn.addEventListener('click', () => {
    const paused = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(paused));
    btn.setAttribute('aria-label', paused ? 'Включить движение облаков' : 'Остановить движение облаков');
    fig.toggleAttribute('data-sky-paused', paused);
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => fig.toggleAttribute('data-sky-offscreen', !en.isIntersecting)).observe(fig);
  }
}

/* ---------- Карточки объектов: галерея по зонам (как на Авито), свайп на телефоне ---------- */
function initObjGallery() {
  $$('[data-gallery]').forEach((media) => {
    const imgs = $$('img', media);
    const segs = $$('.obj-segs i', media);
    const n = imgs.length;
    if (n < 2) return;
    let cur = 0;
    const show = (i) => {
      if (i === cur) return;
      cur = i;
      imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
      segs.forEach((sg, k) => sg.classList.toggle('is-on', k === i));
    };
    segs[0]?.classList.add('is-on');
    imgs.forEach((im) => { im.loading = 'eager'; });   // догружаем остальные фото при первом взаимодействии
    media.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = media.getBoundingClientRect();
      show(Math.min(n - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * n))));
    });
    media.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') show(0); });
    // Свайп пальцем
    let x0 = null;
    media.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; media.classList.add('is-touched'); }, { passive: true });
    media.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 30) show((cur + (dx < 0 ? 1 : n - 1)) % n);
    });
    // Клик по фото открывает объект, как клик по карточке
    media.addEventListener('click', () => media.closest('.obj-card')?.querySelector('.obj-link')?.click());
  });
}

/* ---------- О нас: карусель фото команды, 2,5 с ---------- */
function initAboutSlides() {
  const root = $('[data-about-slides]');
  if (!root) return;
  const slides = $$('.about3-slide', root);
  const segs = $$('.about3-segs i', root);
  const btn = $('[data-about-pause]', root);
  let i = 0; let timer = null; let hover = false; let offscreen = false;
  let paused = reduceMQ.matches;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((im, k) => { im.classList.toggle('is-on', k === i); im.toggleAttribute('aria-hidden', k !== i); if (k === i) im.loading = 'eager'; });
    segs.forEach((sg, k) => sg.classList.toggle('is-on', k === i));
  };
  const run = () => {
    clearInterval(timer);
    if (!paused && !hover && !offscreen && !document.hidden) timer = setInterval(() => show(i + 1), 2500);
  };
  const sync = () => {
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(paused));
    btn.setAttribute('aria-label', paused ? 'Включить смену фото' : 'Остановить смену фото');
  };
  btn?.addEventListener('click', () => { paused = !paused; sync(); run(); });
  root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hover = true; run(); } });
  root.addEventListener('pointerleave', () => { hover = false; run(); });
  document.addEventListener('visibilitychange', run);
  if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { offscreen = !en.isIntersecting; run(); }).observe(root);
  let x0 = null;
  root.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', (e) => {
    if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) { show(i + (dx < 0 ? 1 : -1)); run(); }
  });
  reduceMQ.addEventListener('change', (e) => { if (e.matches) { paused = true; sync(); run(); } });
  show(0); sync(); run();
}

/* ---------- Уведомление о cookie ---------- */
function initCookie() {
  const bar = $('[data-cookie]');
  if (!bar) return;
  const KEY = 'pl-cookie-ok';
  try { if (localStorage.getItem(KEY)) return; } catch (e) { /* приватный режим — покажем */ }
  setTimeout(() => { bar.hidden = false; bar.classList.add('is-in'); }, 800);
  $('[data-cookie-accept]', bar).addEventListener('click', () => {
    try { localStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
    bar.classList.remove('is-in'); bar.classList.add('is-out');
    setTimeout(() => { bar.hidden = true; }, reduceMQ.matches ? 0 : 220);
  });
}

/* ---------- Подсказка «Есть вопрос?»: через 30 с, один раз за сессию ---------- */
function initAskToast() {
  const t = $('[data-ask-toast]');
  if (!t) return;
  const KEY = 'pl-ask-shown';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) { /* приватный режим */ }
  const hide = () => {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
    t.classList.remove('is-in'); t.classList.add('is-out');
    setTimeout(() => { t.hidden = true; t.classList.remove('is-out'); }, reduceMQ.matches ? 0 : 220);
  };
  const show = () => {
    // не мешаем, если человек уже заполняет заявку или открыто меню
    if ($('dialog[open]') || $('[data-menu-toggle]')?.getAttribute('aria-expanded') === 'true') { setTimeout(show, 10000); return; }
    t.hidden = false; t.classList.add('is-in');
  };
  setTimeout(show, 12000);
  $('[data-ask-close]', t).addEventListener('click', hide);
  $('[data-ask-open]', t).addEventListener('click', (e) => {
    const dlg = $('[data-callback]');
    hide();
    if (dlg) openDialog(dlg, $('.fab') || e.currentTarget);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !t.hidden && !$('dialog[open]')) hide(); });
}

/* ---------- «Чем мы занимаемся»: слайдер с плавным сдвигом и бесконечным циклом ---------- */
function initDirSlider() {
  const view = $('[data-dslider]');
  const track = $('[data-dtrack]', view || document);
  if (!view || !track) return;
  const real = $$('.dcard', track);
  const n = real.length;
  if (n < 2) return;
  // Клоны всех карточек слева и справа — для бесшовного цикла
  const mkClone = (el) => {
    const c = el.cloneNode(true);
    c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; c.dataset.clone = '';
    return c;
  };
  real.slice().reverse().forEach((el) => track.prepend(mkClone(el)));
  real.forEach((el) => track.append(mkClone(el)));

  let index = n; let busy = false;
  const step = () => real[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
  const place = (instant) => {
    track.classList.toggle('is-instant', !!instant);
    track.style.transform = `translate3d(${-index * step()}px, 0, 0)`;
    if (instant) { void track.offsetWidth; track.classList.remove('is-instant'); }
  };
  const go = (d) => {
    if (busy) return;
    index += d; place(false);
    busy = !reduceMQ.matches;
    if (!busy) normalize();
  };
  const normalize = () => {
    if (index >= 2 * n) index -= n;
    if (index < n) index += n;
    place(true);
    busy = false;
  };
  track.addEventListener('transitionend', (e) => { if (e.target === track) normalize(); });

  // Отступ до краёв экрана (как у сетки страницы)
  const bleed = () => {
    if (innerWidth < 640) view.style.removeProperty('--bleed');
    else view.style.setProperty('--bleed', `${Math.round(view.parentElement.getBoundingClientRect().left)}px`);
    place(true);
  };
  bleed();
  window.addEventListener('resize', bleed);

  $('[data-dslide-prev]')?.addEventListener('click', () => go(-1));
  $('[data-dslide-next]')?.addEventListener('click', () => go(1));
  view.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });

  // Свайп / перетаскивание
  let x0 = null; let dx = 0; let moved = false;
  view.addEventListener('pointerdown', (e) => {
    if (busy || (e.pointerType === 'mouse' && e.button !== 0)) return;
    x0 = e.clientX; dx = 0; moved = false;
    track.classList.add('is-instant');
  });
  view.addEventListener('pointermove', (e) => {
    if (x0 === null) return;
    dx = e.clientX - x0;
    if (Math.abs(dx) > 6) moved = true;
    track.style.transform = `translate3d(${-index * step() + dx}px, 0, 0)`;
  });
  const end = () => {
    if (x0 === null) return;
    x0 = null; track.classList.remove('is-instant');
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); else place(false);
  };
  view.addEventListener('pointerup', end);
  view.addEventListener('pointercancel', end);
  view.addEventListener('pointerleave', end);
  // после перетаскивания не открываем карточку случайным кликом
  view.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  view.addEventListener('dragstart', (e) => e.preventDefault());
}

/* ---------- Плавающая кнопка звонка ---------- */
function initFab() {
  const wrap = $('[data-fab]');
  const toggle = $('[data-fab-toggle]');
  const menu = $('[data-fab-menu]');
  const dialog = $('[data-callback]');
  if (!wrap || !toggle || !menu) return;
  const label = $('[data-fab-label]', toggle);

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Закрыть способы связи' : 'Связаться с нами';
    menu.hidden = !open;
    menu.classList.toggle('is-open', open);
  };
  setOpen(false);
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  // Пункт меню выбран — меню закрываем (ссылки и заглушки срабатывают как обычно)
  menu.addEventListener('click', (e) => { if (e.target.closest('.fab-item')) setOpen(false); });
  const cb = $('[data-fab-callback]', menu);
  if (cb && dialog) cb.addEventListener('click', () => openDialog(dialog, toggle));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) setOpen(false); });

  // Прячем у формы консультации и в подвале, чтобы не закрывать поля и юридические ссылки
  const targets = ['#consultation form', 'footer'].map((sel) => $(sel)).filter(Boolean);
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
    const hide = visible.size > 0;
    if (hide) setOpen(false);
    wrap.classList.toggle('is-hidden', hide);
    wrap.toggleAttribute('inert', hide);
  }, { threshold: 0.15 });
  targets.forEach((t) => io.observe(t));
}

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initCity();
  initDialogs();
  initStubs();
  initSearch();
  initObjectsMore();
  initCarousel();
  initLeadForms();
  initIntents();
  initFab();
  initSheen();
  initTopbar();
  initSky();
  initObjGallery();
  initAboutSlides();
  initCookie();
  initDirSlider();
  initAskToast();
});
