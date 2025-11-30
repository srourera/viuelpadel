# Documentación de la Plataforma - Facturas

## Información Almacenada de Cada Factura

### Información Básica

- **ID**: Identificador único numérico
- **Número de Factura**: Número único de la factura (campo `invoiceNumber`)
- **Tipo**: Tipo de factura (campo `type`)
  - Ejemplos: "Manual", "Automática", etc.
- **Descripción**: Concepto o descripción de la factura (campo `description`)
- **Importe**: Cantidad en euros (campo `amount`, número decimal)
- **Fecha de Vencimiento**: Fecha de vencimiento de la factura (campo `dueDate`, formato dd-mm-yyyy)
- **Link**: URL para ver/descargar la factura en PDF (campo `link`)

### Información de Relación

- **Cliente**: Cliente asociado a la factura
  - ID del cliente
  - Nombre del cliente
  - Estado activo/inactivo del cliente
- **Remesa**: Remesa asociada (opcional)
  - ID de la remesa (campo `remittanceId`)
  - Si está asociada a una remesa, la factura forma parte de esa remesa

### Información del Sistema

- **Fecha de creación**: `createdAt` (timestamp)
- **Fecha de actualización**: `updatedAt` (timestamp)

## Listado de Facturas

**Ruta**: `/invoices`

### Header de la Página

- **Título**: "Facturas" (izquierda)
- **Información adicional**: "Último número de factura: [número]" (debajo del título, solo si existe)
- **Botón "＋ Factura manual"**: Botón verde en la parte superior derecha
  - Al hacer clic: Navega a `/invoices/manual`
  - En móviles: Ocupa el ancho completo

### Filtros

**Ubicación**: Debajo del header, antes de la tabla

**Filtros disponibles**:

1. **Búsqueda por texto**:
   - Input de texto con icono 🔍
   - Placeholder: "Buscar por Número, Cliente o Descripción..."
   - Busca en tiempo real en:
     - Número de factura
     - Nombre del cliente
     - Descripción de la factura
   - Búsqueda case-insensitive, coincidencias parciales

2. **Filtro por tipo**:
   - Dropdown con opciones:
     - "Todos los tipos" (valor vacío)
     - Lista de tipos únicos encontrados en las facturas (ordenados alfabéticamente)
   - Filtra facturas que coincidan exactamente con el tipo seleccionado

3. **Filtro por fecha**:
   - Input tipo "month" (selector de mes y año)
   - Filtra facturas por el mes y año de la fecha de vencimiento
   - Formato: YYYY-MM

4. **Botón "Limpiar filtros"**:
   - Solo visible si hay algún filtro activo
   - Color: Fondo gris claro, borde gris
   - Al hacer clic: Limpia todos los filtros

### Tabla de Facturas

**Columnas**:

1. **Número de Factura**: Número único (texto en negrita, color #292929)
2. **Tipo**: Tipo de factura
3. **Cliente**: Nombre del cliente (clickeable, lleva a la página del cliente, texto en negrita)
4. **Descripción**: Concepto de la factura (máximo 300px de ancho, texto truncado con ellipsis)
5. **Importe**: Cantidad en euros (formato moneda, texto en negrita, color #292929)
6. **Vencimiento**: Fecha de vencimiento (formato dd/mm/yyyy)
7. **Creación**: Fecha de creación (formato dd/mm/yyyy)
8. **Link**: Enlace para ver la factura
   - Solo visible si existe el campo `link`
   - Texto: "Ver Factura"
   - Color: Verde
   - Abre en nueva pestaña

**Estados de la tabla**:

- **Cargando**: Spinner y mensaje "Cargando facturas..."
- **Error**: Mensaje de error y botón "Reintentar"
- **Vacío**: "No hay facturas disponibles" o "No se encontraron facturas que coincidan con la búsqueda"

**Comportamiento**:

- Las filas tienen hover effect (fondo #f9f9f9)
- La tabla tiene scroll horizontal en pantallas pequeñas
- Se eliminan duplicados automáticamente por ID

## Crear Factura Manual

**Ruta**: `/invoices/manual`

### Formulario

**Título**: "Nova factura manual"
**Subtítulo**: "Generació de factura manual"

**Campos obligatorios** (marcados con asterisco rojo \*):

1. **Client** (\*): Dropdown
   - Muestra lista de todos los clientes disponibles
   - Placeholder: "Selecciona un client" o "Carregant clients..." si está cargando
   - Se deshabilita mientras carga la lista

2. **Import (IVA inclòs)** (\*): Input numérico
   - Permite decimales
   - Mínimo: 0
   - Placeholder: "0.00"
   - Representa el importe total con IVA incluido

3. **Concepte** (\*): Input de texto
   - Placeholder: "Descripció del concepte"
   - Descripción del concepto de la factura

4. **Mètode pagament** (\*): Radio buttons
   - Dos opciones:
     - "Gir bancari" (Giro bancario)
     - "Transferència" (Transferencia)
   - Solo se puede seleccionar una opción
   - Color de selección: Verde

5. **Venciment** (\*): Input de texto con icono 📅
   - Formato: dd/mm/aaaa
   - Placeholder: "dd/mm/aaaa"

### Validaciones

**Validaciones del formulario**:

- Todos los campos obligatorios deben estar completos
- El importe debe ser un número válido mayor que 0
- La fecha debe tener formato válido dd/mm/aaaa

**Mensajes de error**:

- Se muestran en rojo dentro de un contenedor con fondo rosa claro
- Aparecen arriba del botón de envío
- Mensajes posibles:
  - "Por favor, completa todos los campos requeridos."
  - "Por favor, introduce una fecha válida (dd/mm/aaaa)."
  - "Por favor, introduce un importe válido."

### Proceso de Creación

1. Usuario completa el formulario
2. Al hacer clic en "Generar Factura":
   - El botón muestra "Generant..." y se deshabilita
   - Se convierte la fecha de dd/mm/aaaa a formato ISO (YYYY-MM-DD)
   - Se construye el payload con:
     - `clientId`: ID del cliente seleccionado
     - `amount`: Importe (número)
     - `description`: Concepto
     - `paymentMethod`: Método de pago seleccionado
     - `dueDate`: Fecha en formato ISO
3. Se envía la petición al backend
4. Si es exitoso:
   - Muestra mensaje verde "Factura generada correctament. Redirigint..."
   - Limpia el formulario
   - Redirige a `/invoices` después de 500ms
5. Si hay error:
   - Muestra mensaje de error
   - El botón vuelve a su estado normal

### Botón de Envío

- **Texto**: "Generar Factura" (normal) / "Generant..." (cargando)
- **Color**: Verde
- **Estado**: Se deshabilita durante el envío
- **Ancho**: 100% del contenedor

## Visualización de Facturas en Otras Páginas

### En Página de Cliente

**Ubicación**: `/client/:clientId`

- **Título**: "Facturas"
- **Componente**: InvoiceList filtrado solo para ese cliente
- **Filtro aplicado**: `onlyFromClientIds: [clientId]`
- Muestra todas las facturas asociadas al cliente, con todos los filtros disponibles

### En Página de Remesa Validada

**Ubicación**: `/remittance-type/:id/remittance/:remittanceId`

- **Condición**: Solo se muestra si la remesa está en estado "validated"
- **Título**: "Facturas de la Remesa"
- **Componente**: InvoiceList filtrado solo para esa remesa
- **Filtro aplicado**: `onlyFromRemittanceId: remittanceId`
- Muestra todas las facturas asociadas a la remesa validada

## Último Número de Factura

### Información

- Se muestra en la página de listado de facturas (`/invoices`)
- Aparece debajo del título "Facturas"
- Formato: "Último número de factura: [número]"
- Solo se muestra si existe el valor
- Se carga automáticamente al entrar en la página

### Uso

- Información de referencia para saber qué número de factura se asignará a la siguiente factura manual
- Se actualiza automáticamente después de crear una factura manual

## Reglas de Negocio

### Generación de Números de Factura

- El sistema asigna automáticamente el número de factura
- El número se incrementa secuencialmente
- El último número se puede consultar en la página de facturas

### Tipos de Factura

- **Factura Manual**: Creada manualmente por el usuario a través del formulario
- **Factura Automática**: Generada automáticamente por el sistema (por ejemplo, al validar una remesa)

### Asociación con Remesas

- Una factura puede estar asociada a una remesa (campo `remittanceId`)
- Si una factura está asociada a una remesa, aparece en el listado de facturas de esa remesa (solo cuando la remesa está validada)
- Las facturas asociadas a remesas se generan automáticamente cuando se valida una remesa

### Filtrado y Búsqueda

- Los filtros se pueden combinar (búsqueda + tipo + fecha)
- La búsqueda es en tiempo real (se filtra mientras se escribe)
- Los filtros se pueden limpiar todos a la vez con un botón
- Se eliminan duplicados automáticamente por ID de factura

### Formato de Fechas

- **Almacenamiento**: Formato dd-mm-yyyy en el backend
- **Visualización**: Formato dd/mm/yyyy en la interfaz
- **Envío al backend**: Formato ISO (YYYY-MM-DD) para creación de facturas manuales
- **Conversión**: Se convierte automáticamente entre formatos según el contexto

### Enlaces a Facturas

- Si una factura tiene un `link`, se muestra el botón "Ver Factura"
- El enlace abre en nueva pestaña
- El link apunta generalmente a un PDF de la factura
