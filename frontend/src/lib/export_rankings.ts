import jsPDF from 'jspdf';
import { captureRankingAsImage } from '../components/Dashboard/ExportUtils';
import { formatSantiagoDateTime, formatSantiagoTimestampForFile } from './export';

// CONFIGURACIÓN DE ZOOM PARA RANKINGS
// Modifica este valor para ajustar el zoom de las imágenes de los rankings en el PDF
// Valores recomendados: 1.0 (tamaño original), 1.3 (zoom moderado), 1.5 (zoom alto)
const RANKING_ZOOM_FACTOR = 1.8;

// Función optimizada para exportar rankings a PDF con un ranking por página
export const exportRankingsToPDFOptimized = async (
  rankingsData: any,
  companyName: string,
  fileName: string,
  countByMode: 'truck' | 'driver',
  setModalTitle: (title: string) => void,
  setModalContent: (content: string) => void,
  setModalLoading: (loading: boolean) => void,
  setExportModalOpen: (open: boolean) => void,
  topAlarmsRef?: React.RefObject<HTMLDivElement>,
  allAlarmsRef?: React.RefObject<HTMLDivElement>,
  bestPerformersRef?: React.RefObject<HTMLDivElement>
) => {
  // Mostrar modal de carga
  setModalTitle('Exportando Rankings a PDF');
  setModalContent('Generando reporte PDF de rankings con capturas automáticas...');
  setModalLoading(true);
  setExportModalOpen(true);
  
  try {
    console.log('Iniciando generación de PDF de rankings optimizado...');
    
    // Crear un nuevo documento PDF con orientación horizontal para todas las páginas
    const pdf = new jsPDF('l', 'mm', 'a4');
    let pageWidth = pdf.internal.pageSize.getWidth();
    let pageHeight = pdf.internal.pageSize.getHeight();
    
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
    
    // Función para agregar la página de introducción
    const addIntroductionPage = () => {
      // Título principal centrado
      pdf.setFontSize(24);
      pdf.setTextColor(primaryColor);
      pdf.text('Rankings de Eventos de Conducción', pageWidth / 2, 30, { align: 'center' });
      
      // Salto de línea y alinear a la izquierda la información
      pdf.setFontSize(14);
      pdf.setTextColor(100);
      const infoX = 30;
      let infoY = 50;
      
      pdf.text(`Empresa: ${companyName || 'N/A'}`, infoX, infoY);
      infoY += 10;
      
      // Calcular cantidad de vehículos únicos
      const uniqueVehicles = new Set([
        ...rankingsData.topAlarms.map((item: any) => item.name),
        ...rankingsData.bestPerformers.map((item: any) => item.name)
      ]).size;
      pdf.text(`Cantidad de Vehículos: ${uniqueVehicles}`, infoX, infoY);
      infoY += 10;
      
      pdf.text(`Archivo fuente: ${fileName}`, infoX, infoY);
      infoY += 10;
      
      pdf.text(`Fecha: ${formatSantiagoDateTime(new Date())}`, infoX, infoY);
      infoY += 20;
      
      // Texto de introducción
      pdf.setFontSize(16);
      pdf.setTextColor(primaryColor);
      pdf.text('Los rankings se mostrarán en las siguientes hojas:', infoX, infoY);
      infoY += 15;
      
      pdf.setFontSize(14);
      pdf.setTextColor(50);
      const bulletX = infoX + 8;
      
      pdf.text('• Camiones o Conductores con más eventos', bulletX, infoY);
      infoY += 12;
      
      pdf.text('• Todos los Eventos por Tipo', bulletX, infoY);
      infoY += 12;
      
      pdf.text('• Camiones o Conductores con menos eventos', bulletX, infoY);
      
      // Agregar una nota adicional en la parte inferior derecha
      pdf.setFontSize(12);
      pdf.setTextColor(150);
      pdf.text('Reporte generado automáticamente', pageWidth - 40, pageHeight - 30);
      
      return infoY + 20; // Devolver la posición Y después del contenido
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
      pdf.text('West Ingeniería - Reporte de Rankings', 15, footerY);
      pdf.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 30, footerY);
      
      // Información de contacto
      pdf.setFontSize(8);
      pdf.text('Generado por Sistema de Análisis de Alarmas', 15, footerY + 5);
    };
    
    // Función para agregar rankings como imágenes en páginas horizontales separadas
    const addRankingsAsImages = async () => {
      console.log('Capturando rankings como imágenes...');
      
      // Configuración optimizada para captura
      console.log('🔍 INICIANDO CAPTURA DE RANKINGS CON PARÁMETROS OPTIMIZADOS:');
      console.log('  - Scale: 2');
      console.log('  - MaxWidth: 1200px');
      
      const topAlarmsResult = topAlarmsRef?.current ? await captureRankingAsImage(topAlarmsRef, 'top-alarms', {
        scale: 2, // Reducido para optimizar tamaño
        maxWidth: 1200 // Reducido para optimizar tamaño
      }) : { imageData: '', width: 0, height: 0 };
      
      console.log('📊 RESULTADO CAPTURA TOP ALARMAS:');
      console.log(`  - Dimensiones: ${topAlarmsResult.width}x${topAlarmsResult.height}`);
      console.log(`  - Tamaño imageData: ${topAlarmsResult.imageData.length} caracteres`);
      console.log(`  - imageData vacío: ${topAlarmsResult.imageData === ''}`);
      
      const allAlarmsResult = allAlarmsRef?.current ? await captureRankingAsImage(allAlarmsRef, 'all-alarms', {
        scale: 2, // Reducido para optimizar tamaño
        maxWidth: 1200 // Reducido para optimizar tamaño
      }) : { imageData: '', width: 0, height: 0 };
      
      console.log('📊 RESULTADO CAPTURA ALL ALARMS:');
      console.log(`  - Dimensiones: ${allAlarmsResult.width}x${allAlarmsResult.height}`);
      console.log(`  - Tamaño imageData: ${allAlarmsResult.imageData.length} caracteres`);
      console.log(`  - imageData vacío: ${allAlarmsResult.imageData === ''}`);
      
      const bestPerformersResult = bestPerformersRef?.current ? await captureRankingAsImage(bestPerformersRef, 'best-performers', {
        scale: 2, // Reducido para optimizar tamaño
        maxWidth: 1200 // Reducido para optimizar tamaño
      }) : { imageData: '', width: 0, height: 0 };
      
      console.log('📊 RESULTADO CAPTURA BEST PERFORMERS:');
      console.log(`  - Dimensiones: ${bestPerformersResult.width}x${bestPerformersResult.height}`);
      console.log(`  - Tamaño imageData: ${bestPerformersResult.imageData.length} caracteres`);
      console.log(`  - imageData vacío: ${bestPerformersResult.imageData === ''}`);
      
      // Array con todos los rankings para procesar
      const rankings = [
        {
          label: `Top 10 ${countByMode === 'truck' ? 'Camiones' : 'Conductores'} con Más Eventos`,
          result: topAlarmsResult
        },
        {
          label: 'Todos los Eventos por Tipo',
          result: allAlarmsResult
        },
        {
          label: `Top 10 ${countByMode === 'truck' ? 'Camiones' : 'Conductores'} con Menos Eventos`,
          result: bestPerformersResult
        }
      ];
      
      // Procesar cada ranking en una página horizontal separada
      for (const ranking of rankings) {
        if (ranking.result.imageData) {
          // Agregar nueva página (ya está en orientación horizontal)
          pdf.addPage();
          
          // Actualizar dimensiones para página horizontal
          pageWidth = pdf.internal.pageSize.getWidth();
          pageHeight = pdf.internal.pageSize.getHeight();
          
          console.log(`Nueva página horizontal: ${pageWidth}mm x ${pageHeight}mm`);
          
          // Configurar márgenes y dimensiones para el ranking
          const margin = 20;
          const headerHeight = 20;
          const footerHeight = 15;
          const availableWidth = pageWidth - (margin * 2);
          const availableHeight = pageHeight - headerHeight - footerHeight - margin;
          
          // Aplicar zoom y centrar (valor configurado en RANKING_ZOOM_FACTOR)
          const zoomFactor = RANKING_ZOOM_FACTOR;
          const maxDrawWidth = Math.min(availableWidth * zoomFactor, availableWidth);
          const maxDrawHeight = availableHeight * zoomFactor;
          
          const aspectRatio = ranking.result.height / ranking.result.width || 1;
          let drawWidth = maxDrawWidth;
          let drawHeight = drawWidth * aspectRatio;
          
          // Ajustar si excede el alto disponible
          if (drawHeight > maxDrawHeight) {
            drawHeight = maxDrawHeight;
            drawWidth = drawHeight / aspectRatio;
          }
          
          // Centrar en la página
          const drawX = (pageWidth - drawWidth) / 2;
          const drawY = headerHeight + margin;
          
          // Agregar título del ranking
          pdf.setFontSize(16);
          pdf.setTextColor(primaryColor);
          pdf.text(ranking.label, pageWidth / 2, 15, { align: 'center' });
          
          console.log(`Agregando ranking "${ranking.label}" con dimensiones: ${drawWidth}x${drawHeight}`);
          console.log(`Posición: x=${drawX}, y=${drawY}`);
          
          // Agregar la imagen del ranking
          pdf.addImage(
            ranking.result.imageData,
            'PNG',
            drawX,
            drawY,
            drawWidth,
            drawHeight
          );
        } else {
          console.error(`No se pudo capturar la imagen para: ${ranking.label}`);
        }
      }
    };
    
    // Generar el PDF
    console.log('Generando PDF de rankings optimizado...');
    
    // Agregar página de introducción
    addIntroductionPage();
    
    // Agregar rankings como imágenes en páginas horizontales separadas
    await addRankingsAsImages();
    
    // Agregar marca de agua a todas las páginas
    await addWatermark();
    
    // Agregar footer a todas las páginas
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(i, totalPages);
    }
    
    // Guardar el PDF
    const companySuffix = companyName ? `_${companyName.replace(/\s+/g, '_')}` : '';
    const modeSuffix = countByMode === 'truck' ? 'camiones' : 'conductores';
    const pdfFileName = `rankings_${modeSuffix}${companySuffix}_${formatSantiagoTimestampForFile(new Date())}.pdf`;
    pdf.save(pdfFileName);
    
    console.log(`PDF de rankings generado exitosamente con capturas automáticas`);
    
    // Mostrar modal de éxito
    setModalLoading(false);
    setModalTitle('Exportación Completada');
    setModalContent(`El reporte PDF de rankings se ha generado exitosamente con capturas automáticas de los tres rankings.`);
  } catch (error) {
    console.error('Error al generar PDF de rankings:', error);
    // Mostrar modal de error
    setModalLoading(false);
    setModalTitle('Error en Exportación');
    setModalContent('No se pudo generar el reporte PDF de rankings. Por favor, intente nuevamente.');
  }
};
