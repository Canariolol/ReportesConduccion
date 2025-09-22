import React, { useState, useCallback, useRef } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Badge,
  OutlinedInput,
  Divider,
} from '@mui/material'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts'
import { useDropzone } from 'react-dropzone'
import { 
  CloudUpload, 
  GetApp, 
  PictureAsPdf, 
  Save,
  FilterList,
  TrendingUp,
  Warning,
  CheckCircle,
  Info,
  Speed,
  Assessment,
  Analytics,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store/store.ts'
import { uploadExcel, getReports, clearCurrentReport } from '../store/slices/excelSlice.ts'
import { format } from 'date-fns'

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentReport, loading, error, reports } = useSelector((state: RootState) => state.excel)
  const [filters, setFilters] = useState({
    tipo: [] as string[],
    patente: '',
    fechaInicio: '',
    fechaFin: '',
    comentario: '',
  })

  // Refs para los gráficos
  const pieChartRef = useRef<HTMLDivElement>(null)
  const areaChartRef = useRef<HTMLDivElement>(null)
  const barChartRef = useRef<HTMLDivElement>(null)
  const lineChartRef = useRef<HTMLDivElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', 'demo_user')
      dispatch(uploadExcel(formData))
    }
  }, [dispatch])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  })

  const handleFilterChange = (field: string, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const getFilteredEvents = () => {
    if (!currentReport) return []
    
    return currentReport.events.filter(event => {
      return (
        (filters.tipo.length === 0 || filters.tipo.includes(event.alarmType)) &&
        (!filters.patente || event.vehiclePlate.toLowerCase().includes(filters.patente.toLowerCase())) &&
        (!filters.fechaInicio || new Date(event.timestamp) >= new Date(filters.fechaInicio)) &&
        (!filters.fechaFin || new Date(event.timestamp) <= new Date(filters.fechaFin)) &&
        (!filters.comentario || (event.comments && event.comments.toLowerCase().includes(filters.comentario.toLowerCase())))
      )
    })
  }

  const exportToExcel = () => {
    if (!currentReport) return
    
    // Importación dinámica para evitar errores de compilación
    import('xlsx').then(XLSX => {
      const worksheet = XLSX.utils.json_to_sheet(getFilteredEvents())
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Eventos Filtrados')
      XLSX.writeFile(workbook, `reporte_filtrado_${format(new Date(), 'yyyyMMdd')}.xlsx`)
    }).catch(error => {
      console.error('Error al exportar a Excel:', error)
    })
  }

  const captureChartAsImage = async (ref: React.RefObject<HTMLDivElement>, fileName: string): Promise<{ imageData: string; width: number; height: number }> => {
    if (!ref.current) return { imageData: '', width: 0, height: 0 }
    
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(ref.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Mayor calidad
        useCORS: true,
        allowTaint: true,
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight,
      })
      
      return {
        imageData: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height
      }
    } catch (error) {
      console.error(`Error capturando ${fileName}:`, error)
      return { imageData: '', width: 0, height: 0 }
    }
  }

  const exportToPDF = async () => {
    if (!currentReport) return
    
    try {
      // Importar las librerías dinámicamente
      const [jsPDF, html2canvas] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ])
      
      const { default: JsPDF } = jsPDF
      
      // Capturar gráficos como imágenes con sus dimensiones originales
      const pieChartResult = await captureChartAsImage(pieChartRef, 'pie-chart')
      const areaChartResult = await captureChartAsImage(areaChartRef, 'area-chart')
      const barChartResult = await captureChartAsImage(barChartRef, 'bar-chart')
      const lineChartResult = await captureChartAsImage(lineChartRef, 'line-chart')
      
      // Crear un nuevo documento PDF
      const pdf = new JsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Configurar colores y estilos
      const primaryColor = '#1565C0'
      const secondaryColor = '#764ba2'
      
      // Función para agregar el logo como marca de agua
      const addWatermark = async () => {
        try {
          // Cargar el logo gris desde la raíz del proyecto
          const logoResponse = await fetch('/west_logo_gris.png')
          if (logoResponse.ok) {
            const logoBlob = await logoResponse.blob()
            const logoBase64 = await blobToBase64(logoBlob)
            
            // Agregar logo como marca de agua en todas las páginas
            const totalPages = pdf.getNumberOfPages()
            for (let i = 1; i <= totalPages; i++) {
              pdf.setPage(i)
              // Logo con dimensiones proporcionales para evitar deformación
              pdf.addImage(logoBase64, 'PNG', 15, 10, 30, 12)
            }
          }
        } catch (error) {
          console.error('Error al cargar el logo como marca de agua:', error)
        }
      }
      
      // Función para convertir blob a base64
      const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      }
      
      // Función para agregar el encabezado
      const addHeader = () => {
        pdf.setFontSize(20)
        pdf.setTextColor(primaryColor)
        pdf.text('Reporte de Alarmas de Conducción', 60, 20)
        
        pdf.setFontSize(12)
        pdf.setTextColor(100)
        pdf.text(`Vehículo: ${currentReport.vehicle_plate}`, 60, 28)
        pdf.text(`Archivo: ${currentReport.file_name}`, 60, 35)
        pdf.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 60, 42)
      }
      
      // Función para agregar el pie de página
      const addFooter = (pageNumber: number, totalPages: number) => {
        const footerY = pageHeight - 15
        
        // Línea superior del footer
        pdf.setDrawColor(primaryColor)
        pdf.setLineWidth(0.5)
        pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5)
        
        // Texto del footer
        pdf.setFontSize(10)
        pdf.setTextColor(100)
        pdf.text('West Ingeniería - Reporte de Conducción', 15, footerY)
        pdf.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 30, footerY)
        
        // Información de contacto
        pdf.setFontSize(8)
        pdf.text('Generado por Sistema de Análisis de Alarmas', 15, footerY + 5)
      }
      
      // Función para agregar métricas
      const addMetrics = (yPosition: number) => {
        pdf.setFillColor(primaryColor)
        pdf.rect(15, yPosition, pageWidth - 30, 8, 'F')
        
        pdf.setFontSize(14)
        pdf.setTextColor(255, 255, 255)
        pdf.text('Resumen de Métricas', 20, yPosition + 5.5)
        
        const metricsY = yPosition + 15
        pdf.setFontSize(12)
        pdf.setTextColor(0, 0, 0)
        
        // Métricas en dos columnas
        const col1X = 20
        const col2X = pageWidth / 2 + 10
        
        pdf.text(`Total de Alarmas: ${currentReport.summary.totalAlarms}`, col1X, metricsY)
        pdf.text(`Tipos de Alarma: ${Object.keys(currentReport.summary.alarmTypes).length}`, col2X, metricsY)
        
        pdf.text(`Vídeos Solicitados: ${currentReport.summary.videosRequested || 0}`, col1X, metricsY + 8)
        pdf.text(`Eventos Filtrados: ${filteredEvents.length}`, col2X, metricsY + 8)
        
        return metricsY + 20
      }
      
      // Función para agregar gráficos con proporciones correctas y espaciado adecuado
      const addCharts = async (startY: number, isFirstPage: boolean) => {
        let currentY = startY
        
        // Ajustar posición inicial según sea la primera página o no
        // En páginas siguientes, dejar más espacio para el logo
        if (!isFirstPage) {
          currentY = Math.max(currentY, 35) // Asegurar espacio después del logo
        }
        
        // Título de la sección
        pdf.setFontSize(16)
        pdf.setTextColor(primaryColor)
        pdf.text('Análisis Gráfico', 15, currentY)
        currentY += 20
        
        // Gráfico de torta - mantener proporciones
        if (pieChartResult.imageData) {
          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)
          pdf.text('Distribución de Tipos de Alarmas', 15, currentY)
          currentY += 8
          
          // Calcular dimensiones manteniendo proporción
          const chartWidth = 160
          const aspectRatio = pieChartResult.height / pieChartResult.width
          const chartHeight = chartWidth * aspectRatio
          
          pdf.addImage(pieChartResult.imageData, 'PNG', 25, currentY, chartWidth, chartHeight)
          currentY += chartHeight + 15
        }
        
        // Verificar si necesitamos nueva página
        if (currentY + 140 > pageHeight - 30) {
          pdf.addPage()
          currentY = 35 // Nueva página con espacio para logo
        }
        
        // Gráfico de área - mantener proporciones
        if (areaChartResult.imageData) {
          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)
          pdf.text('Evolución Diaria de Eventos', 15, currentY)
          currentY += 8
          
          // Calcular dimensiones manteniendo proporción
          const chartWidth = 160
          const aspectRatio = areaChartResult.height / areaChartResult.width
          const chartHeight = chartWidth * aspectRatio
          
          pdf.addImage(areaChartResult.imageData, 'PNG', 25, currentY, chartWidth, chartHeight)
          currentY += chartHeight + 15
        }
        
        // Verificar si necesitamos nueva página
        if (currentY + 140 > pageHeight - 30) {
          pdf.addPage()
          currentY = 35 // Nueva página con espacio para logo
        }
        
        // Gráfico de barras - mantener proporciones
        if (barChartResult.imageData) {
          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)
          pdf.text('Cantidad de Alarmas por Tipo', 15, currentY)
          currentY += 8
          
          // Calcular dimensiones manteniendo proporción
          const chartWidth = 160
          const aspectRatio = barChartResult.height / barChartResult.width
          const chartHeight = chartWidth * aspectRatio
          
          pdf.addImage(barChartResult.imageData, 'PNG', 25, currentY, chartWidth, chartHeight)
          currentY += chartHeight + 15
        }
        
        // Verificar si necesitamos nueva página
        if (currentY + 140 > pageHeight - 30) {
          pdf.addPage()
          currentY = 35 // Nueva página con espacio para logo
        }
        
        // Gráfico de líneas - mantener proporciones
        if (lineChartResult.imageData) {
          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)
          pdf.text('Alarmas por Hora del Día', 15, currentY)
          currentY += 8
          
          // Calcular dimensiones manteniendo proporción
          const chartWidth = 160
          const aspectRatio = lineChartResult.height / lineChartResult.width
          const chartHeight = chartWidth * aspectRatio
          
          pdf.addImage(lineChartResult.imageData, 'PNG', 25, currentY, chartWidth, chartHeight)
          currentY += chartHeight + 15
        }
        
        return currentY
      }
      
      // Función para agregar tabla de eventos
      const addEventsTable = async (startY: number) => {
        if (filteredEvents.length === 0) return startY
        
        pdf.setFontSize(12)
        pdf.setTextColor(primaryColor)
        pdf.text('Eventos Filtrados', 15, startY)
        
        const tableStartY = startY + 10
        const rowHeight = 6
        const colWidths = [25, 25, 30, 25, pageWidth - 120] // Fechas, Patente, Tipo, Conductor, Comentarios
        
        // Encabezados de tabla
        pdf.setFillColor(primaryColor)
        pdf.rect(15, tableStartY, pageWidth - 30, rowHeight, 'F')
        
        pdf.setFontSize(10)
        pdf.setTextColor(255, 255, 255)
        pdf.text('Fecha', 17, tableStartY + 4)
        pdf.text('Patente', 42, tableStartY + 4)
        pdf.text('Tipo', 67, tableStartY + 4)
        pdf.text('Conductor', 97, tableStartY + 4)
        pdf.text('Comentarios', 122, tableStartY + 4)
        
        // Contenido de la tabla
        pdf.setTextColor(0, 0, 0)
        let currentY = tableStartY + rowHeight
        
        for (let i = 0; i < Math.min(filteredEvents.length, 20); i++) {
          const event = filteredEvents[i]
          
          // Verificar si necesitamos una nueva página
          if (currentY + rowHeight > pageHeight - 30) {
            pdf.addPage()
            currentY = 35 // Nueva página con espacio para logo
          }
          
          // Fila alternada
          if (i % 2 === 0) {
            pdf.setFillColor(245, 245, 245)
            pdf.rect(15, currentY, pageWidth - 30, rowHeight, 'F')
          }
          
          // Fecha formateada
          const eventDate = new Date(event.timestamp)
          const formattedDate = format(eventDate, 'dd/MM HH:mm')
          
          pdf.setFontSize(8)
          pdf.text(formattedDate, 17, currentY + 4)
          pdf.text(event.vehiclePlate, 42, currentY + 4)
          pdf.text(event.alarmType, 67, currentY + 4)
          pdf.text(event.driver, 97, currentY + 4)
          
          // Comentarios truncados
          const comments = event.comments || 'Sin comentarios'
          const truncatedComments = comments.length > 40 ? comments.substring(0, 40) + '...' : comments
          pdf.text(truncatedComments, 122, currentY + 4)
          
          currentY += rowHeight
        }
        
        // Si hay más eventos, agregar nota
        if (filteredEvents.length > 20) {
          pdf.setFontSize(10)
          pdf.setTextColor(100)
          pdf.text(`... y ${filteredEvents.length - 20} eventos más`, 15, currentY + 5)
          currentY += 10
        }
        
        return currentY
      }
      
      // Generar el PDF
      addHeader()
      
      let currentY = 55
      
      // Agregar página 1 - Métricas
      currentY = addMetrics(currentY)
      
      // Verificar si necesitamos nueva página para gráficos
      if (currentY + 50 > pageHeight - 30) {
        pdf.addPage()
        currentY = 35
      }
      
      // Agregar gráficos (primera página)
      currentY = await addCharts(currentY, true)
      
      // Verificar si necesitamos más páginas para la tabla
      if (currentY + 50 > pageHeight - 30) {
        pdf.addPage()
        currentY = 35
      }
      
      // Agregar tabla de eventos
      currentY = await addEventsTable(currentY)
      
      // Agregar marca de agua a todas las páginas
      await addWatermark()
      
      // Agregar footer a todas las páginas
      const totalPages = pdf.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        addFooter(i, totalPages)
      }
      
      // Guardar el PDF
      const fileName = `reporte_conduccion_${currentReport.vehicle_plate}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`
      pdf.save(fileName)
      
      console.log('PDF generado exitosamente con gráficos de alta calidad, proporciones correctas y espaciado adecuado')
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el PDF. Por favor, intente nuevamente.')
    }
  }

  const getAlarmColor = (type: string): string => {
    const colors: Record<string, string> = {
      'cinturon': '#b71c1c',
      'distraido': '#e65100',
      'cruce': '#6a1b9a',
      'distancia': '#0d47a1',
      'fatiga': '#f9a825',
      'frenada': '#1b5e20',
      'stop': '#424242',
      'telefono': '#004d40',
      'boton': '#2e7d32',
      'video': '#8e24aa',
    }
    
    const normalized = type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    for (const [key, color] of Object.entries(colors)) {
      if (normalized.includes(key)) return color
    }
    return '#64b5f6'
  }

  const getAlarmsByHour = () => {
    const events = getFilteredEvents()
    if (events.length === 0) return []
    
    const hourCounts: Record<number, number> = {}
    
    // Inicializar todas las horas (0-23) en 0
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0
    }
    
    // Contar alarmas por hora usando eventos filtrados
    events.forEach(event => {
      try {
        const eventDate = new Date(event.timestamp)
        const hour = eventDate.getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      } catch (error) {
        console.error('Error parsing timestamp:', event.timestamp, error)
      }
    })
    
    // Convertir a formato para el gráfico (agrupar de 2 en 2 horas)
    return Array.from({ length: 12 }, (_, i) => {
      const startHour = i * 2
      const endHour = startHour + 1
      const total = hourCounts[startHour] + (hourCounts[endHour] || 0)
      return {
        hour: `${startHour.toString().padStart(2, '0')}:00-${endHour.toString().padStart(2, '0')}:59`,
        alarmas: total
      }
    })
  }

  const getFilteredAlarmTypes = () => {
    const events = getFilteredEvents()
    const alarmTypes: Record<string, number> = {}
    
    events.forEach(event => {
      alarmTypes[event.alarmType] = (alarmTypes[event.alarmType] || 0) + 1
    })
    
    return alarmTypes
  }

  const getFilteredDailyEvolution = () => {
    const events = getFilteredEvents()
    if (events.length === 0) return { labels: [], data: [] }
    
    const dailyCounts: Record<string, number> = {}
    
    events.forEach(event => {
      try {
        const eventDate = new Date(event.timestamp)
        const dateKey = eventDate.toISOString().split('T')[0] // YYYY-MM-DD
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1
      } catch (error) {
        console.error('Error parsing timestamp:', event.timestamp, error)
      }
    })
    
    // Ordenar fechas y convertir a formato para el gráfico
    const sortedDates = Object.keys(dailyCounts).sort()
    return {
      labels: sortedDates,
      data: sortedDates.map(date => dailyCounts[date])
    }
  }

  const filteredEvents = getFilteredEvents()
  const mostFrequentType = filteredEvents.reduce((acc, event) => {
    acc[event.alarmType] = (acc[event.alarmType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostFrequent = Object.entries(mostFrequentType).sort(([,a], [,b]) => (b as number) - (a as number))[0]

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              color: 'primary.main',
              mb: 1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            🚛 Reportes de Conducción
          </Typography>
          <Typography variant="h6" color="text.secondary">
            West Ingeniería - Sistema de Análisis de Alarmas
          </Typography>
        </Box>
        <Box
          component="img"
          src="/west_logo.png"
          alt="West Ingeniería"
          sx={{ 
            height: 60, 
            width: 'auto',
            ml: 2,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
          }}
        />
      </Box>

      {/* Upload Section */}
      <Card 
        sx={{ 
          mb: 4, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: '700px',
          mx: 'auto',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.1,
          }
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', p: 3 }}>
          <Box
            {...getRootProps()}
            sx={{
              border: '3px dashed',
              borderColor: isDragActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
              borderRadius: 4,
              p: 6,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.8)',
              },
              maxWidth: '600px',
              width: '100%',
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 64, color: 'white', mb: 2, opacity: 0.9 }} />
            <Typography variant="h5" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
              {isDragActive ? '🎯 Suelta el archivo aquí' : '📁 Arrastra y suelta un archivo Excel aquí'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
              o haz clic para seleccionar un archivo
            </Typography>
            <Chip 
              label="Formatos: .xlsx, .xls (máx. 50MB)" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 500
              }} 
            />
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)'
          }}
        >
          {error}
        </Alert>
      )}

      {loading && (
        <Box 
          display="flex" 
          justifyContent="center" 
          sx={{ 
            mb: 4,
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <CircularProgress size={48} thickness={4} />
        </Box>
      )}

      {/* Dashboard Content */}
      {currentReport && (
        <>
          {/* Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '140px',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Warning sx={{ mr: 1, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {currentReport.summary.totalAlarms}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Total Alarmas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '140px',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Analytics sx={{ mr: 1, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {Object.keys(currentReport.summary.alarmTypes).length}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Tipos de Alarma
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '140px',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Speed sx={{ mr: 1, fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {currentReport.vehicle_plate}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Vehículo
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #5ec581ff 0%, #4eb9a6ff 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '140px',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Assessment sx={{ mr: 1, fontSize: 28 }} />
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700,
                        fontSize: '1rem',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {currentReport.file_name}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Archivo
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: 400 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ mr: 1, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z"/>
                      </svg>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Distribución de Tipos de Alarmas
                    </Typography>
                  </Box>
                  <Box ref={pieChartRef} sx={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={Object.entries(getFilteredAlarmTypes()).map(([name, value]) => ({
                            name,
                            value,
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        >
                          {Object.entries(currentReport.summary.alarmTypes).map(([name]) => (
                            <Cell key={name} fill={getAlarmColor(name)} stroke="white" strokeWidth={2} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            borderRadius: 8,
                            border: '1px solid rgba(0,0,0,0.1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: 400 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Evolución Diaria de Eventos
                    </Typography>
                  </Box>
                  <Box ref={areaChartRef} sx={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={getFilteredDailyEvolution().labels.map((label, index) => ({
                        day: label,
                        alarmas: getFilteredDailyEvolution().data[index],
                      }))}>
                        <defs>
                          <linearGradient id="colorAlarmas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis dataKey="day" stroke="#666" />
                        <YAxis stroke="#666" />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            borderRadius: 8,
                            border: '1px solid rgba(0,0,0,0.1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="alarmas" 
                          stroke="#8884d8" 
                          fillOpacity={1} 
                          fill="url(#colorAlarmas)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Additional Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: 400 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Analytics sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Cantidad de Alarmas por Tipo
                    </Typography>
                  </Box>
                  <Box ref={barChartRef} sx={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={Object.entries(getFilteredAlarmTypes()).map(([name, value]) => ({
                        tipo: name,
                        cantidad: value,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis dataKey="tipo" stroke="#666" angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#666" />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            borderRadius: 8,
                            border: '1px solid rgba(0,0,0,0.1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        />
                        <Bar 
                          dataKey="cantidad" 
                          radius={[4, 4, 0, 0]}
                        >
                          {Object.entries(currentReport.summary.alarmTypes).map(([name]) => (
                            <Cell key={name} fill={getAlarmColor(name)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: 400 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Speed sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Alarmas por Hora del Día
                    </Typography>
                  </Box>
                  <Box ref={lineChartRef} sx={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={getAlarmsByHour()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis dataKey="hour" stroke="#666" />
                        <YAxis stroke="#666" />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            borderRadius: 8,
                            border: '1px solid rgba(0,0,0,0.1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="alarmas" 
                          stroke="#f5576c" 
                          strokeWidth={2}
                          dot={{ fill: '#f5576c', strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FilterList sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Filtros Avanzados
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="tipo-alarma-label">Tipo de Alarma</InputLabel>
                    <Select
                      labelId="tipo-alarma-label"
                      multiple
                      value={filters.tipo}
                      onChange={(e) => handleFilterChange('tipo', e.target.value)}
                      input={<OutlinedInput label="Tipo de Alarma" />}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      <MenuItem value="todos">
                        <em>Todos los tipos</em>
                      </MenuItem>
                      <Divider />
                      {Object.keys(currentReport.summary.alarmTypes).map((tipo) => (
                        <MenuItem key={tipo} value={tipo}>
                          {tipo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="patente-label">Patente</InputLabel>
                    <Select
                      labelId="patente-label"
                      value={filters.patente}
                      onChange={(e) => handleFilterChange('patente', e.target.value)}
                      input={<OutlinedInput label="Patente" />}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      <MenuItem value="">Todas las patentes</MenuItem>
                      <MenuItem value={currentReport.vehicle_plate}>{currentReport.vehicle_plate}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Fecha Inicio"
                    type="date"
                    value={filters.fechaInicio}
                    onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Fecha Fin"
                    type="date"
                    value={filters.fechaFin}
                    onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Comentarios"
                    value={filters.comentario}
                    onChange={(e) => handleFilterChange('comentario', e.target.value)}
                    variant="outlined"
                    placeholder="Buscar por palabras clave en comentarios..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <Box sx={{ 
            mb: 3, 
            p: 3, 
            bgcolor: 'background.paper', 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Badge 
              badgeContent={filteredEvents.length} 
              color="primary"
              sx={{ '& .MuiBadge-badge': { fontSize: '1rem', fontWeight: 600 } }}
            >
              <Info sx={{ fontSize: 28, color: 'primary.main' }} />
            </Badge>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Resultados Filtrados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredEvents.length} eventos encontrados
              </Typography>
            </Box>
            {mostFrequent && (
              <Chip
                icon={<TrendingUp />}
                label={`Más frecuente: ${mostFrequent[0]} (${mostFrequent[1]})`}
                color="primary"
                sx={{ ml: 'auto', fontWeight: 600 }}
              />
            )}
          </Box>

          {/* Export Buttons */}
          <Box sx={{ 
            mb: 4, 
            display: 'flex', 
            gap: 2,
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={exportToExcel}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                }
              }}
            >
              Exportar Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={exportToPDF}
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(240, 147, 251, 0.4)',
                }
              }}
            >
              Exportar PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={() => console.log('Guardar en BD')}
              sx={{
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'primary.main',
                  color: 'white',
                }
              }}
            >
              Guardar en BD
            </Button>
          </Box>

          {/* Events Table */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Eventos Filtrados
                </Typography>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Patente</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Conductor</TableCell>
                      <TableCell>Comentarios</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEvents.map((event, index) => (
                      <TableRow key={index} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{event.timestamp}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {event.vehiclePlate}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={event.alarmType}
                            size="small"
                            sx={{
                              bgcolor: getAlarmColor(event.alarmType),
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              px: 1,
                              py: 0.5,
                            }}
                          />
                        </TableCell>
                        <TableCell>{event.driver}</TableCell>
                        <TableCell>
                          <Tooltip title={event.comments || ''}>
                            <span>
                              {event.comments
                                ? event.comments.length > 30
                                  ? `${event.comments.substring(0, 30)}...`
                                  : event.comments
                                : 'Sin comentarios'}
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}

export default Dashboard
