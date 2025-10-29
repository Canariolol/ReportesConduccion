import jsPDF from 'jspdf';
import { captureRankingAsImage } from '../components/Dashboard/ExportUtils';
import { formatSantiagoDateTime, formatSantiagoTimestampForFile } from './export';

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
    
    // Crear un nuevo documento PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
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
      pdf.text('Rankings de Alarmas de Conducción', pageWidth / 2, 25, { align: 'center' });
      
      // Salto de línea y alinear a la izquierda la información
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      const infoX = 20;
      let infoY = 40;
      
      pdf.text(`Empresa: ${companyName || 'N/A'}`, infoX, infoY);
      infoY += 8;
      
      // Calcular cantidad de vehículos únicos
      const uniqueVehicles = new Set([
        ...rankingsData.topAlarms.map((item: any) => item.name),
        ...rankingsData.bestPerformers.map((item: any) => item.name)
      ]).size;
      pdf.text(`Cantidad de Vehículos: ${uniqueVehicles}`, infoX, infoY);
      infoY += 8;
      
      pdf.text(`Archivo fuente: ${fileName}`, infoX, infoY);
      infoY += 8;
      
      pdf.text(`Fecha: ${formatSantiagoDateTime(new Date())}`, infoX, infoY);
      
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
      pdf.text('West Ingeniería - Reporte de Rankings', 15, footerY);
      pdf.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 30, footerY);
      
      // Información de contacto
      pdf.setFontSize(8);
      pdf.text('Generado por Sistema de Análisis de Alarmas', 15, footerY + 5);
    };
    
    // Función para agregar rankings como imágenes (un ranking por página)
    const addRankingsAsImages = async () => {
      // Configuración para el layout de un ranking por página
      const baseImageWidth = 85; // Reducido al 50% del tamaño original
      const topMargin = 35;
      const bottomMargin = 30;
      const titleSpacing = 15;
      
      // Capturar los rankings como imágenes con opciones optimizadas
      console.log('Capturando rankings como imágenes...');
      
      const topAlarmsResult = topAlarmsRef?.current ? await captureRankingAsImage(topAlarmsRef, 'top-alarms', {
        scale: 2, // Mayor escala para mejor calidad
        maxWidth: 600 // Mayor ancho para capturar más detalles
      }) : { imageData: '', width: 0, height: 0 };
      
      const allAlarmsResult = allAlarmsRef?.current ? await captureRankingAsImage(allAlarmsRef, 'all-alarms', {
        scale: 2,
        maxWidth: 600
      }) : { imageData: '', width: 0, height: 0 };
      
      const bestPerformersResult = bestPerformersRef?.current ? await captureRankingAsImage(bestPerformersRef, 'best-performers', {
        scale: 2,
        maxWidth: 600
      }) : { imageData: '', width: 0, height: 0 };
      
      // Array con los resultados de captura y sus títulos
      const rankings = [
        {
          title: `Top 10 ${countByMode === 'truck' ? 'Camiones' : 'Conductores'} con Más Alarmas`,
          result: topAlarmsResult
        },
        {
          title: 'Todas las Alarmas por Tipo',
          result: allAlarmsResult
        },
        {
          title: `Top 10 ${countByMode === 'truck' ? 'Camiones' : 'Conductores'} con Menos Alarmas`,
          result: bestPerformersResult
        }
      ];
      
      // Agregar cada ranking en su propia página
      for (let i = 0; i < rankings.length; i++) {
        const ranking = rankings[i];
        
        // Si no es el primer ranking, agregar nueva página
        if (i > 0) {
          pdf.addPage();
        }
        
        let currentY = topMargin;
        
        // Agregar subtítulo centrado
        pdf.setFontSize(16);
        pdf.setTextColor(primaryColor);
        pdf.setFont('helvetica', 'bold');
        pdf.text(ranking.title, pageWidth / 2, currentY, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        
        currentY += titleSpacing;
        
        // Agregar la imagen si se capturó correctamente
        if (ranking.result.imageData) {
          // Calcular altura manteniendo la proporción
          const aspectRatio = ranking.result.height / ranking.result.width;
          let drawWidth = baseImageWidth;
          let drawHeight = drawWidth * aspectRatio;
          const maxImageHeight = pageHeight - bottomMargin - currentY;

          if (drawHeight > maxImageHeight) {
            drawHeight = maxImageHeight;
            drawWidth = drawHeight / aspectRatio;
          }

          const drawX = (pageWidth - drawWidth) / 2;

          console.log(`Agregando ranking ${ranking.title} con dimensiones: ${drawWidth}x${drawHeight}`);
          
          pdf.addImage(
            ranking.result.imageData,
            'PNG',
            drawX,
            currentY,
            drawWidth,
            drawHeight
          );
        } else {
          // Si no se pudo capturar la imagen, mostrar un mensaje
          pdf.setFontSize(12);
          pdf.setTextColor(150);
          pdf.text('No se pudo capturar la imagen del ranking', pageWidth / 2, 50, { align: 'center' });
          console.error(`No se pudo capturar la imagen para: ${ranking.title}`);
        }
      }
    };
    
    // Generar el PDF
    console.log('Generando PDF de rankings optimizado...');
    const headerEndY = addHeader();
    
    // Agregar rankings como imágenes
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
