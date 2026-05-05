# Criterios de Aceptación

Cada bloque funcional se considera **aceptado** cuando cumple todos los criterios listados bajo ese bloque. Los criterios están ordenados de mayor a menor prioridad.

---

## Bloque 1 — Motor de respuesta técnica

### CA-1.1 Equivalencias entre marcas
- El agente devuelve la referencia equivalente en NTN/SNR cuando se le proporciona una referencia de SKF, FAG, NSK, TIMKEN, KOYO o INA.
- La equivalencia es correcta para al menos el 95% de las referencias de rodamientos estándar ISO (series 6000–6300, 6800, 6900, 7xxx, 302xx, 222xx, NU, NK).
- El agente aplica correctamente la regla `SKF 618xx/619xx → NTN 68xx/69xx` (eliminación del prefijo "61").
- El agente no inventa referencias: si no puede confirmar la equivalencia, lo indica explícitamente.

### CA-1.2 Dimensiones técnicas
- Para cualquier referencia de rodamiento estándar ISO, el agente proporciona: diámetro interior (d), diámetro exterior (D), ancho (B), carga dinámica (Cr) y carga estática (C0r).
- Las dimensiones se corresponden con el catálogo ISO estándar del fabricante.

### CA-1.3 Selección por aplicación
- El agente puede recomendar un tipo de rodamiento adecuado cuando el usuario describe la aplicación (carga radial/axial, velocidad de giro, temperatura, presencia de vibraciones, etc.).
- La recomendación incluye al menos: tipo de rodamiento, serie, justificación técnica breve.

### CA-1.4 Diagnóstico de fallos
- El agente proporciona posibles causas y acciones correctivas cuando el usuario describe síntomas (ruido, vibración excesiva, temperatura anormal, desgaste prematuro).

### CA-1.5 Calidad de respuesta
- Las respuestas no contienen datos inventados (alucinaciones).
- Si el agente no dispone de información verificada, responde "No tengo esa información con certeza" y propone alternativas (buscar en catálogo, contactar con ESGAS).
- El agente mantiene el contexto de la conversación durante al menos 10 turnos consecutivos.

---

## Bloque 2 — Widget visual

### CA-2.1 Botón flotante
- El widget flotante es visible en la esquina inferior derecha en todas las páginas donde se instale.
- No cubre elementos interactivos críticos de la web huésped (menús, formularios de compra).
- El widget es responsivo: en móvil se adapta sin solaparse con el contenido.

### CA-2.2 Animaciones
- El robot flota suavemente (animación continua, no disruptiva).
- El brazo izquierdo realiza un saludo periódico sutil (cada ~7 segundos).
- La secuencia de atención se activa periódicamente pero no distrae en exceso durante la navegación.
- El badge de notificación (punto rojo) es visible pero no molesto.
- Al hacer clic, el efecto de compresión (scale) es inmediato y fluido.

### CA-2.3 Panel de chat
- El panel se abre en menos de 300 ms tras hacer clic.
- El panel muestra el historial completo de la conversación sin pérdida de mensajes.
- El indicador de escritura (tres puntos) aparece mientras el agente procesa la respuesta.
- El panel se cierra al hacer clic en el botón ✕.
- En móvil, el panel ocupa el ancho completo de la pantalla.

### CA-2.4 Embed vía iframe
- La URL `/embed` muestra únicamente el widget sin la página de demostración.
- El widget embebido comunica su estado de apertura/cierre a la ventana padre vía `postMessage`.
- El iframe no requiere cookies de terceros para funcionar.

---

## Bloque 3 — Integración PrestaShop (futuro)

### CA-3.1 Precio por cliente
- Cuando el usuario está autenticado, el agente muestra el precio del producto aplicando su tarifa.
- El precio mostrado coincide con el que aparece en la ficha del producto en PrestaShop.
- Si el usuario no está autenticado, el agente indica que debe iniciar sesión para ver su precio.

### CA-3.2 Stock en tiempo real
- El agente informa correctamente sobre la disponibilidad del producto.
- El stock mostrado se actualiza en cada consulta (no está cacheado más de 5 minutos).

### CA-3.3 Añadir al carrito
- Al confirmar la cantidad, el producto se añade al carrito del usuario en PrestaShop.
- El agente confirma la adición con el nombre del producto y la cantidad.
- El carrito en PrestaShop refleja la adición inmediatamente.
- Si el stock es insuficiente, el agente informa y no procesa la adición.

### CA-3.4 Enlace al producto
- El agente proporciona un enlace directo a la URL del producto en PrestaShop.
- El enlace abre la ficha correcta del producto.

---

## Bloque 4 — Calidad técnica general

### CA-4.1 Disponibilidad
- El widget está operativo el 99% del tiempo (excluyendo ventanas de mantenimiento de n8n o Vercel).
- En caso de error de conexión con n8n, el usuario recibe un mensaje de error claro con el número de teléfono de ESGAS.

### CA-4.2 Rendimiento
- El tiempo de respuesta del agente es inferior a 10 segundos para el 90% de las consultas.
- El widget carga en menos de 2 segundos en una conexión de 10 Mbps.

### CA-4.3 Seguridad
- Ninguna clave API (OpenAI, PrestaShop, n8n) queda expuesta en el código del frontend.
- El proxy `/api/chat` no expone el webhook de n8n al usuario final.
- No se almacenan datos personales del usuario en el frontend ni en logs accesibles.
