# aibiti-web

Landing de **AiBiTi Consulting** (aibiti.com.mx). Sitio estático para GitHub Pages: HTML, CSS y JavaScript sin dependencias ni compilación. Costo recurrente: $0.

## Estructura
```
index.html            página principal (todas las secciones)
privacidad.html       aviso de privacidad (aprobado)
aviso-legal.html      aviso legal (aprobado)
404.html              página de error (la usa GitHub Pages)
CNAME                 dominio personalizado: aibiti.com.mx
.nojekyll             publica los archivos tal cual
robots.txt, sitemap.xml, site.webmanifest
assets/css/styles.css estilos (tokens de color arriba del archivo)
assets/fonts/        Montserrat (SIL OFL 1.1, tipografía oficial de la marca), autoalojada; licencia en Montserrat-OFL.txt
assets/js/main.js     menú, formulario (CONFIG al inicio), pestañas, equipo y red neuronal (canvas)
assets/img/           logo, favicon, íconos e imagen para redes (og-image.jpg)
```

## Qué debes completar (busca `TODO` en el código)
| Dónde | Qué |
|---|---|
| `assets/js/main.js` → `CONFIG.web3formsKey` | access_key **pública** de https://web3forms.com (se crea con tu correo). Restríngela a `aibiti.com.mx` en su panel. |
| `assets/js/main.js` → `CONFIG.whatsapp` | Número con código de país y sin signos, p. ej. `5215512345678` |
| `assets/img/logo-aibiti.svg` | Logo vectorial definitivo (hoy es un marcador de texto). El sitio usa `logo-aibiti.jpg` mientras tanto. |
| `index.html` → JSON-LD | Dirección cuando exista (hoy no se inventa). El teléfono ya está. |

Mientras no haya clave de Web3Forms, el formulario valida y ofrece un enlace `mailto:` de respaldo; mientras no haya número, el botón de WhatsApp abre el correo. Nada queda roto.

## Probar en local
Con Node instalado, desde la carpeta que contiene `serve.js` y `aibiti-web/`:
```
node serve.js
```
y abre http://localhost:4173. (Abrir `index.html` con doble clic también funciona, pero el formulario y las rutas se prueban mejor con servidor.)

## Publicar en GitHub Pages con tu dominio
1. Copia el contenido de esta carpeta a la raíz del repositorio `aibiti-web`, haz commit y push a `main`.
2. Repositorio → **Settings → Pages** → Source: *Deploy from a branch* → rama `main`, carpeta `/ (root)`.
3. En **Custom domain** escribe `aibiti.com.mx` (el archivo `CNAME` ya lo trae) y activa **Enforce HTTPS** cuando esté disponible.
4. En tu proveedor de DNS: registros `A` hacia las IP de GitHub Pages y un `CNAME` de `www` hacia `<tu-usuario>.github.io`. (Verifica las IP vigentes en la documentación de GitHub Pages.)

## Lista de pruebas antes de anunciar el sitio
- [ ] Formulario: envío real con la clave configurada, mensaje que llega al correo y estado de éxito.
- [ ] Botón de WhatsApp abre el chat con el mensaje inicial.
- [ ] Menú móvil, enlaces internos y página 404 (`/una-ruta-inexistente`).
- [ ] Anchos 360, 768 y 1280 px sin desbordes.
- [ ] Navegación solo con teclado (Tab, Enter, Escape) y foco visible.
- [ ] Lighthouse (Chrome → DevTools → Lighthouse): rendimiento, accesibilidad, buenas prácticas y SEO.
- [ ] Vista previa al compartir el enlace en WhatsApp o LinkedIn (imagen `og-image.jpg`).
- [x] Avisos legales revisados por un abogado y `noindex` retirado (12 oct 2026).

## Reglas de contenido
Sin testimonios, logos de clientes, cifras ni certificaciones que no se puedan comprobar. Todo lo que el sitio promete debe poder entregarse hoy.

## Marca
La identidad visual manda y vive en el repo `aibiti-empresa` (`00-contexto/identidad-visual.md`): paleta (marino `#16213A`, azul `#2C3E63`, gris `#6B7280`, acero `#8FA9C2`, claro `#F4F6F9`, acento violeta `#8B6CF0` / `#6E55D9` / lavanda `#A996F2`), Montserrat y los logos oficiales (`00-contexto/logos/`, que nunca se redibujan). Si cambias colores, tipografía o logo en este sitio, avisa a Marketing en `00-contexto/puente-comercial-marketing.md`.
