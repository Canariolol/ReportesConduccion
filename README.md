# 🚛 Reportes de Conducción - West Ingeniería

## Descripción
Herramienta web profesional para generar reportes de alarmas de conducción a partir de archivos Excel. Desarrollada específicamente para West Ingeniería y la Supervisora de Mesa de Servicio, Catherine Triviño.

## ✨ Características Mejoradas
- **Carga intuitiva**: Arrastra y suelta archivos Excel o selección manual
- **Análisis automático**: Procesamiento inteligente de datos de alarmas
- **Dashboard visual**: Métricas clave con tarjetas animadas y colores diferenciados
- **Gráficos interactivos**: Visualizaciones circulares y de líneas con animaciones
- **Filtrado avanzado**: Filtra por tipo de alarma, patente, fecha y comentarios
- **Tabla mejorada**: Diseño optimizado con etiquetas de color y comentarios expandibles
- **Exportación múltiple**: Excel, PDF y guardado en base de datos
- **Interfaz responsive**: Diseño moderno que se adapta a diferentes pantallas
- **Experiencia de usuario**: Animaciones suaves y retroalimentación visual

## Requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Archivos Excel con el formato proporcionado por el sistema de monitoreo

## Uso Rápido

### 1. Abrir la aplicación
- Hacer doble clic en el archivo `index.html`
- Se abrirá en el navegador predeterminado

### 2. Cargar archivo Excel
- Arrastrar el archivo Excel al área designada
- O hacer clic en el área y seleccionar el archivo manualmente
- El sistema procesará automáticamente los datos

### 3. Visualizar reporte
El dashboard mostrará:
- **Métricas principales**:
  - Total de Alarmas (unificado)
  - Tipos de Alarma diferentes
  - Vehículo(s) monitoreado(s)
  - Nombre del archivo procesado
- **Gráficos interactivos**:
  - Gráfico circular: Distribución de tipos de alarmas
  - Gráfico de línea: Evolución diaria de eventos
- **Tabla detallada con filtrado**:
  - Todos los eventos con formato mejorado
  - Etiquetas de color por tipo de alarma
  - Comentarios con tooltip expandible
  - Filtros múltiples: Tipo, Patente, Fecha, Comentarios
- **Barra de estadísticas**: Muestra resultados filtrados y tipo más frecuente

### 4. Exportar reporte
- **Exportar Excel**: Genera un nuevo archivo Excel con el reporte
- **Exportar PDF**: Genera un reporte en formato PDF
- **Guardar en BD**: Guarda el reporte en la base de datos (simulado por ahora)

## Estructura del Archivo Excel
La aplicación espera archivos Excel con dos hojas:

### Hoja "Hoja1" - Resumen
- Columna A: Tipos de alarmas
- Columna B: Conteo de cada tipo

### Hoja "Vídeos" - Detalle de Eventos
- Columna A: Tipo de alarma
- Columna B: Fecha y hora del evento
- Columna D: Patente del vehículo
- Columna E: Conductor
- Columna G: Comentarios
- Columna H: Severidad del evento

## Tecnologías Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Librerías**:
  - SheetJS (xlsx): Procesamiento de archivos Excel
  - Chart.js: Generación de gráficos
  - jsPDF: Exportación a PDF

## Despliegue

### Opción 1: Uso Local (Recomendado)
1. Asegurarse de tener los archivos del proyecto en una carpeta:
   - `index.html` - Interfaz principal
   - `script.js` - Lógica de la aplicación
   - `west_logo.png` - Logo de la empresa
   - Archivos Excel de ejemplo
2. Abrir `index.html` en un navegador web moderno
3. Listo para usar

**Requisitos mínimos:**
- Navegador: Chrome, Firefox, Edge, Safari (versiones recientes)
- Conexión a internet para cargar las librerías externas (CDN)

### Opción 2: Hosting Estático (GitHub Pages, Netlify, etc.)
1. Subir los archivos a un servicio de hosting estático
2. La aplicación estará disponible online

### Opción 3: Google Cloud (Futura implementación)
- **Cloud Functions**: Para procesamiento de datos
- **Cloud Storage**: Para almacenamiento de archivos
- **Cloud SQL**: Base de datos para reportes
- **Cloud Run**: Despliegue de la aplicación

## 🎨 Personalización y Diseño

### Esquema de Colores
La aplicación utiliza una paleta profesional con gradientes:
- **Azul**: #3498db → #2980b9 (métricas principales)
- **Púrpura**: #9b59b6 → #8e44ad (tipos de alarma)
- **Rojo**: #e74c3c → #c0392b (vehículos)
- **Verde**: #27ae60 → #229954 (archivos)
- **Etiquetas de alarma**: Colores diferenciados por tipo

### Tipos de Alarmas con Códigos de Color
- **Cinturón de seguridad**: Rojo (#e74c3c)
- **Conductor distraído**: Naranja (#f39c12)
- **Cruce de carril**: Púrpura (#9b59b6)
- **Distancia de seguridad**: Azul (#3498db)
- **Fatiga**: Naranja oscuro (#e67e22)
- **Frenada brusca**: Verde azulado (#1abc9c)
- **Infracción de stop**: Gris oscuro (#34495e)
- **Teléfono móvil**: Verde mar (#16a085)
- **Botón de alerta**: Verde (#27ae60)
- **Vídeo solicitado**: Púrpura oscuro (#8e44ad)

### Interacciones y Animaciones
- **Tarjetas de métricas**: Efecto hover con elevación
- **Gráficos**: Animaciones suaves al cargar
- **Tabla**: Filas con hover y comentarios expandibles
- **Botones**: Efectos de sombra y elevación al interactuar

## 🛠 Soporte y Solución de Problemas

### Problemas Comunes
**El archivo no se carga:**
- Verificar que el archivo tenga extensión .xlsx o .xls
- Asegurarse de que el archivo contenga las hojas "Hoja1" y "Vídeos"
- Revisar que el archivo no esté dañado o protegido

**Los gráficos no se muestran:**
- Verificar la conexión a internet (se cargan librerías desde CDN)
- Revisar la consola del navegador para errores
- Asegurarse de que el archivo Excel tenga datos válidos

**Los filtros no funcionan:**
- Verificar que se hayan cargado datos en la tabla
- Limpiar los filtros y aplicar nuevamente
- Revisar el formato de las fechas en el archivo Excel

### Consejos de Uso
- **Para grandes volúmenes de datos**: Usar los filtros para navegar más fácilmente
- **Para análisis específicos**: Combinar múltiples filtros (tipo + fecha + comentarios)
- **Para presentaciones**: Exportar a PDF para reportes formales
- **Para análisis adicional**: Exportar a Excel para manipular datos en otras herramientas

## 🚀 Próximas Mejoras (Versión 2.0)

### Funcionalidades
- [ ] **Conexión real con base de datos** (Google Cloud SQL)
- [ ] **Autenticación de usuarios** con roles y permisos
- [ ] **Historial de reportes** con búsqueda y recuperación
- [ ] **Filtros avanzados** por rangos de fechas y severidad
- [ ] **Reportes programados** y envío automático por correo
- [ ] **Panel de administración** para gestión de usuarios
- [ ] **Múltiples idiomas** (inglés, portugués, español)

### Mejoras Técnicas
- [ ] **Optimización de rendimiento** para grandes volúmenes de datos
- [ ] **Carga progresiva** de datos para mejor experiencia
- [ ] **Almacenamiento local** de configuraciones
- [ ] **Exportación a más formatos** (CSV, JSON, imágenes)
- [ ] **API REST** para integración con otros sistemas

### Mejoras de Diseño
- [ ] **Modo oscuro/claro** para mejor visibilidad
- [ ] **Diseño totalmente responsive** para móviles
- [ ] **Gráficos más interactivos** con drill-down
- [ ] **Vista de mapa** para ubicación de eventos
- [ ] **Dashboard personalizable** por usuario

## Notas para el Desarrollador
- El MVP está diseñado para ser funcional inmediatamente
- No requiere instalación de dependencias adicionales
- La lógica de base de datos está simulada por ahora
- Todos los archivos son autocontenidos en una sola carpeta

---

**Desarrollado para West Ingeniería**  
*Fecha: 17 de septiembre de 2025*
