import React from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { ExcelExportProps } from './ExportTypes';
import { formatTimestamp } from '../ExportUtils';

const ExcelExport: React.FC<ExcelExportProps> = ({
  currentReport,
  selectedCompany,
  getFilteredEvents,
  getEventCompanyName,
  callbacks
}) => {
  const exportToExcel = () => {
    if (!currentReport) return;

    callbacks.setModalTitle('Exportando a Excel');
    callbacks.setModalContent('Generando reporte de Excel con el formato profesional...');
    callbacks.setModalLoading(true);
    callbacks.setExportModalOpen(true);

    import('xlsx').then(XLSX => {
      // --- CARGAR PLANTILLA DE REFERENCIA ---
      let workbook: XLSX.WorkBook;
      
      // Intentar cargar el archivo de plantilla
      fetch('/referenciaReporte.xlsx')
        .then(response => {
          if (!response.ok) {
            throw new Error('No se pudo cargar la plantilla de referencia');
          }
          return response.arrayBuffer();
        })
        .then(arrayBuffer => {
          // Cargar el archivo de plantilla
          const templateData = new Uint8Array(arrayBuffer);
          workbook = XLSX.read(templateData, { type: 'array' });
          
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

          // --- ACTUALIZAR HOJA DE RESUMEN ---
          const summarySheet = workbook.Sheets['Resumen'];
          if (summarySheet) {
            // Actualizar datos básicos
            const updateCell = (cellRef: string, value: any) => {
              if (summarySheet[cellRef]) {
                summarySheet[cellRef].v = value;
              }
            };

            // Actualizar información del reporte
            updateCell('B3', selectedCompany || 'N/A');
            updateCell('B4', currentReport.vehicle_plate);
            updateCell('B5', currentReport.file_name);
            updateCell('B6', format(new Date(), 'dd/MM/yyyy HH:mm'));

            // Actualizar métricas
            updateCell('B9', currentReport.summary.totalAlarms);
            updateCell('B10', Object.keys(currentReport.summary.alarmTypes).length);
            updateCell('B11', getFilteredEvents().length);

            // Actualizar tabla de resumen por alarma
            const alarmSummaryData = Object.entries(currentReport.summary.alarmTypes).map(([type, count]) => [
              alarmNameMapping[type.toLowerCase()] || type,
              count,
            ]);

            // Encontrar la fila donde empieza la tabla de alarmas (usualmente fila 15)
            let startRow = 15;
            for (let i = 0; i < alarmSummaryData.length; i++) {
              updateCell(`A${startRow + i}`, alarmSummaryData[i][0]);
              updateCell(`B${startRow + i}`, alarmSummaryData[i][1]);
            }
          }

          // --- ACTUALIZAR HOJA DE EVENTOS FILTRADOS ---
          const eventsSheet = workbook.Sheets['Eventos Filtrados'];
          if (eventsSheet) {
            const filteredEvents = getFilteredEvents();
            
            // Limpiar datos existentes (mantener encabezados)
            const range = XLSX.utils.decode_range(eventsSheet['!ref'] || 'A1');
            for (let row = 2; row <= range.e.r; row++) {
              for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (eventsSheet[cellAddress]) {
                  delete eventsSheet[cellAddress];
                }
              }
            }

            // Agregar nuevos datos
            filteredEvents.forEach((event, index) => {
              const rowIndex = index + 2; // Empezar en fila 2 (después del encabezado)
              
              // Fecha y Hora
              const dateCell = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
              eventsSheet[dateCell] = { t: 's', v: formatTimestamp(event.timestamp) };
              
              // Patente
              const plateCell = XLSX.utils.encode_cell({ r: rowIndex, c: 1 });
              eventsSheet[plateCell] = { t: 's', v: event.vehiclePlate };
              
              // Tipo de Alarma
              const typeCell = XLSX.utils.encode_cell({ r: rowIndex, c: 2 });
              eventsSheet[typeCell] = { t: 's', v: alarmNameMapping[event.alarmType.toLowerCase()] || event.alarmType };
              
              // Conductor
              const driverCell = XLSX.utils.encode_cell({ r: rowIndex, c: 3 });
              eventsSheet[driverCell] = { t: 's', v: event.driver || 'Sin conductor' };
              
              // Empresa
              const companyCell = XLSX.utils.encode_cell({ r: rowIndex, c: 4 });
              eventsSheet[companyCell] = { t: 's', v: getEventCompanyName(event) };
              
              // Comentarios
              const commentsCell = XLSX.utils.encode_cell({ r: rowIndex, c: 5 });
              eventsSheet[commentsCell] = { t: 's', v: event.comments || 'Sin comentarios' };
            });

            // Actualizar el rango de la hoja
            const newRange = XLSX.utils.decode_range('A1:F' + (filteredEvents.length + 1));
            eventsSheet['!ref'] = XLSX.utils.encode_range(newRange);
          }

          // --- GUARDAR ARCHIVO ---
          const companySuffix = selectedCompany ? `_${selectedCompany.replace(/\s+/g, '_')}` : '';
          XLSX.writeFile(workbook, `reporte_conducción_${currentReport.vehicle_plate}${companySuffix}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);

          callbacks.setModalLoading(false);
          callbacks.setModalTitle('Exportación Completada');
          callbacks.setModalContent(`El reporte de Excel se ha generado exitosamente con ${getFilteredEvents().length} eventos usando la plantilla de formato profesional.`);
        })
        .catch(error => {
          console.error('Error al cargar plantilla, usando método alternativo:', error);
          
          // Si falla la carga de la plantilla, usar el método original
          const workbook = XLSX.utils.book_new();

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

          // --- HOJA DE RESUMEN ---
          const summarySheetData = [
            ['Reporte de Alarmas de Conducción'],
            [], // Fila vacía
            ['Empresa:', selectedCompany || 'N/A'],
            ['Vehículo:', currentReport.vehicle_plate],
            ['Archivo:', currentReport.file_name],
            ['Fecha de Exportación:', format(new Date(), 'dd/MM/yyyy HH:mm')],
            [], // Fila vacía
            ['Resumen de Métricas'],
            ['Métrica', 'Valor'],
            ['Total de Alarmas', currentReport.summary.totalAlarms],
            ['Tipos de Alarma', Object.keys(currentReport.summary.alarmTypes).length],
            ['Eventos Filtrados', getFilteredEvents().length],
            [], // Fila vacía
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

          // --- HOJA DE EVENTOS FILTRADOS ---
          const filteredEvents = getFilteredEvents();
          const eventsSheetData = filteredEvents.map(event => [
            formatTimestamp(event.timestamp),
            event.vehiclePlate,
            alarmNameMapping[event.alarmType.toLowerCase()] || event.alarmType,
            event.driver || 'Sin conductor',
            getEventCompanyName(event),
            event.comments || 'Sin comentarios',
          ]);

          const eventsWorksheet = XLSX.utils.aoa_to_sheet([
            ['Fecha y Hora', 'Patente', 'Tipo de Alarma', 'Conductor', 'Empresa', 'Comentarios'],
            ...eventsSheetData,
          ]);
          XLSX.utils.book_append_sheet(workbook, eventsWorksheet, 'Eventos Filtrados');

          // --- GUARDAR ARCHIVO ---
          const companySuffix = selectedCompany ? `_${selectedCompany.replace(/\s+/g, '_')}` : '';
          XLSX.writeFile(workbook, `reporte_conducción_${currentReport.vehicle_plate}${companySuffix}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);

          callbacks.setModalLoading(false);
          callbacks.setModalTitle('Exportación Completada');
          callbacks.setModalContent(`El reporte de Excel se ha generado exitosamente con ${getFilteredEvents().length} eventos (método alternativo).`);
        });
    }).catch(error => {
      console.error('Error al exportar a Excel:', error);
      callbacks.setModalLoading(false);
      callbacks.setModalTitle('Error en Exportación');
      callbacks.setModalContent('No se pudo generar el reporte de Excel. Por favor, intente nuevamente.');
    });
  };

  return (
    <button onClick={exportToExcel} style={{ display: 'none' }}>
      Exportar Excel
    </button>
  );
};

export default ExcelExport;
