# Alcance Funcional

## 1. Motor de respuesta técnica

### Descripción
El chatbot actúa como un asesor técnico especializado en rodamientos y transmisión de potencia. Responde preguntas sobre equivalencias entre marcas, dimensiones, tolerancias, materiales, aplicaciones y diagnóstico de fallos.

### Fuentes de conocimiento (por prioridad)
1. **Conocimiento interno del modelo** (GPT-4o): abarca el catálogo completo de rodamientos estándar ISO — series 6000, 6200, 6300, 6800, 6900, 7xxx, 302xx, 222xx, NU, NK y equivalentes.
2. **Búsqueda web en tiempo real** (Tavily API / DuckDuckGo fallback): para referencias exóticas, specs exactas de catálogo de fabricante o nuevos productos.
3. **Base de datos propia del cliente** *(pendiente de entrega)*: Excel/CSV con el catálogo específico de ESGAS. Cuando esté disponible, se integrará como fuente primaria.
4. **Documentación oficial de fabricantes** *(pendiente de entrega)*: fichas técnicas PDF de NTN, SNR y demás marcas confirmadas.

### Funcionalidades incluidas

| Funcionalidad | Estado |
|---|---|
| Equivalencias entre marcas (NTN/SNR/SKF/FAG/NSK/TIMKEN/KOYO/INA) | ✅ Activo |
| Dimensiones ISO (d, D, B, Cr, C0r) de todas las series estándar | ✅ Activo |
| Selección de rodamiento por aplicación, carga, velocidad, temperatura | ✅ Activo |
| Diagnóstico de fallos (vibración, ruido, temperatura, desgaste) | ✅ Activo |
| Descripción de sufijos y variantes (C3, ZZ, 2RS, NJ, NF…) | ✅ Activo |
| Estrategia de venta cruzada NTN/SNR | ✅ Activo |
| Memoria de conversación (20 mensajes por sesión) | ✅ Activo |
| Búsqueda web para referencias no estándar | ✅ Activo |
| Consulta de catálogo propio del cliente | 🔴 Pendiente entregable |

---

## 2. Marcas prioritarias

**Estado**: lista pendiente de confirmación definitiva por el cliente.

Marcas actualmente cubiertas en el agente IA:
- **NTN** y **SNR** — marcas objetivo de venta
- **SKF, FAG, NSK, TIMKEN, KOYO, INA, NACHI** — marcas origen para equivalencias

El sistema de equivalencias cubre las principales reglas de sufijos de cada fabricante. La regla crítica documentada: `SKF 618xx/619xx → NTN 68xx/69xx` (eliminar el "6" del prefijo "61").

> **Supuesto**: se asume que el cliente confirmará NTN y SNR como marcas principales. Cualquier marca adicional requerirá documentación oficial antes de incluirse en el agente.

---

## 3. Integración PrestaShop B2B (v2 — futuro)

### Descripción
El chatbot detecta qué usuario B2B está autenticado y consulta la API de PrestaShop para ofrecer precios personalizados, stock en tiempo real y la posibilidad de añadir al carrito directamente desde el chat.

### Acciones disponibles dentro del chat

| Acción | Descripción |
|---|---|
| Ver ficha de producto | Enlace directo a la URL del producto en PrestaShop |
| Consultar precio | Precio real según el usuario autenticado y sus tarifas |
| Consultar stock | Disponibilidad en tiempo real desde PrestaShop |
| Añadir al carrito | El bot pregunta la cantidad y realiza la llamada API |
| Ir al carrito | Enlace directo para finalizar la compra en PrestaShop |

> **Exclusión explícita**: el pago **nunca** se realiza dentro del chatbot. El proceso de checkout ocurre íntegramente en PrestaShop.

**Estado**: 🔴 Pendiente — requiere acceso a la API REST de PrestaShop del cliente (clave y URL de la tienda).

---

## 4. Instalación visual en la web

| Elemento | Descripción |
|---|---|
| Icono flotante (esquina inferior derecha) | Robot animado con burbuja de chat. Siempre visible. Abre el panel al hacer clic. |
| Icono central en página de demostración | Versión de mayor tamaño, con animación de flotación y etiqueta "¿ALGUNA DUDA?" |
| Panel de chat | Ventana emergente de 420×580 px, diseño oscuro con acentos cian (#00D1FF) |
| Embed vía iframe | URL `/embed` para integrar en cualquier web externa sin código adicional |

### Comportamiento del widget flotante
- Flota con animación suave (translateY + ligera rotación cíclica)
- El brazo izquierdo saluda periódicamente (cada 7 segundos)
- Secuencia de atención cada 14 segundos (escala + micro-rebote)
- Badge rojo pulsante para indicar disponibilidad
- Etiqueta con glow animado en cyan/azul
- Al hacer clic: efecto de compresión (scale 0.93) antes de abrir el panel

---

## 5. Fuera de alcance (exclusiones)

- Gestión de pedidos completa dentro del chat
- Procesamiento de pagos
- Panel de administración para el cliente
- Histórico de conversaciones persistente (se reinicia por sesión)
- Soporte multiidioma (actualmente solo español)
- Integración con ERP o sistemas de gestión de almacén distintos a PrestaShop
