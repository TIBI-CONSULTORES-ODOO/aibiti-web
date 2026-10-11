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
