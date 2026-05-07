# Dependencias del cliente

Todos los materiales, accesos y decisiones que ESGAS debe proporcionar antes del inicio del desarrollo. El proyecto está bloqueado en los puntos marcados como 🔴 hasta que el cliente los resuelva.

> **Condición contractual:** el plazo de desarrollo empieza a contar desde la recepción y validación completa de todos los materiales. Los retrasos en la entrega se trasladan proporcionalmente al calendario de entrega sin penalización para Flownexion.

---

## Resumen de pendientes

| # | Entregable | Estado | Bloquea |
|---|---|---|---|
| 1 | Razón social y CIF | 🔴 Pendiente | Firma del contrato |
| 2 | Lista definitiva de marcas | 🔴 Pendiente | Inicio del desarrollo |
| 3 | Base de datos del catálogo (Excel/CSV) | 🔴 Pendiente | Motor técnico con catálogo propio |
| 4 | Documentación técnica de fabricantes | 🔴 Pendiente | Precisión de respuestas técnicas |
| 5 | Acceso API PrestaShop | 🔴 Pendiente | Integración precio/stock/carrito |
| 6 | Identidad visual (logo, colores) | 🔴 Pendiente | Diseño definitivo del widget |
| 7 | Decisiones de comportamiento (ver §Decisiones) | 🔴 Pendiente | Diseño de la integración B2B |

---

## Entregables detallados

### 1. Datos legales y contractuales

| Campo | Detalle |
|---|---|
| Razón social completa | Necesaria para el contrato y NDA |
| CIF | Necesario para el contrato y facturación |

---

### 2. Lista definitiva de marcas

**Marcas provisionales**: NTN, SNR.

El cliente debe confirmar la lista completa y cerrada **antes del inicio del desarrollo**. Una vez cerrada, no se añadirán nuevas marcas al alcance de v1 sin acuerdo de cambio de alcance.

---

### 3. Base de datos del catálogo propio

| Campo | Requisito |
|---|---|
| **Formato** | Excel (.xlsx) o CSV — editable con texto (no escaneos, no imágenes) |
| **Contenido mínimo** | Referencia, descripción, marca, tipo de producto, stock, precio |
| **Contenido recomendado** | Referencia del fabricante, equivalencias propias, categoría, imagen |
| **Calidad** | Sin celdas fusionadas · una fila por referencia · cabeceras sin caracteres especiales |

**Impacto si no se entrega**: el agente usa únicamente conocimiento genérico de specs ISO. Referencias exclusivas del catálogo ESGAS y tarifas propias no estarán disponibles.

---

### 4. Documentación técnica de fabricantes

Por cada marca confirmada, ESGAS debe entregar:

| Entregable | Formato aceptado |
|---|---|
| Catálogos técnicos oficiales | PDF con texto seleccionable (no escaneados) |
| Tablas de equivalencias | Excel / CSV (si existen, aceleran el desarrollo) |
| Documentos de aplicación | PDF (opcionales pero recomendados) |

**Estado por marca:**

| Marca | Estado |
|---|---|
| NTN | 🔴 Pendiente |
| SNR | 🔴 Pendiente |
| Otras marcas adicionales | Pendiente de confirmar lista |

> Si la documentación solo existe en papel o PDF escaneado sin OCR, se debe acordar un proceso de digitalización antes de iniciar el desarrollo.

---

### 5. Acceso a PrestaShop B2B

| Acceso | Detalle | Estado |
|---|---|---|
| Versión de PrestaShop instalada | Necesaria para validar compatibilidad de la API | 🔴 Pendiente |
| Clave API REST — lectura | Permisos sobre `products`, `stock_availables`, `specific_prices`, `customers` | 🔴 Pendiente |
| Clave API REST — escritura | Permisos sobre `carts` | 🔴 Pendiente |
| URL base de la API | `https://esgas.es/api/` o equivalente | 🔴 Pendiente |
| Lista de módulos B2B instalados | Especialmente los que afecten a precios o gestión de clientes | 🔴 Pendiente |
| Entorno de staging/pruebas | Recomendado: entorno separado de producción | 🔴 Pendiente |
| Acceso al back-office (solo lectura) | Para verificar la configuración durante el desarrollo | 🔴 Pendiente |

*Supuesto [S3]:* ESGAS dispone de entorno de staging. Sin staging, las pruebas de integración se realizarán en producción con riesgo operativo.

---

### 6. Identidad visual

| Entregable | Formato | Estado |
|---|---|---|
| Logotipo de ESGAS | SVG o PNG con fondo transparente (alta resolución) | 🔴 Pendiente |
| Paleta de colores corporativa | Códigos hexadecimales o guía de marca | 🔴 Pendiente |
| Tipografía corporativa | Nombre de la fuente o archivo .ttf/.woff | Opcional |

---

## Decisiones pendientes de confirmación

Además de materiales, el cliente debe tomar estas decisiones antes del inicio del desarrollo de la integración B2B:

| ID | Decisión | Impacto |
|---|---|---|
| D1 | ¿Debe el chatbot mostrar precios públicos a usuarios no autenticados, o bloquear las funciones comerciales? | Afecta al diseño de la integración de precios |
| D2 | ¿Cómo se identificará al usuario autenticado dentro del iframe? (cookie compartida / token en URL / postMessage) | Define la arquitectura de autenticación |
| D3 | ¿Existe entorno de staging en PrestaShop? | Define el plan de pruebas |
| D4 | ¿El módulo B2B de tarifas expone API propia o usa la API nativa de PrestaShop? | Puede requerir desarrollo adicional fuera del alcance actual |

---

## Proceso de entrega

1. ESGAS entrega los materiales en los formatos indicados.
2. Flownexion valida completitud y usabilidad en un plazo máximo de 3 días hábiles.
3. Si hay deficiencias, Flownexion notifica con detalle de qué debe corregirse.
4. Con todos los materiales validados, se confirma la fecha de inicio del desarrollo.

---

## Supuestos documentados

| ID | Supuesto | Riesgo si es falso |
|---|---|---|
| S1 | Las marcas NTN y SNR son las marcas objetivo de venta. Otras marcas se usan para equivalencias. | Si hay más marcas objetivo, el system prompt requiere revisión |
| S2 | El catálogo se recibirá en formato tabular (Excel/CSV), no como imágenes o PDFs de lista de precios | Si es PDF, requiere proceso de extracción adicional no contemplado |
| S3 | PrestaShop tiene la API REST nativa activada y accesible con autenticación por clave | Si no, el proyecto queda bloqueado hasta habilitarla |
| S4 | El widget se instalará en PrestaShop vía iframe, sin necesidad de módulo PHP personalizado | Si el cliente quiere módulo PHP, es desarrollo adicional fuera del alcance |
| S5 | Los precios y descuentos por cliente están gestionados en PrestaShop (grupos de clientes o tarifas específicas) | Si la lógica de precio está en un sistema externo, se requiere integración adicional |
