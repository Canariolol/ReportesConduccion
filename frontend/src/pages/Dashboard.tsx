import React, { useState, useCallback, useRef } from 'react'
import { Box, Grid, CircularProgress, Alert } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store/store.ts'
import { uploadExcel, getReports, clearCurrentReport } from '../store/slices/excelSlice.ts'
import { format } from 'date-fns'

// Componentes especializados
import Header from '../components/Dashboard/Header.tsx'
import UploadSection from '../components/Dashboard/UploadSection.tsx'
import MetricsCards from '../components/Dashboard/MetricsCards.tsx'
import PieChartComponent from '../components/Dashboard/PieChart.tsx'
import AreaChartComponent from '../components/Dashboard/AreaChart.tsx'
import LineChartComponent from '../components/Dashboard/LineChart.tsx'
import Filters from '../components/Dashboard/Filters.tsx'
import ResultsSummary from '../components/Dashboard/ResultsSummary.tsx'
import ExportButtons from '../components/Dashboard/ExportButtons.tsx'
import EventsTable from '../components/Dashboard/EventsTable.tsx'

// Utilidades de exportación
import { captureChartAsImage, getAlarmColor, formatTimestamp } from '../components/Dashboard/ExportUtils.tsx'

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

  const exportToPDF = async () => {
    if (!currentReport) return
    
    try {
      console.log('Iniciando generación de PDF...')
      
      // Importar las librerías dinámicamente
      const [jsPDF] = await Promise.all([
        import('jspdf')
      ])
      
      const { default: JsPDF } = jsPDF
      
      // Crear un nuevo documento PDF
      const pdf = new JsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Configurar colores y estilos
      const primaryColor = '#1565C0'
      
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
        if (!isFirstPage) {
          currentY = Math.max(currentY, 35)
        }
        
        // Título de la sección
        pdf.setFontSize(16)
        pdf.setTextColor(primaryColor)
        pdf.text('Análisis Gráfico', 15, currentY)
        currentY += 20
        
        console.log('Capturando gráficos...')
        console.log('Estado de las referencias:')
        console.log('- pieChartRef:', pieChartRef.current)
        console.log('- areaChartRef:', areaChartRef.current)
        console.log('- lineChartRef:', lineChartRef.current)
        
        // Capturar gráficos como imágenes con sus dimensiones originales
        const pieChartResult = await captureChartAsImage(pieChartRef, 'pie-chart')
        console.log('Gráfico de torta capturado:', pieChartResult.imageData ? 'EXITOSO' : 'FALLÓ')
        
        const areaChartResult = await captureChartAsImage(areaChartRef, 'area-chart')
        console.log('Gráfico de área capturado:', areaChartResult.imageData ? 'EXITOSO' : 'FALLÓ')
        
        const lineChartResult = await captureChartAsImage(lineChartRef, 'line-chart')
        console.log('Gráfico de líneas capturado:', lineChartResult.imageData ? 'EXITOSO' : 'FALLÓ')
        
        // Gráfico de torta
        if (pieChartResult.imageData) {
          console.log('Agregando gráfico de torta al PDF...')
          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)
          pdf.text('Distribución de Tipos de Alarmas', 15, currentY)
          currentY += 8
          
          // Calcular dimensiones manteniendo proporción
          const chartWidth = 120
          const aspectRatio = pieChartResult.height / pieChartResult.width
          const chartHeight = chartWidth * aspectRatio
          
          console.log(`Dimensiones gráfico torta: ${chartWidth}x${chartHeight}`)
          console.log(`Datos de imagen: ${pieChartResult.imageData.substring(0, 50)}...`)
          
          // Alineado a la izquierda con margen de 20mm
          pdf.addImage(pieChartResult.imageData, 'PNG', 20, currentY, chartWidth, chartHeight)
          currentY += chartHeight + 15
        }
        
        // Verificar si necesitamos nueva página
        if (currentY + 140 > pageHeight - 30) {
          pdf.addPage()
          currentY = 35
        }
        
        // Gráfico de área
        if (areaChartResult.imageData) {
          console.log('Agregando gráfico de área al PDF...')
          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)
          pdf.text('Evolución Diaria de Eventos', 15, currentY)
          currentY += 8
          
          // Calcular dimensiones manteniendo proporción
          const chartWidth = 160
          const aspectRatio = areaChartResult.height / areaChartResult.width
          const chartHeight = chartWidth * aspectRatio
          
          console.log(`Dimensiones gráfico área: ${chartWidth}x${chartHeight}`)
          console.log(`Datos de imagen: ${areaChartResult.imageData.substring(0, 50)}...`)
          
          pdf.addImage(areaChartResult.imageData, 'PNG', 25, currentY, chartWidth, chartHeight)
          currentY += chartHeight + 15
        }
        
        // Verificar si necesitamos nueva página
        if (currentY + 140 > pageHeight - 30) {
          pdf.addPage()
          currentY = 35
        }
        
        // Gráfico de líneas
        if (lineChartResult.imageData) {
          console.log('Agregando gráfico de líneas al PDF...')
          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)
          pdf.text('Alarmas por Hora del Día', 15, currentY)
          currentY += 8
          
          // Calcular dimensiones manteniendo proporción
          const chartWidth = 160
          const aspectRatio = lineChartResult.height / lineChartResult.width
          const chartHeight = chartWidth * aspectRatio
          
          console.log(`Dimensiones gráfico líneas: ${chartWidth}x${chartHeight}`)
          console.log(`Datos de imagen: ${lineChartResult.imageData.substring(0, 50)}...`)
          
          pdf.addImage(lineChartResult.imageData, 'PNG', 25, currentY, chartWidth, chartHeight)
          currentY += chartHeight + 15
        }
        
        console.log('Gráficos agregados al PDF. Posición final Y:', currentY)
        return currentY
      }
      
      // Función para agregar tabla de eventos con TODOS los eventos
      const addEventsTable = async (startY: number) => {
        if (filteredEvents.length === 0) return startY
        
        pdf.setFontSize(12)
        pdf.setTextColor(primaryColor)
        pdf.text('Eventos Filtrados', 15, startY)
        
        const tableStartY = startY + 10
        const rowHeight = 6
        // CORREGIDO: Ajustar anchos de columnas - Conductor más angosta, limitar contenido
        const colWidths = [25, 35, 40, 30, pageWidth - 130] // Fechas, Patente, Tipo, Conductor, Comentarios
        
        // Encabezados de tabla
        pdf.setFillColor(primaryColor)
        pdf.rect(15, tableStartY, pageWidth - 30, rowHeight, 'F')
        
        pdf.setFontSize(10)
        pdf.setTextColor(255, 255, 255)
        pdf.text('Fecha', 17, tableStartY + 4)
        pdf.text('Patente', 52, tableStartY + 4) // Ajustado posición
        pdf.text('Tipo', 87, tableStartY + 4) // Ajustado posición
        pdf.text('Conductor', 122, tableStartY + 4) // Ajustado posición (más a la izquierda)
        pdf.text('Comentarios', 152, tableStartY + 4) // Ajustado posición
        
        // Contenido de la tabla - MOSTRAR TODOS LOS EVENTOS
        pdf.setTextColor(0, 0, 0)
        let currentY = tableStartY + rowHeight
        
        // CORREGIDO: Iterar sobre todos los eventos filtrados correctamente
        console.log(`Procesando ${filteredEvents.length} eventos para la tabla del PDF`)
        
        for (let i = 0; i < filteredEvents.length; i++) {
          const event = filteredEvents[i]
          
          // Verificar si necesitamos una nueva página
          if (currentY + rowHeight > pageHeight - 30) {
            pdf.addPage()
            currentY = 35
            
            // Repetir encabezados de tabla en nueva página
            pdf.setFillColor(primaryColor)
            pdf.rect(15, currentY, pageWidth - 30, rowHeight, 'F')
            
            pdf.setFontSize(10)
            pdf.setTextColor(255, 255, 255)
            pdf.text('Fecha', 17, currentY + 4)
            pdf.text('Patente', 52, currentY + 4)
            pdf.text('Tipo', 87, currentY + 4)
            pdf.text('Conductor', 122, currentY + 4)
            pdf.text('Comentarios', 152, currentY + 4)
            
            currentY += rowHeight
            pdf.setTextColor(0, 0, 0)
          }
          
          // Fila alternada
          if (i % 2 === 0) {
            pdf.setFillColor(245, 245, 245)
            pdf.rect(15, currentY, pageWidth - 30, rowHeight, 'F')
          }
          
          // Fecha formateada - CORREGIDO: manejar timestamps inválidos
          const formattedDate = formatTimestamp(event.timestamp)
          
          pdf.setFontSize(8)
          pdf.setTextColor(0, 0, 0)
          pdf.text(formattedDate, 17, currentY + 4)
          pdf.text(event.vehiclePlate, 52, currentY + 4) // Ajustado posición
          pdf.text(event.alarmType, 87, currentY + 4) // Ajustado posición
          
          // Conductor - limitar contenido para que no pase a la siguiente columna
          const driver = event.driver || 'Sin conductor'
          const truncatedDriver = driver.length > 15 ? driver.substring(0, 15) + '...' : driver
          pdf.text(truncatedDriver, 122, currentY + 4) // Ajustado posición
          
          // Comentarios truncados intencionalmente
          const comments = event.comments || 'Sin comentarios'
          const truncatedComments = comments.length > 25 ? comments.substring(0, 25) + '...' : comments
          pdf.text(truncatedComments, 152, currentY + 4) // Ajustado posición
          
          // Incrementar currentY para la siguiente fila
          currentY += rowHeight
        }
        
        console.log(`Tabla completada. Última posición Y: ${currentY}`)
        
        return currentY
      }
      
      // Generar el PDF
      console.log('Generando PDF...')
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
      
      // Agregar tabla de eventos con TODOS los eventos
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
      const fileName = `reporte_conducción_${currentReport.vehicle_plate}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`
      pdf.save(fileName)
      
      console.log(`PDF generado exitosamente con todos los ${filteredEvents.length} eventos filtrados`)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el PDF. Por favor, intente nuevamente.')
    }
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
        // Parsear el timestamp en formato "14/09/25, 11:38:35"
        const timestampStr = event.timestamp
        const [datePart, timePart] = timestampStr.split(', ')
        const [day, month, year] = datePart.split('/')
        const [hours, minutes, seconds] = timePart.split(':')
        
        // Crear fecha con formato correcto (añadir 2000 al año de 2 dígitos)
        const fullYear = `20${year}`
        const dateKey = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        
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

  const mostFrequent = Object.entries(mostFrequentType).sort(([,a], [,b]) => b - a)[0]

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Header */}
      <Header 
        title="🚛 Reportes de Conducción"
        subtitle="West Ingeniería - Sistema de Análisis de Alarmas"
      />

      {/* Upload Section */}
      <UploadSection onUpload={() => {}} />

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
          <MetricsCards
            totalAlarms={currentReport.summary.totalAlarms}
            alarmTypesCount={Object.keys(currentReport.summary.alarmTypes).length}
            vehiclePlate={currentReport.vehicle_plate}
            fileName={currentReport.file_name}
          />

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
            <Grid item xs={12} md={10}>
              <PieChartComponent
                ref={pieChartRef}
                data={Object.entries(getFilteredAlarmTypes()).map(([name, value]) => ({
                  name,
                  value,
                }))}
                getAlarmColor={getAlarmColor}
              />
            </Grid>
          </Grid>

          {/* Additional Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <AreaChartComponent
                ref={areaChartRef}
                data={getFilteredDailyEvolution().labels.map((label, index) => ({
                  day: label,
                  alarmas: getFilteredDailyEvolution().data[index],
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LineChartComponent
                ref={lineChartRef}
                data={getAlarmsByHour()}
              />
            </Grid>
          </Grid>

          {/* Filters */}
          <Filters
            filters={filters}
            alarmTypes={Object.keys(currentReport.summary.alarmTypes)}
            vehiclePlate={currentReport.vehicle_plate}
            onFilterChange={handleFilterChange}
          />

          {/* Results Summary */}
          <ResultsSummary
            filteredEventsCount={filteredEvents.length}
            mostFrequentAlarm={mostFrequent ? { type: mostFrequent[0], count: mostFrequent[1] } : undefined}
          />

          {/* Export Buttons */}
          <ExportButtons
            onExportExcel={exportToExcel}
            onExportPDF={exportToPDF}
            onSaveToDB={() => console.log('Guardar en BD')}
          />

          {/* Events Table */}
          <EventsTable
            events={filteredEvents}
            getAlarmColor={getAlarmColor}
          />
        </>
      )}
    </Box>
  )
}

export default Dashboard
