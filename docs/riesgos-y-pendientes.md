# Riesgos y puntos pendientes

## Riesgos técnicos

### RT-1 — Alucinaciones del modelo IA

| Campo | Detalle |
|---|---|
| **Probabilidad** | Media |
| **Impacto** | Alto — información técnica incorrecta puede provocar un pedido erróneo |
| **Descripción** | GPT-4o puede generar referencias que no existen o dimensiones incorrectas, especialmente en referencias exóticas o series poco comunes no cubiertas por el system prompt. |
| **Mitigación actual** | System prompt con instrucción explícita de no inventar datos y declarar incertidumbre. Temperatura 0.1 (mínima creatividad). |
| **Mitigación propuesta** | Integrar la base de datos del cliente como fuente primaria verificada. Añadir validación post-respuesta contra el catálogo. |

---

### RT-2 — Dependencia de disponibilidad de n8n

| Campo | Detalle |
|---|---|
| **Probabilidad** | Baja |
| **Impacto** | Alto — si n8n cae, el chatbot no responde |
| **Descripción** | El webhook n8n es el único backend del agente. Una caída de la instancia en Transformaconia Cloud deja el widget sin respuesta. |
| **Mitigación actual** | El frontend muestra mensaje de error con el teléfono de ESGAS como canal alternativo. |
| **Mitigación propuesta** | Configurar healthcheck y alertas en n8n. Evaluar fallback directo a OpenAI desde el proxy Next.js si n8n no responde en 15 segundos. |

---

### RT-3 — Conflicto de z-index en el tema de PrestaShop

| Campo | Detalle |
|---|---|
| **Probabilidad** | Media |
| **Impacto** | Medio — el widget puede quedar oculto bajo elementos del tema |
| **Descripción** | Algunos temas de PrestaShop usan z-index elevados en menús, overlays de cookies o banners. El widget usa z-index 999998/999999, pero puede no ser suficiente. |
| **Mitigación** | Verificar en el tema específico de ESGAS que el widget es visible y clicable. Ajustar z-index si es necesario. |

---

### RT-4 — CORS y cookies en iframe embebido

| Campo | Detalle |
|---|---|
| **Probabilidad** | Media |
| **Impacto** | Medio — puede bloquear la autenticación B2B en algunos navegadores |
| **Descripción** | Si el iframe se carga desde un dominio diferente al de PrestaShop, los navegadores modernos bloquean las cookies de sesión (restricciones SameSite). Esto impide identificar al usuario autenticado para las funciones de precio/carrito. |
| **Mitigación** | Configurar headers `Content-Security-Policy` y `X-Frame-Options` en Vercel. Para autenticación, evaluar tokens en localStorage o mecanismo postMessage en lugar de cookies. |

---

### RT-5 — API de PrestaShop no expone tarifas B2B personalizadas

| Campo | Detalle |
|---|---|
| **Probabilidad** | Media |
| **Impacto** | Alto — sin API de tarifas, el precio personalizado por cliente no es viable en v1 |
| **Descripción** | Si PrestaShop usa un módulo B2B de terceros para gestionar tarifas específicas por cliente, ese módulo puede no exponer los datos vía la API nativa. |
| **Mitigación** | Solicitar a ESGAS la lista de módulos B2B instalados. Validar antes del inicio del desarrollo de la integración. Si el módulo no tiene API, evaluar desarrollo de endpoint adicional fuera del alcance actual. |

---

### RT-6 — Coste de la API de OpenAI a escala

| Campo | Detalle |
|---|---|
| **Probabilidad** | Baja-Media |
| **Impacto** | Medio — coste inesperado si el volumen de usuarios escala |
| **Descripción** | Con el system prompt actual (~17.500 caracteres) y 20 mensajes de contexto, cada conversación consume ~4.000–8.000 tokens. A alto volumen esto puede generar costes significativos. |
| **Estimación** | A $0.005/1K tokens (output), 1.000 conversaciones/mes ≈ $20–40/mes. |
| **Mitigación** | Monitorizar el uso en el dashboard de OpenAI. Si el coste escala, evaluar GPT-4o-mini para consultas simples y reservar GPT-4o para consultas técnicas complejas. |

---

## Riesgos operativos

### RO-1 — Entrega incompleta o tardía de materiales por parte del cliente

| Campo | Detalle |
|---|---|
| **Probabilidad** | Alta |
| **Impacto** | Alto — retrasa el inicio del desarrollo |
| **Mitigación** | Fijar contractualmente que el plazo empieza desde la validación completa de materiales. Establecer fechas límite por entregable. |

---

### RO-2 — Actualizaciones frecuentes del catálogo

| Campo | Detalle |
|---|---|
| **Probabilidad** | Media |
| **Impacto** | Medio — el sistema puede quedar desactualizado si el catálogo cambia con frecuencia |
| **Mitigación** | Definir en el contrato de mantenimiento el SLA para actualización de datos del catálogo. Considerar sincronización automática en versiones futuras. |

---

### RO-3 — Usuario B2B no autenticado espera precios personalizados

| Campo | Detalle |
|---|---|
| **Probabilidad** | Alta |
| **Impacto** | Medio — experiencia de usuario degradada o confusa |
| **Mitigación** | Definir con ESGAS el comportamiento exacto: mostrar precios públicos, redirigir al login, o desactivar funciones comerciales. *(Ver decisión D1 en [dependencias-cliente.md](./dependencias-cliente.md))* |

---

### RO-4 — Caída de la API de PrestaShop durante una sesión

| Campo | Detalle |
|---|---|
| **Probabilidad** | Baja |
| **Impacto** | Medio — usuario no puede ver precios ni añadir al carrito |
| **Mitigación** | Implementar degradación elegante: el chatbot responde en modo técnico sin datos comerciales y notifica al usuario. |

---

## Puntos pendientes de decisión

### PP-1 — Cómo integrar la base de datos del cliente

**Pregunta**: cuando ESGAS entregue el Excel/CSV de su catálogo, ¿cómo se incorpora al sistema?

| Opción | Descripción | Complejidad | Mantenimiento |
|---|---|---|---|
| A — Embeddings vectoriales (Supabase pgvector) | Búsqueda semántica de alta precisión | Alta | Requiere re-indexación al actualizar el catálogo |
| B — Incorporar al system prompt | Viable solo si el catálogo tiene <500 productos clave | Baja | Manual — regenerar el prompt al cambiar el catálogo |
| C — API estructurada de búsqueda | El agente llama a una API que devuelve el producto exacto | Media | Depende del endpoint (`/api/search`) |

**Decisión pendiente antes de**: recibir el Excel/CSV del cliente.

---

### PP-2 — Lista definitiva de marcas

**Pregunta**: ¿qué marcas además de NTN y SNR comercializa ESGAS directamente?

El system prompt actual cubre equivalencias desde SKF, FAG, NSK, TIMKEN, KOYO e INA. Si ESGAS también comercializa estas marcas de forma directa, el agente debe ajustar su estrategia de venta para no desviar al cliente hacia NTN/SNR en esos casos.

**Acción requerida**: el cliente debe confirmar la lista completa antes del inicio del desarrollo del system prompt definitivo.

---

### PP-3 — Mecanismo de identificación del usuario autenticado en el iframe

**Pregunta**: ¿cómo se identificará al usuario B2B dentro del iframe del chatbot?

| Opción | Descripción | Complejidad | Dependencias |
|---|---|---|---|
| A — Cookie de sesión compartida | Requiere mismo dominio o configuración CORS estricta | Media | Dominio del iframe = dominio de PrestaShop |
| B — Token en URL | PrestaShop inyecta un token en la URL del iframe al cargarlo | Baja | Modificación menor en el tema de PrestaShop |
| C — PostMessage | PrestaShop envía el token al iframe vía `window.postMessage` al cargarse | Media | Modificación en el tema de PrestaShop |

**Decisión pendiente antes de**: inicio del desarrollo de la integración B2B.

---

### PP-4 — Entorno de pruebas de PrestaShop

**Pregunta**: ¿dispone el cliente de un entorno staging separado de producción?

Sin staging, las pruebas de integración de carrito y precios se realizarán directamente en producción, con riesgo de que un bug añada productos erróneos a pedidos reales.

**Recomendación**: solicitar staging antes de iniciar el desarrollo de la integración.

---

## Log de decisiones tomadas

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-04-26 | Eliminar Supabase como fuente de datos | GPT-4o conoce nativamente las specs ISO. Supabase añadía latencia y coste sin mejora real para el 90% de consultas. |
| 2026-04-26 | Usar GPT-4o con temperatura 0.1 | Minimiza respuestas creativas o inventadas en un dominio donde la precisión técnica es crítica. |
| 2026-04-26 | System prompt de 17.500+ caracteres | Incorpora reglas de equivalencia, series ISO y estrategia de venta. Evita consultas externas para el 90% de los casos. |
| 2026-04-26 | Embed vía iframe en `/embed` | Instalación en PrestaShop sin necesidad de módulo PHP ni acceso al código del tema. |
| 2026-05-07 | Estructurar documentación en `/docs` | Facilitar la colaboración, el seguimiento de pendientes y la entrega profesional al cliente. |
