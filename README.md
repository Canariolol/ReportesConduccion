# 🚛 Reportes de Conducción - West Ingeniería

## Descripción
Plataforma fullstack profesional para generar reportes de alarmas de conducción a partir de archivos Excel. Actualmente en migración desde una aplicación web monolítica hacia una arquitectura moderna con React + Python + Firebase.

**Estado Actual**: 🔄 En proceso de migración a fullstack  
**Versión Actual**: 1.0 (Monolítica) → 2.0 (FullStack)  
**Tecnologías**: React 18 + Python FastAPI + Firebase

## 🚀 Arquitectura FullStack (En Desarrollo)

### Frontend (React + TypeScript)
- **Framework**: React 18 con Vite y TypeScript
- **Estado**: Redux Toolkit para manejo de estado global
- **UI**: Material-UI con diseño responsive
- **Gráficos**: Recharts para visualizaciones interactivas
- **Autenticación**: Firebase Authentication

### Backend (Python + FastAPI)
- **Framework**: FastAPI para API REST de alto rendimiento
- **Procesamiento**: Pandas para análisis de datos Excel
- **Validación**: Pydantic para validación de datos
- **Base de datos**: Firestore para almacenamiento en tiempo real
- **Storage**: Firebase Storage para gestión de archivos

### Firebase Services
- **Firestore**: Base de datos NoSQL escalable
- **Authentication**: Sistema de autenticación de usuarios
- **Storage**: Almacenamiento de archivos Excel y reportes
- **Hosting**: Despliegue de aplicación React
- **Functions**: Procesamiento serverless

## ✨ Características Actuales (v1.0 - Monolítica)
- **Carga intuitiva**: Arrastra y suelta archivos Excel o selección manual
- **Análisis automático**: Procesamiento inteligente de datos de alarmas
- **Dashboard visual**: Métricas clave con tarjetas animadas y colores diferenciados
- **Gráficos interactivos**: Visualizaciones circulares y de líneas con animaciones
- **Filtrado avanzado**: Filtra por tipo de alarma, patente, fecha y comentarios
- **Tabla mejorada**: Diseño optimizado con etiquetas de color y comentarios expandibles
- **Exportación múltiple**: Excel, PDF y guardado en base de datos
- **Interfaz responsive**: Diseño moderno que se adapta a diferentes pantallas
- **Experiencia de usuario**: Animaciones suaves y retroalimentación visual

## 🚀 Características Nuevas (v2.0 - FullStack)
- **Sistema de usuarios**: Autenticación con roles y permisos
- **Gestión de vehículos**: CRUD completo para flotas de vehículos
- **Multiusuario**: Soporte para múltiples usuarios simultáneos
- **Reportes programados**: Generación automática y envío por email
- **API REST**: Integración con sistemas externos
- **Almacenamiento en la nube**: Gestión segura de archivos
- **Panel de administración**: Gestión centralizada de usuarios y vehículos
- **Aplicación móvil**: Versión móvil nativa (React Native)
- **Análisis predictivo**: Detección de patrones y tendencias
- **Soporte multi-empresa**: Gestión de múltiples empresas

## Requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Archivos Excel con el formato proporcionado por el sistema de monitoreo

## Uso Rápido

### 1. Abrir la aplicación
- Entrar a la web

<!-->
- Hacer doble clic en el archivo `index.html`
- Se abrirá en el navegador predeterminado <-->

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

### Opción 4: Google Firebase (Implementación elegida y definitiva)
- **Firestore**: Base de datos para reportes
- **Hosting**: Para desplegar la aplicación
- **Functions**: Para procesamiento de datos (backend)
- **Storage**: Para almacenamiento de archivos

## 🎨 Personalización y Diseño

### Esquema de Colores
La aplicación utiliza una paleta profesional con gradientes:
- **Azul**: #90dfffff → #2980b9 (métricas principales)
- **Púrpura**: #d49bdbff → #7c3aa8ff (tipos de alarma)
- **Rojo**: #f7ab65ff → #c0392b (vehículos)
- **Verde**: #72d89cff → #148844ff (archivos)
- **Etiquetas de alarma**: Colores diferenciados por tipo

### Tipos de Alarmas con Códigos de Color (Actualizar sección según colores en el código de script.js)
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

## 📊 Documentación del Proyecto

### 📋 Plan de Migración
- **[PLAN_MIGRACION.md](PLAN_MIGRACION.md)**: Plan detallado de migración a fullstack con fases, tecnologías y arquitectura
- **[PRD.md](PRD.md)**: Product Requirements Document con historias de usuario y requisitos funcionales

### 🔄 Estado de la Migración
- **Fase Actual**: Planificación y diseño
- **Próximos Pasos**: Configuración del entorno Firebase
- **Timeline Estimado**: 2 semanas para MVP, 5 semanas para versión completa

## 🚀 Roadmap de Implementación (Timeline Acelerado)

### Fase 1: Configuración del Entorno (Días 1-2)
- [ ] Crear proyecto Firebase
- [ ] Configurar Firestore, Authentication, Storage
- [ ] Configurar dominio personalizado
- [ ] Crear estructura de carpetas del proyecto

### Fase 2: Backend - API Python (Días 3-5)
- [ ] Configurar entorno virtual Python
- [ ] Implementar estructura básica de API con FastAPI
- [ ] Crear endpoints para procesamiento de Excel
- [ ] Implementar conexión con Firestore

### Fase 3: Frontend - React (Días 6-8)
- [ ] Configurar proyecto React con Vite
- [ ] Migrar componentes visuales principales
- [ ] Implementar sistema de rutas y estado
- [ ] Migrar lógica de procesamiento de Excel

### Fase 4: Integración Firebase (Días 9-10)
- [ ] Implementar autenticación de usuarios
- [ ] Conectar frontend con API Python
- [ ] Implementar almacenamiento de archivos
- [ ] Configurar reglas de seguridad

### Fase 5: Testing y Despliegue (Días 11-14)
- [ ] Crear suite de tests
- [ ] Optimizar rendimiento
- [ ] Configurar Firebase Hosting
- [ ] Realizar despliegue en producción

## 🛠️ Tecnologías Clave

### Frontend
- **React 18**: Framework principal con TypeScript
- **Redux Toolkit**: Manejo de estado global
- **Material-UI**: Componentes de UI profesionales
- **Recharts**: Gráficos interactivos y visualizaciones
- **Vite**: Herramienta de build y desarrollo rápido

### Backend
- **Python 3.11+**: Lenguaje principal
- **FastAPI**: Framework web de alto rendimiento
- **Pandas**: Procesamiento y análisis de datos
- **Pydantic**: Validación de datos con tipos
- **Firebase Admin SDK**: Integración con servicios Firebase

### Firebase
- **Firestore**: Base de datos NoSQL en tiempo real
- **Authentication**: Sistema de autenticación completo
- **Storage**: Almacenamiento de archivos escalable
- **Hosting**: Despliegue de aplicaciones web estáticas
- **Functions**: Ejecución de código serverless

## 📈 Métricas de Éxito

### Técnicas
- Tiempo de procesamiento de archivos Excel < 10 segundos
- Tiempo de respuesta de API < 200ms
- Tiempo de carga de página inicial < 3 segundos
- Soporte para archivos Excel hasta 50MB
- 99.9% uptime del sistema

### de Usuario
- Reducción del 50% en tiempo de generación de reportes
- Mejora del 80% en experiencia de usuario
- Soporte para múltiples usuarios simultáneos
- Acceso móvil responsivo
- Disponibilidad 24/7

## 🤝 Contribución

### Estructura del Proyecto
```
reportes-conduccion-fullstack/
├── frontend/          # Aplicación React
├── backend/           # API Python FastAPI
├── firebase/          # Configuración Firebase
├── docs/              # Documentación
└── README.md
```

### Guías de Desarrollo
1. Clonar el repositorio
2. Configurar Firebase CLI
3. Instalar dependencias del frontend y backend
4. Configurar variables de entorno
5. Ejecutar en modo desarrollo

## 📞 Soporte y Contacto

### Soporte Técnico
- **Documentación**: Revisar archivos `PLAN_MIGRACION.md` y `PRD.md`
- **Issues**: Reportar problemas en el repositorio
- **Email**: admin@ninfasolutions.com

### Contacto del Proyecto
- **Empresa**: West Ingeniería
- **Supervisora**: Catherine Triviño
- **Desarrollo**: Ninfa Solutions
- **Última Actualización**: 22 de septiembre de 2025

---

**Estado del Proyecto**: 🔄 En migración a fullstack  
**Versión Actual**: 1.0 (Monolítica) → 2.0 (FullStack)  
**Tecnologías**: React 18 + Python FastAPI + Firebase  
**Fecha de Actualización**: 22 de septiembre de 2025
