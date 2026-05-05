# ESGAS AI Chatbot — Especificación de Proyecto

Widget de inteligencia artificial para la web B2B de **ESGAS** (suministros industriales: rodamientos, retenes, correas y transmisión de potencia). Permite a los clientes consultar equivalencias técnicas, ficha de producto, disponibilidad de stock y precios personalizados sin salir de la web.

---

## Arquitectura

```
Cliente web (esgas.es / PrestaShop)
        │
        │  embed widget (<script> o <iframe>)
        ▼
Next.js + TypeScript · Vercel
   /src/components/Chatbot.tsx   ← widget flotante
   /src/app/embed/               ← página embebible vía iframe
   /src/app/api/chat/route.ts    ← proxy al webhook n8n
        │
        │  POST { message, sessionId }
        ▼
n8n Workflow (Transformaconia Cloud)
   Webhook → AI Agent (GPT-4o, temp 0.1) → Responder JSON
   Sub-nodos: Memoria RAM (20 msgs) · Búsqueda web (Tavily/DuckDuckGo)
        │
        │  (futuro) API REST PrestaShop B2B
        ▼
PrestaShop B2B  →  stock · precio por cliente · añadir al carrito
```

---

## URLs de producción

| Recurso | URL |
|---|---|
| Widget (Vercel) | https://chatbot-para-esgas.vercel.app |
| Embed iframe | https://chatbot-para-esgas.vercel.app/embed |
| Web ESGAS | https://esgas.es |

---

## Stack

- **Frontend**: Next.js 15 · TypeScript · Tailwind CSS
- **Deploy**: Vercel (auto-deploy desde rama `main`)
- **Orquestación IA**: n8n self-hosted (Transformaconia)
- **Modelo**: GPT-4o (OpenAI) — temperatura 0.1
- **Memoria de conversación**: RAM buffer, 20 mensajes por sesión

---

## Instalación del widget en PrestaShop

### Opción A — iframe embebido

```html
<iframe
  src="https://chatbot-para-esgas.vercel.app/embed"
  style="position:fixed;bottom:0;right:0;width:460px;height:640px;border:none;z-index:9999"
  allow="clipboard-write"
></iframe>
```

### Opción B — Script en el tema

Añadir en el `<head>` de PrestaShop:

```html
<script>
  (function(){
    var iframe = document.createElement('iframe');
    iframe.src = 'https://chatbot-para-esgas.vercel.app/embed';
    iframe.style.cssText = 'position:fixed;bottom:0;right:0;width:460px;height:640px;border:none;z-index:9999999;background:transparent';
    iframe.allow = 'clipboard-write';
    document.body.appendChild(iframe);
  })();
</script>
```

---

## Desarrollo local

```bash
npm install
npm run dev
# Abre http://localhost:3000
```

---

## Documentación adicional

| Documento | Descripción |
|---|---|
| [docs/alcance-funcional.md](docs/alcance-funcional.md) | Funcionalidades cubiertas y excluidas |
| [docs/integraciones.md](docs/integraciones.md) | n8n, PrestaShop API, Vercel |
| [docs/dependencias-cliente.md](docs/dependencias-cliente.md) | Entregables requeridos al cliente |
| [docs/criterios-aceptacion.md](docs/criterios-aceptacion.md) | Criterios de aceptación por bloque funcional |
| [docs/riesgos-y-pendientes.md](docs/riesgos-y-pendientes.md) | Riesgos técnicos y puntos abiertos |

---

## Estado del proyecto

| Bloque | Estado |
|---|---|
| Widget flotante + panel de chat | ✅ Producción |
| Agente IA (equivalencias + specs técnicas) | ✅ Producción |
| Embed iframe para PrestaShop | ✅ Producción |
| Integración PrestaShop API (stock/precio/carrito) | 🔴 Pendiente — requiere acceso API del cliente |
| Base de datos catálogo propia (Excel/CSV) | 🔴 Pendiente — requiere entregable del cliente |
| Documentación oficial marcas confirmadas | 🔴 Pendiente — requiere entregable del cliente |

---

*Desarrollado por [Flownexion](https://flownexion.com) · Powered by GPT-4o + n8n*
