# Criterios de aceptación

El proyecto se considera entregado y aprobado cuando **todos** los criterios de esta lista están verificados y validados conjuntamente por ESGAS y Flownexion durante la Fase F5 (UAT).

Cualquier criterio no superado genera un ítem de corrección que debe resolverse antes de emitir la factura del 50% final. Las incidencias clasificadas como mejoras o cambios de alcance no bloquean la aceptación y se gestionan en el contrato de mantenimiento.

---

## Bloque 1 — Motor de respuesta técnica

### CA-1.1 Equivalencias entre marcas

- El agente devuelve la referencia equivalente en NTN/SNR cuando se le proporciona una referencia de SKF, FAG, NSK, TIMKEN, KOYO o INA.
- La equivalencia es correcta para al menos el 95% de las referencias de rodamientos estándar ISO (series 6000–6300, 6800, 6900, 7xxx, 302xx, 222xx, NU, NK).
- El agente aplica correctamente la regla `SKF 618xx/619xx → NTN 68xx/69xx` (eliminación del prefijo "61").
- El agente no inventa referencias: si no puede confirmar la equivalencia, lo indica explícitamente.

### CA-1.2 Especificaciones técnicas

- Para cualquier referencia ISO estándar, el agente proporciona: diámetro interior (d), diámetro exterior (D), ancho (B), carga dinámica (Cr) y carga estática (C0r).
- Las especificaciones coinciden con el catálogo ISO del fabricante.

### CA-1.3 Selección por aplicación

- El agente recomienda un tipo de rodamiento adecuado cuando el usuario describe la aplicación (carga radial/axial, velocidad, temperatura, vibraciones).
- La recomendación incluye: tipo de rodamiento, serie sugerida y justificación técnica breve.

### CA-1.4 Diagnóstico de fallos

- El agente proporciona posibles causas y acciones correctivas cuando el usuario describe síntomas (ruido, vibración, temperatura anormal, desgaste prematuro).

### CA-1.5 Calidad de respuesta

- Las respuestas no contienen datos inventados (alucinaciones).
- Cuando el agente no dispone de información verificada, responde explícitamente que no tiene esa información y propone alternativas (contactar con ESGAS, buscar en catálogo).
- La memoria de sesión mantiene el contexto durante al menos 10 turnos consecutivos.

---

## Bloque 2 — Widget visual

### CA-2.1 Widget flotante

- Visible en la esquina inferior derecha en todas las páginas donde se instale.
- No cubre elementos interactivos críticos de la web huésped (menús, formularios, botones de compra).
- Responsive: en móvil no solapa contenido relevante y el panel ocupa el ancho completo.

### CA-2.2 Animaciones

- Flotación suave continua (no disruptiva).
- Secuencia de atención periódica (escala + micro-rebote).
- Indicador online (punto verde) visible y pulsante.
- Efecto de compresión al hacer clic (scale 0.93) fluido e inmediato.

### CA-2.3 Panel de chat

- Se abre en menos de 300 ms tras hacer clic.
- Muestra el historial completo sin pérdida de mensajes.
- El indicador de escritura (tres puntos animados) aparece mientras el agente procesa.
- Se cierra correctamente al hacer clic en ✕.
- El campo de texto recupera el foco tras enviar un mensaje.
- El scroll automático al último mensaje funciona correctamente.

### CA-2.4 Compatibilidad de navegadores

- Funciona correctamente en Chrome, Firefox, Safari y Edge (últimas 2 versiones principales).
- Funciona en dispositivos móviles iOS (Safari) y Android (Chrome).

### CA-2.5 Embed vía iframe

- La URL `/embed` muestra únicamente el widget sin la página de demostración.
- El widget embebido comunica su estado (abierto/cerrado) a la ventana padre vía `postMessage`.
- El iframe no requiere cookies de terceros para funcionar en su modo básico (sin autenticación B2B).

---

## Bloque 3 — Integración PrestaShop

### CA-3.1 Precio por cliente

- El precio mostrado para al menos 3 usuarios B2B de prueba coincide con el precio en PrestaShop para esos usuarios.
- Si el usuario no está autenticado, el agente muestra el comportamiento definido con el cliente *(ver [dependencias-cliente.md](./dependencias-cliente.md), D1)*.

### CA-3.2 Stock en tiempo real

- El stock mostrado coincide con el disponible en PrestaShop en el momento de la consulta.
- El stock se actualiza en cada consulta (no cacheado más de 5 minutos).
- El agente informa correctamente cuando el stock es 0.

### CA-3.3 Añadir al carrito

- El producto se añade al carrito del usuario autenticado con la cantidad indicada.
- El agente confirma la adición con nombre del producto y cantidad.
- El carrito en PrestaShop refleja la adición inmediatamente.
- Si el stock es insuficiente, el agente informa y no procesa la adición.

### CA-3.4 Enlaces directos

- El enlace "Ver ficha del producto" dirige a la URL correcta del producto en PrestaShop (verificado en 10 referencias).
- El enlace "Ir al carrito" dirige al carrito correcto del usuario autenticado.

### CA-3.5 Modo degradado

- Si la API de PrestaShop no está disponible, el chatbot responde en modo técnico sin fallar completamente.
- El usuario recibe un mensaje claro indicando que las funciones comerciales no están disponibles temporalmente.

---

## Bloque 4 — Calidad técnica general

### CA-4.1 Rendimiento

- El tiempo de respuesta del agente es inferior a 10 segundos para el 90% de las consultas en condiciones normales de red.
- El widget (JS/CSS) carga en menos de 2 segundos en una conexión de 10 Mbps.

### CA-4.2 Disponibilidad

- El widget está operativo el 99% del tiempo (excluyendo ventanas de mantenimiento programadas de n8n o Vercel).
- En caso de error de conexión con n8n, el usuario recibe un mensaje de error claro con el número de teléfono de ESGAS.

### CA-4.3 Seguridad

- Ninguna clave API (OpenAI, PrestaShop, n8n) queda expuesta en el código del cliente (frontend).
- El proxy `/api/chat` no expone la URL del webhook de n8n al usuario final.
- No se almacenan datos personales del usuario en el frontend ni en logs accesibles.

---

## Procedimiento de UAT

1. Flownexion entrega el entorno listo para UAT con la lista de casos de prueba acordada.
2. ESGAS ejecuta los casos de prueba y registra incidencias en el repositorio GitHub (Issues con etiqueta `bug`).
3. Flownexion resuelve incidencias **bloqueantes** en un plazo máximo de 5 días hábiles.
4. ESGAS valida las correcciones y firma el acta de aceptación.
5. La firma del acta desbloquea el segundo pago (1.100 € + IVA) y el inicio del contrato de mantenimiento.
