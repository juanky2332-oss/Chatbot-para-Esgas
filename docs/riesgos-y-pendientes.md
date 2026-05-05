# Riesgos y Pendientes

## Riesgos técnicos

### RT-1 — Alucinaciones del modelo IA

| Campo | Detalle |
|---|---|
| Probabilidad | Media |
| Impacto | Alto — información técnica incorrecta puede causar un pedido erróneo |
| Descripción | GPT-4o puede generar referencias de rodamientos que no existen o dimensiones incorrectas, especialmente en referencias exóticas o de series poco comunes. |
| Mitigación actual | System prompt con instrucción explícita de no inventar datos y decir "no lo sé" cuando no hay certeza. Temperatura 0.1 (mínima creatividad). |
| Mitigación propuesta | Integrar la base de datos real del cliente (Excel/CSV) como fuente verificada. Añadir un paso de validación post-respuesta que compruebe las referencias generadas contra el catálogo. |

---

### RT-2 — Dependencia de la disponibilidad de n8n

| Campo | Detalle |
|---|---|
| Probabilidad | Baja |
| Impacto | Alto — si n8n cae, el chatbot no responde |
| Descripción | El webhook n8n es el único backend del agente. Si la instancia de n8n en Transformaconia Cloud tiene una caída, el widget muestra error. |
| Mitigación actual | El frontend muestra un mensaje de error con el teléfono de ESGAS como alternativa. |
| Mitigación propuesta | Configurar healthcheck y alertas en n8n. Evaluar un fallback directo a OpenAI desde el proxy Next.js si n8n no responde en 15 segundos. |

---

### RT-3 — Conflicto de z-index en PrestaShop

| Campo | Detalle |
|---|---|
| Probabilidad | Media |
| Impacto | Medio — el widget puede quedar oculto bajo elementos del tema |
| Descripción | Algunos temas de PrestaShop usan z-index elevados en menús, overlays de cookies o banners. El widget está en z-index 999998/999999, pero puede no ser suficiente en algunos temas. |
| Mitigación | Al instalar el widget, verificar en el tema específico de ESGAS que el widget es visible y clicable. Ajustar el z-index si es necesario. |

---

### RT-4 — CORS y cookies en iframe embebido

| Campo | Detalle |
|---|---|
| Probabilidad | Media |
| Impacto | Medio — el iframe puede no funcionar en algunos navegadores o configuraciones |
| Descripción | Si el iframe se carga desde un dominio diferente al de PrestaShop, los navegadores modernos pueden bloquear las cookies de sesión. Esto afecta a la autenticación del usuario para las funcionalidades B2B (precio/carrito). |
| Mitigación propuesta | Configurar los headers `Content-Security-Policy` y `X-Frame-Options` en Vercel para permitir el embedding desde `esgas.es`. Para autenticación, usar tokens en localStorage en lugar de cookies. |

---

### RT-5 — Cambios en la API de PrestaShop

| Campo | Detalle |
|---|---|
| Probabilidad | Baja |
| Impacto | Alto — una actualización de PrestaShop puede romper la integración |
| Descripción | La API REST de PrestaShop varía entre versiones. Una actualización automática del servidor puede cambiar endpoints o romper la autenticación. |
| Mitigación | Fijar la versión de PrestaShop antes del desarrollo de la integración. Documentar los endpoints utilizados. Acordar con el cliente un aviso previo antes de actualizar PrestaShop. |

---

### RT-6 — Coste de la API de OpenAI

| Campo | Detalle |
|---|---|
| Probabilidad | Baja-Media |
| Impacto | Medio — coste inesperado si el uso escala |
| Descripción | GPT-4o tiene un coste por token. Con el system prompt actual (~17.500 caracteres) y 20 mensajes de contexto, cada conversación consume ~4.000–8.000 tokens. A alto volumen de usuarios esto puede generar coste significativo. |
| Estimación | A $0.005/1K tokens (output), 1.000 conversaciones/mes ≈ $20–40/mes aproximadamente. |
| Mitigación | Monitorizar el uso en el dashboard de OpenAI. Si el coste escala, evaluar migrar a GPT-4o-mini para consultas simples y reservar GPT-4o para consultas técnicas complejas. |

---

## Puntos pendientes de decisión

### PP-1 — Almacenamiento del catálogo del cliente

**Pregunta**: ¿Cómo se integrará la base de datos del cliente cuando esté disponible?

Opciones:
1. **Embeddings vectoriales en Supabase pgvector**: búsqueda semántica. Mayor precisión pero mayor complejidad de mantenimiento.
2. **Incorporar al system prompt**: solo viable si el catálogo tiene menos de ~500 productos clave.
3. **Búsqueda estructurada vía API**: el agente llama a una API que devuelve el producto exacto. Requiere desarrollo de API adicional.

**Decisión pendiente antes de**: recibir el Excel/CSV del cliente.

---

### PP-2 — Lista definitiva de marcas

**Pregunta**: ¿Qué marcas además de NTN y SNR comercializa ESGAS?

El system prompt actual cubre equivalencias desde SKF, FAG, NSK, TIMKEN, KOYO e INA. Si ESGAS también comercializa estas marcas de forma directa, el agente debe ajustar su estrategia de venta.

**Acción requerida**: el cliente debe confirmar la lista completa de marcas antes de la próxima revisión del system prompt.

---

### PP-3 — Gestión de sesión en PrestaShop

**Pregunta**: ¿Cómo se identificará al usuario B2B dentro del iframe?

Opciones:
1. **Cookie de sesión compartida**: PrestaShop y el iframe en el mismo dominio (requiere subdomain o configuración CORS).
2. **Token en URL**: PrestaShop inyecta un token en la URL del iframe al cargar el widget.
3. **PostMessage**: PrestaShop envía el token del usuario al iframe vía `postMessage` al cargarse.

**Decisión pendiente antes de**: inicio del desarrollo de la integración B2B.

---

### PP-4 — Entorno de pruebas de PrestaShop

**Pregunta**: ¿Dispone el cliente de un entorno staging o de pruebas?

Sin entorno de staging, las pruebas de integración de carrito y precios se realizarán directamente en producción, con el riesgo de que un bug añada productos erróneos a pedidos reales.

**Recomendación**: solicitar staging antes de iniciar el desarrollo de la integración.

---

## Log de decisiones tomadas

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-04-26 | Eliminar Supabase como fuente de datos | GPT-4o conoce de forma nativa las specs ISO. Supabase añadía latencia y coste sin mejora real en la mayoría de consultas. |
| 2026-04-26 | Usar GPT-4o con temperatura 0.1 | Minimiza respuestas creativas o inventadas en un dominio donde la precisión es crítica. |
| 2026-04-26 | System prompt de 17.500+ caracteres | Incorpora todas las reglas de equivalencia, series ISO y estrategia de venta. Evita consultas externas para el 90% de los casos. |
| 2026-04-26 | Embed vía iframe en `/embed` | Instalación en PrestaShop sin necesidad de módulo PHP ni acceso al código del tema. |
