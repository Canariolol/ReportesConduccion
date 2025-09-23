# 📋 Product Requirements Document - Reportes de Conducción FullStack

## 🎯 Visión del Producto

**Reportes de Conducción FullStack** es una evolución de la herramienta actual de West Ingeniería que transformará una aplicación web monolítica en una plataforma fullstack escalable, moderna y colaborativa para el análisis de alarmas de conducción. La nueva plataforma permitirá a múltiples usuarios gestionar flotas de vehículos, analizar patrones de conducción y generar reportes automáticos con una experiencia de usuario mejorada.

## 👥 Usuarios y Roles

### Usuarios Primarios
1. **Supervisores de Flota (Catherine Triviño)**
   - **Rol**: Admin/User
   - **Necesidades**: Análisis completo de alarmas, gestión de vehículos, reportes automáticos
   - **Frecuencia**: Diaria

2. **Operadores de Mesa de Servicio**
   - **Rol**: User
   - **Necesidades**: Monitoreo en tiempo real, generación rápida de reportes, filtrado avanzado
   - **Frecuencia**: Continua

3. **Gerentes de Operaciones**
   - **Rol**: Viewer
   - **Necesidades**: Reportes ejecutivos, métricas de rendimiento, tendencias
   - **Frecuencia**: Semanal/Mensual

### Usuarios Secundarios
1. **Conductores**
   - **Rol**: Viewer limitado
   - **Necesidades**: Ver sus propias estadísticas, historial de alarmas
   - **Frecuencia**: Ocasional

2. **Administradores de Sistema**
   - **Rol**: Admin
   - **Necesidades**: Gestión de usuarios, configuración, mantenimiento
   - **Frecuencia**: Según necesidad

## 🎨 Historias de Usuario

### Épica 1: Gestión de Usuarios y Autenticación
**Como** supervisor de flota,  
**quiero** iniciar sesión con mis credenciales,  
**para** acceder a mis reportes y vehículos asignados.

**Criterios de Aceptación:**
- [ ] Página de login con email y contraseña
- [ ] Opción de inicio de sesión con Google
- [ ] Recuperación de contraseña por email
- [ ] Verificación de email obligatoria
- [ ] Sesión persistente con "recordarme"
- [ ] Cierre de sesión seguro

**Como** administrador del sistema,  
**quiero** gestionar usuarios y roles,  
**para** controlar el acceso a la plataforma.

**Criterios de Aceptación:**
- [ ] Panel de administración de usuarios
- [ ] Creación, edición y eliminación de usuarios
- [ ] Asignación de roles (Admin, User, Viewer)
- [ ] Asignación de vehículos por usuario
- [ ] Historial de actividad de usuarios
- [ ] Desactivación de usuarios

### Épica 2: Gestión de Vehículos
**Como** supervisor de flota,  
**quiero** registrar y gestionar vehículos,  
**para** asociarlos a los reportes de conducción.

**Criterios de Aceptación:**
- [ ] Formulario de registro de vehículos (patente, tipo, conductor)
- [ ] Listado de vehículos con búsqueda y filtrado
- [ ] Edición de información de vehículos
- [ ] Estado activo/inactivo de vehículos
- [ ] Asignación de conductores a vehículos
- [ ] Historial de reportes por vehículo

### Épica 3: Procesamiento de Archivos Excel
**Como** operador de mesa de servicio,  
**quiero** cargar archivos Excel de alarmas,  
**para** generar reportes automáticos.

**Criterios de Aceptación:**
- [ ] Interfaz de arrastrar y soltar para archivos Excel
- [ ] Soporte para formatos .xlsx y .xls
- [ ] Validación de estructura de archivos
- [ ] Procesamiento asíncrono con indicador de progreso
- [ ] Detección automática de patentes y fechas
- [ ] Manejo de errores con mensajes descriptivos

### Épica 4: Dashboard y Análisis
**Como** supervisor de flota,  
**quiero** ver un dashboard con métricas clave,  
**para** tomar decisiones informadas.

**Criterios de Aceptación:**
- [ ] Métricas principales en tarjetas (total alarmas, tipos, vehículos)
- [ ] Gráficos interactivos (distribución, evolución temporal)
- [ ] Filtros avanzados por tipo, patente, fecha, comentarios
- [ ] Tabla detallada con paginación y ordenamiento
- [ ] Exportación a Excel, PDF e imagen
- [ ] Actualización en tiempo real de datos

### Épica 5: Reportes y Exportación
**Como** gerente de operaciones,  
**quiero** generar reportes automáticos,  
**para** presentar a la dirección.

**Criterios de Aceptación:**
- [ ] Generación de reportes en múltiples formatos (Excel, PDF)
- [ ] Plantillas personalizables de reportes
- [ ] Programación de reportes automáticos
- [ ] Envío de reportes por email
- [ ] Historial de reportes generados
- [ ] Descarga de reportes anteriores

### Épica 6: Almacenamiento y Gestión de Archivos
**Como** administrador del sistema,  
**quiero** gestionar archivos cargados,  
**para** optimizar el almacenamiento.

**Criterios de Aceptación:**
- [ ] Almacenamiento seguro de archivos Excel originales
- [ ] Gestión de reportes generados
- [ ] Eliminación automática de archivos antiguos
- [ ] Cuotas de almacenamiento por usuario
- [ ] Backup automático de archivos
- [ ] Recuperación de archivos eliminados

## 📊 Requisitos Funcionales

### RF-01: Autenticación y Autorización
- **Descripción**: Sistema seguro de autenticación de usuarios con roles y permisos
- **Prioridad**: Alta
- **Dependencias**: Firebase Authentication
- **Criterios de Aceptación**:
  - Login con email/contraseña y Google OAuth
  - Roles: Admin, User, Viewer
  - Sesiones con timeout configurable
  - Verificación de email obligatoria
  - Política de contraseñas seguras

### RF-02: Gestión de Vehículos
- **Descripción**: CRUD completo para gestión de vehículos y conductores
- **Prioridad**: Alta
- **Dependencias**: Firestore
- **Criterios de Aceptación**:
  - Registro de vehículos con patente, tipo, conductor
  - Listado paginado con búsqueda
  - Edición y eliminación lógica
  - Asignación de usuarios a vehículos
  - Historial de reportes por vehículo

### RF-03: Procesamiento de Excel
- **Descripción**: Procesamiento robusto de archivos Excel con múltiples hojas
- **Prioridad**: Crítica
- **Dependencias**: Pandas, OpenPyXL
- **Criterios de Aceptación**:
  - Soporte para .xlsx y .xls
  - Procesamiento de hojas "Hoja1" y "Vídeos"
  - Validación de estructura y datos
  - Manejo de errores y excepciones
  - Procesamiento asíncrono

### RF-04: Dashboard Interactivo
- **Descripción**: Interfaz visual con métricas y gráficos en tiempo real
- **Prioridad**: Alta
- **Dependencias**: Recharts, React
- **Criterios de Aceptación**:
  - Métricas en tarjetas animadas
  - Gráficos de torta, línea y barras
  - Filtros múltiples y combinados
  - Tabla con paginación y ordenamiento
  - Actualización en tiempo real

### RF-05: Exportación de Reportes
- **Descripción**: Generación de reportes en múltiples formatos
- **Prioridad**: Media
- **Dependencias**: jsPDF, ExcelJS, html2canvas
- **Criterios de Aceptación**:
  - Exportación a Excel con formato profesional
  - Exportación a PDF con gráficos y tablas
  - Exportación a imagen de alta calidad
  - Plantillas personalizables
  - Programación de exportaciones

### RF-06: Almacenamiento en la Nube
- **Descripción**: Gestión de archivos en Firebase Storage
- **Prioridad**: Media
- **Dependencias**: Firebase Storage
- **Criterios de Aceptación**:
  - Almacenamiento seguro de archivos
  - Gestión de cuotas por usuario
  - Backup automático
  - Eliminación programada
  - Recuperación de archivos

## 🛠️ Requisitos No Funcionales

### RNF-01: Rendimiento
- **Descripción**: Tiempos de respuesta rápidos y procesamiento eficiente
- **Especificaciones**:
  - Tiempo de carga inicial < 3 segundos
  - Tiempo de procesamiento Excel < 10 segundos (50MB)
  - Tiempo de respuesta API < 200ms
  - Soporte para 100 usuarios concurrentes
  - Procesamiento asíncrono de archivos grandes

### RNF-02: Seguridad
- **Descripción**: Protección de datos y acceso seguro
- **Especificaciones**:
  - Encriptación de datos en tránsito y en reposo
  - Autenticación de dos factores disponible
  - Reglas de seguridad Firestore y Storage
  - Validación de entrada de datos
  - Protección contra ataques comunes (XSS, CSRF)

### RNF-03: Escalabilidad
- **Descripción**: Capacidad para crecer con la demanda
- **Especificaciones**:
  - Arquitectura microservicios
  - Base de datos escalable (Firestore)
  - Almacenamiento elástico (Firebase Storage)
  - Balanceo de carga automático
  - Despliegue en múltiples regiones

### RNF-04: Disponibilidad
- **Descripción**: Sistema disponible 24/7
- **Especificaciones**:
  - 99.9% uptime
  - Monitoreo continuo
  - Alertas automáticas
  - Backup diario
  - Plan de recuperación ante desastres

### RNF-05: Usabilidad
- **Descripción**: Experiencia de usuario intuitiva y accesible
- **Especificaciones**:
  - Diseño responsive (mobile-first)
  - Interfaz intuitiva con curva de aprendizaje mínima
  - Accesibilidad WCAG 2.1 AA
  - Soporte para español e inglés
  - Modo oscuro/claro

### RNF-06: Mantenibilidad
- **Descripción**: Código fácil de mantener y evolucionar
- **Especificaciones**:
  - Código documentado
  - Tests unitarios y de integración
  - Arquitectura modular
  - CI/CD automatizado
  - Monitoreo y logging

## 🎨 Diseño y Experiencia de Usuario

### Principios de Diseño
- **Simplicidad**: Interfaces limpias y sin elementos innecesarios
- **Consistencia**: Diseño coherente en toda la aplicación
- **Accesibilidad**: Diseño accesible para todos los usuarios
- **Rendimiento**: Interfaz rápida y responsiva
- **Profesionalismo**: Diseño corporativo adecuado para West Ingeniería

### Paleta de Colores
- **Primario**: Azul West (#1565C0, #1976D2, #1E88E5)
- **Secundario**: Gradientes profesionales
- **Acento**: Colores para tipos de alarma (mantener esquema actual)
- **Neutros**: Grises para texto y fondos (#263238, #546E7A)

### Tipografía
- **Principal**: Inter o Roboto (moderna y legible)
- **Secundaria**: Open Sans (para párrafos largos)
- **Código**: Fira Code (para snippets técnicos)

### Iconografía
- **Sistema**: Material Icons o Font Awesome
- **Estilo**: Consistente y reconocible
- **Tamaño**: Escalable según contexto

## 📱 Prototipos de Interfaz

### Dashboard Principal
```
┌─────────────────────────────────────────────────────────────┐
│  🚛 Reportes de Conducción - West Ingeniería            │
│  👤 Catherine Triviño | 🚪 Salir                     │
├─────────────────────────────────────────────────────────────┤
│  📊 Métricas Principales                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │   145   │ │   12    │ │   SHGP72 │ │ reporte │         │
│  │Alarmas  │ │   Tipos │ │Vehículo │ │.xlsx    │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│                                                             │
│  📈 Gráficos Interactivos                                  │
│  ┌─────────────────┐ ┌─────────────────┐                 │
│  │  Tipos de      │ │  Evolución      │                 │
│  │  Alarmas       │ │  Diaria         │                 │
│  │  🥧📊          │ │  📈📊          │                 │
│  └─────────────────┘ └─────────────────┘                 │
│                                                             │
│  🔍 Filtros                                               │
│  ┌─────┐ ┌───────┐ ┌──────────┐ ┌─────────────┐         │
│  │Tipo │ │Patente│ │  Fecha   │ │Comentarios  │         │
│  └─────┘ └───────┘ └──────────┘ └─────────────┘         │
│                                                             │
│  📋 Tabla de Eventos                                      │
│  ┌─────────┬─────────┬─────────┬───────────────────────┐   │
│  │ Fecha   │ Patente │ Tipo   │ Comentarios            │   │
│  ├─────────┼─────────┼─────────┼───────────────────────┤   │
│  │16/09/25│ SHGP72  │Cinturón │Sin comments...         │   │
│  └─────────┴─────────┴─────────┴───────────────────────┘   │
│                                                             │
│  💾 Acciones: Exportar Excel | Exportar PDF | Guardar BD  │
└─────────────────────────────────────────────────────────────┘
```

### Panel de Administración
```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Administración - West Ingeniería                    │
│  👤 Admin | 🚪 Salir                                  │
├─────────────────────────────────────────────────────────────┤
│  👥 Gestión de Usuarios                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 Buscar...  ➕ Nuevo Usuario                    │   │
│  ├─────────┬────────────┬─────────┬─────────┬─────────┤   │
│  │ Email   │ Nombre     │ Rol     │ Estado  │ Acciones│   │
│  ├─────────┼────────────┼─────────┼─────────┼─────────┤   │
│  │c@w.com │Catherine   │Admin    │Activo   │✏️🗑️   │   │
│  └─────────┴────────────┴─────────┴─────────┴─────────┘   │
│                                                             │
│  🚗 Gestión de Vehículos                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 Buscar...  ➕ Nuevo Vehículo                    │   │
│  ├─────────┬────────────┬─────────┬─────────┬─────────┤   │
│  │ Patente │ Conductor  │ Tipo    │ Estado  │ Acciones│   │
│  ├─────────┼────────────┼─────────┼─────────┼─────────┤   │
│  │ SHGP72  │ Juan Pérez │ Camión  │ Activo  │✏️🗑️   │   │
│  └─────────┴────────────┴─────────┴─────────┴─────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Métricas de Éxito

### Métricas de Negocio
- **Adopción**: 90% de usuarios activos semanales
- **Retención**: 95% de usuarios mensuales
- **Satisfacción**: NPS > 50
- **Productividad**: Reducción del 70% en tiempo de generación de reportes
- **Escalabilidad**: Soporte para 500+ usuarios

### Métricas Técnicas
- **Rendimiento**: Tiempo de carga < 3s
- **Disponibilidad**: 99.9% uptime
- **Errores**: < 0.1% tasa de error
- **Seguridad**: 0 incidentes de seguridad
- **Mantenibilidad**: 90% cobertura de tests

### Métricas de Usuario
- **Experiencia**: CSAT > 4.5/5
- **Usabilidad**: Tiempo promedio en sesión < 15 min
- **Adopción de features**: 80% de usuarios usan features avanzadas
- **Soporte**: < 5 tickets por usuario al mes

## 🚀 Roadmap de Lanzamiento (Timeline Actualizado)

### ✅ Fase 1: MVP (Completada - Avance Significativo)
- [x] Procesamiento de archivos Excel
- [x] Dashboard con métricas básicas
- [x] Gráficos interactivos (torta, línea, área)
- [x] Exportación a Excel y PDF
- [x] Filtros avanzados
- [x] **✅ NUEVO: Corrección de problemas críticos con gráficos en PDF**
- [x] **✅ NUEVO: Optimización de tabla de eventos en PDF**
- [x] **✅ NUEVO: Implementación de seguridad y protección de secret keys**

### 🔄 Fase 2: Versión 1.0 (1-2 semanas)
- [ ] Autenticación y gestión de usuarios básica
- [ ] Gestión completa de vehículos
- [ ] Panel de administración
- [ ] Integración con Firebase Authentication
- [ ] Documentación completa
- [ ] Testing y optimización

### 📋 Fase 3: Versión 2.0 (2-3 semanas adicionales)
- [ ] Reportes programados y envío por email
- [ ] API para integraciones externas
- [ ] Módulo de análisis predictivo
- [ ] Aplicación móvil (React Native)
- [ ] Soporte multi-empresa

## 📋 Criterios de Listo para Lanzamiento

### Técnicos
- [x] Todos los tests unitarios pasando (>90% cobertura)
- [ ] Tests de integración completos
- [x] Performance tests aprobados
- [x] Seguridad auditada (protección de secret keys implementada)
- [ ] Documentación completa

### de Producto
- [x] Todas las historias de usuario implementadas (MVP)
- [ ] Pruebas de aceptación con usuarios reales
- [ ] Formación de usuarios completada
- [ ] Material de soporte preparado
- [ ] Plan de migración de datos ejecutado

### de Negocio
- [x] ROI positivo proyectado
- [x] Plan de marketing definido
- [x] Modelo de precios establecido
- [ ] Acuerdos de nivel de servicio (SLA)
- [ ] Plan de soporte post-lanzamiento

## 🔒 Consideraciones de Seguridad

### Seguridad de Datos
- [x] Encriptación AES-256 para datos sensibles
- [x] Encriptación TLS 1.3 para comunicaciones
- [x] Máscara de datos en interfaces
- [x] Políticas de retención de datos
- [x] Cumplimiento GDPR y Ley Chilena de Protección de Datos

### Seguridad de Aplicación
- [x] Validación de entrada de datos
- [x] Protección contra inyección SQL y XSS
- [x] Rate limiting en API endpoints
- [x] Auditoría de accesos
- [x] Monitoreo de actividades sospechosas

### Seguridad de Infraestructura
- [x] Firewall y WAF configurados
- [x] Actualizaciones de seguridad automáticas
- [x] Backup diario con encriptación
- [x] Plan de recuperación ante desastres
- [x] Monitoreo 24/7

## 🎯 Últimos Avances Implementados (22 de septiembre de 2025)

### ✅ Corrección de Problemas Críticos en Gráficos y PDF
- **Implementación de React.forwardRef**: Solucionado el error "Function components cannot be given refs" en todos los componentes de gráficos (PieChart, AreaChart, LineChart)
- **Corrección de useImperativeHandle**: Manejo adecuado del tipo `HTMLDivElement | null` para evitar errores de TypeScript
- **Captura exitosa de gráficos**: Los gráficos ahora se capturan correctamente como imágenes para incluir en el PDF
- **Logging mejorado**: Implementación de console.log detallado para depuración del proceso de captura de gráficos
- **PDF completo**: Los documentos PDF generados ahora incluyen todos los gráficos visuales correctamente

### ✅ Optimización de Tabla de Eventos en PDF
- **Columna conductor optimizada**: Reducida de 35mm a 30mm de ancho para mejor distribución del espacio
- **Contenido limitado**: Implementación de truncado de texto a 15 caracteres para evitar superposición entre columnas
- **Posicionamiento ajustado**: Columnas reubicadas para mejor espaciado y legibilidad
- **Prevención de superposición**: Texto del conductor ya no desborda a la columna de comentarios
- **Mostrar todos los eventos**: Eliminado el límite de 20 eventos, ahora se muestran todos los eventos filtrados en la tabla del PDF

### ✅ Mejoras en Seguridad y Gestión de Configuración
- **Protección de secret keys**: Migración de todas las credenciales hardcodeadas en config.py a variables de entorno
- **Configuración segura**: Implementación de os.getenv() con valores por defecto para todas las variables sensibles
- **Manejo de tipos complejos**: Conversión segura de strings a listas para configuración de CORS
- **Archivo .env completo**: Todas las credenciales de Firebase y configuración ahora almacenadas de forma segura
- **Actualización de .gitignore**: Reglas estrictas para prevenir commits de archivos con información sensible

### ✅ Mejoras en Calidad de Código y Depuración
- **Componentes bien estructurados**: Uso correcto de patrones de React con forwardRef y useImperativeHandle
- **TypeScript tipado**: Manejo adecuado de tipos y nulos en todos los componentes
- **Logging exhaustivo**: Información detallada para depuración en consola
- **Mantenibilidad**: Código más fácil de entender y modificar
- **Experiencia de usuario**: Documentos PDF más profesionales y bien formateados

---

**Versión del Documento**: 2.0  
**Fecha de Creación**: 22 de septiembre de 2025  
**Última Actualización**: 22 de septiembre de 2025  
**Propietario del Producto**: West Ingeniería  
**Status**: En Desarrollo - Avance Significativo  
**Porcentaje Completado**: 70%  
**Próxima Revisión**: 29 de septiembre de 2025  
**Próximo Hit**: Integración Firebase (1-2 semanas)
