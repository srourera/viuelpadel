# Documentación de la Plataforma - Clientes

## Información Almacenada de Cada Cliente

### Información General

- **ID**: Identificador único numérico
- **Nombre**: Nombre del cliente (obligatorio)
- **Estado**: Activo (🟢) o Inactivo (⚪️) - campo `isActive` (booleano)
- **Responsable**: Persona responsable del cliente
  - Puede ser un responsable existente (con ID)
  - O un responsable nuevo (solo con nombre)

### Información de Contacto

- **Dirección 1**: Primera línea de dirección (obligatorio)
- **Dirección 2**: Segunda línea de dirección (obligatorio)
- **Email**: Dirección de correo electrónico (obligatorio, formato email)
- **Teléfono**: Número de teléfono (obligatorio, máximo 9 dígitos)

### Información de Identificación

- **Tipo de ID**: Tipo de identificación (obligatorio)
  - Valores posibles: "DNI" o "Pasaporte"
- **Valor de ID**: Valor de la identificación (obligatorio)

### Información Bancaria

- **IBAN**: Número IBAN de la cuenta bancaria (opcional)
  - Si se proporciona IBAN, los siguientes campos se vuelven obligatorios:
    - Referencia Cliente
    - Referencia Mandato
    - Fecha Firma Mandato
  - Si NO se proporciona IBAN, los campos bancarios no se guardan

- **Referencia Cliente**: Referencia bancaria del cliente (obligatorio si hay IBAN)
  - Se auto-rellena con el nombre del cliente al escribir el nombre
  - Campo de solo lectura cuando se auto-rellena

- **Referencia Mandato**: Referencia del mandato bancario (obligatorio si hay IBAN)
  - Se auto-rellena con el nombre del cliente al escribir el nombre
  - Campo de solo lectura cuando se auto-rellena

- **Fecha Firma Mandato**: Fecha de firma del mandato (obligatorio si hay IBAN)
  - Formato: dd/mm/aaaa
  - Icono de calendario 📅 visible en el campo

### Información del Sistema

- **Fecha de creación**: `createdAt` (timestamp)
- **Fecha de actualización**: `updatedAt` (timestamp)

## Listado de Clientes

**Ruta**: `/clients`

### Header de la Página

- **Título**: "Clientes" (izquierda)
- **Botón "＋ Cliente"**: Botón verde en la parte superior derecha
  - Al hacer clic: Navega a `/clients/new`
  - En móviles: Ocupa el ancho completo

### Búsqueda

- **Campo de búsqueda**: Input de texto con icono 🔍 a la derecha
- **Placeholder**: "Buscar por Cliente, Responsable, Email o Teléfono..."
- **Funcionalidad**: Busca en tiempo real en:
  - Nombre del cliente
  - Nombre del responsable
  - Email
  - Teléfono
- **Búsqueda**: Case-insensitive, busca coincidencias parciales

### Tabla de Clientes

**Columnas**:

1. **Cliente**: Nombre del cliente (clickeable, lleva a la página del cliente)
2. **Responsable**: Nombre del responsable (clickeable si existe, lleva a la página del responsable)
3. **Dirección**: Muestra dirección 1 y dirección 2 (si existen)
4. **Email**: Email del cliente (clickeable, abre cliente de correo)
5. **Teléfono**: Teléfono del cliente (clickeable, abre aplicación de llamadas)
6. **Activo**: Indicador visual
   - 🟢 si está activo
   - ⚪️ si está inactivo

**Estados de la tabla**:

- **Cargando**: Spinner y mensaje "Cargando clientes..."
- **Error**: Mensaje de error y botón "Reintentar"
- **Vacío**: "No hay clientes disponibles" o "No se encontraron clientes que coincidan con la búsqueda"

## Página de Detalle de Cliente

**Ruta**: `/client/:clientId`

### Header de la Página

- **Título**: Nombre del cliente
- **Botones de acción** (derecha):
  1. **Botón "Desactivar cliente" / "Activar cliente"**:
     - Color: Fondo blanco, borde gris
     - Texto cambia según el estado actual
     - Al hacer clic: Cambia el estado activo/inactivo del cliente
     - Muestra "Procesando..." mientras se procesa
     - Se deshabilita durante el proceso
  2. **Botón "Editar"**:
     - Color: Verde
     - Al hacer clic: Navega a `/client/:clientId/edit`

### Secciones de Información

La información se muestra en una tarjeta blanca con secciones separadas:

1. **Información General**:
   - Cliente (nombre)
   - Responsable (clickeable si existe)
   - Estado (🟢 Activo / ⚪️ Inactivo)

2. **Dirección**:
   - Dirección 1
   - Dirección 2

3. **Contacto**:
   - Email (clickeable, abre cliente de correo)
   - Teléfono (clickeable, abre aplicación de llamadas)

4. **Identificación**:
   - Tipo de ID
   - Valor de ID

5. **Información Bancaria**:
   - IBAN

6. **Referencias**:
   - Referència Client
   - Referència Mandat
   - Data Firma Mandat (formateada como dd/mm/yyyy)

### Listado de Facturas

- **Título**: "Facturas"
- **Componente**: InvoiceList filtrado solo para este cliente
- Muestra todas las facturas asociadas al cliente

## Crear Nuevo Cliente

**Ruta**: `/clients/new`

### Formulario

**Título**: "Nuevo cliente"
**Subtítulo**: "Creación de cliente"

**Campos obligatorios** (marcados con asterisco rojo \*):

1. **Cliente** (\*): Input de texto
   - Auto-rellena "Referencia Cliente" y "Referencia Mandato" cuando se escribe

2. **Responsable** (\*):
   - Switch con dos opciones:
     - **"Existente"**: Muestra dropdown con lista de responsables existentes
     - **"Nuevo"**: Muestra input de texto para nombre del responsable
   - El switch activo tiene fondo verde

3. **Dirección 1** (\*): Input de texto

4. **Dirección 2** (\*): Input de texto

5. **Email** (\*): Input tipo email

6. **Teléfono** (\*): Input tipo tel

7. **ID Type** (\*): Dropdown
   - Opciones: "DNI" o "Pasaporte"

8. **ID Value** (\*): Input de texto

9. **IBAN**: Input de texto (opcional)
   - Si se completa, muestra los siguientes campos:

10. **Referencia Cliente** (\* si hay IBAN): Input de texto (solo lectura, auto-rellenado)

11. **Referencia Mandato** (\* si hay IBAN): Input de texto (solo lectura, auto-rellenado)

12. **Fecha Firma Mandato** (\* si hay IBAN): Input de texto con icono 📅
    - Formato: dd/mm/aaaa

### Validaciones

**Validaciones del formulario**:

- Todos los campos obligatorios deben estar completos
- Si hay IBAN, los campos bancarios (Referencia Cliente, Referencia Mandato, Fecha Firma Mandato) son obligatorios
- El email debe tener formato válido
- El teléfono debe tener máximo 9 dígitos

**Mensajes de error**:

- Se muestran en rojo dentro de un contenedor con fondo rosa claro
- Aparecen arriba del botón de envío

### Botón de Envío

- **Texto**: "Crear Cliente" (normal) / "Creando..." (cargando)
- **Color**: Verde
- **Estado**: Se deshabilita durante el envío
- **Acción después del éxito**:
  - Muestra mensaje verde "Cliente creado correctamente. Redirigiendo..."
  - Redirige automáticamente a `/client/:id` después de 500ms

## Editar Cliente

**Ruta**: `/client/:clientId/edit`

### Diferencias con Crear Cliente

1. **Título**: "Editar cliente" con subtítulo mostrando el nombre del cliente

2. **Campo Nombre**:
   - Por defecto está en modo solo lectura
   - Muestra advertencia: "Al editar Nombre, se edita Referencia cliente y Referencia Mandato."
   - Botón "Editar igualmente" para habilitar la edición del nombre
   - Si se edita el nombre, se actualizan automáticamente las referencias

3. **Datos precargados**: Todos los campos se cargan con los datos actuales del cliente

4. **Botón de envío**:
   - Texto: "Guardar Cambios" (normal) / "Guardando..." (cargando)

5. **Acción después del éxito**:
   - Muestra mensaje verde "Cliente editado correctamente. Redirigiendo..."
   - Redirige automáticamente a `/client/:id` después de 500ms

### Validaciones

- Iguales que en crear cliente
- El ID del cliente se incluye en el payload para identificar qué cliente editar

## Activar/Desactivar Cliente

### Ubicación

- **En detalle de cliente**: Botón en el header junto a "Editar"
- **Estado visual**:
  - Si está activo: Botón muestra "Desactivar cliente"
  - Si está inactivo: Botón muestra "Activar cliente"

### Proceso

1. Usuario hace clic en el botón
2. El botón muestra "Procesando..." y se deshabilita
3. Se envía petición al backend para cambiar el estado
4. Se limpia el caché
5. Se recarga la información del cliente
6. El botón vuelve a su estado normal con el nuevo texto

### Efectos

- Los clientes inactivos se muestran con ⚪️ en lugar de 🟢
- Los clientes inactivos NO aparecen en ciertos listados (por ejemplo, al añadir a remesas, solo se muestran activos)

## Reglas de Negocio

### Reglas de Validación

1. **Nombre del cliente**:
   - Obligatorio
   - Al escribirlo, auto-rellena Referencia Cliente y Referencia Mandato

2. **Responsable**:
   - Obligatorio
   - Puede ser existente o nuevo
   - Si es existente, debe seleccionarse de la lista
   - Si es nuevo, debe escribirse el nombre

3. **Campos bancarios**:
   - Si se proporciona IBAN, todos los campos bancarios son obligatorios
   - Si NO se proporciona IBAN, los campos bancarios no se guardan

### Reglas de Estado

1. **Cliente activo/inactivo**:
   - Un cliente puede activarse o desactivarse en cualquier momento
   - Los clientes inactivos no aparecen en ciertos listados (como selección para remesas)
   - El estado se muestra visualmente con 🟢 (activo) o ⚪️ (inactivo)

2. **Edición de nombre**:
   - Por defecto, el nombre no se puede editar para evitar cambios accidentales
   - Si se edita el nombre, se actualizan automáticamente las referencias bancarias
   - Requiere confirmación explícita del usuario (botón "Editar igualmente")

### Reglas de Navegación

1. **Después de crear cliente**: Redirige automáticamente a la página de detalle
2. **Después de editar cliente**: Redirige automáticamente a la página de detalle
3. **Enlaces clickeables**:
   - Nombre del cliente → Página de detalle
   - Nombre del responsable → Página del responsable
   - Email → Abre cliente de correo
   - Teléfono → Abre aplicación de llamadas
