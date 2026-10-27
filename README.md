# aibiti-web

Landing de **AiBiTi Consulting** (aibiti.com.mx). Sitio estático para GitHub Pages: HTML, CSS y JavaScript sin dependencias ni compilación. Costo recurrente: $0.

## Estructura
```
index.html            página principal (todas las secciones)
diagnostico.html      landing para campañas (noindex, fuera del sitemap); mide el origen con UTM
privacidad.html       aviso de privacidad (aprobado)
aviso-legal.html      aviso legal (aprobado)
404.html              página de error (la usa GitHub Pages)
CNAME                 dominio personalizado: aibiti.com.mx
.nojekyll             publica los archivos tal cual
robots.txt, sitemap.xml, site.webmanifest
assets/css/styles.css estilos (tokens de color arriba del archivo)
assets/fonts/        Montserrat (SIL OFL 1.1, tipografía oficial de la marca), autoalojada; licencia en Montserrat-OFL.txt
assets/js/main.js     menú, formulario y UTM (CONFIG al inicio), carrusel, pestañas, equipo, red neuronal (canvas), carpeta de cristal y orbe
assets/img/           logos oficiales (solo escalados), favicon, íconos e imagen para redes (og-banner.jpg, el banner oficial)
assets/img/orbe/      caritas y hologramas oficiales del orbe en WebP (recortados y reducidos, sin recrearlos); solo la cabeza, sin manos
```

## Qué debes completar (busca `TODO` en el código)
| Dónde | Qué |
|---|---|
| `assets/js/main.js` → `CONFIG.web3formsKey` | access_key **pública** de https://web3forms.com (se crea con tu correo). Restríngela a `aibiti.com.mx` en su panel. |
| `assets/js/main.js` → `CONFIG.whatsapp` | Número con código de país y sin signos, p. ej. `5215512345678` |
| `assets/js/main.js` → `CONFIG.calLink` | Enlace de Cal.com (`usuario/evento`). Con él se activa el calendario del inicio y de la landing. |
| `assets/js/main.js` → `CONFIG.redes` | URL de los perfiles (ya puestas). El pie y el JSON-LD (`sameAs`) deben coincidir. |
| `index.html` → JSON-LD | Dirección cuando exista (hoy no se inventa). Teléfono y redes ya están. |

Los logos oficiales solo se escalan; no se redibujan ni se recrean.

Mientras no haya clave de Web3Forms, el formulario valida y ofrece un enlace `mailto:` de respaldo; mientras no haya número, el botón de WhatsApp abre el correo. Nada queda roto.

## Probar en local
Con Node instalado, un servidor estático mínimo sobre esta carpeta (el sitio no necesita compilación). Abrir `index.html` con doble clic no sirve del todo: las rutas, el WebM y los módulos se prueban mejor con servidor. Para ver la landing con UTM: `/diagnostico.html?utm_source=instagram&utm_medium=bio&utm_campaign=lanzamiento`.

## Caché y versiones
GitHub Pages + Cloudflare guardan todo hasta 4 horas. Al cambiar `styles.css` o `main.js`, sube el `?v=` en todos los HTML. Si cambias una imagen que ya existe, ponle `?v=` en el HTML o usa otro nombre. No pidas por `curl` una URL nueva antes de que termine el despliegue: la CDN guarda la respuesta vacía.

## Medir con Lighthouse
`npm install lighthouse` en una carpeta temporal (fuera del repo), abre Edge o Chrome con `--headless=new --remote-debugging-port=9333` y corre `npx lighthouse https://aibiti.com.mx/ --port=9333` (agrega `--preset=desktop` para escritorio). Último resultado (20-oct-2026): 99 móvil y 100 escritorio; accesibilidad, mejores prácticas y SEO en 100.

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
- [x] Lighthouse: rendimiento, accesibilidad, buenas prácticas y SEO (20 oct 2026).
- [ ] Vista previa al compartir el enlace en WhatsApp o LinkedIn (imagen `og-banner.jpg`).
- [x] Avisos legales revisados por un abogado y `noindex` retirado (12 oct 2026).

## Reglas de contenido
Sin testimonios, logos de clientes, cifras ni certificaciones que no se puedan comprobar. Todo lo que el sitio promete debe poder entregarse hoy.

## Marca
La identidad visual manda y vive en el repo `aibiti-empresa` (`00-contexto/identidad-visual.md`): paleta (marino `#16213A`, azul `#2C3E63`, gris `#6B7280`, acero `#8FA9C2`, claro `#F4F6F9`, acento violeta `#8B6CF0` / `#6E55D9` / lavanda `#A996F2`), Montserrat y los logos oficiales (`00-contexto/logos/`, que nunca se redibujan). Si cambias colores, tipografía o logo en este sitio, avisa a Marketing en `00-contexto/puente-comercial-marketing.md`.
