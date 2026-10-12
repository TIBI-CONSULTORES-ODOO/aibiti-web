/* =====================================================================
   AiBiTi Consultores — comportamiento del sitio (sin dependencias)
   1 Configuración · 2 Menú móvil · 3 Aparición al scroll · 4 WhatsApp
   5 Formulario de contacto
   ===================================================================== */
(function () {
  'use strict';

  /* 1. CONFIGURACIÓN ------------------------------------------------------
     Lo único que debes completar para dejar el sitio operativo.
     - web3formsKey: access_key PÚBLICA de https://web3forms.com (es normal que
       vaya en el código; no es una contraseña). Restríngela a tu dominio en su panel.
     - whatsapp: número con código de país y sin signos, p. ej. 5215512345678. */
  var CONFIG = {
    email: 'irwin.martinez@aibiti.com.mx',
    web3formsKey: 'TODO_WEB3FORMS_ACCESS_KEY',
    whatsapp: 'TODO_NUMERO_WHATSAPP',
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

  /* 5. FORMULARIO DE CONTACTO --------------------------------------------
     Envía a Web3Forms. Si falla o aún no hay clave, ofrece el correo como respaldo. */
  var form = document.getElementById('form-contacto');
  if (!form) { return; }
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
    datos.append('access_key', CONFIG.web3formsKey);

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
  })();

  /* ---------- Equipo: tres nodos ---------- */
  (function team() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-node]'));
    var box = document.querySelector('[data-team-detail]');
    if (!nodes.length || !box) return;
    var title = box.querySelector('[data-team-title]');
    var text = box.querySelector('[data-team-text]');
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
      var d = DATA[nodes[i].getAttribute('data-node')];
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
      steel: token('--steel', '#9aa4b5'),
      steelHi: token('--steel-hi', '#dfe5ee'),
      steelLo: token('--steel-lo', '#5d687c'),
      navy: token('--navy', '#10264d'),
      navy2: token('--navy-2', '#1b3a73'),
      accent: token('--accent', '#86a6ee'),
      display: token('--font-display', 'sans-serif')
    };

    var MAIN = [
      { id: 'ai', label: 'Ai', role: 'Inteligencia artificial', x: 0.30, y: 0.28 },
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
        nodes.push({ bx: x, by: y, x: x, y: y, r: 1.6 + Math.random() * 2.2, main: false, ph: Math.random() * 6.28, sp: 0.00018 + Math.random() * 0.00026, amp: 6 + Math.random() * 14, glow: 0 });
      }
      signals = [];
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
      ctx.clearRect(0, 0, W, H);
      var i, j;

      /* Conexiones ambientales */
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          var d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < linkDist) {
            var al = (1 - d / linkDist) * 0.32 + (nodes[i].glow + nodes[j].glow) * 0.18;
            ctx.strokeStyle = 'rgba(154,164,181,' + Math.min(0.7, al).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }

      /* Triángulo principal Ai, Bi, Ti */
      ctx.lineWidth = 1.6;
      for (i = 0; i < 3; i++) {
        var p = mains[i], q = mains[(i + 1) % 3];
        var grad = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
        grad.addColorStop(0, 'rgba(154,164,181,0.55)');
        grad.addColorStop(0.5, 'rgba(134,166,238,0.5)');
        grad.addColorStop(1, 'rgba(154,164,181,0.55)');
        ctx.strokeStyle = grad;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }

      /* Sondas del puntero */
      if (pointer.x > -999) {
        for (i = 3; i < nodes.length; i++) {
          var dd = Math.hypot(nodes[i].x - pointer.x, nodes[i].y - pointer.y);
          if (dd < 120) {
            ctx.strokeStyle = 'rgba(134,166,238,' + ((1 - dd / 120) * 0.55).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pointer.x, pointer.y); ctx.lineTo(nodes[i].x, nodes[i].y); ctx.stroke();
          }
        }
      }

      /* Señales */
      for (i = 0; i < signals.length; i++) {
        var g = signals[i], a = nodes[g.from], b = nodes[g.to];
        var x = a.x + (b.x - a.x) * g.t, y = a.y + (b.y - a.y) * g.t;
        var tx = a.x + (b.x - a.x) * Math.max(0, g.t - 0.14), ty = a.y + (b.y - a.y) * Math.max(0, g.t - 0.14);
        var tg = ctx.createLinearGradient(tx, ty, x, y);
        tg.addColorStop(0, 'rgba(134,166,238,0)');
        tg.addColorStop(1, 'rgba(200,216,250,0.95)');
        ctx.strokeStyle = tg; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = '#dfe9ff';
        ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 6.2832); ctx.fill();
      }

      /* Nodos ambientales */
      for (i = 3; i < nodes.length; i++) {
        var n = nodes[i];
        ctx.fillStyle = n.glow > 0.05 ? 'rgba(180,200,245,' + (0.55 + n.glow * 0.4).toFixed(2) + ')' : 'rgba(154,164,181,0.62)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + n.glow * 1.8, 0, 6.2832); ctx.fill();
      }

      /* Nodos principales */
      for (i = 0; i < 3; i++) {
        var m = mains[i];
        var breathe = 1 + Math.sin(now * 0.0016 + m.ph) * 0.035;
        var R = m.r * breathe;
        ctx.strokeStyle = 'rgba(134,166,238,' + (0.16 + m.glow * 0.3).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(m.x, m.y, R + 12 + Math.sin(now * 0.0012 + m.ph) * 3, 0, 6.2832); ctx.stroke();

        var rg = ctx.createRadialGradient(m.x - R * 0.3, m.y - R * 0.35, R * 0.1, m.x, m.y, R);
        rg.addColorStop(0, C.navy2); rg.addColorStop(0.6, C.navy); rg.addColorStop(1, '#091731');
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(m.x, m.y, R, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = m.glow > 0.2 ? C.accent : C.steel;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = C.steelHi;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '700 ' + Math.round(R * 0.74) + 'px ' + C.display;
        ctx.fillText(m.label, m.x, m.y + 1);
        ctx.fillStyle = C.steel;
        ctx.font = '600 ' + Math.max(12, Math.round(R * 0.32)) + 'px ' + C.display;
        ctx.fillText(m.role, m.x, m.y + R + 24);
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
