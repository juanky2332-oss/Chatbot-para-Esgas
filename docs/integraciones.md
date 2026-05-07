# Integraciones

## Mapa de integraciones

```
Widget (Next.js / Vercel)
        │
        ├──► /api/chat  (proxy Next.js — oculta el webhook)
        │         └──► n8n Webhook
        │                   ├──► AI Agent GPT-4o
        │                   │         ├──► System Prompt (17.500+ chars)
        │                   │         └──► Memoria de sesión (20 msgs)
        │                   ├──► Búsqueda web (Tavily → DuckDuckGo fallback)
        │                   └──► PrestaShop API REST  ← (pendiente)
        │                             ├──► Precio por usuario
        │                             ├──► Stock en tiempo real
        │                             └──► Añadir al carrito
        │
        └──► /api/search  (proxy Next.js)
                  └──► Base de datos catálogo ESGAS  ← (pendiente)
```

---

## 1. n8n — Orquestación del agente IA

### Configuración actual

| Parámetro | Valor |
|---|---|
| Instancia | Transformaconia Cloud (`paneln8n.transformaconia.com`) |
| Workflow ID | `3bdkgcNKnr6eGhfk` |
| Webhook URL | `https://paneln8n.transformaconia.com/webhook/031ab1e6-d64e-41f0-b03e-f5c0681a6491` |
| Modelo IA | GPT-4o · temperatura 0.1 · maxIterations 25 |
| Memoria | RAM buffer · 20 mensajes por sesión |

### Flujo de un mensaje

```
POST /api/chat  { message: "...", sessionId: "abc123" }
        │
        ▼
Next.js proxy  →  POST webhook n8n  { message, sessionId }
        │
        ▼
n8n: Webhook → AI Agent → (opcional: búsqueda web) → Responder JSON
        │
        ▼
{ response: "..." }  →  Next.js  →  Widget (renderizado en el panel)
```

### Nodos del workflow

| Nodo | Tipo | Descripción |
|---|---|---|
| Webhook ESGAS | Trigger | Recibe la petición del widget |
| Agente de Ventas ESGAS | AI Agent | GPT-4o, temp=0.1, maxIterations=25 |
| Memoria de sesión | RAM Buffer | Retiene los últimos 20 mensajes por sessionId |
| Búsqueda web | Code Tool | Tavily API (fallback: DuckDuckGo) |
| Responder al Widget | Respond | Devuelve JSON `{ response }` |

### Variables de entorno en n8n

| Variable | Descripción | Estado |
|---|---|---|
| `OPENAI_API_KEY` | Clave de OpenAI para GPT-4o | ✅ Configurada |
| `TAVILY_API_KEY` | Búsqueda web de alta precisión (1.000 búsquedas/mes gratis) | ⬜ Recomendada — sin ella usa DuckDuckGo |

### Actualización del workflow vía API

```
Method: PUT
URL: https://paneln8n.transformaconia.com/api/v1/workflows/3bdkgcNKnr6eGhfk
Body: { name, nodes, connections, settings, staticData }
```

> Usar siempre UTF-8 para que los caracteres con tilde se guarden correctamente.

---

## 2. Vercel — Hosting y CI/CD

| Parámetro | Valor |
|---|---|
| Plataforma | Vercel |
| Rama de producción | `main` |
| Repositorio | `github.com/juanky2332-oss/Chatbot-para-Esgas` |
| URL de producción | `https://chatbot-para-esgas.vercel.app` |
| Runtime | Next.js 15 App Router |

Auto-deploy activado: cualquier push a `main` dispara un nuevo despliegue en Vercel.

### Variables de entorno en Vercel

Actualmente no se requieren variables en Vercel (el webhook de n8n está hardcodeado en el proxy). Cuando se integre PrestaShop, añadir:

```env
PRESTASHOP_API_URL=https://esgas.es/api/
PRESTASHOP_API_KEY=<clave con permisos de lectura/escritura>
```

---

## 3. PrestaShop B2B — API REST

**Estado**: 🔴 Pendiente — bloqueado por entregable del cliente.

### Requisitos previos

- PrestaShop con API REST habilitada (Ajustes avanzados → Webservice).
- Versión de PrestaShop confirmada (la API varía entre versiones).
- Clave API con permisos de **lectura** sobre: `products`, `stock_availables`, `specific_prices`, `customers`.
- Clave API con permisos de **escritura** sobre: `carts`.
- Confirmación de si se usa módulo B2B de terceros para tarifas personalizadas *(ver [riesgos-y-pendientes.md](./riesgos-y-pendientes.md), RT-5)*.

### Endpoints previstos

| Acción | Endpoint | Método |
|---|---|---|
| Datos del producto | `/api/products/{id}` | GET |
| Stock en tiempo real | `/api/stock_availables?id_product={id}` | GET |
| Precio por cliente | `/api/specific_prices?id_product={id}&id_customer={cid}` | GET |
| Crear/actualizar carrito | `/api/carts` | POST / PUT |
| Datos del usuario autenticado | `/api/customers/{id}` | GET |

> Pendiente de validación con ESGAS: confirmar que los endpoints nativos son suficientes o si el módulo B2B requiere endpoints propios.

### Identificación del usuario autenticado

*Supuesto [S1]:* el widget se embebe en el mismo dominio que PrestaShop, lo que permite acceder a la cookie de sesión. Si se instala en un dominio diferente, la cookie no será accesible por restricciones CORS/SameSite y se requerirá un mecanismo alternativo (token en URL, postMessage). Ver opciones en [riesgos-y-pendientes.md](./riesgos-y-pendientes.md), PP-3.

---

## 4. Proxy API Next.js

El widget nunca llama directamente a servicios externos para no exponer URLs ni claves en el cliente.

| Ruta interna | Destino real | Propósito |
|---|---|---|
| `POST /api/chat` | n8n Webhook | Proxy de mensajes al agente IA |
| `GET /api/search` | Base de datos catálogo | Búsqueda en catálogo de productos *(pendiente)* |

---

## 5. Búsqueda web (Tavily / DuckDuckGo)

Herramienta de apoyo para references exóticas o specs de catálogo no cubiertas por el system prompt.

| Proveedor | Modo | Límite gratuito | Precisión técnica |
|---|---|---|---|
| **Tavily** | Principal (si `TAVILY_API_KEY` configurada) | 1.000 búsquedas/mes | Alta |
| **DuckDuckGo** | Fallback automático | Sin límite | Media |

---

## 6. Supabase (desactivado — v1)

La versión v1 usaba Supabase (proyecto `cjfuhuaxeaxgfnrgzhys`) para almacenar el catálogo de equivalencias. Se desactivó porque GPT-4o conoce nativamente las specs ISO estándar y las reglas de equivalencia por sufijos son predecibles mediante el system prompt. El proyecto sigue activo pero el agente no lo consulta.

**Pendiente de decisión:** cuando el cliente entregue su base de datos (Excel/CSV), se evaluará si incorporarla en Supabase (búsqueda vectorial) o como contexto en el system prompt. Ver [riesgos-y-pendientes.md](./riesgos-y-pendientes.md), PP-1.
