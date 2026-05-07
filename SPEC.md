# Chatbot IA para Suministros ESGAS — Especificación de Proyecto

**Versión:** 1.0 · **Fecha:** 2026-05-07 · **Estado:** Borrador para validación

---

## 1. Resumen ejecutivo

Flownexion desarrollará e implantará un asistente conversacional (chatbot) con inteligencia artificial para Suministros ESGAS, orientado a dar soporte técnico y comercial a los usuarios del portal B2B de la empresa.

El sistema responderá consultas técnicas sobre productos del catálogo (rodamientos, retenes, correas de transmisión y productos industriales afines), mostrará información de precio y stock en tiempo real según el usuario autenticado, y permitirá añadir artículos al carrito de PrestaShop directamente desde la conversación, sin abandonar la interfaz del chat.

El alcance económico del proyecto es:

| Concepto | Base | IVA (21%) | Total |
|---|---|---|---|
| Desarrollo | 2.200 € | 462 € | **2.662 €** |
| Mantenimiento mensual | 175 € | 36,75 € | **211,75 €/mes** |

---

## 2. Alcance funcional

### 2.1 Motor de respuesta técnica

- El chatbot responde preguntas técnicas sobre productos del catálogo de ESGAS.
- Solo utiliza información verificada y oficial; no genera datos sin respaldo documental.
- Cuando no disponga de información suficiente, lo indicará explícitamente y orientará al usuario hacia el canal humano adecuado.
- Las marcas cubiertas en el lanzamiento son **NTN** y **SNR**. *(Pendiente de confirmación — ver §8)*
- Para cada marca confirmada, ESGAS debe entregar la documentación técnica oficial completa antes del inicio del desarrollo.

### 2.2 Integración comercial con PrestaShop B2B

El chatbot se conecta en tiempo real con el PrestaShop del cliente y ofrece:

| Acción | Descripción |
|---|---|
| **Precio personalizado** | Muestra el precio aplicable al usuario autenticado (con sus descuentos y tarifas específicas) |
| **Stock en tiempo real** | Consulta disponibilidad en el momento de la interacción |
| **Ficha del producto** | Genera un enlace directo a la página del producto en PrestaShop |
| **Añadir al carrito** | Solicita cantidad y añade el artículo al carrito del usuario |
| **Ir al carrito** | Genera un enlace directo al carrito para completar el pago |

> **Límite de alcance:** el proceso de pago se realiza **siempre dentro de PrestaShop**, nunca dentro del chatbot.

### 2.3 Identificación del usuario

- El chatbot detecta la sesión activa del usuario en el portal B2B.
- Aplica automáticamente los precios, descuentos y condiciones comerciales asociados a esa cuenta.
- *Supuesto [S1]:* La sesión de PrestaShop es accesible desde el contexto donde se embebe el widget (misma cookie de dominio o token compartido). Si no fuera así, se requeriría un mecanismo de autenticación adicional fuera del alcance actual.

### 2.4 Presencia visual en la web

- Widget flotante en esquina inferior derecha del sitio, persistente en todas las páginas.
- Icono animado opcional en la página principal.
- Diseño alineado con la identidad visual de ESGAS (colores, logotipo, tono).
- Totalmente responsive (escritorio y móvil).

---

## 3. Integraciones

| Sistema | Tipo | Dirección | Propósito |
|---|---|---|---|
| **PrestaShop B2B** | API REST | Bidireccional | Precios, stock, carrito, sesión de usuario |
| **Base de datos ESGAS** | Archivo editable (Excel/CSV) o API | Lectura | Catálogo de productos propio |
| **Documentación fabricantes** | Documentos PDF/técnicos | Lectura | Fichas técnicas de NTN, SNR y marcas confirmadas |

### Requisitos de la API PrestaShop

*Supuesto [S2]:* Se asume que la instalación de PrestaShop dispone de la API REST habilitada y que ESGAS puede generar una clave de API con permisos de lectura/escritura sobre productos, stock, precios de cliente y carrito. Si PrestaShop usa un módulo B2B de terceros para gestionar tarifas, será necesario confirmar si dicho módulo expone esos datos vía API o requiere desarrollo adicional.

---

## 4. Fuentes de datos

| Fuente | Propietario | Formato esperado | Prioridad |
|---|---|---|---|
| Catálogo propio ESGAS | Cliente | Excel / CSV / API | **Primaria** |
| Fichas técnicas NTN | Cliente | PDF / datos estructurados | Secundaria |
| Fichas técnicas SNR | Cliente | PDF / datos estructurados | Secundaria |
| Fichas de marcas adicionales | Cliente | Por confirmar | Pendiente |

**Responsabilidad del cliente:** ESGAS debe entregar todas las fuentes de datos en formatos editables y completos antes del inicio del desarrollo. Entregas incompletas o tardías podrán impactar el calendario del proyecto *(ver §8, riesgo R3)*.

---

## 5. Requisitos del cliente

### Entregas obligatorias antes del inicio del desarrollo

- [ ] Razón social completa y CIF de Suministros ESGAS.
- [ ] Lista definitiva y cerrada de marcas a cubrir.
- [ ] Documentación técnica oficial de **cada marca confirmada**.
- [ ] Base de datos del catálogo en formato editable (Excel, CSV u otro).
- [ ] Credenciales de acceso a la API de PrestaShop B2B (entorno de desarrollo/staging).
- [ ] Guía de identidad visual (colores, logotipo, tipografía).

### Requisitos de infraestructura

- El cliente debe mantener activo y accesible el servicio de PrestaShop durante el proyecto y en producción.
- *Supuesto [S3]:* ESGAS dispone de un entorno de staging o pruebas en PrestaShop separado de producción, donde se realizarán las pruebas de integración antes del despliegue final.

---

## 6. Fases del proyecto

| Fase | Descripción | Hito económico |
|---|---|---|
| **F1 — Formalización** | Firma del contrato y NDA | Pago inicial: 1.100 € + IVA |
| **F2 — Onboarding de datos** | Recepción y validación de catálogo, documentación técnica y acceso PrestaShop | — |
| **F3 — Desarrollo** | Construcción del motor de IA, integración PrestaShop y widget visual | — |
| **F4 — Pruebas internas** | QA técnico por parte de Flownexion | — |
| **F5 — UAT** | Pruebas de aceptación de usuario con ESGAS | — |
| **F6 — Entrega y aprobación** | ESGAS valida y aprueba el sistema | Pago final: 1.100 € + IVA |
| **F7 — Go-live y mantenimiento** | Despliegue en producción e inicio del contrato de mantenimiento | 175 € + IVA/mes |

> *Supuesto [S4]:* El plazo total de desarrollo (F3–F5) se estima en **4–6 semanas** desde la recepción completa de materiales (F2). Este dato debe ser acordado y fijado en el contrato.

---

## 7. Criterios de aceptación

El sistema se considera entregado y aceptable cuando:

**Motor técnico**
- [ ] El chatbot responde correctamente a preguntas técnicas de productos del catálogo entregado.
- [ ] No genera información no respaldada por las fuentes oficiales proporcionadas.
- [ ] Indica explícitamente cuando no tiene información sobre una consulta.

**Integración PrestaShop**
- [ ] Muestra el precio correcto para al menos 3 usuarios B2B de prueba con tarifas distintas.
- [ ] El stock mostrado coincide con el de PrestaShop en el momento de la consulta.
- [ ] El artículo se añade correctamente al carrito del usuario autenticado.
- [ ] Los enlaces a ficha de producto y carrito funcionan sin errores.

**Experiencia de usuario**
- [ ] El widget se carga correctamente en Chrome, Firefox, Safari y Edge (últimas 2 versiones).
- [ ] El widget es funcional en dispositivos móviles (iOS y Android).
- [ ] El tiempo de respuesta del chatbot es inferior a 8 segundos en condiciones normales de red.

**Visual**
- [ ] El diseño es coherente con la identidad visual aprobada por ESGAS.

---

## 8. Riesgos y puntos abiertos

### Puntos pendientes de validación (decisiones abiertas)

| ID | Punto | Responsable | Impacto si no se resuelve |
|---|---|---|---|
| P1 | Razón social y CIF del cliente | ESGAS | Bloquea la firma del contrato |
| P2 | Lista definitiva de marcas | ESGAS | Bloquea el inicio del desarrollo |
| P3 | Formato y calidad de la base de datos del catálogo | ESGAS | Puede requerir trabajo de limpieza no contemplado |
| P4 | Versión y módulos instalados en PrestaShop | ESGAS / Flownexion | Puede afectar a la viabilidad técnica de la integración |
| P5 | Módulo B2B de tarifas: ¿expone API? | ESGAS | Si no hay API, requiere desarrollo adicional fuera de alcance |
| P6 | Plazo de ejecución acordado | Ambas partes | Sin plazo fijado, no se puede gestionar el proyecto |
| P7 | Entorno de staging en PrestaShop | ESGAS | Sin staging, las pruebas se harían en producción (riesgo alto) |

### Riesgos técnicos

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | La API de PrestaShop no expone tarifas B2B personalizadas | Media | Alto | Confirmar antes del inicio; contemplar desarrollo adicional si es necesario |
| R2 | Documentación técnica en formato no procesable (escaneos sin OCR) | Media | Medio | Solicitar formatos estructurados; acordar proceso de limpieza de datos |
| R3 | ESGAS entrega materiales incompletos o con retraso | Alta | Alto | Fijar en contrato que el plazo empieza desde la recepción completa de materiales |
| R4 | Cambios de catálogo o precios frecuentes requieren actualizaciones constantes | Media | Medio | Definir en el contrato de mantenimiento el SLA para actualizaciones de datos |
| R5 | Conflictos de CORS o autenticación entre el widget embebido y PrestaShop | Baja | Medio | Prueba técnica temprana en F2 antes del desarrollo completo |

### Riesgos operativos

| ID | Riesgo | Mitigación |
|---|---|---|
| R6 | El usuario B2B no está autenticado cuando abre el chat | Definir comportamiento: mostrar precios públicos, redirigir al login, o bloquear funciones comerciales |
| R7 | Dependencia de disponibilidad de PrestaShop para respuestas en tiempo real | Implementar degradación elegante: si la API falla, el chatbot responde en modo técnico sin datos comerciales |

---

## 9. Exclusiones del alcance

Los siguientes elementos quedan **explícitamente fuera** de este proyecto:

- Procesamiento de pagos dentro del chatbot.
- Gestión de pedidos (creación, seguimiento, devoluciones).
- Integración con sistemas ERP o almacén del cliente.
- Atención al cliente humana (live chat o hand-off a agente).
- Soporte técnico de la plataforma PrestaShop del cliente.
- Desarrollo de funcionalidades en el back-office de PrestaShop.
- Cobertura de marcas adicionales no confirmadas antes del inicio del desarrollo.
- Formación presencial al equipo de ESGAS (se entrega documentación escrita).

---

## 10. Propuesta de mejora

### Mejoras recomendadas para versiones futuras (no incluidas en v1)

1. **Hand-off a humano:** Cuando el chatbot no pueda resolver una consulta, transferir la conversación a un comercial de ESGAS (por email, WhatsApp o chat en vivo). Alto impacto comercial.

2. **Histórico de conversaciones:** Guardar el historial de chats por usuario B2B para análisis de demanda y mejora continua del sistema.

3. **Recomendador de equivalencias:** Motor que sugiera equivalencias entre marcas (SKF → NTN, FAG → SNR, etc.) — ya parcialmente desarrollado, integrable con bajo esfuerzo adicional.

4. **Panel de métricas:** Dashboard con volumen de consultas, productos más preguntados y tasa de conversión a carrito para justificar el ROI del chatbot.

5. **Actualización automática de catálogo:** Sincronización periódica del catálogo del chatbot desde la API o exportación de PrestaShop, sin intervención manual.

6. **Soporte multilingüe:** Detección de idioma para usuarios en Portugal u otros mercados (requiere confirmación del alcance geográfico).

### Estructura recomendada del repositorio

```
/
├── README.md               # Descripción general + setup rápido
├── SPEC.md                 # Este documento (especificación de proyecto)
├── CHANGELOG.md            # Historial de versiones
├── docs/
│   ├── arquitectura.md     # Diagrama de componentes
│   ├── api-prestashop.md   # Contratos de la integración
│   └── datos-catalogo.md   # Estructura esperada del catálogo
├── src/                    # Código fuente
├── .env.example            # Variables de entorno documentadas (sin secretos)
└── .github/
    └── ISSUE_TEMPLATE/     # Plantillas para bugs y features
```

---

*Documento generado por Flownexion · Pendiente de revisión y firma por ambas partes*
