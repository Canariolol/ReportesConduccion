import * as XLSX from 'xlsx';

// Colores corporativos West Ingeniería (ajustados a la referencia)
export const WEST_COLORS = {
  primary: '003366',      // Azul oscuro para títulos
  primaryLight: 'DDEBF7', // Azul claro para fondos de info
  secondary: 'C6E0B4',    // Verde claro para cabecera de métricas
  accent: 'F8CBAD',      // Naranja claro para cabecera de alarmas
  dark: '000000',         // Negro para texto
  white: 'FFFFFF',        // Blanco para texto en cabeceras oscuras
  gray: '808080',         // Gris para bordes
  headerDark: '404040',   // Gris oscuro para cabecera de eventos
};

// Estilos de fuente y celda
export const FONT_STYLES = {
  // Título principal del reporte
  title: {
    font: { name: 'Calibri', sz: 18, bold: true, color: { rgb: WEST_COLORS.primary } },
    alignment: { horizontal: 'center', vertical: 'center' },
  },
  // Bloque de información (Empresa, Vehículo, etc.)
  infoLabel: {
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: WEST_COLORS.dark } },
    fill: { fgColor: { rgb: WEST_COLORS.primaryLight } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
      bottom: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
      left: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
      right: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
    },
  },
  infoValue: {
    font: { name: 'Calibri', sz: 11, color: { rgb: WEST_COLORS.dark } },
    fill: { fgColor: { rgb: WEST_COLORS.primaryLight } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
      bottom: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
      left: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
      right: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
    },
  },
  // Títulos de las tablas de resumen
  subtitle: {
    font: { name: 'Calibri', sz: 12, bold: true, color: { rgb: WEST_COLORS.primary } },
    alignment: { horizontal: 'left', vertical: 'center' },
  },
  // Cabecera de la tabla de Métricas
  metricsHeader: {
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: WEST_COLORS.dark } },
    fill: { fgColor: { rgb: WEST_COLORS.secondary } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
        top: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
        bottom: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
        left: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
        right: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
    },
  },
  // Cabecera de la tabla de Resumen por Alarma
  alarmsHeader: {
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: WEST_COLORS.dark } },
    fill: { fgColor: { rgb: WEST_COLORS.accent } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
        top: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
        bottom: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
        left: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
        right: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
    },
  },
  // Estilo para los datos de las tablas de resumen
  data: {
    font: { name: 'Calibri', sz: 11, color: { rgb: WEST_COLORS.dark } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
        top: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
        bottom: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
        left: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
        right: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
    },
  },
  dataCenter: {
    font: { name: 'Calibri', sz: 11, color: { rgb: WEST_COLORS.dark } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
        top: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
        bottom: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
        left: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
        right: { style: 'thin', color: { rgb: WEST_COLORS.gray } },
    },
  },
  // Cabecera de la tabla de Eventos
  eventsHeader: {
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: WEST_COLORS.white } },
    fill: { fgColor: { rgb: WEST_COLORS.headerDark } },
    alignment: { horizontal: 'center', vertical: 'center' },
  },
};

// Función principal para aplicar estilos a todo el libro
export const applyEnhancedStyles = (workbook: XLSX.WorkBook) => {
  if (workbook.Sheets['Resumen']) {
    styleSummarySheet(workbook.Sheets['Resumen']);
  }
  if (workbook.Sheets['Eventos Filtrados']) {
    styleEventsSheet(workbook.Sheets['Eventos Filtrados']);
  }
  return workbook;
};

// Estilos para la hoja "Resumen"
const styleSummarySheet = (worksheet: XLSX.WorkSheet) => {
  // Verificar que la hoja existe
  if (!worksheet) return;

  // Ancho de columnas
  worksheet['!cols'] = [{ wch: 25 }, { wch: 40 }];

  // Función segura para aplicar estilos a celdas
  const applyCellStyle = (cellRef: string, style: any) => {
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = style;
    }
  };

  // Título principal
  applyCellStyle('A1', FONT_STYLES.title);
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });

  // Bloque de información (filas 2-5)
  for (let i = 2; i <= 5; i++) {
    applyCellStyle(`A${i}`, FONT_STYLES.infoLabel);
    applyCellStyle(`B${i}`, FONT_STYLES.infoValue);
  }

  // Subtítulo "Resumen de Métricas" (fila 7)
  applyCellStyle('A7', FONT_STYLES.subtitle);

  // Tabla de Métricas (fila 8 cabecera, filas 9-11 datos)
  applyCellStyle('A8', FONT_STYLES.metricsHeader);
  applyCellStyle('B8', FONT_STYLES.metricsHeader);
  for (let i = 9; i <= 11; i++) {
    applyCellStyle(`A${i}`, FONT_STYLES.data);
    applyCellStyle(`B${i}`, FONT_STYLES.dataCenter);
  }

  // Subtítulo "Resumen por Alarma" (fila 13)
  applyCellStyle('A13', FONT_STYLES.subtitle);

  // Tabla de Resumen por Alarma (fila 14 cabecera, filas siguientes datos)
  applyCellStyle('A14', FONT_STYLES.alarmsHeader);
  applyCellStyle('B14', FONT_STYLES.alarmsHeader);
  
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let row = 14; row <= range.e.r; row++) {
    applyCellStyle(`A${row + 1}`, FONT_STYLES.data);
    applyCellStyle(`B${row + 1}`, FONT_STYLES.dataCenter);
  }
};

// Estilos para la hoja "Eventos Filtrados"
const styleEventsSheet = (worksheet: XLSX.WorkSheet) => {
  // Verificar que la hoja existe
  if (!worksheet) return;

  // Ancho de columnas
  worksheet['!cols'] = [
    { wch: 20 }, // Fecha y Hora
    { wch: 15 }, // Patente
    { wch: 25 }, // Tipo de Alarma
    { wch: 30 }, // Conductor
    { wch: 30 }, // Empresa
    { wch: 50 }, // Comentarios
  ];

  // Función segura para aplicar estilos a celdas
  const applyCellStyle = (cellRef: string, style: any) => {
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = style;
    }
  };

  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  // Estilo del encabezado
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    applyCellStyle(cellAddress, FONT_STYLES.eventsHeader);
  }

  // Estilo de las filas de datos (solo bordes y alineación)
  for (let row = 1; row <= range.e.r; row++) {
    for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        applyCellStyle(cellAddress, FONT_STYLES.data);
    }
  }
};
