import React, { forwardRef, useImperativeHandle } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { ExcelExportProps } from './ExportTypes';
import { formatTimestamp } from '../ExportUtils';

interface ExcelExportImprovedProps extends ExcelExportProps {
  onExportError?: (error: string) => void;
}

const ExcelExportImproved = forwardRef<HTMLButtonElement, ExcelExportImprovedProps>(({
  currentReport,
  selectedCompany,
  getFilteredEvents,
  getEventCompanyName,
  callbacks,
  onExportError
}, ref) => {
  const exportToExcel = async () => {
    if (!currentReport) {
      const errorMsg = 'No hay reporte actual para exportar';
      console.error(errorMsg);
      onExportError?.(errorMsg);
      return;
    }

    try {
      callbacks.setModalTitle('Exportando a Excel');
      callbacks.setModalContent('Generando reporte de Excel con formato profesional...');
      callbacks.setModalLoading(true);
      callbacks.setExportModalOpen(true);

      console.log('🚀 Iniciando exportación Excel mejorada...');

      // --- CARGAR PLANTILLA DE REFERENCIA ---
      console.log('📁 Cargando plantilla referenciaReporte.xlsx...');
      const response = await fetch('/referenciaReporte.xlsx');
      
      if (!response.ok) {
        throw new Error(`No se pudo cargar la plantilla de referencia: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const templateData = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(templateData, { type: 'array' });
      
      console.log('✅ Plantilla cargada exitosamente');
      console.log('📊 Hojas encontradas:', workbook.SheetNames);

      // --- MAPEO DE NOMBRES DE ALARMAS ---
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

      // --- OBTENER DATOS ---
      const filteredEvents = getFilteredEvents();
      console.log(`📈 Procesando ${filteredEvents.length} eventos filtrados`);

      // --- ACTUALIZAR HOJAS DE LA PLANTILLA ---
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) return;

        console.log(`🔧 Procesando hoja: "${sheetName}"`);

        if (sheetName.toLowerCase().includes('resumen')) {
          // --- HOJA DE RESUMEN ---
          console.log('📋 Actualizando hoja de resumen...');
          
          // Función para actualizar celdas de forma segura
          const updateCell = (cellRef: string, value: any, type: 's' | 'n' = 's') => {
            if (sheet[cellRef]) {
              sheet[cellRef].v = value;
              sheet[cellRef].t = type;
            } else {
              console.warn(`⚠️ Celda ${cellRef} no encontrada en la hoja ${sheetName}`);
            }
          };

          // Actualizar información básica del reporte
          updateCell('B3', selectedCompany || 'N/A');
          updateCell('B4', currentReport.vehicle_plate);
          updateCell('B5', currentReport.file_name);
          updateCell('B6', format(new Date(), 'dd/MM/yyyy HH:mm'));

          // Actualizar métricas principales
          updateCell('B9', currentReport.summary.totalAlarms, 'n');
          updateCell('B10', Object.keys(currentReport.summary.alarmTypes).length, 'n');
          updateCell('B11', filteredEvents.length, 'n');

          // Actualizar tabla de resumen por tipo de alarma
          const alarmSummaryData = Object.entries(currentReport.summary.alarmTypes).map(([type, count]) => [
            alarmNameMapping[type.toLowerCase()] || type,
            count
          ]);

          console.log('📊 Datos de resumen por alarma:', alarmSummaryData);

          // Encontrar dónde empieza la tabla de alarmas (usualmente fila 15)
          let startRow = 15;
          alarmSummaryData.forEach(([alarmType, count], index) => {
            const row = startRow + index;
            updateCell(`A${row}`, alarmType);
            updateCell(`B${row}`, count, 'n');
          });

        } else if (sheetName.toLowerCase().includes('evento')) {
          // --- HOJA DE EVENTOS FILTRADOS ---
          console.log('📝 Actualizando hoja de eventos...');
          
          // Limpiar datos existentes (mantener encabezados)
          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
          console.log(`📏 Rango de la hoja: ${sheet['!ref']}`);
          
          for (let row = 2; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
              if (sheet[cellAddress]) {
                delete sheet[cellAddress];
              }
            }
          }

          // Agregar nuevos datos de eventos
          filteredEvents.forEach((event, index) => {
            const rowIndex = index + 2; // Empezar en fila 2 (después del encabezado)
            
            // Fecha y Hora
            const dateCell = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
            sheet[dateCell] = { t: 's', v: formatTimestamp(event.timestamp) };
            
            // Patente
            const plateCell = XLSX.utils.encode_cell({ r: rowIndex, c: 1 });
            sheet[plateCell] = { t: 's', v: event.vehiclePlate };
            
            // Tipo de Alarma
            const typeCell = XLSX.utils.encode_cell({ r: rowIndex, c: 2 });
            sheet[typeCell] = { t: 's', v: alarmNameMapping[event.alarmType.toLowerCase()] || event.alarmType };
            
            // Conductor
            const driverCell = XLSX.utils.encode_cell({ r: rowIndex, c: 3 });
            sheet[driverCell] = { t: 's', v: event.driver || 'Sin conductor' };
            
            // Empresa
            const companyCell = XLSX.utils.encode_cell({ r: rowIndex, c: 4 });
            sheet[companyCell] = { t: 's', v: getEventCompanyName(event) };
            
            // Comentarios
            const commentsCell = XLSX.utils.encode_cell({ r: rowIndex, c: 5 });
            sheet[commentsCell] = { t: 's', v: event.comments || 'Sin comentarios' };
          });

          // Actualizar el rango de la hoja para incluir todos los datos
          const newRange = XLSX.utils.decode_range('A1:F' + (filteredEvents.length + 1));
          sheet['!ref'] = XLSX.utils.encode_range(newRange);
          console.log(`📏 Nuevo rango actualizado: ${sheet['!ref']}`);

        } else {
          console.log(`ℹ️ Hoja "${sheetName}" no requiere actualización`);
        }
      });

      // --- GENERAR NOMBRE DE ARCHIVO ---
      const companySuffix = selectedCompany ? `_${selectedCompany.replace(/\s+/g, '_')}` : '';
      const fileName = `reporte_conducción_${currentReport.vehicle_plate}${companySuffix}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
      
      console.log('💾 Guardando archivo:', fileName);

      // --- GUARDAR ARCHIVO ---
      XLSX.writeFile(workbook, fileName);

      console.log('✅ Exportación Excel completada exitosamente');

      callbacks.setModalLoading(false);
      callbacks.setModalTitle('Exportación Completada');
      callbacks.setModalContent(`El reporte de Excel se ha generado exitosamente con ${filteredEvents.length} eventos usando la plantilla de formato profesional.`);

    } catch (error) {
      console.error('❌ Error en exportación Excel:', error);
      
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al exportar a Excel';
      callbacks.setModalLoading(false);
      callbacks.setModalTitle('Error en Exportación');
      callbacks.setModalContent(`No se pudo generar el reporte de Excel: ${errorMsg}`);
      onExportError?.(errorMsg);
    }
  };

  // Exponer la función de exportación a través de la ref
  useImperativeHandle(ref, () => ({
    click: () => exportToExcel()
  }));

  return (
    <button ref={ref} onClick={exportToExcel} style={{ display: 'none' }}>
      Exportar Excel Mejorado
    </button>
  );
};

export default ExcelExportImproved;
