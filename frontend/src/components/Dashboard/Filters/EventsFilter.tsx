import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import { format } from 'date-fns';
import { EventsFilterProps, FilterFunctions } from './FilterTypes';

const EventsFilter = forwardRef<FilterFunctions, EventsFilterProps>(({
  currentReport,
  filters,
  onFilterChange
}, ref) => {
  // Función para parsear fechas
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month - 1, day);
      }
    }
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  // Función principal para obtener eventos filtrados
  const getFilteredEvents = () => {
    if (!currentReport) return [];

    return currentReport.events.filter((event: any) => {
      let eventDate: Date | null = null;
      try {
        const timestampStr = event.timestamp;
        const [datePart, timePart] = timestampStr.split(', ');
        const [day, month, year] = datePart.split('/');
        const [hours, minutes, seconds] = timePart.split(':');
        const fullYear = `20${year}`;
        eventDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours}:${minutes}:${seconds}`);
      } catch (error) {
        console.error('Error parsing timestamp:', event.timestamp, error);
        return false;
      }
      
      const startDate = parseDate(filters.fechaInicio);
      const endDate = parseDate(filters.fechaFin);

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const fechaInicioValida = !startDate || eventDate >= startDate;
      const fechaFinValida = !endDate || eventDate <= endDate;
      
      // Si el filtro está vacío o incluye 'todos', mostrar todos los eventos
      // Si no, verificar que el tipo de alarma del evento esté en los filtros seleccionados
      let tipoFilterValid = true;
      
      if (filters.tipo.length > 0 && !filters.tipo.includes('todos')) {
        tipoFilterValid = filters.tipo.includes(event.alarmType);
      }
      
      // Debug logging para verificar el comportamiento
      console.log('🔍 Evento actual:', event.alarmType);
      console.log('🔍 Filtros tipo:', filters.tipo);
      console.log('🔍 tipoFilterValid:', tipoFilterValid);
      
      return (
        tipoFilterValid &&
        (!filters.patente || event.vehiclePlate.toLowerCase().includes(filters.patente.toLowerCase())) &&
        fechaInicioValida &&
        fechaFinValida &&
        (!filters.comentario || (event.comments && event.comments.toLowerCase().includes(filters.comentario.toLowerCase())))
      );
    });
  };

  // Función para obtener tipos de alarmas filtradas
  const getFilteredAlarmTypes = () => {
    const events = getFilteredEvents();
    const alarmTypes: Record<string, number> = {};
    
    events.forEach(event => {
      alarmTypes[event.alarmType] = (alarmTypes[event.alarmType] || 0) + 1;
    });
    
    return alarmTypes;
  };

  // Función para obtener evolución diaria filtrada
  const getFilteredDailyEvolution = () => {
    const events = getFilteredEvents();
    if (events.length === 0) return { labels: [], data: [] };
    
    const dailyCounts: Record<string, number> = {};
    
    events.forEach(event => {
      try {
        // Parsear el timestamp en formato "14/09/25, 11:38:35"
        const timestampStr = event.timestamp;
        const [datePart, timePart] = timestampStr.split(', ');
        const [day, month, year] = datePart.split('/');
        const [hours, minutes, seconds] = timePart.split(':');
        
        // Crear fecha con formato correcto (añadir 2000 al año de 2 dígitos)
        const fullYear = `20${year}`;
        const dateKey = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
      } catch (error) {
        console.error('Error parsing timestamp:', event.timestamp, error);
      }
    });
    
    // Ordenar fechas y convertir a formato para el gráfico
    const sortedDates = Object.keys(dailyCounts).sort();
    return {
      labels: sortedDates,
      data: sortedDates.map(date => dailyCounts[date])
    };
  };

  // Función para obtener alarmas por hora
  const getAlarmsByHour = () => {
    const events = getFilteredEvents();
    if (events.length === 0) return [];
    
    const hourCounts: Record<number, number> = {};
    
    // Inicializar todas las horas (0-23) en 0
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0;
    }
    
    // Contar alarmas por hora usando eventos filtrados
    events.forEach(event => {
      try {
        // Parsear el timestamp en formato "14/09/25, 11:38:35" - mismo método que getFilteredEvents
        const timestampStr = event.timestamp;
        const [datePart, timePart] = timestampStr.split(', ');
        const [day, month, year] = datePart.split('/');
        const [hours, minutes, seconds] = timePart.split(':');
        
        // Crear fecha con formato correcto (añadir 2000 al año de 2 dígitos)
        const fullYear = `20${year}`;
        const eventDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours}:${minutes}:${seconds}`);
        
        const hour = eventDate.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      } catch (error) {
        console.error('Error parsing timestamp:', event.timestamp, error);
      }
    });
    
    // Convertir a formato para el gráfico (horarios fijos)
    return Array.from({ length: 24 }, (_, i) => {
      return {
        hour: `${i.toString().padStart(2, '0')}:00`,
        alarmas: hourCounts[i] || 0
      };
    });
  };

  // Usar useMemo para optimizar cálculos
  const filteredEvents = useMemo(() => getFilteredEvents(), [currentReport, filters]);
  const filteredAlarmTypes = useMemo(() => getFilteredAlarmTypes(), [filteredEvents]);
  const filteredDailyEvolution = useMemo(() => getFilteredDailyEvolution(), [filteredEvents]);
  const alarmsByHour = useMemo(() => getAlarmsByHour(), [filteredEvents]);

  // Exponer funciones para que sean usadas por otros componentes
  React.useImperativeHandle(ref, () => ({
    getFilteredEvents,
    getFilteredAlarmTypes,
    getFilteredDailyEvolution,
    getAlarmsByHour
  }));

  // Este componente no renderiza nada, solo proporciona lógica
  return null;
});

EventsFilter.displayName = 'EventsFilter';

export default EventsFilter;
