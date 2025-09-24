import React, { useState, useCallback, useRef } from 'react'
import { Box, Grid, CircularProgress, Alert, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store/store.ts'
import { uploadExcel, getReports, clearCurrentReport } from '../store/slices/excelSlice.ts'
import { format } from 'date-fns'
import Modal from '../components/ui/Modal.tsx'

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
  
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([])
  
  // Estados para modales
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalContent, setModalContent] = useState('')
  const [modalLoading, setModalLoading] = useState(false)
  
  // Estado para conteo de eventos filtrados
  const [filteredEventsCount, setFilteredEventsCount] = useState(0)
  
  // Función para extraer empresas de los datos del conductor
  const extractCompaniesFromData = () => {
    if (!currentReport) return []
    
    const companies = new Set<string>()
    const validCompanies = ['Bosque Los Lagos', 'TPF', 'Llico']
    
    currentReport.events.forEach(event => {
      if (event.driver) {
        // Buscar empresas entre paréntesis en el nombre del conductor
        const match = event.driver.match(/\(([^)]+)\)/)
        if (match) {
          const company = match[1].trim()
          if (validCompanies.includes(company)) {
            companies.add(company)
          }
        }
      }
    })
    
    return Array.from(companies)
  }
  
  // Actualizar empresas disponibles cuando cambie el reporte
  React.useEffect(() => {
    if (currentReport) {
      const companies = extractCompaniesFromData()
      setAvailableCompanies(companies)
      if (companies.length > 0 && !selectedCompany) {
        setSelectedCompany(companies[0])
      }
    }
  }, [currentReport])
  
  // Actualizar conteo de eventos filtrados cuando cambien los filtros
  React.useEffect(() => {
    if (currentReport) {
      const count = getFilteredEvents().length
      setFilteredEventsCount(count)
    }
  }, [filters, currentReport])

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
      // Parsear el timestamp del evento
      let eventDate: Date | null = null
      try {
        // Parsear el timestamp en formato "14/09/25, 11:38:35"
        const timestampStr = event.timestamp
        const [datePart, timePart] = timestampStr.split(', ')
        const [day, month, year] = datePart.split('/')
        const [hours, minutes, seconds] = timePart.split(':')
        
        // Crear fecha con formato correcto (añadir 2000 al año de 2 dígitos)
        const fullYear = `20${year}`
        eventDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours}:${minutes}:${seconds}`)
      } catch (error) {
        console.error('Error parsing timestamp:', event.timestamp, error)
        return false // Excluir eventos con fechas inválidas
      }
      
      // Comparar fechas
      const fechaInicioValida = !filters.fechaInicio || eventDate >= new Date(filters.fechaInicio)
      const fechaFinValida = !filters.fechaFin || eventDate <= new Date(filters.fechaFin + 'T23:59:59')
      
      return (
        (filters.tipo.length === 0 || filters.tipo.includes(event.alarmType)) &&
        (!filters.patente || event.vehiclePlate.toLowerCase().includes(filters.patente.toLowerCase())) &&
        fechaInicioValida &&
        fechaFinValida &&
        (!filters.comentario || (event.comments && event.comments.toLowerCase().includes(filters.comentario.toLowerCase())))
      )
    })
  }

  const exportToExcel = () => {
    if (!currentReport) return
    
    // Mostrar modal de carga
    setModalTitle('Exportando a Excel')
    setModalContent('Generando reporte de Excel con los datos filtrados...')
    setModalLoading(true)
    setExportModalOpen(true)
    
    // Importación dinámica para evitar errores de compilación
    import('xlsx').then(XLSX => {
      const filteredEvents = getFilteredEvents()
      const workbook = XLSX.utils.book_new()
      
      // 1. Crear hoja de resumen con título y métricas
      const summaryWorksheet = XLSX.utils.aoa_to_sheet([
        // Título principal
        ['Reporte de Alarmas de Conducción'],
        [''],
        // Información del reporte
        ['Empresa:', selectedCompany || 'N/A'],
        ['Vehículo:', currentReport.vehicle_plate],
        ['Archivo:', currentReport.file_name],
        ['Fecha de Exportación:', format(new Date(), 'dd/MM/yyyy HH:mm')],
        [''],
        // Título de la tabla de métricas
        ['Resumen de Métricas'],
        ['Métrica', 'Valor'],
        ['Total de Alarmas', currentReport.summary.totalAlarms],
        ['Tipos de Alarma', Object.keys(currentReport.summary.alarmTypes).length],
        // Solo incluir Videos Solicitados si es mayor que 0
        ...(currentReport.summary.videosRequested && currentReport.summary.videosRequested > 0 ? 
          [['Vídeos Solicitados', currentReport.summary.videosRequested]] : []
        ),
        ['Eventos Filtrados', filteredEvents.length]
      ])
      
      // Configurar anchos de columna para resumen
      summaryWorksheet['!cols'] = [
        { wch: 25 }, // Columna A - Métricas
        { wch: 20 }  // Columna B - Valores
      ]
      
      // Aplicar estilos a hoja de resumen
      const summaryRange = XLSX.utils.decode_range(summaryWorksheet['!ref'] || 'A1')
      
      // Estilo para título principal
      const titleStyle = {
        font: { bold: true, sz: 16, color: { rgb: "1565C0" } },
        alignment: { horizontal: "center" }
      }
      
      // Estilo para encabezados de tabla
      const tableHeaderStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1565C0" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      }
      
      // Estilo para datos de tabla
      const tableDataStyle = {
        font: { color: { rgb: "000000" } },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "E0E0E0" } },
          bottom: { style: "thin", color: { rgb: "E0E0E0" } },
          left: { style: "thin", color: { rgb: "E0E0E0" } },
          right: { style: "thin", color: { rgb: "E0E0E0" } }
        }
      }
      
      // Estilo para etiquetas de información
      const labelStyle = {
        font: { bold: true, color: { rgb: "1565C0" } }
      }
      
      // Aplicar estilos a celdas específicas
      for (let row = summaryRange.s.r; row <= summaryRange.e.r; row++) {
        for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (!summaryWorksheet[cellAddress]) continue
          
          // Título principal (A1)
          if (row === 0 && col === 0) {
            summaryWorksheet[cellAddress].s = titleStyle
          }
          // Etiquetas de información (A4, A5, A6, A7)
          else if ((row === 3 || row === 4 || row === 5 || row === 6) && col === 0) {
            summaryWorksheet[cellAddress].s = labelStyle
          }
          // Encabezados de tabla de métricas (A9, B9)
          else if (row === 8) {
            summaryWorksheet[cellAddress].s = tableHeaderStyle
          }
          // Datos de tabla de métricas (A10 en adelante)
          else if (row >= 9) {
            summaryWorksheet[cellAddress].s = tableDataStyle
          }
        }
      }
      
      // 2. Crear hoja de eventos filtrados
      const excelData = filteredEvents.map((event, index) => {
        // Formatear fecha para mostrar en formato normalizado
        let formattedDate = event.timestamp
        try {
          const timestampStr = event.timestamp
          const [datePart, timePart] = timestampStr.split(', ')
          const [day, month, year] = datePart.split('/')
          const [hours, minutes, seconds] = timePart.split(':')
          const fullYear = `20${year}`
          formattedDate = `${day}/${month}/${fullYear}, ${hours}:${minutes}:${seconds}`
        } catch (error) {
          console.error('Error formateando fecha:', event.timestamp, error)
        }
        
        return {
          '#': index + 1,
          'Fecha y Hora': formattedDate,
          'Patente': event.vehiclePlate,
          'Tipo de Alarma': event.alarmType,
          'Conductor': event.driver || 'Sin conductor',
          'Comentarios': event.comments || 'Sin comentarios'
        }
      })
      
      const eventsWorksheet = XLSX.utils.json_to_sheet(excelData)
      
      // Auto-ajustar anchos de columna al contenido
      const colWidths = [
        Math.max(5, ...['#'].map(s => s.length)), // #
        Math.max(20, ...excelData.map(row => row['Fecha y Hora']?.toString().length || 0)), // Fecha y Hora
        Math.max(15, ...excelData.map(row => row['Patente']?.toString().length || 0)), // Patente
        Math.max(25, ...excelData.map(row => row['Tipo de Alarma']?.toString().length || 0)), // Tipo de Alarma
        Math.max(30, ...excelData.map(row => row['Conductor']?.toString().length || 0)), // Conductor
        Math.max(40, ...excelData.map(row => row['Comentarios']?.toString().length || 0)) // Comentarios
      ]
      
      eventsWorksheet['!cols'] = colWidths.map(wch => ({ wch }))
      
      // Aplicar estilos a hoja de eventos
      const eventsRange = XLSX.utils.decode_range(eventsWorksheet['!ref'] || 'A1')
      
      // Estilo para encabezados de eventos
      const eventsHeaderStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1565C0" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      }
      
      // Estilo para filas de datos de eventos
      const eventsDataStyle = {
        font: { color: { rgb: "000000" } },
        alignment: { horizontal: "left", vertical: "center", wrapText: true },
        border: {
          top: { style: "thin", color: { rgb: "E0E0E0" } },
          bottom: { style: "thin", color: { rgb: "E0E0E0" } },
          left: { style: "thin", color: { rgb: "E0E0E0" } },
          right: { style: "thin", color: { rgb: "E0E0E0" } }
        }
      }
      
      // Estilo para filas alternadas de eventos
      const eventsAltRowStyle = {
        font: { color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "F5F5F5" } },
        alignment: { horizontal: "left", vertical: "center", wrapText: true },
        border: {
          top: { style: "thin", color: { rgb: "E0E0E0" } },
          bottom: { style: "thin", color: { rgb: "E0E0E0" } },
          left: { style: "thin", color: { rgb: "E0E0E0" } },
          right: { style: "thin", color: { rgb: "E0E0E0" } }
        }
      }
      
      // Aplicar estilos a encabezados de eventos
      for (let col = eventsRange.s.c; col <= eventsRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: eventsRange.s.r, c: col })
        if (!eventsWorksheet[cellAddress]) continue
        eventsWorksheet[cellAddress].s = eventsHeaderStyle
      }
      
      // Aplicar estilos a filas de datos de eventos
      for (let row = eventsRange.s.r + 1; row <= eventsRange.e.r; row++) {
        for (let col = eventsRange.s.c; col <= eventsRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (!eventsWorksheet[cellAddress]) continue
          
          // Aplicar estilo alternado para filas pares
          if (row % 2 === 0) {
            eventsWorksheet[cellAddress].s = eventsAltRowStyle
          } else {
            eventsWorksheet[cellAddress].s = eventsDataStyle
          }
        }
        
        // Aplicar colores específicos a la columna "Tipo de Alarma" (columna D, índice 3)
        const alarmTypeCellAddress = XLSX.utils.encode_cell({ r: row, c: 3 })
        if (eventsWorksheet[alarmTypeCellAddress]) {
          const alarmType = eventsWorksheet[alarmTypeCellAddress].v
          const color = getAlarmColor(alarmType)
          
          // Convertir color hex a RGB para Excel
          const hex = color.replace('#', '')
          const r = parseInt(hex.substring(0, 2), 16)
          const g = parseInt(hex.substring(2, 4), 16)
          const b = parseInt(hex.substring(4, 6), 16)
          
          // Crear estilo especial para celdas de tipo de alarma
          eventsWorksheet[alarmTypeCellAddress].s = {
            font: { 
              color: { rgb: "FFFFFF" }, // Texto blanco
              bold: true 
            },
            fill: { 
              fgColor: { rgb: `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}` } 
            },
            alignment: { 
              horizontal: "center", 
              vertical: "center" 
            },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          }
        }
      }
      
      // Agregar hojas al workbook en el orden correcto
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen')
      XLSX.utils.book_append_sheet(workbook, eventsWorksheet, 'Eventos Filtrados')
      
      // Guardar archivo
      const companySuffix = selectedCompany ? `_${selectedCompany.replace(/\s+/g, '_')}` : ''
      XLSX.writeFile(workbook, `reporte_conducción_${currentReport.vehicle_plate}${companySuffix}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`)
      
      // Mostrar modal de éxito
      setModalLoading(false)
      setModalTitle('Exportación Completada')
      setModalContent(`El reporte de Excel se ha generado exitosamente con ${filteredEvents.length} eventos.`)
      
      console.log(`Excel exportado exitosamente con ${filteredEvents.length} eventos`)
    }).catch(error => {
      console.error('Error al exportar a Excel:', error)
      // Mostrar modal de error
      setModalLoading(false)
      setModalTitle('Error en Exportación')
      setModalContent('No se pudo generar el reporte de Excel. Por favor, intente nuevamente.')
    })
  }

  const exportToPDF = async () => {
    if (!currentReport) return
    
    // Mostrar modal de carga
    setModalTitle('Exportando a PDF')
    setModalContent('Generando reporte PDF con gráficos y datos filtrados...')
    setModalLoading(true)
    setExportModalOpen(true)
    
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
              // Logo con dimensiones proporcionales para mantener proporción original
              // Aumentado tamaño pero manteniendo relación de aspecto (generalmente los logos son más anchos que altos)
              pdf.addImage(logoBase64, 'PNG', 6, 6, 31, 10)
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
        // Título principal centrado
        pdf.setFontSize(22)
        pdf.setTextColor(primaryColor)
        pdf.text('Reporte de Alarmas de Conducción', pageWidth / 2, 25, { align: 'center' })
        
        // Salto de línea y alinear a la izquierda la información
        pdf.setFontSize(12)
        pdf.setTextColor(100)
        const infoX = 20
        let infoY = 40
        
        pdf.text(`Empresa: ${selectedCompany || 'N/A'}`, infoX, infoY)
        infoY += 8
        pdf.text(`Vehículo: ${currentReport.vehicle_plate}`, infoX, infoY)
        infoY += 8
        pdf.text(`Archivo: ${currentReport.file_name}`, infoX, infoY)
        infoY += 8
        pdf.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, infoX, infoY)
        
        return infoY + 10 // Devolver la posición Y después del encabezado
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
        let currentY = 75
        // Título de la sección
        pdf.setFontSize(18)
        pdf.setTextColor(primaryColor)
        pdf.text('Resumen de Métricas', 15, currentY)

        pdf.setDrawColor(primaryColor)
        pdf.setLineWidth(0.3)
        pdf.line(15, currentY + 3, pageWidth - 15, currentY + 3)
        
        const tableStartY = yPosition + 10
        const rowHeight = 8
        const tableWidth = pageWidth - 30
        const tableX = 15
        
        // Encabezados de tabla
        pdf.setFillColor(primaryColor)
        pdf.rect(tableX, tableStartY, tableWidth, rowHeight, 'F')
        
        pdf.setFontSize(12)
        pdf.setTextColor(255, 255, 255)
        pdf.text('Métrica', tableX + 5, tableStartY + 5.5)
        pdf.text('Valor', tableX + tableWidth - 25, tableStartY + 5.5)
        
        // Datos de la tabla
        const metricsData = [
          ['Total de Alarmas', currentReport.summary.totalAlarms.toString()],
          ['Tipos de Alarma', Object.keys(currentReport.summary.alarmTypes).length.toString()],
          // Solo incluir Videos Solicitados si es mayor que 0
          ...(currentReport.summary.videosRequested && currentReport.summary.videosRequested > 0 ? 
            [['Vídeos Solicitados', currentReport.summary.videosRequested.toString()]] : []
          ),
          ['Eventos Filtrados', filteredEvents.length.toString()]
        ]
        
        pdf.setFontSize(11)
        pdf.setTextColor(0, 0, 0)
        
        let currentRowY = tableStartY + rowHeight
        
        metricsData.forEach((row, index) => {
          // Fila alternada
          if (index % 2 === 0) {
            pdf.setFillColor(245, 245, 245)
            pdf.rect(tableX, currentRowY, tableWidth, rowHeight, 'F')
          }
          
          // Borde de la fila
          pdf.setDrawColor(200, 200, 200)
          pdf.setLineWidth(0.1)
          pdf.rect(tableX, currentRowY, tableWidth, rowHeight)
          
          // Contenido de la fila
          pdf.text(row[0], tableX + 5, currentRowY + 5.5)
          pdf.text(row[1], tableX + tableWidth - 25, currentRowY + 5.5)
          
          currentRowY += rowHeight
        })
        
        return currentRowY + 10
      }
      
      // Función para agregar gráficos con proporciones correctas y espaciado adecuado
      const addCharts = async (startY: number, isFirstPage: boolean) => {
        let currentY = startY
        
        // Ajustar posición inicial según sea la primera página o no
        if (!isFirstPage) {
          currentY = Math.max(currentY, 35)
        }
        
        // Título de la sección con subrayado
        pdf.setFontSize(18)
        pdf.setTextColor(primaryColor)
        pdf.text('Análisis Gráfico', 15, currentY)
        
        // Agregar subrayado delgado a lo ancho de la página
        pdf.setDrawColor(primaryColor)
        pdf.setLineWidth(0.3)
        pdf.line(15, currentY + 3, pageWidth - 15, currentY + 3)
        
        currentY += 15
        
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
          // Subtítulo destacado con fondo y borde
          pdf.setFillColor(240, 248, 255)
          pdf.setDrawColor(primaryColor)
          pdf.setLineWidth(0.5)
          pdf.rect(15, currentY, pageWidth - 30, 10, 'FD')
          
          pdf.setFontSize(13)
          pdf.setTextColor(primaryColor)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Distribución de Tipos de Alarmas', 20, currentY + 6)
          pdf.setFont('helvetica', 'normal')
          
          currentY += 12
          
          // Calcular dimensiones manteniendo proporción - AGRANDADO
          const chartWidth = 180  // Aumentado de 160 a 180 para mejor legibilidad
          const aspectRatio = pieChartResult.height / pieChartResult.width
          const chartHeight = chartWidth * aspectRatio
          
          console.log(`Dimensiones gráfico torta: ${chartWidth}x${chartHeight}`)
          console.log(`Datos de imagen: ${pieChartResult.imageData.substring(0, 50)}...`)
          
          // Centrado horizontalmente con margen adecuado
          const centerX = (pageWidth - chartWidth) / 2
          pdf.addImage(pieChartResult.imageData, 'PNG', centerX, currentY, chartWidth, chartHeight)
          currentY += chartHeight + 20  // Aumentado espacio después del gráfico
        }
        
        // Verificar si necesitamos nueva página
        if (currentY + 140 > pageHeight - 30) {
          pdf.addPage()
          currentY = 35
        }
        
        // Gráfico de área
        if (areaChartResult.imageData) {
          console.log('Agregando gráfico de área al PDF...')
          // Subtítulo destacado con fondo y borde
          pdf.setFillColor(240, 248, 255)
          pdf.setDrawColor(primaryColor)
          pdf.setLineWidth(0.5)
          pdf.rect(15, currentY, pageWidth - 30, 10, 'FD')
          
          pdf.setFontSize(13)
          pdf.setTextColor(primaryColor)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Evolución Diaria de Eventos', 20, currentY + 6)
          pdf.setFont('helvetica', 'normal')
          
          currentY += 12
          
          // Calcular dimensiones manteniendo proporción - AGRANDADO
          const chartWidth = 180  // Aumentado de 160 a 180 para mejor legibilidad
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
          // Subtítulo destacado con fondo y borde
          pdf.setFillColor(240, 248, 255)
          pdf.setDrawColor(primaryColor)
          pdf.setLineWidth(0.5)
          pdf.rect(15, currentY, pageWidth - 30, 10, 'FD')
          
          pdf.setFontSize(13)
          pdf.setTextColor(primaryColor)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Alarmas por Hora del Día', 20, currentY + 6)
          pdf.setFont('helvetica', 'normal')
          
          currentY += 12
          
          // Calcular dimensiones manteniendo proporción - AGRANDADO
          const chartWidth = 180  // Aumentado de 160 a 180 para mejor legibilidad
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
      const headerEndY = addHeader()
      
      let currentY = headerEndY
      
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
      const companySuffix = selectedCompany ? `_${selectedCompany.replace(/\s+/g, '_')}` : ''
      const fileName = `reporte_conducción_${currentReport.vehicle_plate}${companySuffix}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`
      pdf.save(fileName)
      
      console.log(`PDF generado exitosamente con todos los ${filteredEvents.length} eventos filtrados`)
      
      // Mostrar modal de éxito
      setModalLoading(false)
      setModalTitle('Exportación Completada')
      setModalContent(`El reporte PDF se ha generado exitosamente con ${filteredEvents.length} eventos.`)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      // Mostrar modal de error
      setModalLoading(false)
      setModalTitle('Error en Exportación')
      setModalContent('No se pudo generar el reporte PDF. Por favor, intente nuevamente.')
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
        // Parsear el timestamp en formato "14/09/25, 11:38:35" - mismo método que getFilteredEvents
        const timestampStr = event.timestamp
        const [datePart, timePart] = timestampStr.split(', ')
        const [day, month, year] = datePart.split('/')
        const [hours, minutes, seconds] = timePart.split(':')
        
        // Crear fecha con formato correcto (añadir 2000 al año de 2 dígitos)
        const fullYear = `20${year}`
        const eventDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours}:${minutes}:${seconds}`)
        
        const hour = eventDate.getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      } catch (error) {
        console.error('Error parsing timestamp:', event.timestamp, error)
      }
    })
    
    // Convertir a formato para el gráfico (horarios fijos)
    return Array.from({ length: 24 }, (_, i) => {
      return {
        hour: `${i.toString().padStart(2, '0')}:00`,
        alarmas: hourCounts[i] || 0
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
      bgcolor: 'transparent'
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
            videosRequested={currentReport.summary.videosRequested}
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

          {/* Filters and Results Summary - Side by side */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Filters
                filters={filters}
                alarmTypes={Object.keys(currentReport.summary.alarmTypes)}
                vehiclePlate={currentReport.vehicle_plate}
                onFilterChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ResultsSummary
                filteredEventsCount={filteredEventsCount}
                mostFrequentAlarm={mostFrequent ? { type: mostFrequent[0], count: mostFrequent[1] } : undefined}
                videosRequested={currentReport.summary.videosRequested}
              />
            </Grid>
          </Grid>

          {/* Export Buttons */}
          <ExportButtons
            onExportExcel={exportToExcel}
            onExportPDF={exportToPDF}
            onSaveToDB={() => console.log('Guardar en BD')}
            onRestart={() => {
              // Limpiar el reporte actual y filtros
              dispatch(clearCurrentReport())
              setFilters({
                tipo: [],
                patente: '',
                fechaInicio: '',
                fechaFin: '',
                comentario: '',
              })
              setSelectedCompany('')
              setAvailableCompanies([])
            }}
            selectedCompany={selectedCompany}
            availableCompanies={availableCompanies}
            onCompanyChange={setSelectedCompany}
          />

      {/* Events Table */}
      <EventsTable
        events={filteredEvents}
        getAlarmColor={getAlarmColor}
      />
        </>
      )}
      
      {/* Modales */}
      <Modal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title={modalTitle}
        content={modalContent}
        loading={modalLoading}
      />
      
      <Modal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title={modalTitle}
        content={modalContent}
        loading={modalLoading}
      />
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          mt: 'auto',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          backgroundColor: 'background.paper',
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} West Ingeniería - Sistema de Análisis de Alarmas
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          Todos los derechos reservados
        </Typography>
      </Box>
    </Box>
  )
}

export default Dashboard
