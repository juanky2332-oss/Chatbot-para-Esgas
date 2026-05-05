# Dependencias del Cliente

Este documento lista todos los entregables y accesos que debe proporcionar el cliente antes de poder completar el desarrollo de cada bloque funcional. El proyecto está bloqueado en los puntos marcados como 🔴 hasta que el cliente los resuelva.

---

## Entregables obligatorios

### 1. Base de datos del catálogo propio

**Estado**: 🔴 Pendiente

| Campo | Detalle |
|---|---|
| Formato aceptado | Excel (.xlsx) o CSV con separador de coma o punto y coma |
| Contenido mínimo requerido | Referencia, descripción, marca, tipo de producto, stock, PVP |
| Contenido recomendado | Referencia del fabricante, equivalencias propias, imágenes, categorías |
| Uso | Integración como fuente primaria del agente IA y base para búsquedas de producto |

**Impacto si no se entrega**: el agente utiliza únicamente su conocimiento general de rodamientos ISO. Los productos específicos del catálogo ESGAS (referencias exclusivas, tarifas propias, stock) no estarán disponibles.

---

### 2. Documentación oficial de fabricantes

**Estado**: 🔴 Pendiente

| Campo | Detalle |
|---|---|
| Formato aceptado | PDF de catálogo oficial, fichas técnicas descargables |
| Marcas requeridas | Todas las marcas confirmadas (mínimo NTN y SNR) |
| Uso | Fuente de datos técnicos verificados para el agente IA |

**Impacto si no se entrega**: el agente responde con especificaciones ISO estándar y búsqueda web. Sin los catálogos oficiales, no puede garantizar exactitud en references menos comunes o en productos de nueva generación.

---

### 3. Lista definitiva de marcas

**Estado**: 🔴 Pendiente confirmación

| Campo | Detalle |
|---|---|
| Marcas provisionales | NTN, SNR |
| Acción requerida | Confirmar lista completa antes del inicio del desarrollo de la base de conocimiento |
| Impacto de cambio tardío | Añadir marcas tras el desarrollo del system prompt implica revisión y repruebas del agente |

---

### 4. Acceso API PrestaShop

**Estado**: 🔴 Pendiente

| Campo | Detalle |
|---|---|
| Clave API REST | Con permisos de lectura sobre `products`, `stock_availables`; escritura sobre `carts` |
| URL base | `https://esgas.es/api/` o URL equivalente |
| Versión PrestaShop | Necesaria para confirmar compatibilidad de endpoints |
| Entorno de pruebas | Preferible disponer de entorno staging antes de producción |

**Impacto si no se entrega**: las funcionalidades de precio en tiempo real, consulta de stock y añadir al carrito no pueden desarrollarse ni probarse.

---

## Accesos técnicos

| Acceso | Responsable | Estado |
|---|---|---|
| Panel PrestaShop (back-office) | Cliente | 🔴 Pendiente |
| FTP / SSH del servidor web | Cliente | 🔴 Pendiente (solo si se instala módulo PHP) |
| Cuenta Vercel del cliente (opcional) | Cliente | ⬜ Opcional — se puede usar la cuenta de Flownexion |

---

## Calendario de entregables (referencia)

> Las fechas son orientativas. El proyecto no puede avanzar en los bloques marcados hasta recibir cada entregable.

| Entregable | Fecha límite sugerida | Bloque desbloqueado |
|---|---|---|
| Lista definitiva de marcas | Antes del inicio | System prompt definitivo |
| Base de datos catálogo (Excel/CSV) | Semana 1 | Motor de búsqueda en catálogo propio |
| Documentación oficial marcas | Semana 1 | Precisión de respuestas técnicas |
| Clave API PrestaShop + URL | Semana 2 | Integración precios/stock/carrito |
| Acceso entorno staging PrestaShop | Semana 3 | Pruebas de integración |

---

## Supuestos documentados

Los siguientes supuestos se han asumido para poder avanzar en el desarrollo. Si el cliente los modifica, se deberá revisar el impacto:

- **S1**: Las marcas NTN y SNR son las marcas objetivo de venta. Otras marcas se usan únicamente para equivalencias.
- **S2**: El catálogo se recibirá en formato tabular (Excel/CSV), no como imágenes o PDFs de lista de precios.
- **S3**: PrestaShop tiene la API REST activada y accesible con autenticación por clave.
- **S4**: El widget se instalará en PrestaShop vía iframe, sin necesidad de módulo PHP personalizado.
- **S5**: Los precios y descuentos por cliente están gestionados en PrestaShop (grupos de clientes o tarifas por cliente).
