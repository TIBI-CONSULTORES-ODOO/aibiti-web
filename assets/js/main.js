/* =====================================================================
   AiBiTi Consulting — comportamiento del sitio (sin dependencias)
   1 Configuración · 2 Menú móvil · 3 Aparición al scroll · 4 WhatsApp
   4b Calendario Cal.com · 5 Formulario de contacto
   ===================================================================== */
(function () {
  'use strict';

  /* 1. CONFIGURACIÓN ------------------------------------------------------
     Lo único que debes completar para dejar el sitio operativo.
     - web3formsKey: access_key PÚBLICA de https://web3forms.com (es normal que
       vaya en el código; no es una contraseña). Restríngela a tu dominio en su panel.
     - whatsapp: número con código de país y sin signos, p. ej. 5215512345678. */
  var CONFIG = {
    email: 'contacto@aibiti.com.mx',
    web3formsKey: 'cb075f15-5f40-48ce-afd1-38ef0a3283c8',
    whatsapp: '525641340392',
    calLink: 'PENDIENTE/diagnostico-30min', // enlace de Cal.com (usuario/evento); mientras diga PENDIENTE o esté vacío no se muestra el calendario
    whatsappMensaje: 'Hola, vi su sitio aibiti.com.mx y me gustaría agendar un diagnóstico.'
  };
  var esPendiente = function (valor) { return String(valor).indexOf('TODO') === 0; };

  /* 2. MENÚ MÓVIL -------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu-principal');
  if (toggle && menu) {
    var iconoAbrir = toggle.querySelector('[data-icon-open]');
    var iconoCerrar = toggle.querySelector('[data-icon-close]');
    var setMenu = function (abierto) {
      menu.setAttribute('data-open', String(abierto));
      toggle.setAttribute('aria-expanded', String(abierto));
      toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
      // Los SVG no tienen la propiedad .hidden: se usa el atributo.
      iconoAbrir.toggleAttribute('hidden', abierto);
      iconoCerrar.toggleAttribute('hidden', !abierto);
    };
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { setMenu(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* 3. APARICIÓN AL SCROLL ----------------------------------------------- */
  var elementos = document.querySelectorAll('.reveal');
  var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !sinMovimiento) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12 });
    elementos.forEach(function (el) { observador.observe(el); });
  } else {
    elementos.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* 4. WHATSAPP ----------------------------------------------------------
     Mientras no haya número configurado, el botón abre el correo (no queda roto). */
  var botonWa = document.getElementById('btn-whatsapp');
  if (botonWa && !esPendiente(CONFIG.whatsapp)) {
    botonWa.href = 'https://wa.me/' + encodeURIComponent(CONFIG.whatsapp) +
      '?text=' + encodeURIComponent(CONFIG.whatsappMensaje);
    botonWa.target = '_blank';
  }

  /* 4b. CALENDARIO (Cal.com) ----------------------------------------------
     Solo se activa si CONFIG.calLink es un enlace real ("usuario/evento"). El script de
     Cal.com se carga cuando #contacto se acerca al viewport. Si falla, o no hay enlace,
     la columna del calendario se oculta y el formulario ocupa todo el ancho. */
  var calCol = document.getElementById('agendar');
  var calCols = document.querySelector('[data-contact-cols]');
  var calEnlaces = document.querySelectorAll('[data-agendar]');
  var mostrarCal = function (activo) {
    if (!calCol) { return; }
    calCol.hidden = !activo;
    if (calCols) { calCols.classList.toggle('contact-cols--solo', !activo); }
    // Los botones "Agendar diagnóstico" bajan al calendario solo si existe; si no, al formulario.
    calEnlaces.forEach(function (a) { a.setAttribute('href', activo ? '#agendar' : '#contacto'); });
  };
  if (calCol && CONFIG.calLink && !/PENDIENTE|TODO/.test(CONFIG.calLink)) {
    mostrarCal(true);
    var calCargado = false;
    var cargarCal = function () {
      if (calCargado) { return; }
      calCargado = true;
      var fallo = function () { mostrarCal(false); };
      // Fragmento oficial de Cal.com; el único cambio es que el <script> se crea aquí para detectar errores de carga.
      (function (C, A, L) {
        var p = function (a, ar) { a.q.push(ar); };
        var d = C.document;
        C.Cal = C.Cal || function () {
          var cal = C.Cal, ar = arguments;
          if (!cal.loaded) {
            cal.ns = {}; cal.q = cal.q || [];
            var s = d.createElement('script');
            s.src = A; s.async = true; s.onerror = fallo;
            d.head.appendChild(s);
            cal.loaded = true;
          }
          if (ar[0] === L) {
            var api = function () { p(api, arguments); };
            var ns = ar[1];
            api.q = api.q || [];
            if (typeof ns === 'string') {
              cal.ns[ns] = cal.ns[ns] || api;
              p(cal.ns[ns], ar);
              p(cal, ['initNamespace', ns]);
            } else { p(cal, ar); }
            return;
          }
          p(cal, ar);
        };
      })(window, 'https://app.cal.com/embed/embed.js', 'init');

      window.Cal('init', 'diagnostico', { origin: 'https://app.cal.com' });
      var cal = window.Cal.ns.diagnostico;
      cal('inline', { elementOrSelector: '#cal-embed', calLink: CONFIG.calLink, config: { layout: 'month_view', theme: 'dark' } });
      cal('ui', { theme: 'dark', hideEventTypeDetails: false, layout: 'month_view',
        cssVarsPerTheme: { light: { 'cal-brand': '#E9EFF6' }, dark: { 'cal-brand': '#E9EFF6' } } });
      cal('on', { action: 'linkFailed', callback: fallo });
      cal('on', { action: 'linkReady', callback: function () {
        var aviso = calCol.querySelector('.cal-loading');
        if (aviso) { aviso.remove(); }
      } });
    };
    var seccionContacto = document.getElementById('contacto');
    if ('IntersectionObserver' in window && seccionContacto) {
      var ioCal = new IntersectionObserver(function (entradas) {
        if (entradas[0].isIntersecting) { ioCal.disconnect(); cargarCal(); }
      }, { rootMargin: '600px 0px' });
      ioCal.observe(seccionContacto);
    } else {
      cargarCal();
    }
  }

  /* 5. FORMULARIO DE CONTACTO --------------------------------------------
     Envía a Web3Forms. Si falla o aún no hay clave, ofrece el correo como respaldo. */
  var form = document.getElementById('form-contacto');
  if (!form) { return; }
  form.noValidate = true; // con JS se usa la validación propia; sin JS queda la nativa del navegador
  var estado = document.getElementById('estado-form');
  var botonEnviar = document.getElementById('btn-enviar');
  var campos = form.querySelectorAll('input[required], select[required], textarea[required]');

  var mostrarEstado = function (tipo, html) {
    estado.setAttribute('data-state', tipo);
    estado.innerHTML = html;
  };
  var limpiarError = function (campo) {
    campo.removeAttribute('aria-invalid');
    var span = document.getElementById('err-' + campo.id);
    if (span) { span.textContent = ''; }
  };
  var textoError = function (campo) {
    if (campo.validity.valueMissing) {
      return campo.type === 'checkbox' ? 'Debes aceptar el aviso de privacidad para continuar.' : 'Este campo es obligatorio.';
    }
    if (campo.validity.typeMismatch) { return 'Escribe un correo válido, por ejemplo nombre@empresa.com.'; }
    return campo.validationMessage;
  };
  var validar = function () {
    var primeroInvalido = null;
    campos.forEach(function (campo) {
      limpiarError(campo);
      if (!campo.checkValidity()) {
        campo.setAttribute('aria-invalid', 'true');
        var span = document.getElementById('err-' + campo.id);
        if (span) { span.textContent = textoError(campo); }
        if (!primeroInvalido) { primeroInvalido = campo; }
      }
    });
    if (primeroInvalido) { primeroInvalido.focus(); }
    return !primeroInvalido;
  };
  campos.forEach(function (campo) {
    campo.addEventListener('input', function () { limpiarError(campo); });
    campo.addEventListener('change', function () { limpiarError(campo); });
  });

  var enlaceCorreo = function () {
    var cuerpo = 'Nombre: ' + form.nombre.value + '\n' +
      'Correo: ' + form.correo.value + '\n' +
      'Teléfono: ' + form.telefono.value + '\n' +
      'Empresa: ' + form.empresa.value + '\n' +
      'Servicio: ' + form.servicio.value + '\n\n' + form.mensaje.value;
    return 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Solicitud de diagnóstico desde aibiti.com.mx') +
      '&body=' + encodeURIComponent(cuerpo);
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    mostrarEstado('', '');
    if (!validar()) {
      mostrarEstado('error', 'Revisa los campos marcados para poder enviar tu solicitud.');
      return;
    }
    // Trampa anti-spam: los bots llenan este campo oculto; las personas no.
    if (form.botcheck.checked) { return; }

    var respaldo = 'No pudimos enviar el formulario. <a href="' + enlaceCorreo() + '">Escríbenos por correo</a> y te respondemos.';
    if (esPendiente(CONFIG.web3formsKey)) {
      mostrarEstado('error', 'El formulario aún no está configurado. <a href="' + enlaceCorreo() + '">Escríbenos por correo</a> mientras tanto.');
      return;
    }

    botonEnviar.disabled = true;
    mostrarEstado('', 'Enviando…');
    var datos = new FormData(form);
    datos.set('access_key', CONFIG.web3formsKey); // CONFIG manda sobre el input oculto

    fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: datos })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.success, json: j }; }); })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          mostrarEstado('ok', '¡Gracias! Recibimos tu solicitud y te responderemos pronto.');
        } else {
          mostrarEstado('error', respaldo);
        }
      })
      .catch(function () { mostrarEstado('error', respaldo); })
      .then(function () { botonEnviar.disabled = false; });
  });
})();

/* =====================================================================
   6 Pestañas de desarrollo · 7 Equipo (tres nodos) · 8 Metodología
   9 Red neuronal del hero (canvas)
   Bloque independiente: no depende de la configuración del formulario.
   ===================================================================== */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 8. METODOLOGÍA: cada etapa se enciende al entrar en pantalla ------------ */
  (function metodologia() {
    var steps = document.querySelector('[data-steps]');
    if (!steps) { return; }
    var items = steps.querySelectorAll('.step');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      steps.classList.add('is-visible');
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    steps.style.setProperty('--steps-w', steps.clientWidth + 'px');
    window.addEventListener('resize', function () { steps.style.setProperty('--steps-w', steps.clientWidth + 'px'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el, i) { el.style.transitionDelay = (i * 0.1) + 's'; io.observe(el); });
    io.observe(steps);
  })();

  /* ---------- Spotlight de las tarjetas del bento ---------- */
  (function spotlight() {
    if (reduceMotion || !window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.tile').forEach(function (tile) {
      tile.addEventListener('pointermove', function (e) {
        var r = tile.getBoundingClientRect();
        tile.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        tile.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  })();

  /* ---------- Tabs accesibles (desarrollo en Odoo) ---------- */
  (function tabs() {
    var root = document.querySelector('[data-tabs]');
    if (!root) return;
    var tabEls = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = tabEls.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

    function select(index, focus) {
      tabEls.forEach(function (t, i) {
        var on = i === index;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      if (focus) tabEls[index].focus();
    }
    tabEls.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = tabEls.length, k = e.key, to = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') to = (i + 1) % n;
        else if (k === 'ArrowUp' || k === 'ArrowLeft') to = (i - 1 + n) % n;
        else if (k === 'Home') to = 0;
        else if (k === 'End') to = n - 1;
        if (to !== null) { e.preventDefault(); select(to, true); }
      });
    });

    /* Móvil (<768 px): los mismos paneles se envuelven en <details>, sin duplicar contenido. */
    var tablist = root.querySelector('[role="tablist"]');
    var mq = window.matchMedia('(max-width: 767px)');
    function toAccordion() {
      root.classList.add('tabs--acc');
      tablist.hidden = true;
      tabEls.forEach(function (t, i) {
        var p = panels[i], d = document.createElement('details'), s = document.createElement('summary');
        d.className = 'acc'; s.textContent = t.textContent;
        p.parentNode.insertBefore(d, p);
        d.appendChild(s); d.appendChild(p);
        p.hidden = false;
        p.removeAttribute('role'); p.removeAttribute('aria-labelledby'); p.removeAttribute('tabindex');
        d.open = i === 0;
      });
    }
    function toTabs() {
      root.classList.remove('tabs--acc');
      tablist.hidden = false;
      var cur = 0;
      tabEls.forEach(function (t, i) {
        var p = panels[i], d = p.parentNode;
        if (t.getAttribute('aria-selected') === 'true') cur = i;
        d.parentNode.insertBefore(p, d); d.remove();
        p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', t.id); p.tabIndex = 0;
      });
      select(cur, false);
    }
    function sync() { var acc = root.classList.contains('tabs--acc'); if (mq.matches && !acc) toAccordion(); else if (!mq.matches && acc) toTabs(); }
    if (mq.addEventListener) mq.addEventListener('change', sync); else mq.addListener(sync);
    window.addEventListener('resize', sync);
    sync();
  })();

  /* ---------- Equipo: tres nodos ---------- */
  (function team() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-node]'));
    var box = document.querySelector('[data-team-detail]');
    if (!nodes.length || !box) return;
    var title = box.querySelector('[data-team-title]');
    var text = box.querySelector('[data-team-text]');
    var beams = document.querySelectorAll('[data-beam]');
    var DATA = {
      ai: {
        t: 'Ai: Inteligencia Artificial',
        p: 'Claude Code trabaja con nosotros: acelera el desarrollo, la documentación y la revisión de cada entrega. Toda modificación a tus datos la aprueba una persona.'
      },
      bi: {
        t: 'Bi: Inteligencia de Negocios y operación',
        p: 'Nuestro socio de BI ha sido gerente de operaciones, de proyectos y de inventarios. Convierte procesos reales en indicadores y tableros que Dirección entiende.'
      },
      ti: {
        t: 'Ti: Tecnologías de la Información',
        p: 'Analista de TI y desarrollador de Odoo. Implementa, parcha y despliega siempre en staging primero, con tu autorización antes de tocar producción.'
      }
    };

    function select(i, focus) {
      nodes.forEach(function (n, j) {
        var on = i === j;
        n.setAttribute('aria-selected', String(on));
        n.tabIndex = on ? 0 : -1;
      });
      var key = nodes[i].getAttribute('data-node');
      beams.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-beam') === key); });
      var d = DATA[key];
      title.textContent = d.t;
      text.textContent = d.p;
      box.classList.remove('is-changing');
      void box.offsetWidth;
      box.classList.add('is-changing');
      if (focus) nodes[i].focus();
    }
    nodes.forEach(function (n, i) {
      n.addEventListener('click', function () { select(i, false); });
      n.addEventListener('keydown', function (e) {
        var k = e.key, len = nodes.length, to = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') to = (i + 1) % len;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (i - 1 + len) % len;
        if (to !== null) { e.preventDefault(); select(to, true); }
      });
    });
  })();


  /* ---------- Red neuronal del hero ---------- */
  (function network() {
    var canvas = document.getElementById('red-neuronal');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');

    var css = getComputedStyle(document.documentElement);
    function token(n, fb) { return (css.getPropertyValue(n) || fb).trim() || fb; }
    var C = {
      ink: token('--deep', '#131F35'),
      light: token('--btn', '#E9EFF6'),
      navy: token('--navy', '#2B3A5F'),
      steel: token('--steel', '#8CA6BC'),
      steelDeep: token('--steel-deep', '#5A6E86'),
      slate: token('--slate', '#6F7680'),
      muted: token('--muted', '#B4C0D2'),
      display: token('--font-display', 'sans-serif')
    };
    // Cada nodo principal toma un color del logotipo: Ai azul marino, Bi azul acero, Ti gris pizarra.
    var FILL = {
      ai: ['#6A83B8', C.navy, '#17213B'],
      bi: ['#C3D4E3', C.steel, C.steelDeep],
      ti: ['#B5BBC6', '#7E8696', '#4A4F5C']
    };

    var MAIN = [
      { id: 'ai', label: 'Ai', role: 'Inteligencia artificial', x: 0.36, y: 0.28 },
      { id: 'bi', label: 'Bi', role: 'Inteligencia de negocios', x: 0.78, y: 0.42 },
      { id: 'ti', label: 'Ti', role: 'Tecnologías de la información', x: 0.46, y: 0.76 }
    ];

    var W = 0, H = 0, dpr = 1, nodes = [], mains = [], signals = [];
    var raf = 0, running = false, lastT = 0, spawnAt = 0, visible = true;
    var pointer = { x: -9999, y: -9999 };
    var linkDist = 130;

    function resize() {
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (!running) frame(performance.now(), true);
    }

    function build() {
      var s = Math.min(W, H);
      linkDist = Math.max(90, Math.min(150, s * 0.2));
      mains = MAIN.map(function (m) {
        return { id: m.id, label: m.label, role: m.role, bx: m.x * W, by: m.y * H, x: m.x * W, y: m.y * H, r: Math.max(28, Math.min(46, s * 0.075)), main: true, ph: Math.random() * 6.28, glow: 0 };
      });
      nodes = mains.slice();
      var count = Math.round(Math.max(34, Math.min(92, (W * H) / 9500)));
      for (var i = 0; i < count; i++) {
        var x, y, ok, guard = 0;
        do {
          x = Math.random() * W; y = Math.random() * H; guard++;
          ok = mains.every(function (m) { return Math.hypot(m.bx - x, m.by - y) > m.r * 2.1; });
        } while (!ok && guard < 30);
        nodes.push({ bx: x, by: y, x: x, y: y, r: 1.8 + Math.random() * 2.4, main: false, tone: Math.random() < 0.4 ? 1 : 0, ph: Math.random() * 6.28, sp: 0.00018 + Math.random() * 0.00026, amp: 6 + Math.random() * 14, glow: 0 });
      }
      signals = [];
    }

    /* Los vínculos entre los tres nodos principales son curvas, como los trazos del logotipo. */
    function ctrl(a, b) {
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      var cx = (mains[0].x + mains[1].x + mains[2].x) / 3, cy = (mains[0].y + mains[1].y + mains[2].y) / 3;
      var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
      var nx = -dy / len, ny = dx / len;
      if ((mx - cx) * nx + (my - cy) * ny < 0) { nx = -nx; ny = -ny; }
      var k = len * 0.22;
      return { x: mx + nx * k, y: my + ny * k };
    }
    function pointOn(a, b, t, useCurve) {
      if (!useCurve) return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      var c = ctrl(a, b), u = 1 - t;
      return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
    }

    function neighbors(i) {
      var a = nodes[i], out = [];
      for (var j = 0; j < nodes.length; j++) {
        if (j === i) continue;
        var d = Math.hypot(a.x - nodes[j].x, a.y - nodes[j].y);
        if (d < linkDist) out.push(j);
      }
      return out;
    }

    function spawn() {
      var a = Math.floor(Math.random() * 3);
      var b = (a + 1 + Math.floor(Math.random() * 2)) % 3;
      signals.push({ from: a, to: b, t: 0, hops: 0, max: 0, speed: 0.00042 + Math.random() * 0.0003 });
      if (Math.random() < 0.55) {
        var ns = neighbors(a);
        if (ns.length) signals.push({ from: a, to: ns[Math.floor(Math.random() * ns.length)], t: 0, hops: 0, max: 3, speed: 0.0007 });
      }
    }

    function step(dt, now) {
      if (mains.length < 3) return; // lienzo aún sin medir
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var amp = n.main ? 4 : n.amp, sp = n.main ? 0.00022 : n.sp;
        n.x = n.bx + Math.sin(now * sp + n.ph) * amp;
        n.y = n.by + Math.cos(now * sp * 1.13 + n.ph) * amp;
        var dp = Math.hypot(n.x - pointer.x, n.y - pointer.y);
        var target = dp < 150 ? 1 - dp / 150 : 0;
        n.glow += (target - n.glow) * 0.12;
      }
      if (now > spawnAt) { spawn(); spawnAt = now + 650 + Math.random() * 900; }
      for (var s = signals.length - 1; s >= 0; s--) {
        var g = signals[s];
        var a = nodes[g.from], b = nodes[g.to];
        var len = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
        g.t += (dt * g.speed * 900) / len;
        if (g.t >= 1) {
          b.glow = Math.max(b.glow, 0.9);
          if (g.hops < g.max && Math.random() < 0.7) {
            var ns = neighbors(g.to).filter(function (k) { return k !== g.from; });
            if (ns.length) { g.from = g.to; g.to = ns[Math.floor(Math.random() * ns.length)]; g.t = 0; g.hops++; continue; }
          }
          signals.splice(s, 1);
        }
      }
    }

    function draw(now) {
      if (mains.length < 3) return; // aún sin medir el lienzo
      ctx.clearRect(0, 0, W, H);
      var i, j;

      /* Conexiones ambientales */
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          var d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < linkDist) {
            var al = (1 - d / linkDist) * 0.3 + (nodes[i].glow + nodes[j].glow) * 0.16;
            ctx.strokeStyle = 'rgba(157,184,206,' + Math.min(0.6, al).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }

      /* Curvas entre Ai, Bi y Ti */
      ctx.lineWidth = 2.2;
      for (i = 0; i < 3; i++) {
        var p = mains[i], q = mains[(i + 1) % 3], c = ctrl(p, q);
        var grad = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
        grad.addColorStop(0, 'rgba(157,184,206,0.8)');
        grad.addColorStop(1, 'rgba(233,239,246,0.85)');
        ctx.strokeStyle = grad;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(c.x, c.y, q.x, q.y); ctx.stroke();
      }

      /* Sondas del puntero */
      if (pointer.x > -999) {
        for (i = 3; i < nodes.length; i++) {
          var dd = Math.hypot(nodes[i].x - pointer.x, nodes[i].y - pointer.y);
          if (dd < 120) {
            ctx.strokeStyle = 'rgba(233,239,246,' + ((1 - dd / 120) * 0.5).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pointer.x, pointer.y); ctx.lineTo(nodes[i].x, nodes[i].y); ctx.stroke();
          }
        }
      }

      /* Señales: viajan por la curva si unen dos nodos principales */
      for (i = 0; i < signals.length; i++) {
        var g = signals[i], a = nodes[g.from], b = nodes[g.to];
        var curved = g.from < 3 && g.to < 3;
        var head = pointOn(a, b, g.t, curved), tail = pointOn(a, b, Math.max(0, g.t - 0.14), curved);
        var tg = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
        tg.addColorStop(0, 'rgba(233,239,246,0)');
        tg.addColorStop(1, 'rgba(233,239,246,0.95)');
        ctx.strokeStyle = tg; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(head.x, head.y); ctx.stroke();
        ctx.fillStyle = C.light;
        ctx.beginPath(); ctx.arc(head.x, head.y, 3, 0, 6.2832); ctx.fill();
      }

      /* Nodos ambientales */
      for (i = 3; i < nodes.length; i++) {
        var n = nodes[i];
        ctx.fillStyle = n.glow > 0.05 ? 'rgba(233,239,246,' + (0.6 + n.glow * 0.35).toFixed(2) + ')' : (n.tone ? 'rgba(140,166,188,0.95)' : 'rgba(180,192,210,0.55)');
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + n.glow * 1.8, 0, 6.2832); ctx.fill();
      }

      /* Nodos principales */
      for (i = 0; i < 3; i++) {
        var m = mains[i];
        var breathe = 1 + Math.sin(now * 0.0016 + m.ph) * 0.035;
        var R = m.r * breathe, f = FILL[m.id];
        ctx.strokeStyle = 'rgba(157,184,206,' + (0.25 + m.glow * 0.3).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(m.x, m.y, R + 12 + Math.sin(now * 0.0012 + m.ph) * 3, 0, 6.2832); ctx.stroke();

        var rg = ctx.createRadialGradient(m.x - R * 0.3, m.y - R * 0.35, R * 0.1, m.x, m.y, R);
        rg.addColorStop(0, f[0]); rg.addColorStop(0.55, f[1]); rg.addColorStop(1, f[2]);
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 7;
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(m.x, m.y, R, 0, 6.2832); ctx.fill();
        ctx.restore();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(m.x, m.y, R, 0, 6.2832); ctx.stroke();

        ctx.fillStyle = m.id === 'bi' ? C.ink : '#FFFFFF';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '700 ' + Math.round(R * 0.74) + 'px ' + C.display;
        ctx.fillText(m.label, m.x, m.y + 1);
        ctx.fillStyle = C.muted;
        ctx.font = '600 ' + Math.max(12, Math.round(R * 0.32)) + 'px ' + C.display;
        ctx.fillText(m.role, m.x, m.y + R + 26);
      }
    }

    function frame(now, once) {
      var dt = Math.min(48, now - (lastT || now));
      lastT = now;
      if (!once) step(dt, now); else { for (var i = 0; i < nodes.length; i++) { nodes[i].x = nodes[i].bx; nodes[i].y = nodes[i].by; } }
      draw(now);
      if (!once && running) raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduceMotion || !visible || document.hidden) return;
      running = true; lastT = 0; raf = requestAnimationFrame(frame);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }

    canvas.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    });
    canvas.addEventListener('pointerleave', function () { pointer.x = pointer.y = -9999; });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }, { threshold: 0.05 }).observe(canvas);
    }
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 120); });

    resize();
    start();
    if (document.fonts && document.fonts.load) {
      document.fonts.load("700 24px Geist").then(function () { if (!running) { frame(performance.now(), true); } });
    }
  })();
})();
