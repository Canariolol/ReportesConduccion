import * as XLSX from 'xlsx'

// Colores corporativos West Ingeniería
export const WEST_COLORS = {
  primary: '#1565C0',
  primaryLight: '#E3F2FD',
  secondary: '#2E7D32',
  secondaryLight: '#E8F5E9',
  accent: '#FF6F00',
  accentLight: '#FFF3E0',
  dark: '#263238',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#757575',
  lightGray: '#E0E0E0'
}

// Tipografía corporativa
export const FONT_STYLES = {
  title: {
    font: { bold: true, sz: 16, color: { rgb: "1565C0" } },
    alignment: { horizontal: "center", vertical: "center" }
  },
  subtitle: {
    font: { bold: true, sz: 14, color: { rgb: "1565C0" } },
    alignment: { horizontal: "left", vertical: "center" }
  },
  header: {
    font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "1565C0" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "1565C0" } },
      bottom: { style: "thin", color: { rgb: "1565C0" } },
      left: { style: "thin", color: { rgb: "1565C0" } },
      right: { style: "thin", color: { rgb: "1565C0" } }
    }
  },
  headerAlt: {
    font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "2E7D32" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "2E7D32" } },
      bottom: { style: "thin", color: { rgb: "2E7D32" } },
      left: { style: "thin", color: { rgb: "2E7D32" } },
      right: { style: "thin", color: { rgb: "2E7D32" } }
    }
  },
  data: {
    font: { sz: 10, color: { rgb: "000000" } },
    alignment: { horizontal: "left", vertical: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: "E0E0E0" } },
      bottom: { style: "thin", color: { rgb: "E0E0E0" } },
      left: { style: "thin", color: { rgb: "E0E0E0" } },
      right: { style: "thin", color: { rgb: "E0E0E0" } }
    }
  },
  dataAlt: {
    font: { sz: 10, color: { rgb: "000000" } },
    fill: { fgColor: { rgb: "F5F5F5" } },
    alignment: { horizontal: "left", vertical: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: "E0E0E0" } },
      bottom: { style: "thin", color: { rgb: "E0E0E0" } },
      left: { style: "thin", color: { rgb: "E0E0E0" } },
      right: { style: "thin", color: { rgb: "E0E0E0" } }
    }
  },
  metricLabel: {
    font: { bold: true, sz: 11, color: { rgb: "1565C0" } },
    alignment: { horizontal: "left", vertical: "center" }
  },
  metricValue: {
    font: { sz: 11, color: { rgb: "000000" } },
    alignment: { horizontal: "right", vertical: "center" }
  },
  infoLabel: {
    font: { bold: true, sz: 11, color: { rgb: "757575" } },
    alignment: { horizontal: "left", vertical: "center" }
  },
  infoValue: {
    font: { sz: 11, color: { rgb: "000000" } },
    alignment: { horizontal: "left", vertical: "center" }
  }
}

// Función para aplicar estilos mejorados a las hojas de Excel
export const applyEnhancedStyles = (workbook: XLSX.WorkBook) => {
  // Hoja de Resumen
  if (workbook.Sheets['Resumen']) {
    styleSummarySheet(workbook.Sheets['Resumen'])
  }
  
  // Hoja de Eventos Filtrados
  if (workbook.Sheets['Eventos Filtrados']) {
    styleEventsSheet(workbook.Sheets['Eventos Filtrados'])
  }
  
  return workbook
}

// Estilizar hoja de resumen
const styleSummarySheet = (worksheet: XLSX.WorkSheet) => {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (!worksheet[cellAddress]) continue
      
      // Título principal (A1)
      if (row === 0 && col === 0) {
        worksheet[cellAddress].s = FONT_STYLES.title
      }
      // Subtítulo de sección (A8)
      else if (row === 7 && col === 0 && worksheet[cellAddress].v === 'Resumen de Métricas') {
        worksheet[cellAddress].s = FONT_STYLES.subtitle
      }
      // Encabezados de tabla (A8, B8)
      else if (row === 7 && (col === 0 || col === 1)) {
        worksheet[cellAddress].s = FONT_STYLES.header
      }
      // Etiquetas de información (A4-A7)
      else if (row >= 3 && row <= 6 && col === 0) {
        worksheet[cellAddress].s = FONT_STYLES.infoLabel
      }
      // Valores de información (B4-B7)
      else if (row >= 3 && row <= 6 && col === 1) {
        worksheet[cellAddress].s = FONT_STYLES.infoValue
      }
      // Etiquetas de métricas (A9 en adelante)
      else if (row >= 8 && col === 0) {
        worksheet[cellAddress].s = FONT_STYLES.metricLabel
      }
      // Valores de métricas (B9 en adelante)
      else if (row >= 8 && col === 1) {
        worksheet[cellAddress].s = FONT_STYLES.metricValue
      }
    }
  }
  
  // Configurar anchos de columna
  worksheet['!cols'] = [
    { wch: 35 }, // Columna A - Métricas/Información
    { wch: 25 }  // Columna B - Valores
  ]
}

// Estilizar hoja de eventos
const styleEventsSheet = (worksheet: XLSX.WorkSheet) => {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (!worksheet[cellAddress]) continue
      
      // Encabezados de tabla (primera fila)
      if (row === 0) {
        worksheet[cellAddress].s = FONT_STYLES.header
      }
      // Filas de datos
      else if (row >= 1) {
        // Aplicar estilo alternado para filas pares
        if (row % 2 === 0) {
          worksheet[cellAddress].s = FONT_STYLES.dataAlt
        } else {
          worksheet[cellAddress].s = FONT_STYLES.data
        }
      }
      
      // Aplicar colores específicos a la columna "Tipo de Alarma" (columna D, índice 3)
      if (row >= 1 && col === 3) {
        const alarmType = worksheet[cellAddress].v
        const color = getAlarmColor(alarmType)
        
        // Convertir color hex a RGB para Excel
        const hex = color.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        
        // Crear estilo especial para celdas de tipo de alarma
        worksheet[cellAddress].s = {
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
  }
  
  // Auto-ajustar anchos de columna al contenido
  const colWidths = [
    { wch: 8 },   // # - columna estrecha
    { wch: 20 },  // Fecha y Hora
    { wch: 15 },  // Patente
    { wch: 25 },  // Tipo de Alarma
    { wch: 30 },  // Conductor
    { wch: 40 },  // Empresa
    { wch: 40 }   // Comentarios
  ]
  
  worksheet['!cols'] = colWidths
}

// Función para obtener color según tipo de alarma (misma que en el dashboard)
const getAlarmColor = (alarmType: string): string => {
  const colors: Record<string, string> = {
    'Exceso de Velocidad': '#F44336',
    'Frenada Brusca': '#FF9800',
    'Aceleración Brusca': '#4CAF50',
    'Giro Brusco': '#2196F3',
    'Cambio de Carril': '#9C27B0',
    'Conducción Distraída': '#795548',
    'Fatiga': '#607D8B',
    'Distancia de Seguimiento': '#E91E63'
  }
  
  return colors[alarmType] || '#757575'
}

// Función para crear una hoja con diseño mejorado
export const createEnhancedWorksheet = (data: any[][], title: string, headers: string[]) => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    [title], // Título principal
    [''], // Espacio
    headers, // Encabezados
    ...data // Datos
  ])
  
  return worksheet
}

// Función para agregar una tabla de métricas con diseño mejorado
export const addEnhancedMetricsTable = (worksheet: XLSX.WorkSheet, metrics: [string, string][], startRow: number) => {
  const headers = ['Métrica', 'Valor']
  
  // Agregar encabezados
  headers.forEach((header, col) => {
    const cellAddress = XLSX.utils.encode_cell({ r: startRow, c: col })
    worksheet[cellAddress] = { v: header, s: FONT_STYLES.header }
  })
  
  // Agregar datos
  metrics.forEach((metric, row) => {
    const metricCellAddress = XLSX.utils.encode_cell({ r: startRow + 1 + row, c: 0 })
    const valueCellAddress = XLSX.utils.encode_cell({ r: startRow + 1 + row, c: 1 })
    
    worksheet[metricCellAddress] = { v: metric[0], s: FONT_STYLES.metricLabel }
    worksheet[valueCellAddress] = { v: metric[1], s: FONT_STYLES.metricValue }
  })
  
  return startRow + 1 + metrics.length + 1 // Devolver la siguiente fila disponible
}
