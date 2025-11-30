# Documentación de la Plataforma - Remesas

## Concepto de Remesas

Las remesas son agrupaciones de pagos que se generan periódicamente para cobrar a múltiples clientes. Cada remesa tiene un tipo asociado y se genera automáticamente en fechas específicas.

## Tipos de Remesa

### Información de un Tipo de Remesa

- **ID**: Identificador único numérico
- **Nombre**: Nombre del tipo de remesa (ej: "Mensual", "Trimestral", etc.)
- **Icono**: Emoji o símbolo que representa el tipo (ej: 💳, 📅, etc.)
- **Día de Generación**: Día del mes en que se genera automáticamente la remesa (campo `generationDay`)
  - Número del 1 al 31
  - Puede ser `null` si no tiene generación automática
  - Si está configurado, la remesa se genera automáticamente cada mes en ese día

### Listado de Tipos de Remesa

**Ruta**: `/remittance-types`

**Vista**:
- Grid de tarjetas, cada una representa un tipo de remesa
- Cada tarjeta muestra:
  - Icono grande (tamaño 3rem)
  - Nombre del tipo de remesa
- Las tarjetas son clickeables y llevan a `/remittance-type/:id`
- Hover effect: Borde verde (#cddc39), sombra, se eleva ligeramente

**Estados**:
- **Cargando**: Spinner y mensaje "Cargando remesas..."
- **Error**: Mensaje de error y botón "Reintentar"
- **Vacío**: "No hay remesas disponibles."

## Detalle de Tipo de Remesa

**Ruta**: `/remittance-type/:id`

### Header

- **Título**: Icono + Nombre del tipo de remesa
- **Información adicional**: "Generada automáticamente cada día [número]" (solo si tiene `generationDay` configurado)
- **Botón "⚙️ Cuotas de clientes"**: Botón verde (#cddc39) a la derecha
  - Al hacer clic: Navega a `/remittance-type/:id/clients`
  - Permite gestionar las cuotas de los clientes para este tipo de remesa

### Listado de Remesas

**Título**: "Remesas"

**Vista**:
- Lista de tarjetas, cada una representa una remesa
- Cada tarjeta muestra:
  - **Período**: Mes y año (ej: "Enero 2024")
  - **Estado**: Badge con icono y texto
    - ⏳ "Pendiente" (fondo naranja claro, texto naranja oscuro)
    - 🕒 "Procesando validación" (fondo verde claro, texto verde oscuro)
    - ✅ "Validada" (fondo verde claro, texto verde oscuro)

**Estados**:
- **Cargando**: Spinner y mensaje "Cargando remesas..."
- **Error**: Mensaje de error y botón "Reintentar"
- **Vacío**: "No hay remesas disponibles."

**Navegación**:
- Las tarjetas son clickeables y llevan a `/remittance-type/:id/remittance/:remittanceId`

## Información de una Remesa

### Información Básica

- **ID**: Identificador único numérico
- **Tipo de Remesa**: ID del tipo de remesa asociado
- **Período**: Mes y año de la remesa
  - `month`: Número del 1 al 12
  - `year`: Año (número de 4 dígitos)
- **Estado**: Estado actual de la remesa
  - `pending`: Pendiente de validar
  - `processing_validation`: Procesando validación (generando PDFs y Excel)
  - `validated`: Validada (proceso completado)

### Información del Sistema

- **Fecha de creación**: `createdAt` (timestamp, cuando se generó la remesa)
- **Fecha de validación**: `validatedAt` (timestamp, cuando se validó, solo si está validada)
- **Fichero**: URL del archivo Excel generado (campo `fileUrl`, solo si está validada)
  - Este es el archivo que se puede subir al banco para procesar la remesa

## Detalle de Remesa

**Ruta**: `/remittance-type/:id/remittance/:remittanceId`

### Header

- **Título**: "Remesa" + Icono y nombre del tipo de remesa
- **Botón "Validar"**: Solo visible si el estado es "pending"
  - Color: Verde (#cddc39)
  - Texto: "Validar" (normal) / "Validando..." (procesando)
  - Al hacer clic: Inicia el proceso de validación
  - Se deshabilita durante el proceso

### Información de la Remesa

**Tarjeta con secciones**:

1. **Período**: Mes y año formateado (ej: "Enero 2024")

2. **Estado**: Badge con icono y texto
   - ⏳ "Pendiente validar" (fondo naranja claro)
   - 🕒 "Procesando validación" (fondo verde claro)
   - ✅ "Validada" (fondo verde claro)

3. **Alerta de Procesamiento**: Solo visible si el estado es "processing_validation"
   - Icono: 🕒
   - Mensaje: "El proceso de validación puede tardar varios minutos. Te llegará un correo electrónico en cuanto haya terminado."
   - Fondo verde claro con borde izquierdo verde

4. **Creación**: Fecha y hora de creación (formato largo en español)

5. **Validación**: Fecha y hora de validación (solo si está validada, formato largo en español)

6. **Fichero**: Enlace al archivo Excel (solo si está validada y tiene `fileUrl`)
   - Texto: "📄 Fichero de la remesa"
   - Color: Verde (#cddc39)
   - Abre en nueva pestaña

### Líneas de Remesa

**Título**: "Líneas de Remesa"

**Header de la sección**:
- Campo de búsqueda: Input de texto con placeholder "Buscar por nombre..."
- Botón "＋ Añadir línea": Solo visible si el estado es "pending"
  - Color: Verde (#cddc39)
  - Al hacer clic: Abre modal para añadir una línea

**Tabla de líneas**:

**Columnas**:
1. **Cliente**: Nombre del cliente (clickeable, lleva a la página del cliente)
   - Muestra ⚪️ si el cliente está inactivo
2. **Importe**: 
   - Si la remesa está validada o procesando: Texto de solo lectura (formato moneda)
   - Si la remesa está pendiente: Input numérico editable
     - Step: 0.01
     - Mínimo: 0
     - Ancho: 120px
     - Al perder el foco (blur): Muestra modal de confirmación si cambió el valor

**Estados**:
- **Cargando**: Spinner y mensaje "Cargando líneas..."
- **Error**: Mensaje de error y botón "Reintentar"
- **Vacío**: "No hay líneas de remesa disponibles." o "No se encontraron líneas con ese nombre."

**Edición de importes** (solo si está pendiente):
- Al editar un importe y perder el foco, si cambió:
  - Muestra modal de confirmación
  - Modal pregunta: "¿Confirmas cambiar el importe de [original] a [nuevo]?"
  - Botones: "Cancelar" (gris) y "Confirmar" (verde)
  - Si se cancela: Revierte el valor al original
  - Si se confirma: Actualiza el importe en el backend

**Eliminación de líneas** (solo si está pendiente):
- Si se cambia el importe a 0:
  - Modal pregunta: "¿Confirmas eliminar la línea de remesa?"
  - Mensaje: "Dejará de salir en este listado (siempre lo puedes volver a añadir)."
  - Si se confirma: Elimina la línea

**Añadir línea** (solo si está pendiente):
- Modal con formulario:
  - **Cliente** (*): Dropdown con clientes activos que NO están ya en la remesa
  - **Importe (€)** (*): Input numérico (step 0.01, min 0)
- Botones: "Cancelar" (gris) y "Añadir" (verde)
- Al añadir: Cierra el modal y recarga las líneas

### Facturas de la Remesa

**Condición**: Solo visible si el estado es "validated"

**Título**: "Facturas de la Remesa"

**Componente**: InvoiceList filtrado solo para esta remesa
- Filtro aplicado: `onlyFromRemittanceId: remittanceId`
- Muestra todas las facturas asociadas a la remesa validada
- Incluye todos los filtros disponibles (búsqueda, tipo, fecha)

## Cuotas de Clientes por Tipo de Remesa

**Ruta**: `/remittance-type/:id/clients`

### Propósito

Gestionar las cuotas fijas que cada cliente debe pagar en cada remesa de este tipo. Estos valores se usan como base cuando se genera automáticamente una remesa.

### Header

- **Título**: Icono + Nombre del tipo de remesa + " - Cuotas de clientes"
- **Información**: "Los cambios que hagas afectarán a las siguientes remesas. Nunca afectarán a remesas ya generadas."

### Listado de Clientes

**Header de la sección**:
- Título: "Clientes"
- Campo de búsqueda: Input de texto con placeholder "Buscar por nombre..."
- Botón "＋ Añadir cliente": Botón verde (#cddc39)
  - Al hacer clic: Abre modal para añadir un cliente

**Tabla de clientes**:

**Columnas**:
1. **Cliente**: Nombre del cliente (clickeable, lleva a la página del cliente)
   - Muestra ⚪️ si el cliente está inactivo
2. **Importe**: Input numérico editable
   - Step: 0.01
   - Mínimo: 0
   - Ancho: 120px
   - Al perder el foco (blur): Muestra modal de confirmación si cambió el valor

**Edición de importes**:
- Al editar un importe y perder el foco, si cambió:
  - Muestra modal de confirmación
  - Modal pregunta: "¿Confirmas cambiar el importe de [original] a [nuevo]?"
  - Si el nuevo importe es 0: "¿Confirmas eliminar la cuota del cliente?"
  - Botones: "Cancelar" (gris) y "Confirmar" (verde)
  - Si se cancela: Revierte el valor al original
  - Si se confirma: Actualiza el importe en el backend

**Añadir cliente**:
- Modal con formulario:
  - **Cliente** (*): Dropdown con clientes activos que NO están ya en el listado
  - **Importe (€)** (*): Input numérico (step 0.01, min 0)
- Botones: "Cancelar" (gris) y "Añadir" (verde)
- Al añadir: Cierra el modal y recarga el listado

**Estados**:
- **Cargando**: Spinner y mensaje "Cargando clientes..."
- **Error**: Mensaje de error y botón "Reintentar"
- **Vacío**: "No hay clientes disponibles." o "No se encontraron clientes con ese nombre."

## Proceso Automático de Generación de Remesas

### Generación Automática

**Cuándo se genera**:
- Cada mes, en el día configurado en `generationDay` del tipo de remesa
- El proceso se ejecuta automáticamente por el sistema (backend)

**Qué hace**:
1. Crea una nueva remesa con estado "pending"
2. Asocia el mes y año actuales
3. Crea líneas de remesa basándose en las cuotas configuradas en "Cuotas de clientes"
4. Cada línea tiene:
   - Cliente asociado
   - Importe basado en la cuota configurada para ese cliente en ese tipo de remesa

**Reglas**:
- Solo se generan remesas para clientes que tienen cuota configurada
- Solo se generan remesas para clientes activos
- Las remesas generadas tienen estado "pending" inicialmente

## Proceso de Validación de Remesas

### Inicio del Proceso

**Cuándo se inicia**:
- Cuando el usuario hace clic en el botón "Validar" en una remesa con estado "pending"

**Qué sucede**:
1. El estado cambia a "processing_validation"
2. Se muestra alerta informando que el proceso puede tardar varios minutos
3. Se envía notificación por correo electrónico cuando termine

### Proceso en el Backend

**Qué hace el backend** (proceso automático):

1. **Genera PDFs de facturas**:
   - Para cada línea de la remesa, genera un PDF de factura
   - La factura se asocia a la remesa (campo `remittanceId`)
   - Cada factura tiene:
     - Número de factura único
     - Cliente asociado
     - Importe de la línea
     - Descripción relacionada con el tipo de remesa
     - Fecha de vencimiento
     - Link al PDF generado

2. **Genera archivo Excel (XLSX)**:
   - Crea un archivo Excel con formato compatible con el banco
   - Contiene todas las líneas de la remesa con:
     - Información del cliente (IBAN, referencias bancarias, etc.)
     - Importe de cada línea
     - Información necesaria para procesar la remesa bancaria
   - El archivo se guarda y se asocia a la remesa (campo `fileUrl`)

3. **Finaliza el proceso**:
   - Cambia el estado a "validated"
   - Guarda la fecha de validación (`validatedAt`)
   - Guarda la URL del archivo Excel (`fileUrl`)

### Resultado

**Después de la validación**:
- La remesa tiene estado "validated"
- Se muestra el enlace al archivo Excel para descargarlo
- Se muestran todas las facturas generadas en la sección "Facturas de la Remesa"
- Las líneas de remesa ya no son editables (solo lectura)
- El botón "Validar" desaparece

### Uso del Archivo Excel

- El archivo Excel generado se puede descargar desde el enlace "📄 Fichero de la remesa"
- Este archivo está en formato compatible con el banco
- Se puede subir directamente al sistema bancario para procesar la remesa
- Contiene toda la información necesaria para el cobro automático

## Reglas de Negocio

### Estados de Remesa

1. **pending** (Pendiente):
   - Remesa recién generada o en edición
   - Se pueden editar las líneas (añadir, modificar, eliminar)
   - Se puede validar
   - No se muestran las facturas

2. **processing_validation** (Procesando validación):
   - Remesa en proceso de generación de PDFs y Excel
   - No se pueden editar las líneas (solo lectura)
   - Se muestra alerta informativa
   - No se puede validar de nuevo
   - No se muestran las facturas aún

3. **validated** (Validada):
   - Remesa completamente procesada
   - No se pueden editar las líneas (solo lectura)
   - Se muestra el enlace al archivo Excel
   - Se muestran todas las facturas generadas
   - No se puede validar de nuevo

### Edición de Líneas

**Solo en estado "pending"**:
- Se pueden añadir líneas nuevas
- Se pueden modificar importes existentes
- Se pueden eliminar líneas (poniendo importe a 0)
- Todos los cambios requieren confirmación mediante modal

**En otros estados**:
- Las líneas son de solo lectura
- No se pueden añadir, modificar ni eliminar

### Cuotas de Clientes

**Propósito**:
- Definir el importe fijo que cada cliente debe pagar en cada remesa de un tipo específico
- Se usan como base al generar automáticamente las remesas

**Reglas**:
- Los cambios en las cuotas NO afectan a remesas ya generadas
- Los cambios en las cuotas SÍ afectan a remesas futuras
- Solo se pueden añadir clientes activos
- Se pueden eliminar cuotas (poniendo importe a 0)

### Generación Automática

**Condiciones**:
- El tipo de remesa debe tener `generationDay` configurado
- Se ejecuta automáticamente el día configurado de cada mes
- Solo incluye clientes que tienen cuota configurada
- Solo incluye clientes activos

### Validación

**Condiciones para validar**:
- La remesa debe estar en estado "pending"
- Debe tener al menos una línea de remesa

**Proceso**:
- No se puede cancelar una vez iniciado
- El proceso es asíncrono (puede tardar varios minutos)
- Se notifica por correo cuando termine
- Genera PDFs de facturas y archivo Excel automáticamente

### Facturas Generadas

**Características**:
- Se generan automáticamente al validar la remesa
- Cada factura corresponde a una línea de remesa
- Las facturas tienen el campo `remittanceId` asociado
- Solo se muestran cuando la remesa está validada
- Se pueden ver y descargar desde el listado de facturas de la remesa

