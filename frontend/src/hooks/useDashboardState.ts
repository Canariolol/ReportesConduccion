
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

// Función para transformar nombres de empresas
const transformCompanyName = (companyName: string): string => {
  const companyMap: Record<string, string> = {
    'TPF': 'TRANS PACIFIC FIBRE SA',
    'Bosque Los Lagos': 'BOSQUES LOS LAGOS SPA',
    'Llico': 'SOC. DE TRANSP. LLICO LTDA.'
  };
  return companyMap[companyName] || companyName;
};

export const useDashboardState = () => {
  const { currentReport, loading, error } = useSelector((state: RootState) => state.excel);

  const [filters, setFilters] = useState({
    tipo: ['todos'] as string[],
    patente: '',
    fechaInicio: '',
    fechaFin: '',
    comentario: '',
  });

  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [filteredEventsCount, setFilteredEventsCount] = useState(0);

  // Función para extraer empresas de los datos del conductor
  const extractCompaniesFromData = useCallback(() => {
    if (!currentReport) return [];
    const companies = new Set<string>();
    const validCompanies = ['Bosque Los Lagos', 'TPF', 'Llico'];
    currentReport.events.forEach(event => {
      if (event.driver) {
        const match = event.driver.match(/\(([^)]+)\)/);
        if (match) {
          const company = match[1].trim();
          if (validCompanies.includes(company)) {
            companies.add(company);
          }
        }
      }
    });
    return Array.from(companies);
  }, [currentReport]);

  // Función para obtener el nombre completo de la empresa del evento
  const getEventCompanyName = (event: any): string => {
    if (!event.driver) return 'Sin empresa';
    const match = event.driver.match(/\(([^)]+)\)/);
    if (match) {
      const company = match[1].trim();
      return transformCompanyName(company);
    }
    return 'Sin empresa';
  };

  // Actualizar empresas disponibles cuando cambie el reporte
  useEffect(() => {
    if (currentReport) {
      const companies = extractCompaniesFromData();
      const transformedCompanies = companies.map(transformCompanyName);
      setAvailableCompanies(transformedCompanies);
      if (transformedCompanies.length > 0 && !selectedCompany) {
        setSelectedCompany(transformedCompanies[0]);
      }
    }
  }, [currentReport, extractCompaniesFromData, selectedCompany]);

  const getFilteredEvents = useCallback(() => {
    if (!currentReport) return [];

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
    
    return currentReport.events.filter(event => {
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
      
      return (
        (filters.tipo.length === 0 || filters.tipo.includes('todos') || filters.tipo.includes(event.alarmType)) &&
        (!filters.patente || event.vehiclePlate.toLowerCase().includes(filters.patente.toLowerCase())) &&
        fechaInicioValida &&
        fechaFinValida &&
        (!filters.comentario || (event.comments && event.comments.toLowerCase().includes(filters.comentario.toLowerCase())))
      );
    });
  }, [currentReport, filters]);

  // Actualizar conteo de eventos filtrados cuando cambien los filtros
  useEffect(() => {
    if (currentReport) {
      const count = getFilteredEvents().length;
      setFilteredEventsCount(count);
    }
  }, [filters, currentReport, getFilteredEvents]);

  const handleFilterChange = (field: string, value: any) => {
    if (field === 'dateRange') {
      const dateRange = value as DateRange | undefined;
      setFilters(prev => ({
        ...prev,
        fechaInicio: dateRange?.from ? format(dateRange.from, 'dd-MM-yyyy') : '',
        fechaFin: dateRange?.to ? format(dateRange.to, 'dd-MM-yyyy') : '',
      }));
    } else {
      setFilters(prev => ({ ...prev, [field]: value }));
    }
  };

  const getAlarmsByHour = useCallback(() => {
    const events = getFilteredEvents();
    if (events.length === 0) return [];
    
    const hourCounts: Record<number, number> = {};
    
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0;
    }
    
    events.forEach(event => {
      try {
        const timestampStr = event.timestamp;
        const [, timePart] = timestampStr.split(', ');
        const [hours] = timePart.split(':');
        const hour = parseInt(hours, 10);
        if (!isNaN(hour)) {
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      } catch (error) {
        console.error('Error parsing timestamp for hour count:', event.timestamp, error);
      }
    });
    
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      alarmas: hourCounts[i] || 0
    }));
  }, [getFilteredEvents]);

  const getFilteredAlarmTypes = useCallback(() => {
    const events = getFilteredEvents();
    const alarmTypes: Record<string, number> = {};
    
    events.forEach(event => {
      alarmTypes[event.alarmType] = (alarmTypes[event.alarmType] || 0) + 1;
    });
    
    return alarmTypes;
  }, [getFilteredEvents]);

  const getFilteredDailyEvolution = useCallback(() => {
    const events = getFilteredEvents();
    if (events.length === 0) return { labels: [], data: [] };
    
    const dailyCounts: Record<string, number> = {};
    
    events.forEach(event => {
      try {
        const timestampStr = event.timestamp;
        const [datePart] = timestampStr.split(', ');
        const [day, month, year] = datePart.split('/');
        const fullYear = `20${year}`;
        const dateKey = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
      } catch (error) {
        console.error('Error parsing timestamp for daily evolution:', event.timestamp, error);
      }
    });
    
    const sortedDates = Object.keys(dailyCounts).sort();
    return {
      labels: sortedDates,
      data: sortedDates.map(date => dailyCounts[date])
    };
  }, [getFilteredEvents]);

  return {
    // State
    filters,
    setFilters,
    selectedCompany,
    setSelectedCompany,
    availableCompanies,
    uploadModalOpen,
    setUploadModalOpen,
    exportModalOpen,
    setExportModalOpen,
    modalTitle,
    setModalTitle,
    modalContent,
    setModalContent,
    modalLoading,
    setModalLoading,
    filteredEventsCount,
    // Redux state
    currentReport,
    loading,
    error,
    // Functions
    handleFilterChange,
    getFilteredEvents,
    getAlarmsByHour,
    getFilteredAlarmTypes,
    getFilteredDailyEvolution,
    getEventCompanyName,
  };
};
