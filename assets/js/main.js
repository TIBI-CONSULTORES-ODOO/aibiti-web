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
    whatsappMensaje: 'Hola, vi su sitio aibiti.com.mx y me gustaría agendar un diagnóstico.',
    // Perfiles oficiales: se agregan aquí cuando existan las cuentas (URL completa). Vacío = no se muestra nada.
    redes: {
      Instagram: 'https://www.instagram.com/aibiti.consulting',
      LinkedIn: 'https://www.linkedin.com/company/aibiti-consulting',
      Facebook: 'https://www.facebook.com/aibiticonsulting',
      TikTok: 'https://www.tiktok.com/@aibiti.consulting'
    }
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

  /* 4a. REDES SOCIALES: el pie muestra solo las que tengan URL en CONFIG.redes ------- */
  var listaRedes = document.querySelector('[data-redes]');
  if (listaRedes) {
    Object.keys(CONFIG.redes).forEach(function (nombre) {
      var url = CONFIG.redes[nombre];
      if (!/^https:\/\//.test(url)) { return; }
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = url; a.textContent = nombre; a.target = '_blank'; a.rel = 'noopener me';
      li.appendChild(a); listaRedes.appendChild(li);
    });
    listaRedes.hidden = !listaRedes.children.length;
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
    var tituloForm = document.querySelector('[data-form-titulo]');
    if (tituloForm) { tituloForm.textContent = activo ? '¿Prefieres que te escribamos?' : 'Cuéntanos qué necesitas'; }
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
  // Origen de la campaña (UTM): se toma del enlace, se recuerda en la pestaña y viaja como campo oculto.
  // Solo se guarda de dónde llegó la visita, nunca datos personales. Sin valor, el campo se desactiva y no se envía.
  (function utm() {
    var llaves = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    var vistos = {};
    try { vistos = JSON.parse(sessionStorage.getItem('aibiti-utm') || '{}') || {}; } catch (e) { vistos = {}; }
    var query = new URLSearchParams(window.location.search);
    var nuevo = false;
    llaves.forEach(function (k) {
      var v = (query.get(k) || '').trim().slice(0, 100);
      if (v) { vistos[k] = v; nuevo = true; }
    });
    if (nuevo) { try { sessionStorage.setItem('aibiti-utm', JSON.stringify(vistos)); } catch (e) { /* sin almacenamiento: se usa solo esta visita */ } }
    form.querySelectorAll('input[data-utm]').forEach(function (campo) {
      var v = vistos[campo.name];
      if (v) { campo.value = v; } else { campo.disabled = true; }
    });
  })();
  form.noValidate = true; // con JS se usa la validación propia; sin JS queda la nativa del navegador
  var estado = document.getElementById('estado-form');
  var botonEnviar = document.getElementById('btn-enviar');
  // Orbe de la marca: cambia de cara con el envío (no habla; el texto de estado sigue siendo el que se anuncia)
  var orbe = document.querySelector('[data-orbe-contacto]');
  var cara = function (nombre) {
    if (!orbe) { return; }
    var src = 'assets/img/orbe/' + nombre + '.webp';
    if (orbe.getAttribute('src') === src) { return; }
    orbe.setAttribute('src', src);
    orbe.classList.remove('is-swap'); void orbe.offsetWidth; orbe.classList.add('is-swap');
  };
  form.addEventListener('focusin', function () {
    ['cargando', 'yaquedo', 'confundido'].forEach(function (n) { var i = new Image(); i.src = 'assets/img/orbe/' + n + '.webp'; });
  }, { once: true });
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
    cara('cargando');
    var datos = new FormData(form);
    datos.set('access_key', CONFIG.web3formsKey); // CONFIG manda sobre el input oculto

    fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: datos })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.success, json: j }; }); })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          cara('yaquedo');
          mostrarEstado('ok', '¡Gracias! Recibimos tu solicitud y te responderemos pronto.');
        } else {
          cara('confundido');
          mostrarEstado('error', respaldo);
        }
      })
      .catch(function () { cara('confundido'); mostrarEstado('error', respaldo); })
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

  /* ORBE en "¿Te suena?": cambia de cara según el problema (pasar el cursor o tocar) */
  (function orbeProblemas() {
    var guia = document.querySelector('[data-orbe-guia]');
    var items = document.querySelectorAll('.pain-item[data-cara]');
    if (!guia || !items.length) { return; }
    var actual = 'nocuadra';
    function poner(nombre) {
      if (nombre === actual) { return; }
      actual = nombre;
      guia.setAttribute('src', 'assets/img/orbe/' + nombre + '.webp');
      guia.classList.remove('is-swap'); void guia.offsetWidth; guia.classList.add('is-swap');
    }
    items.forEach(function (el) {
      var n = el.getAttribute('data-cara');
      var pre = new Image(); pre.src = 'assets/img/orbe/' + n + '.webp';
      el.addEventListener('pointerenter', function () { poner(n); });
      el.addEventListener('click', function () { poner(n); });
    });
  })();

  /* TÍTULOS palabra por palabra: cada palabra sube desde una máscara, escalonada, al entrar el título en pantalla */
  (function titulosPorPalabra() {
    if (reduceMotion || !('IntersectionObserver' in window)) { return; }
    var n = 0;
    function partir(nodo) {
      [].slice.call(nodo.childNodes).forEach(function (hijo) {
        if (hijo.nodeType === 3) {
          var partes = hijo.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
          partes.forEach(function (p) {
            if (!p) { return; }
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement('span'), wi = document.createElement('span');
            w.className = 'w'; wi.className = 'wi'; wi.style.setProperty('--i', n++); wi.textContent = p;
            w.appendChild(wi); frag.appendChild(w);
          });
          nodo.replaceChild(frag, hijo);
        } else if (hijo.nodeType === 1 && hijo.tagName !== 'BR') { partir(hijo); }
      });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    document.querySelectorAll('main h2').forEach(function (h) {
      n = 0; partir(h); h.classList.add('split-ready'); io.observe(h);
    });
  })();

  /* CARRUSEL de servicios: desplazamiento nativo con scroll-snap (teclado y dedo), botones, puntos y arrastre con ratón */
  (function carruseles() {
    document.querySelectorAll('[data-carousel]').forEach(function (root) {
      var track = root.querySelector('.carousel-track');
      var prev = root.querySelector('[data-prev]'), next = root.querySelector('[data-next]');
      var dots = root.querySelector('.carousel-dots');
      if (!track || !prev || !next) { return; }
      var slides = [].slice.call(track.children);
      slides.forEach(function () { dots.appendChild(document.createElement('span')); });
      var tick = 0;
      function actualizar() {
        tick = 0;
        var max = track.scrollWidth - track.clientWidth, x = track.scrollLeft, idx = 0, best = 1e9;
        prev.disabled = x <= 2; next.disabled = x >= max - 2;
        slides.forEach(function (s, i) { var d = Math.abs(s.offsetLeft - x); if (d < best) { best = d; idx = i; } });
        if (x >= max - 2) { idx = slides.length - 1; }
        [].forEach.call(dots.children, function (d, i) { d.classList.toggle('is-on', i === idx); });
      }
      function ir(dir) {
        var paso = slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth;
        track.scrollBy({ left: dir * paso, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      prev.addEventListener('click', function () { ir(-1); });
      next.addEventListener('click', function () { ir(1); });
      track.addEventListener('scroll', function () { if (!tick) { tick = requestAnimationFrame(actualizar); } }, { passive: true });
      window.addEventListener('resize', actualizar);
      // Arrastre con ratón (el táctil ya se desplaza solo)
      var down = false, moved = false, sx = 0, sl = 0;
      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) { return; }
        down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
      });
      window.addEventListener('pointermove', function (e) {
        if (!down) { return; }
        var dx = e.clientX - sx;
        if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add('is-drag'); }
        if (moved) { track.scrollLeft = sl - dx; }
      });
      window.addEventListener('pointerup', function () {
        if (!down) { return; }
        down = false; track.classList.remove('is-drag');
      });
      track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
      actualizar();
    });
  })();

  /* PORTADA: los hologramas se desplazan con la posición del cursor (solo ratón y con movimiento permitido) */
  (function portadaHologramas() {
    var hero = document.querySelector('.hero');
    if (!hero || reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) { return; }
    var raf = 0, x = 0, y = 0;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width - 0.5) * 2; y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) { raf = requestAnimationFrame(function () { raf = 0; hero.style.setProperty('--px', x.toFixed(3)); hero.style.setProperty('--py', y.toFixed(3)); }); }
    });
    hero.addEventListener('pointerleave', function () { hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0); });
  })();

  /* ORBE GUÍA: una carita y un holograma pequeños acompañan la lectura según la sección visible (solo ≥1100 px) */
  (function orbeGuia() {
    var guia = document.querySelector('[data-guia]');
    var wide = window.matchMedia('(min-width: 1100px)');
    if (!guia || !('IntersectionObserver' in window)) { return; }
    var cara = guia.querySelector('.guia-cara'), holo = guia.querySelector('.guia-holo');
    var secciones = [].slice.call(document.querySelectorAll('main > section'));
    var ratios = new Map(), actual = '';
    function evaluar() {
      var mejor = null, r = 0;
      secciones.forEach(function (s) { var v = ratios.get(s) || 0; if (v > r) { r = v; mejor = s; } });
      var c = mejor && wide.matches ? mejor.getAttribute('data-guia-cara') : null;
      if (!c) { guia.classList.remove('is-on'); actual = ''; return; }
      var h = mejor.getAttribute('data-guia-holo');
      if (actual !== c + h) {
        actual = c + h;
        cara.src = 'assets/img/orbe/' + c + '.webp'; holo.src = 'assets/img/orbe/holo-' + h + '.webp';
      }
      guia.classList.add('is-on');
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { ratios.set(e.target, e.isIntersecting ? e.intersectionRatio : 0); });
      evaluar();
    }, { threshold: [0, 0.15, 0.3, 0.5, 0.7, 1] });
    secciones.forEach(function (s) { io.observe(s); });
    wide.addEventListener('change', evaluar);
  })();

  /* CARPETA DE CRISTAL del cerebro: se inclina con el cursor, se abre con clic, Enter o Espacio y se cierra con Escape o al tocar fuera */
  (function carpeta() {
    document.querySelectorAll('[data-folder]').forEach(function (root) {
      var hit = root.querySelector('.gf-hit'), files = root.querySelector('.gf-files');
      if (!hit || !files) { return; }
      function abrir(si) {
        root.toggleAttribute('data-open', si);
        hit.setAttribute('aria-expanded', String(si));
        hit.setAttribute('aria-label', (si ? 'Cerrar' : 'Abrir') + ' la carpeta del cerebro: juntas, decisiones y procesos');
        files.toggleAttribute('inert', !si);
      }
      files.toggleAttribute('inert', true);
      hit.addEventListener('click', function () { abrir(!root.hasAttribute('data-open')); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.hasAttribute('data-open')) { abrir(false); hit.focus(); } });
      document.addEventListener('pointerdown', function (e) { if (root.hasAttribute('data-open') && !root.contains(e.target)) { abrir(false); } });
      if ('ResizeObserver' in window) {
        new ResizeObserver(function () { root.style.setProperty('--k', (root.clientWidth / 340).toFixed(4)); }).observe(root);
      }
      if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        var raf = 0, px = 0, py = 0;
        function escribir() { raf = 0; root.style.setProperty('--gf-px', px.toFixed(3)); root.style.setProperty('--gf-py', py.toFixed(3)); }
        root.addEventListener('pointermove', function (e) {
          var r = root.getBoundingClientRect();
          px = ((e.clientX - r.left) / r.width) * 2 - 1; py = ((e.clientY - r.top) / r.height) * 2 - 1;
          if (!raf) { raf = requestAnimationFrame(escribir); }
        });
        root.addEventListener('pointerleave', function () { px = 0; py = 0; if (!raf) { raf = requestAnimationFrame(escribir); } });
      }
    });
  })();

  /* ORBE en video (clip 3D ya renderizado, 320 KB): solo se reproduce a la vista y sin "reducir movimiento" */
  (function orbeVideo() {
    var videos = document.querySelectorAll('video[data-orbe-video]');
    // WebM con transparencia: Chrome, Edge y Firefox. Safari lo pintaría con fondo negro, así que usa la imagen.
    var ua = navigator.userAgent;
    var esSafari = /safari|applewebkit/i.test(ua) && !/chrome|chromium|crios|android|edg|firefox|fxios/i.test(ua);
    var sinAlfa = esSafari || !document.createElement('video').canPlayType('video/webm');
    videos.forEach(function (v) {
      v.muted = true;
      if (sinAlfa || reduceMotion) {
        var img = document.createElement('img');
        img.className = v.className; img.src = v.getAttribute('data-fallback');
        img.width = 256; img.height = 256; img.alt = ''; img.setAttribute('aria-hidden', 'true');
        v.parentNode.replaceChild(img, v);
        return;
      }
      if (!('IntersectionObserver' in window)) { v.removeAttribute('autoplay'); return; }
      v.preload = 'auto';
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { var p = v.play(); if (p && p.catch) { p.catch(function () {}); } } else { v.pause(); }
        });
      }, { threshold: 0.25 }).observe(v);
    });
  })();

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
        p: 'La Ai es de los dos socios y de nuestra IA, Claude Code, que propone, ejecuta y documenta cada entrega. Toda modificación a tus datos la aprueba una persona.'
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
      light: token('--btn', '#E9E4FF'),
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

    // Paleta de cada nodo, del reposo al "hover" (patrón gradient-button de 21st.dev con la paleta oficial)
    var NODEPAL = {
      ai: { rest: ['#16213A', '#2C3E63', '#6E55D9', '#8B6CF0', '#A996F2'], hover: ['#E9E4FF', '#A996F2', '#8B6CF0', '#2C3E63', '#16213A'] },
      bi: { rest: ['#16213A', '#2C3E63', '#5A6E86', '#8FA9C2', '#C3D4E3'], hover: ['#F4F6F9', '#C3D4E3', '#8FA9C2', '#2C3E63', '#16213A'] },
      ti: { rest: ['#111A2E', '#2C3E63', '#5A6E86', '#A996F2', '#E9E4FF'], hover: ['#E9E4FF', '#8FA9C2', '#A996F2', '#2C3E63', '#111A2E'] }
    };
    var STOP_REST = [37.35, 61.36, 78.42, 89.52, 100], STOP_HOVER = [0, 8.8, 21.44, 71.34, 85.76];
    function lerp(a, b, t) { return a + (b - a) * t; }
    function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    function mix(a, b, t) { var x = rgb(a), y = rgb(b); return 'rgb(' + Math.round(lerp(x[0], y[0], t)) + ',' + Math.round(lerp(x[1], y[1], t)) + ',' + Math.round(lerp(x[2], y[2], t)) + ')'; }

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
        grad.addColorStop(0, 'rgba(143,169,194,0.85)');
        grad.addColorStop(1, 'rgba(169,150,242,0.9)');
        ctx.strokeStyle = grad;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(c.x, c.y, q.x, q.y); ctx.stroke();
      }

      /* Sondas del puntero */
      if (pointer.x > -999) {
        for (i = 3; i < nodes.length; i++) {
          var dd = Math.hypot(nodes[i].x - pointer.x, nodes[i].y - pointer.y);
          if (dd < 120) {
            ctx.strokeStyle = 'rgba(233,228,255,' + ((1 - dd / 120) * 0.5).toFixed(3) + ')';
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
        tg.addColorStop(0, 'rgba(233,228,255,0)');
        tg.addColorStop(1, 'rgba(233,228,255,0.95)');
        ctx.strokeStyle = tg; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(head.x, head.y); ctx.stroke();
        ctx.fillStyle = C.light;
        ctx.beginPath(); ctx.arc(head.x, head.y, 3, 0, 6.2832); ctx.fill();
      }

      /* Nodos ambientales */
      for (i = 3; i < nodes.length; i++) {
        var n = nodes[i];
        ctx.fillStyle = n.glow > 0.05 ? 'rgba(233,228,255,' + (0.6 + n.glow * 0.35).toFixed(2) + ')' : (n.tone ? 'rgba(140,166,188,0.95)' : 'rgba(180,192,210,0.55)');
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + n.glow * 1.8, 0, 6.2832); ctx.fill();
      }

      /* Nodos principales */
      for (i = 0; i < 3; i++) {
        var m = mains[i];
        var breathe = 1 + Math.sin(now * 0.0016 + m.ph) * 0.035;
        var R = m.r * breathe, f = FILL[m.id];
        ctx.strokeStyle = 'rgba(169,150,242,' + (0.28 + m.glow * 0.3).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(m.x, m.y, R + 12 + Math.sin(now * 0.0012 + m.ph) * 3, 0, 6.2832); ctx.stroke();

        // Degradado radial animado: del reposo al hover según el brillo del nodo (m.glow)
        var th = Math.max(0, Math.min(1, m.glow * 1.1)), pal = NODEPAL[m.id], cols = [], sts = [];
        for (var k = 0; k < 5; k++) { cols.push(mix(pal.rest[k], pal.hover[k], th)); sts.push(lerp(STOP_REST[k], STOP_HOVER[k], th) / 100); }
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 7;
        ctx.fillStyle = cols[1];
        ctx.beginPath(); ctx.arc(m.x, m.y, R, 0, 6.2832); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.beginPath(); ctx.arc(m.x, m.y, R, 0, 6.2832); ctx.clip();
        ctx.translate(m.x - R + 2 * R * lerp(0.1114, 0, th), m.y - R + 2 * R * lerp(1.4, 0.9151, th));
        ctx.scale(2 * R * lerp(1.5, 1.2024, th), 2 * R * lerp(1.8006, 1.0318, th));
        var rg = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        for (k = 0; k < 5; k++) { rg.addColorStop(Math.max(0, Math.min(1, sts[k])), cols[k]); }
        ctx.fillStyle = rg; ctx.fillRect(-12, -12, 24, 24);
        ctx.restore();
        // Borde con degradado lineal que gira (20° a 190°)
        var ang = lerp(20, 190, th) * Math.PI / 180, dx = Math.sin(ang), dy = -Math.cos(ang);
        var bg = ctx.createLinearGradient(m.x - dx * R, m.y - dy * R, m.x + dx * R, m.y + dy * R);
        bg.addColorStop(0, 'rgba(255,255,255,' + lerp(0.35, 0.95, th).toFixed(2) + ')');
        bg.addColorStop(1, 'rgba(169,150,242,' + lerp(0.95, 0.4, th).toFixed(2) + ')');
        ctx.strokeStyle = bg; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(m.x, m.y, R - 1.2, 0, 6.2832); ctx.stroke();

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 8;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '800 ' + Math.round(R * 0.74) + 'px ' + C.display;
        ctx.fillText(m.label, m.x, m.y + 1);
        ctx.restore();
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
      document.fonts.load("800 24px Montserrat").then(function () { if (!running) { frame(performance.now(), true); } });
    }
  })();
})();
