# Integraciones

## 1. n8n (orquestación del agente IA)

### Descripción
n8n actúa como backend de IA. El frontend Next.js envía cada mensaje al webhook, y n8n gestiona el agente, la memoria y la búsqueda web antes de devolver la respuesta.

### Configuración actual

| Parámetro | Valor |
|---|---|
| Instancia | Transformaconia Cloud (`paneln8n.transformaconia.com`) |
| Workflow ID | `3bdkgcNKnr6eGhfk` |
| Webhook URL | `https://paneln8n.transformaconia.com/webhook/031ab1e6-d64e-41f0-b03e-f5c0681a6491` |
| Modelo IA | GPT-4o (OpenAI) · temperatura 0.1 · maxIterations 25 |
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
{ response: "..." }
        │
        ▼
Next.js devuelve al frontend  →  renderizado en el panel de chat
```

### Herramienta de búsqueda web
El agente dispone de un Code Tool que realiza búsquedas vía:
1. **Tavily API** (preferido): requiere variable de entorno `TAVILY_API_KEY` en n8n. 1.000 búsquedas/mes gratuitas en [app.tavily.com](https://app.tavily.com).
2. **DuckDuckGo** (fallback automático): sin clave API, menos preciso para specs técnicas.

---

## 2. Vercel (hosting y CI/CD)

### Descripción
El frontend Next.js se despliega automáticamente en Vercel desde la rama `main` del repositorio GitHub.

### Configuración

| Parámetro | Valor |
|---|---|
| Plataforma | Vercel (plan gratuito / Hobby) |
| Rama de producción | `main` |
| Repo | `github.com/juanky2332-oss/Chatbot-para-Esgas` |
| URL de producción | `https://chatbot-para-esgas.vercel.app` |
| Runtime | Next.js 15 App Router |

### Variables de entorno en Vercel
Actualmente no se requieren. Si en el futuro se externaliza la URL del webhook, añadir:

```
N8N_WEBHOOK_URL=https://paneln8n.transformaconia.com/webhook/<id>
```

---

## 3. PrestaShop B2B API (pendiente)

### Descripción
Integración futura que permite al agente consultar datos en tiempo real de la tienda B2B del cliente.

### Endpoints requeridos

| Acción | Endpoint PrestaShop |
|---|---|
| Autenticación del usuario | Sesión activa via cookie / token |
| Consultar precio por cliente | `GET /api/products/{id}?customer_id={cid}` |
| Consultar stock | `GET /api/stock_availables?id_product={id}` |
| Añadir al carrito | `POST /api/carts` con `id_product`, `quantity`, `id_customer` |
| Obtener URL del producto | `GET /api/products/{id}` → campo `link_rewrite` |

### Requisitos previos
- Clave API REST de PrestaShop con permisos de lectura/escritura sobre `products`, `stock_availables`, `carts`
- URL base de la tienda (`https://esgas.es/api/`)
- Confirmación de la versión de PrestaShop instalada (la API REST varía entre versiones)

**Estado**: 🔴 Pendiente — bloqueado por entregable del cliente.

---

## 4. Supabase (desactivado)

La versión v1 del proyecto usaba Supabase para almacenar el catálogo de equivalencias (15.850 filas). Esta integración fue eliminada en v2 porque el modelo GPT-4o conoce de forma nativa todas las specs ISO y las reglas de equivalencia por sufijos son predecibles mediante el system prompt. Supabase sigue activo (proyecto `cjfuhuaxeaxgfnrgzhys`) pero el agente ya no lo consulta.

> **Pendiente de decisión**: si el cliente entrega su base de datos propia (Excel/CSV), se evaluará si incorporarla en Supabase como fuente primaria o procesarla directamente en el system prompt / embeddings vectoriales.
