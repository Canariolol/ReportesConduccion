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
  // Ancho de columnas
  worksheet['!cols'] = [{ wch: 25 }, { wch: 40 }];

  // Título principal
  worksheet['A1'].s = FONT_STYLES.title;
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });

  // Bloque de información
  for (let i = 2; i <= 5; i++) {
    worksheet[`A${i}`].s = FONT_STYLES.infoLabel;
    worksheet[`B${i}`].s = FONT_STYLES.infoValue;
  }

  // Subtítulo "Resumen de Métricas"
  worksheet['A7'].s = FONT_STYLES.subtitle;

  // Tabla de Métricas
  worksheet['A8'].s = FONT_STYLES.metricsHeader;
  worksheet['B8'].s = FONT_STYLES.metricsHeader;
  for (let i = 9; i <= 11; i++) {
    worksheet[`A${i}`].s = FONT_STYLES.data;
    worksheet[`B${i}`].s = FONT_STYLES.dataCenter;
  }

  // Subtítulo "Resumen por Alarma"
  worksheet['A13'].s = FONT_STYLES.subtitle;

  // Tabla de Resumen por Alarma
  worksheet['A14'].s = FONT_STYLES.alarmsHeader;
  worksheet['B14'].s = FONT_STYLES.alarmsHeader;
  
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let row = 14; row <= range.e.r; row++) {
    if (worksheet[`A${row + 1}`]) {
        worksheet[`A${row + 1}`].s = FONT_STYLES.data;
    }
    if (worksheet[`B${row + 1}`]) {
        worksheet[`B${row + 1}`].s = FONT_STYLES.dataCenter;
    }
  }
};

// Estilos para la hoja "Eventos Filtrados"
const styleEventsSheet = (worksheet: XLSX.WorkSheet) => {
  // Ancho de columnas
  worksheet['!cols'] = [
    { wch: 20 }, // Fecha y Hora
    { wch: 15 }, // Patente
    { wch: 25 }, // Tipo de Alarma
    { wch: 30 }, // Conductor
    { wch: 30 }, // Empresa
    { wch: 50 }, // Comentarios
  ];

  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  // Estilo del encabezado
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = FONT_STYLES.eventsHeader;
    }
  }

  // Estilo de las filas de datos (solo bordes y alineación)
  for (let row = 1; row <= range.e.r; row++) {
    for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = FONT_STYLES.data;
        }
    }
  }
};