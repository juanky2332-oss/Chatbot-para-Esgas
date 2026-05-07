# Alcance funcional

## 1. Motor de respuesta técnica

El chatbot actúa como asesor técnico especializado en rodamientos y transmisión de potencia industrial.

### Comportamiento

- Responde preguntas sobre equivalencias entre marcas, dimensiones, tolerancias, materiales, aplicaciones y diagnóstico de fallos.
- Utiliza **exclusivamente** información de fuentes autorizadas. No genera datos por inferencia cuando no hay respaldo documental.
- Cuando no dispone de información suficiente, lo declara explícitamente y orienta al usuario hacia el canal humano.
- Mantiene contexto de conversación por sesión (memoria de hasta 20 mensajes).

### Fuentes de datos (por orden de prioridad)

| Prioridad | Fuente | Formato | Estado |
|---|---|---|---|
| 1 | Base de datos del catálogo ESGAS | Excel / CSV | 🔴 Pendiente entrega |
| 2 | Fichas técnicas oficiales de fabricantes | PDF con texto | 🔴 Pendiente entrega |
| 3 | Conocimiento técnico del modelo GPT-4o | Interno (specs ISO estándar) | ✅ Activo |
| 4 | Búsqueda web (Tavily / DuckDuckGo) | Web | ✅ Activo |

> **Regla crítica:** las fuentes 1 y 2 son verificadas y deben prevalecer sobre las fuentes 3 y 4. Las fuentes 3 y 4 cubren el 90% de las consultas de specs ISO estándar pero no garantizan exactitud para referencias exclusivas del catálogo ESGAS.

### Funcionalidades activas en producción

| Funcionalidad | Estado |
|---|---|
| Equivalencias entre marcas (NTN/SNR/SKF/FAG/NSK/TIMKEN/KOYO/INA) | ✅ Activo |
| Dimensiones ISO (d, D, B, Cr, C0r) — series 6000, 6200, 6300, 6800, 6900, 7xxx, 302xx, 222xx, NU, NK | ✅ Activo |
| Selección de rodamiento por aplicación, carga, velocidad, temperatura | ✅ Activo |
| Diagnóstico de fallos (vibración, ruido, temperatura, desgaste) | ✅ Activo |
| Descripción de sufijos y variantes (C3, ZZ, 2RS, NJ, NF…) | ✅ Activo |
| Estrategia de venta cruzada NTN/SNR | ✅ Activo |
| Búsqueda web para referencias no estándar | ✅ Activo |
| Consulta de catálogo propio del cliente | 🔴 Pendiente entregable |

### Reglas de equivalencia documentadas

El system prompt incluye las reglas de sufijos para las principales marcas. Regla crítica: `SKF 618xx/619xx → NTN 68xx/69xx` (eliminar el "6" del prefijo "61").

---

## 2. Marcas cubiertas

**Estado de la lista**: pendiente de confirmación definitiva por el cliente antes del inicio del desarrollo del system prompt definitivo.

| Marca | Rol | Estado |
|---|---|---|
| NTN | Marca objetivo de venta | ✅ Confirmada provisionalmente |
| SNR | Marca objetivo de venta | ✅ Confirmada provisionalmente |
| SKF, FAG, NSK, TIMKEN, KOYO, INA, NACHI | Marcas origen para equivalencias | ✅ Cubiertas en el agente actual |
| Otras marcas adicionales | Por confirmar | 🔴 Pendiente confirmación del cliente |

> Cualquier marca adicional que el cliente quiera cubrir requiere entrega de documentación técnica oficial antes de incluirse. Marcas no documentadas no están cubiertas en v1.

---

## 3. Integración comercial con PrestaShop B2B

**Estado**: 🔴 Pendiente — requiere acceso a la API REST de PrestaShop del cliente.

### Identificación del usuario

El chatbot detecta el usuario autenticado en el portal B2B y aplica sus precios y condiciones comerciales. Si el usuario no está autenticado, el comportamiento debe definirse con el cliente *(ver [riesgos-y-pendientes.md](./riesgos-y-pendientes.md), PP-3)*.

### Acciones disponibles desde el chat

| Acción | Descripción | Requiere autenticación |
|---|---|---|
| **Consultar precio** | Precio aplicable al usuario según su tarifa en PrestaShop | Sí |
| **Consultar stock** | Unidades disponibles en tiempo real | Sí |
| **Ver ficha del producto** | Enlace directo a la página del producto en PrestaShop | No |
| **Añadir al carrito** | Solicita cantidad y añade el artículo al carrito del usuario | Sí |
| **Ir al carrito** | Enlace directo al carrito para finalizar la compra | Sí |

> **Exclusión explícita:** el proceso de pago ocurre íntegramente en PrestaShop. El chatbot nunca maneja datos de pago ni redirige fuera del flujo de checkout de PrestaShop.

---

## 4. Presencia visual en el sitio web

| Elemento | Descripción | Estado |
|---|---|---|
| Icono flotante (esquina inferior derecha) | Robot animado con etiqueta "¿ALGUNA DUDA?". Siempre visible. Abre el panel al hacer clic. | ✅ Activo |
| Icono central en página de demostración | Versión de mayor tamaño con animación de flotación | ✅ Activo |
| Panel de chat | Ventana emergente 420×580 px, diseño oscuro con acentos en azul/cian | ✅ Activo |
| Embed vía iframe | URL `/embed` para integrar en cualquier web externa | ✅ Activo |

### Comportamiento del widget flotante

- Animación de flotación suave (translateY + ligera rotación cíclica).
- Secuencia de atención periódica (escala + micro-rebote) para aumentar la tasa de apertura.
- Indicador online pulsante (punto verde).
- Efecto de compresión (scale 0.93) al hacer clic, antes de abrir el panel.
- Responsive: en móvil el panel ocupa el ancho completo de pantalla.

---

## 5. Exclusiones del alcance (v1)

Los siguientes elementos están **explícitamente fuera** de este proyecto:

- Procesamiento de pagos dentro del chatbot.
- Gestión de pedidos (creación, seguimiento, devoluciones, facturas).
- Panel de administración para el cliente.
- Histórico de conversaciones persistente entre sesiones.
- Hand-off a agente humano (chat en vivo con operador).
- Integración con ERP o sistemas de gestión de almacén distintos a PrestaShop.
- Soporte multilingüe (solo español en v1).
- Soporte técnico o mantenimiento de la plataforma PrestaShop del cliente.
- Cobertura de marcas no confirmadas y documentadas antes del inicio del desarrollo.
- Formación presencial al equipo de ESGAS.
