import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { captureChartAsImage, formatTimestamp } from '../components/Dashboard/ExportUtils';
import { applyEnhancedStyles } from '../components/Dashboard/ExcelStyleUtils';

// URL de la API - configurable para desarrollo y producción
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export const exportToExcelBackend = async (
  currentReport: any,
  filteredEvents: any[],
  selectedCompany: string,
  getEventCompanyName: (event: any) => string,
  setModalTitle: (title: string) => void,
  setModalContent: (content: string) => void,
  setModalLoading: (loading: boolean) => void,
  setExportModalOpen: (open: boolean) => void
) => {
  if (!currentReport) return;

  setModalTitle('Exportando a Excel');
  setModalContent('Generando reporte de Excel con formato profesional desde el servidor...');
  setModalLoading(true);
  setExportModalOpen(true);

  try {
    // Preparar los datos para enviar al backend
    const exportData = {
      current_report: currentReport,
      filtered_events: filteredEvents,
      selected_company: selectedCompany
    };

    console.log('Enviando datos al backend para exportación Excel:', {
      reportCount: 1,
      eventCount: filteredEvents.length,
      company: selectedCompany,
      vehicle: currentReport.vehicle_plate
    });

    // Realizar la petición al backend - CORREGIDO: Usar endpoint v2
    const response = await fetch(`${API_BASE_URL}/v1/export/excel/v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exportData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al generar el archivo Excel');
    }

    // Obtener el blob del archivo Excel
    const blob = await response.blob();
    
    // Generar nombre de archivo
    const companySuffix = selectedCompany ? `_${selectedCompany.replace(/\s+/g, '_')}` : '';
    const timestamp = format(new Date(), 'yyyyMMdd_HHmm');
    const filename = `reporte_conducción_${currentReport.vehicle_plate}${companySuffix}_${timestamp}.xlsx`;

    // Crear URL para descarga
    const url = window.URL.createObjectURL(blob);
    
    // Crear enlace temporal para descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Simular clic para iniciar descarga
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setModalLoading(false);
    setModalTitle('Exportación Completada');
    setModalContent(`El reporte de Excel se ha generado exitosamente con ${filteredEvents.length} eventos usando el formato profesional del servidor.`);

  } catch (error) {
    console.error('Error al exportar a Excel desde backend:', error);
    
    setModalLoading(false);
    setModalTitle('Error en Exportación');
    setModalContent(`No se pudo generar el reporte de Excel: ${typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message : 'Error desconocido'}. Por favor, intente nuevamente.`);
  }
};

// Función de fallback para usar el método antiguo si el backend no está disponible
export const exportToExcelFallback = (
  currentReport: any,
  filteredEvents: any[],
  selectedCompany: string,
  getEventCompanyName: (event: any) => string,
  setModalTitle: (title: string) => void,
  setModalContent: (content: string) => void,
  setModalLoading: (loading: boolean) => void,
  setExportModalOpen: (open: boolean) => void
) => {
  setModalTitle('Exportando a Excel (Método Alternativo)');
  setModalContent('Generando reporte de Excel con el método alternativo...');
  setModalLoading(true);
  setExportModalOpen(true);

  // Importar dinámicamente las librerías necesarias
  Promise.all([
    import('xlsx'),
    import('../components/Dashboard/ExportUtils'),
    import('../components/Dashboard/ExcelStyleUtils')
  ]).then(([XLSX, ExportUtils, ExcelStyleUtils]) => {
    const { formatTimestamp } = ExportUtils;
    const { applyEnhancedStyles } = ExcelStyleUtils;
    
    // Crear nuevo workbook
    const workbook = XLSX.utils.book_new();

    // Mapeo de nombres de alarmas
    const alarmNameMapping: Record<string, string> = {
      'cinturon': 'Cinturón de seguridad',
      'distraido': 'Conductor distraído',
      'cruce': 'Cruce de carril',
      'distancia': 'Distancia de seguridad',
      'fatiga': 'Fatiga',
      'frenada': 'Frenada brusca',
      'stop': 'Infracción de señal de stop',
      'telefono': 'Teléfono móvil',
      'boton': 'Botón de Alerta',
      'video': 'Video Solicitado',
    };

    // Hoja de resumen
    const summarySheetData = [
      ['Reporte de Alarmas de Conducción'],
      ['Empresa:', selectedCompany || 'N/A'],
      ['Vehículo:', currentReport.vehicle_plate],
      ['Archivo:', currentReport.file_name],
      ['Fecha de Exportación:', format(new Date(), 'dd/MM/yyyy HH:mm')],
      [],
      ['Resumen de Métricas'],
      ['Métrica', 'Valor'],
      ['Total de Alarmas', currentReport.summary.totalAlarms],
      ['Tipos de Alarma', Object.keys(currentReport.summary.alarmTypes).length],
      ['Eventos Filtrados', filteredEvents.length],
      [],
      ['Resumen por Alarma'],
      ['Tipo de Alarma', 'Valor'],
    ];

    const alarmSummaryData = Object.entries(currentReport.summary.alarmTypes).map(([type, count]) => [
      alarmNameMapping[type.toLowerCase()] || type,
      count,
    ]);

    const finalSummaryData = summarySheetData.concat(alarmSummaryData);
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(finalSummaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen');

    // Hoja de eventos filtrados
    const eventsSheetData = filteredEvents.map((event, index) => [
      index + 1,
      formatTimestamp(event.timestamp),
      event.vehiclePlate,
      alarmNameMapping[event.alarmType.toLowerCase()] || event.alarmType,
      event.driver || 'Sin conductor',
      getEventCompanyName(event),
      event.comments || 'Sin comentarios',
    ]);

    const eventsWorksheet = XLSX.utils.aoa_to_sheet([
      ['#', 'Fecha y Hora', 'Patente', 'Tipo de Alarma', 'Conductor', 'Empresa', 'Comentarios'],
      ...eventsSheetData,
    ]);
    XLSX.utils.book_append_sheet(workbook, eventsWorksheet, 'Eventos Filtrados');

    // Aplicar estilos
    const styledWorkbook = applyEnhancedStyles(workbook);

    // Guardar archivo
    const companySuffix = selectedCompany ? `_${selectedCompany.replace(/\s+/g, '_')}` : '';
    XLSX.writeFile(styledWorkbook, `reporte_conducción_${currentReport.vehicle_plate}${companySuffix}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);

    setModalLoading(false);
    setModalTitle('Exportación Completada');
    setModalContent(`El reporte de Excel se ha generado exitosamente con ${filteredEvents.length} eventos (método alternativo).`);

  }).catch(error => {
    console.error('Error en método alternativo de exportación:', error);
    setModalLoading(false);
    setModalTitle('Error en Exportación');
    setModalContent('No se pudo generar el reporte de Excel con ningún método. Por favor, intente nuevamente.');
  });
};

// Función principal que intenta el método del backend primero y fallback al método antiguo
export const exportToExcel = async (
  currentReport: any,
  filteredEvents: any[],
  selectedCompany: string,
  getEventCompanyName: (event: any) => string,
  setModalTitle: (title: string) => void,
  setModalContent: (content: string) => void,
  setModalLoading: (loading: boolean) => void,
  setExportModalOpen: (open: boolean) => void
) => {
  if (!currentReport) return;

  // Primero intentar con el método del backend
  try {
    await exportToExcelBackend(
      currentReport,
      filteredEvents,
      selectedCompany,
      getEventCompanyName,
      setModalTitle,
      setModalContent,
      setModalLoading,
      setExportModalOpen
    );
  } catch (error) {
    console.warn('Error con método del backend, usando fallback:', error);
    
    // Si falla el método del backend, usar el método alternativo
    exportToExcelFallback(
      currentReport,
      filteredEvents,
      selectedCompany,
      getEventCompanyName,
      setModalTitle,
      setModalContent,
      setModalLoading,
      setExportModalOpen
    );
  }
};

export const exportToPDF = async (
  currentReport: any,
  filteredEvents: any[],
  selectedCompany: string,
  pieChartRef: React.RefObject<HTMLDivElement>,
  areaChartRef: React.RefObject<HTMLDivElement>,
  lineChartRef: React.RefObject<HTMLDivElement>,
  setModalTitle: (title: string) => void,
  setModalContent: (content: string) => void,
  setModalLoading: (loading: boolean) => void,
  setExportModalOpen: (open: boolean) => void
) => {
  if (!currentReport) return;
  
  // Mostrar modal de carga
  setModalTitle('Exportando a PDF');
  setModalContent('Generando reporte PDF con gráficos y datos filtrados...');
  setModalLoading(true);
  setExportModalOpen(true);
  
  try {
    console.log('Iniciando generación de PDF...');
    
    // Importar las librerías dinámicamente
    const [jsPDF] = await Promise.all([
      import('jspdf')
    ]);
    
    const { default: JsPDF } = jsPDF;
    
    // Crear un nuevo documento PDF
    const pdf = new JsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Configurar colores y estilos
    const primaryColor = '#1565C0';
    
    // Función para agregar el logo como marca de agua
    const addWatermark = async () => {
      try {
        // Cargar el logo gris desde la raíz del proyecto
        const logoResponse = await fetch('/west_logo_gris.png');
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob();
          const logoBase64 = await blobToBase64(logoBlob);
          
          // Agregar logo como marca de agua en todas las páginas
          const totalPages = pdf.getNumberOfPages();
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            // Logo con dimensiones proporcionales para mantener proporción original
            // Aumentado tamaño pero manteniendo relación de aspecto (generalmente los logos son más anchos que altos)
            pdf.addImage(logoBase64, 'PNG', 6, 6, 31, 10);
          }
        }
      } catch (error) {
        console.error('Error al cargar el logo como marca de agua:', error);
      }
    };
    
    // Función para convertir blob a base64
    const blobToBase64 = (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };
    
    // Función para agregar el encabezado
    const addHeader = () => {
      // Título principal centrado
      pdf.setFontSize(22);
      pdf.setTextColor(primaryColor);
      pdf.text('Reporte de Alarmas de Conducción', pageWidth / 2, 25, { align: 'center' });
      
      // Salto de línea y alinear a la izquierda la información
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      const infoX = 20;
      let infoY = 40;
      
      pdf.text(`Empresa: ${selectedCompany || 'N/A'}`, infoX, infoY);
      infoY += 8;
      pdf.text(`Vehículo: ${currentReport.vehicle_plate}`, infoX, infoY);
      infoY += 8;
      pdf.text(`Archivo: ${currentReport.file_name}`, infoX, infoY);
      infoY += 8;
      pdf.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, infoX, infoY);
      
      return infoY + 10; // Devolver la posición Y después del encabezado
    };
    
    // Función para agregar el pie de página
    const addFooter = (pageNumber: number, totalPages: number) => {
      const footerY = pageHeight - 15;
      
      // Línea superior del footer
      pdf.setDrawColor(primaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5);
      
      // Texto del footer
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text('West Ingeniería - Reporte de Conducción', 15, footerY);
      pdf.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 30, footerY);
      
      // Información de contacto
      pdf.setFontSize(8);
      pdf.text('Generado por Sistema de Análisis de Alarmas', 15, footerY + 5);
    };
    
    // Función para agregar métricas
    const addMetrics = (yPosition: number) => {
      let currentY = 75;
      // Título de la sección
      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor);
      pdf.text('Resumen de Métricas', 15, currentY);

      pdf.setDrawColor(primaryColor);
      pdf.setLineWidth(0.3);
      pdf.line(15, currentY + 3, pageWidth - 15, currentY + 3);
      
      const tableStartY = yPosition + 10;
      const rowHeight = 8;
      const tableWidth = pageWidth - 30;
      const tableX = 15;
      
      // Encabezados de tabla
      pdf.setFillColor(primaryColor);
      pdf.rect(tableX, tableStartY, tableWidth, rowHeight, 'F');
      
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Métrica', tableX + 5, tableStartY + 5.5);
      pdf.text('Valor', tableX + tableWidth - 25, tableStartY + 5.5);
      
      // Datos de la tabla
      const metricsData = [
        ['Total de Alarmas', currentReport.summary.totalAlarms.toString()],
        ['Tipos de Alarma', Object.keys(currentReport.summary.alarmTypes).length.toString()],
        // Solo incluir Videos Solicitados si es mayor que 0
        ...(currentReport.summary.videosRequested && currentReport.summary.videosRequested > 0 ? 
          [['Vídeos Solicitados', currentReport.summary.videosRequested.toString()]] : []
        ),
        ['Eventos Filtrados', filteredEvents.length.toString()]
      ];
      
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      
      let currentRowY = tableStartY + rowHeight;
      
      metricsData.forEach((row, index) => {
        // Fila alternada
        if (index % 2 === 0) {
          pdf.setFillColor(245, 245, 245);
          pdf.rect(tableX, currentRowY, tableWidth, rowHeight, 'F');
        }
        
        // Borde de la fila
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.1);
        pdf.rect(tableX, currentRowY, tableWidth, rowHeight);
        
        // Contenido de la fila
        pdf.text(row[0], tableX + 5, currentRowY + 5.5);
        pdf.text(row[1], tableX + tableWidth - 25, currentRowY + 5.5);
        
        currentRowY += rowHeight;
      });
      
      return currentRowY + 10;
    };
    
    // Función para agregar gráficos con proporciones correctas y espaciado adecuado
    const addCharts = async (startY: number, isFirstPage: boolean) => {
      let currentY = startY;
      
      // Ajustar posición inicial según sea la primera página o no
      if (!isFirstPage) {
        currentY = Math.max(currentY, 35);
      }
      
      // Título de la sección con subrayado
      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor);
      pdf.text('Análisis Gráfico', 15, currentY);
      
      // Agregar subrayado delgado a lo ancho de la página
      pdf.setDrawColor(primaryColor);
      pdf.setLineWidth(0.3);
      pdf.line(15, currentY + 3, pageWidth - 15, currentY + 3);
      
      currentY += 15;
      
      console.log('Capturando gráficos...');
      console.log('Estado de las referencias:');
      console.log('- pieChartRef:', pieChartRef.current);
      console.log('- areaChartRef:', areaChartRef.current);
      console.log('- lineChartRef:', lineChartRef.current);
      
      // Capturar gráficos como imágenes con sus dimensiones originales
      const pieChartResult = await captureChartAsImage(pieChartRef, 'pie-chart');
      console.log('Gráfico de torta capturado:', pieChartResult.imageData ? 'EXITOSO' : 'FALLÓ');
      
      const areaChartResult = await captureChartAsImage(areaChartRef, 'area-chart');
      console.log('Gráfico de área capturado:', areaChartResult.imageData ? 'EXITOSO' : 'FALLÓ');
      
      const lineChartResult = await captureChartAsImage(lineChartRef, 'line-chart');
      console.log('Gráfico de líneas capturado:', lineChartResult.imageData ? 'EXITOSO' : 'FALLÓ');
      
      // Gráfico de torta
      if (pieChartResult.imageData) {
        console.log('Agregando gráfico de torta al PDF...');
        // Subtítulo destacado con fondo y borde
        pdf.setFillColor(240, 248, 255);
        pdf.setDrawColor(primaryColor);
        pdf.setLineWidth(0.5);
        pdf.rect(15, currentY, pageWidth - 30, 10, 'FD');
        
        pdf.setFontSize(13);
        pdf.setTextColor(primaryColor);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Distribución de Tipos de Alarmas', 20, currentY + 6);
        pdf.setFont('helvetica', 'normal');
        
        currentY += 12;
        
        // Calcular dimensiones manteniendo proporción - AGRANDADO
        const chartWidth = 180;  // Aumentado de 160 a 180 para mejor legibilidad
        const aspectRatio = pieChartResult.height / pieChartResult.width;
        const chartHeight = chartWidth * aspectRatio;
        
        console.log(`Dimensiones gráfico torta: ${chartWidth}x${chartHeight}`);
        console.log(`Datos de imagen: ${pieChartResult.imageData.substring(0, 50)}...`);
        
        // Centrado horizontalmente con margen adecuado
        const centerX = (pageWidth - chartWidth) / 2;
        pdf.addImage(pieChartResult.imageData, 'PNG', centerX, currentY, chartWidth, chartHeight);
        currentY += chartHeight + 20;  // Aumentado espacio después del gráfico
      }
      
      // Verificar si necesitamos nueva página para los próximos dos gráficos
      if (currentY + 320 > pageHeight - 30) {
        pdf.addPage();
        currentY = 35;
      }
      
      // Gráfico de área
      if (areaChartResult.imageData) {
        console.log('Agregando gráfico de área al PDF...');
        // Subtítulo destacado con fondo y borde
        pdf.setFillColor(240, 248, 255);
        pdf.setDrawColor(primaryColor);
        pdf.setLineWidth(0.5);
        pdf.rect(15, currentY, pageWidth - 30, 10, 'FD');
        
        pdf.setFontSize(13);
        pdf.setTextColor(primaryColor);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Evolución Diaria de Eventos', 20, currentY + 6);
        pdf.setFont('helvetica', 'normal');
        
        currentY += 12;
        
        // Calcular dimensiones manteniendo proporción - AGRANDADO
        const chartWidth = 200;  // Reducido de 200 a 190 para mejor centrado
        const aspectRatio = areaChartResult.height / areaChartResult.width;
        const chartHeight = chartWidth * aspectRatio;
        
        console.log(`Dimensiones gráfico área: ${chartWidth}x${chartHeight}`);
        console.log(`Datos de imagen: ${areaChartResult.imageData.substring(0, 50)}...`);
        
        // CORREGIDO: Centrar horizontalmente el gráfico de área en relación a su título
        const areaCenterX = ((pageWidth - chartWidth) / 2)-2;
        pdf.addImage(areaChartResult.imageData, 'PNG', areaCenterX, currentY, chartWidth, chartHeight);
        currentY += chartHeight + 30;  // CORREGIDO: Aumentar espacio entre gráficos
      }
      
      // CORREGIDO: Gráfico de líneas (Alarmas por Hora) justo debajo del gráfico de área
      if (lineChartResult.imageData) {
        console.log('Agregando gráfico de líneas al PDF...');
        // Subtítulo destacado con fondo y borde
        pdf.setFillColor(240, 248, 255);
        pdf.setDrawColor(primaryColor);
        pdf.setLineWidth(0.5);
        pdf.rect(15, currentY, pageWidth - 30, 10, 'FD');
        
        pdf.setFontSize(13);
        pdf.setTextColor(primaryColor);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Alarmas por Hora del Día', 20, currentY + 6);
        pdf.setFont('helvetica', 'normal');
        
        currentY += 12;
        
        // Calcular dimensiones manteniendo proporción - AGRANDADO
        const chartWidth = 205;  // Reducido de 200 a 190 para mejor centrado
        const aspectRatio = lineChartResult.height / lineChartResult.width;
        const chartHeight = chartWidth * aspectRatio;
        
        console.log(`Dimensiones gráfico líneas: ${chartWidth}x${chartHeight}`);
        console.log(`Datos de imagen: ${lineChartResult.imageData.substring(0, 50)}...`);
        
        // CORREGIDO: Centrar horizontalmente el gráfico de líneas en relación a su título
        const lineCenterX = ((pageWidth - chartWidth) / 2)-5; // Ajuste fino para mejor centrado
        pdf.addImage(lineChartResult.imageData, 'PNG', lineCenterX, currentY, chartWidth, chartHeight);
        currentY += chartHeight + 15;
      }
      
      console.log('Gráficos agregados al PDF. Posición final Y:', currentY);
      return currentY;
    };
    
    // Función para agregar tabla de eventos con TODOS los eventos
    const addEventsTable = async (startY: number) => {
      if (filteredEvents.length === 0) return startY;
      
      pdf.setFontSize(12);
      pdf.setTextColor(primaryColor);
      pdf.text('Eventos Filtrados', 15, startY);
      
      const tableStartY = startY + 10;
      const rowHeight = 6;
      // CORREGIDO: Ajustar anchos de columnas - Tipo más ancha, Conductor más angosta
      const colWidths = [25, 35, 50, 20, pageWidth - 130]; // Fechas, Patente, Tipo, Conductor, Comentarios
      
      // Encabezados de tabla
      pdf.setFillColor(primaryColor);
      pdf.rect(15, tableStartY, pageWidth - 30, rowHeight, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Fecha', 17, tableStartY + 4);
      pdf.text('Patente', 52, tableStartY + 4); // Ajustado posición
      pdf.text('Tipo', 97, tableStartY + 4); // Ajustado posición (más a la derecha para más espacio)
      pdf.text('Conductor', 127, tableStartY + 4); // Ajustado posición (más a la izquierda)
      pdf.text('Comentarios', 152, tableStartY + 4); // Ajustado posición
      
      // Contenido de la tabla - MOSTRAR TODOS LOS EVENTOS
      pdf.setTextColor(0, 0, 0);
      let currentY = tableStartY + rowHeight;
      
      // CORREGIDO: Iterar sobre todos los eventos filtrados correctamente
      console.log(`Procesando ${filteredEvents.length} eventos para la tabla del PDF`);
      
      for (let i = 0; i < filteredEvents.length; i++) {
        const event = filteredEvents[i];
        
        // Verificar si necesitamos una nueva página
        if (currentY + rowHeight > pageHeight - 30) {
          pdf.addPage();
          currentY = 35;
          
          // Repetir encabezados de tabla en nueva página
          pdf.setFillColor(primaryColor);
          pdf.rect(15, currentY, pageWidth - 30, rowHeight, 'F');
          
          pdf.setFontSize(10);
          pdf.setTextColor(255, 255, 255);
          pdf.text('Fecha', 17, currentY + 4);
          pdf.text('Patente', 52, currentY + 4);
          pdf.text('Tipo', 87, currentY + 4);
          pdf.text('Conductor', 107, currentY + 4);
          pdf.text('Comentarios', 142, currentY + 4);
          
          currentY += rowHeight;
          pdf.setTextColor(0, 0, 0);
        }
        
        // Fila alternada
        if (i % 2 === 0) {
          pdf.setFillColor(245, 245, 245);
          pdf.rect(15, currentY, pageWidth - 30, rowHeight, 'F');
        }
        
        // Fecha formateada - CORREGIDO: manejar timestamps inválidos
        const formattedDate = formatTimestamp(event.timestamp);
        
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        pdf.text(formattedDate, 17, currentY + 4);
        pdf.text(event.vehiclePlate, 52, currentY + 4); // Ajustado posición
        pdf.text(event.alarmType, 97, currentY + 4); // Ajustado posición (más a la derecha para más espacio)
        
        // Conductor - limitar contenido para que no pase a la siguiente columna
        const driver = event.driver || 'Sin conductor';
        const truncatedDriver = driver.length > 15 ? driver.substring(0, 15) + '...' : driver;
        pdf.text(truncatedDriver, 127, currentY + 4); // Ajustado posición (más a la izquierda)
        
        // Comentarios truncados intencionalmente
        const comments = event.comments || 'Sin comentarios';
        const truncatedComments = comments.length > 25 ? comments.substring(0, 25) + '...' : comments;
        pdf.text(truncatedComments, 152, currentY + 4); // Ajustado posición
        
        // Incrementar currentY para la siguiente fila
        currentY += rowHeight;
      }
      
      console.log(`Tabla completada. Última posición Y: ${currentY}`);
      
      // CORREGIDO: Agregar mensaje de "Mostrando x de y eventos" al final de la tabla
      // Obtener el total de eventos del reporte original
      const totalEventsInReport = currentReport.summary.totalAlarms || 0;
      const filteredEventsCount = filteredEvents.length;
      
      // Agregar espacio antes del mensaje
      currentY += 5;
      
      /* Verificar si necesitamos nueva página para el mensaje
      if (currentY + 10 > pageHeight - 30) {
        pdf.addPage();
        currentY = 35;
      }*/
      
      // Agregar el mensaje en la posición actual
      pdf.setFontSize(8);
      pdf.setTextColor(90);
      pdf.text(`Mostrando ${filteredEventsCount} de ${totalEventsInReport} eventos`, 15, currentY);
      
      console.log(`Mensaje agregado: "Mostrando ${filteredEventsCount} de ${totalEventsInReport} eventos"`);
      
      return currentY + 10; // Devolver la posición después del mensaje
    };
    
    // Generar el PDF
    console.log('Generando PDF...');
    const headerEndY = addHeader();
    
    let currentY = headerEndY;
    
    // Agregar página 1 - Métricas
    currentY = addMetrics(currentY);
    
    // Verificar si necesitamos nueva página para gráficos
    if (currentY + 50 > pageHeight - 30) {
      pdf.addPage();
      currentY = 35;
    }
    
    // Agregar gráficos (primera página)
    currentY = await addCharts(currentY, true);
    
    // Verificar si necesitamos más páginas para la tabla
    if (currentY + 50 > pageHeight - 30) {
      pdf.addPage();
      currentY = 35;
    }
    
    // Agregar tabla de eventos con TODOS los eventos
    currentY = await addEventsTable(currentY);
    
    // Agregar marca de agua a todas las páginas
    await addWatermark();
    
    // Agregar footer a todas las páginas
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(i, totalPages);
    }
    
    // Guardar el PDF
    const companySuffix = selectedCompany ? `_${selectedCompany.replace(/\s+/g, '_')}` : '';
    const fileName = `reporte_conducción_${currentReport.vehicle_plate}${companySuffix}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`;
    pdf.save(fileName);
    
    console.log(`PDF generado exitosamente con todos los ${filteredEvents.length} eventos filtrados`);
    
    // Mostrar modal de éxito
    setModalLoading(false);
    setModalTitle('Exportación Completada');
    setModalContent(`El reporte PDF se ha generado exitosamente con ${filteredEvents.length} eventos.`);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    // Mostrar modal de error
    setModalLoading(false);
    setModalTitle('Error en Exportación');
    setModalContent('No se pudo generar el reporte PDF. Por favor, intente nuevamente.');
  }
};
