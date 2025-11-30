# Documentación de la Plataforma - General

## Visión General

La plataforma es un sistema de administración para gestionar clientes, facturas y remesas bancarias. Permite crear clientes, generar facturas manuales y gestionar remesas bancarias que se generan automáticamente.

## Autenticación

### Acceso al Sistema

- **Página de Login**: Se muestra automáticamente si el usuario no está autenticado
- **Campo de entrada**: Campo de texto tipo password para "Clave de Administrador"
- **Botón de acceso**: Botón verde con texto "Acceder" que permite iniciar sesión
- **Validación**: Si el campo está vacío, muestra error "Por favor, ingresa la clave de administrador"

### Cierre de Sesión

- **Ubicación**: Barra superior (TopBar), parte derecha
- **Botón**: Botón con icono 🚪 y texto "Salir"
- **Acción**: Al hacer clic, cierra la sesión y redirige a la página de inicio

## Estructura de Navegación

### Sidebar (Barra Lateral)

**Ubicación**: Lado izquierdo de la pantalla, fija

**Comportamiento**:

- En pantallas grandes (>768px): Ancho de 200px cuando está expandida, 60px cuando está colapsada
- En pantallas pequeñas (≤768px): Siempre colapsada a 60px

**Elementos del Sidebar**:

1. **Header del Sidebar**:
   - Si es página principal: Muestra el logo de "Viu el Pàdel"
   - Si NO es página principal: Muestra botón "← Volver" que permite navegar hacia atrás

2. **Menú de Navegación** (4 opciones principales):
   - **🏠 Inicio** (ruta: `/`) - Dashboard con estadísticas
   - **👥 Clientes** (ruta: `/clients`) - Listado de clientes
   - **🧾 Facturas** (ruta: `/invoices`) - Listado de facturas
   - **💳 Remesas** (ruta: `/remittance-types`) - Listado de tipos de remesa

**Estados de los elementos del menú**:

- **Normal**: Fondo transparente, texto gris
- **Hover**: Fondo gris claro, texto negro
- **Activo**: Fondo gris muy claro, texto negro, borde izquierdo verde de 3px, texto en negrita

### TopBar (Barra Superior)

**Ubicación**: Parte superior de la pantalla, fija

**Contenido**:

- **Título izquierda**: "Administración de Viu el Pàdel"
- **Botón derecha**: Botón de logout con icono 🚪 y texto "Salir"

**Comportamiento responsive**:

- En móviles: El texto del botón logout se oculta, solo se muestra el icono

### Área de Contenido Principal

**Ubicación**: Debajo del TopBar, a la derecha del Sidebar

**Márgenes**:

- Margen izquierdo: 200px cuando sidebar expandida, 60px cuando colapsada
- Margen superior: 70px (altura del TopBar)
- Padding: 2rem (1rem en móviles)

## Página Principal (Dashboard)

**Ruta**: `/`

**Contenido**:

### Tarjetas de Estadísticas (Stats Cards)

5 tarjetas con información clave:

1. **👥 Clientes Activos**: Muestra "X/Y Clientes Activos" donde X son activos e Y es el total
2. **💰 Facturación Mes Actual**: Muestra el total facturado en el mes actual en formato moneda (€)
3. **📊 Facturación Año Actual**: Muestra el total facturado en el año actual en formato moneda (€)
4. **📄 Facturas Mes Actual**: Muestra el número de facturas del mes actual
5. **🔢 Último Número Factura**: Muestra el último número de factura generado (solo si existe)

**Diseño de las tarjetas**:

- Fondo blanco
- Borde gris
- Hover: Borde verde, sombra, se eleva ligeramente

### Gráficos

**Gráfico de Facturación por Mes**:

- Título: "Facturación por Mes (Últimos 6 meses)"
- Muestra los últimos 6 meses con:
  - Nombre del mes y año
  - Importe total facturado
  - Número de facturas
  - Barra visual proporcional al importe máximo

**Top 5 Clientes por Facturación**:

- Título: "Top 5 Clientes por Facturación"
- Lista de 5 clientes ordenados por facturación descendente
- Cada cliente muestra:
  - Ranking (#1, #2, etc.) en color verde
  - Nombre del cliente (clickeable, lleva a la página del cliente)
  - Importe total facturado
  - Número de facturas
- Los clientes son clickeables y llevan a su página de detalle

## Estados de Carga y Error

### Estado de Carga

**Aspecto visual**:

- Spinner circular verde con borde gris
- Texto debajo: "Cargando [elemento]..."
- Centrado vertical y horizontalmente

### Estado de Error

**Aspecto visual**:

- Mensaje de error en color rojo
- Botón "Reintentar" de color verde
- Centrado vertical y horizontalmente

### Estado Vacío

**Aspecto visual**:

- Mensaje informativo en color gris
- Centrado vertical y horizontalmente

## Colores Principales

- **Verde principal**: #cddc39 (botones principales, enlaces activos, bordes de elementos activos)
- **Verde hover**: #b8c837 (estado hover de botones verdes)
- **Texto principal**: #292929 (títulos, texto importante)
- **Texto secundario**: #666666 (texto descriptivo, labels)
- **Fondo**: #f9f9f9 (fondo de la página)
- **Bordes**: #e0e0e0 (bordes de tarjetas, inputs)
- **Error**: #d32f2f (mensajes de error)
- **Éxito**: #2e7d32 (mensajes de éxito)

## Responsive Design

### Breakpoint Principal

- **≤768px**: Considerado móvil/tablet
  - Sidebar siempre colapsada
  - TopBar ajustado
  - Padding reducido
  - Botones de texto ocultan parte del texto

### Comportamiento Adaptativo

- Las tablas tienen scroll horizontal en móviles
- Los grids se convierten en columnas únicas
- Los botones ocupan el ancho completo cuando es necesario

## Navegación y Rutas

### Rutas Principales

1. `/` - Dashboard/Inicio
2. `/clients` - Listado de clientes
3. `/clients/new` - Crear nuevo cliente
4. `/client/:clientId` - Detalle de cliente
5. `/client/:clientId/edit` - Editar cliente
6. `/invoices` - Listado de facturas
7. `/invoices/manual` - Crear factura manual
8. `/remittance-types` - Listado de tipos de remesa
9. `/remittance-type/:id` - Detalle de tipo de remesa
10. `/remittance-type/:id/clients` - Cuotas de clientes para un tipo de remesa
11. `/remittance-type/:id/remittance/:remittanceId` - Detalle de remesa

### Sistema de Navegación Atrás

- El botón "Volver" en el sidebar utiliza el historial del navegador
- Si no hay historial, usa un sistema interno de rutas visitadas
- Si no hay historial interno, usa rutas de fallback definidas en los metadatos de cada ruta
- Fallback por defecto: `/` (página principal)

## Caché de Datos

- Las peticiones GET se cachean automáticamente
- Las peticiones POST/PUT/DELETE limpian el caché automáticamente
- El caché se limpia automáticamente después de operaciones de escritura
