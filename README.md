# Chatbot IA — Suministros ESGAS

Asistente conversacional con inteligencia artificial para el portal B2B de Suministros ESGAS. Proporciona soporte técnico sobre productos industriales (rodamientos, retenes, correas y transmisión de potencia), consulta precios y stock en tiempo real desde PrestaShop, y permite añadir artículos al carrito directamente desde el chat.

---

## Estado del proyecto

| Bloque | Estado |
|---|---|
| Widget flotante + panel de chat | ✅ Producción |
| Agente IA (equivalencias + specs técnicas NTN/SNR) | ✅ Producción |
| Embed iframe para PrestaShop | ✅ Producción |
| Integración PrestaShop API (precio/stock/carrito) | 🔴 Pendiente — requiere acceso API del cliente |
| Base de datos catálogo propio (Excel/CSV) | 🔴 Pendiente — requiere entregable del cliente |
| Documentación oficial marcas confirmadas | 🔴 Pendiente — requiere entregable del cliente |

---

## Información del proyecto

| Atributo | Detalle |
|---|---|
| **Cliente** | Suministros ESGAS *(razón social y CIF pendientes de confirmar)* |
| **Proveedor** | Flownexion |
| **Frontend** | Next.js 15 · TypeScript · Tailwind CSS |
| **Despliegue** | Vercel — auto-deploy desde rama `main` |
| **Backend IA** | n8n workflow (webhook → GPT-4o → respuesta JSON) |
| **Modelo IA** | GPT-4o · temperatura 0.1 · maxIterations 25 |
| **Integración comercial** | PrestaShop B2B vía API REST *(pendiente)* |
| **Repositorio** | [github.com/juanky2332-oss/Chatbot-para-Esgas](https://github.com/juanky2332-oss/Chatbot-para-Esgas) |

---

## URLs de producción

| Recurso | URL |
|---|---|
| Widget (Vercel) | https://chatbot-para-esgas.vercel.app |
| Embed iframe | https://chatbot-para-esgas.vercel.app/embed |
| Web ESGAS | https://esgas.es |

---

## Arquitectura

```
Usuario (portal B2B esgas.es)
        │
        │  Widget embebido vía <iframe> o <script>
        ▼
Next.js + TypeScript · Vercel
   /src/components/Chatbot.tsx     ← widget flotante
   /src/app/embed/                 ← versión embebible
   /src/app/api/chat/route.ts      ← proxy → n8n (oculta webhook)
        │
        │  POST { message, sessionId }
        ▼
n8n Workflow (Transformaconia Cloud)
   Webhook → AI Agent (GPT-4o, temp 0.1) → Responder JSON
   Sub-nodos: Memoria RAM (20 msgs) · Búsqueda web (Tavily/DuckDuckGo)
        │
        │  (pendiente) API REST PrestaShop B2B
        ▼
PrestaShop B2B  →  precio por cliente · stock · carrito
```

---

## Setup rápido (desarrollo local)

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example .env.local
# Editar .env.local con los valores correctos

# 3. Arrancar
npm run dev
# Abre http://localhost:3000
```

### Variables de entorno requeridas

```env
# Obligatorias
N8N_WEBHOOK_URL=https://paneln8n.transformaconia.com/webhook/031ab1e6-d64e-41f0-b03e-f5c0681a6491

# Requeridas cuando se integre PrestaShop
PRESTASHOP_API_URL=https://esgas.es/api/
PRESTASHOP_API_KEY=
```

---

## Instalación del widget en PrestaShop

### Opción A — iframe embebido (recomendado)

```html
<iframe
  src="https://chatbot-para-esgas.vercel.app/embed"
  style="position:fixed;bottom:0;right:0;width:460px;height:640px;border:none;z-index:9999999"
  allow="clipboard-write"
></iframe>
```

### Opción B — Script dinámico

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

## Documentación

| Documento | Descripción |
|---|---|
| [SPEC.md](./SPEC.md) | Especificación general del proyecto |
| [docs/alcance-funcional.md](./docs/alcance-funcional.md) | Funcionalidades, exclusiones y límites del sistema |
| [docs/integraciones.md](./docs/integraciones.md) | APIs, sistemas externos y contratos de integración |
| [docs/dependencias-cliente.md](./docs/dependencias-cliente.md) | Entregables y accesos requeridos al cliente |
| [docs/criterios-aceptacion.md](./docs/criterios-aceptacion.md) | Condiciones de aceptación por bloque funcional |
| [docs/riesgos-y-pendientes.md](./docs/riesgos-y-pendientes.md) | Riesgos técnicos, operativos y decisiones abiertas |

---

*Desarrollado por [Flownexion](https://flownexion.com) · Powered by GPT-4o + n8n*
