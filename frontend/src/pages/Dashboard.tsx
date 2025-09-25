import React, { useState, useRef } from 'react';
import { Box, Grid, CircularProgress, Alert, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store.ts';
import { uploadExcel, getReports, clearCurrentReport } from '../store/slices/excelSlice.ts';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import Modal from '../components/ui/Modal.tsx';
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { esES } from '@mui/x-date-pickers-pro/locales';

// Componentes especializados
import Header from '../components/Dashboard/Header.tsx';
import UploadSection from '../components/Dashboard/UploadSection.tsx';
import MetricsCards from '../components/Dashboard/MetricsCards.tsx';
import PieChartComponent from '../components/Dashboard/PieChart.tsx';
import AreaChartComponent from '../components/Dashboard/AreaChart.tsx';
import LineChartComponent from '../components/Dashboard/LineChart.tsx';
import Filters from '../components/Dashboard/Filters.tsx';
import ResultsSummary from '../components/Dashboard/ResultsSummary.tsx';
import ExportButtons from '../components/Dashboard/ExportButtons.tsx';
import EventsTable from '../components/Dashboard/EventsTable.tsx';

// Nuevos componentes de refactorización
import ExcelExport from '../components/Dashboard/Export/ExcelExport.tsx';
import ExcelExportImproved from '../components/Dashboard/Export/ExcelExportImproved.tsx';
import PDFExport from '../components/Dashboard/Export/PDFExport.tsx';
import CompanyManager, { CompanyManagerRef } from '../components/Dashboard/Companies/CompanyManager.tsx';
import EventsFilter from '../components/Dashboard/Filters/EventsFilter.tsx';
import { FilterFunctions } from '../components/Dashboard/Filters/FilterTypes.ts';
import TemplateAnalyzer, { TemplateAnalysis } from '../components/Dashboard/Export/TemplateAnalyzer.tsx';

// Utilidades de exportación
import { getAlarmColor } from '../components/Dashboard/ExportUtils.tsx';

// Tipos
interface FilterState {
  tipo: string[];
  patente: string;
  fechaInicio: string;
  fechaFin: string;
  comentario: string;
}

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentReport, loading, error, reports } = useSelector((state: RootState) => state.excel);
  
  const [filters, setFilters] = useState<FilterState>({
    tipo: [],
    patente: '',
    fechaInicio: '',
    fechaFin: '',
    comentario: '',
  });
  
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  
  // Estados para modales
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  
  // Estado para conteo de eventos filtrados
  const [filteredEventsCount, setFilteredEventsCount] = useState(0);
  
  // Refs para los gráficos
  const pieChartRef = useRef<HTMLDivElement>(null);
  const areaChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  
  // Refs para los componentes de lógica
  const companyManagerRef = useRef<CompanyManagerRef>(null);
  const eventsFilterRef = useRef<FilterFunctions>(null);
  
  // Refs para los componentes de exportación
  const excelExportRef = useRef<HTMLButtonElement>(null);
  const pdfExportRef = useRef<HTMLButtonElement>(null);

  // Función para manejar cambios en filtros
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

  // Callbacks para modales de exportación
  const exportCallbacks = {
    setModalTitle,
    setModalContent,
    setModalLoading,
    setExportModalOpen
  };

  // Actualizar conteo de eventos filtrados cuando cambien los filtros
  React.useEffect(() => {
    if (currentReport && eventsFilterRef.current) {
      const count = eventsFilterRef.current.getFilteredEvents().length;
      setFilteredEventsCount(count);
    }
  }, [filters, currentReport]);

  // Obtener datos filtrados de los componentes
  const filteredEvents = React.useMemo(() => {
    const events = eventsFilterRef.current ? eventsFilterRef.current.getFilteredEvents() : [];
    console.log('📊 Dashboard - filteredEvents actualizado:', events.length, 'eventos');
    return events;
  }, [filters, currentReport]);

  // Efecto para inicializar filtros con todos los tipos cuando se carga un reporte
  React.useEffect(() => {
    if (currentReport && filters.tipo.length === 0) {
      const allAlarmTypes = Object.keys(currentReport.summary.alarmTypes);
      console.log('🔄 Dashboard - Inicializando filtros con todos los tipos:', allAlarmTypes);
      setFilters(prev => ({
        ...prev,
        tipo: allAlarmTypes
      }));
    }
  }, [currentReport]);

  const filteredAlarmTypes = React.useMemo(() => {
    const types = eventsFilterRef.current ? eventsFilterRef.current.getFilteredAlarmTypes() : {};
    console.log('📊 Dashboard - filteredAlarmTypes actualizado:', Object.keys(types));
    return types;
  }, [filters, currentReport]); // Cambiado para depender de filters y currentReport directamente

  const filteredDailyEvolution = React.useMemo(() => {
    const evolution = eventsFilterRef.current ? eventsFilterRef.current.getFilteredDailyEvolution() : { labels: [], data: [] };
    console.log('📊 Dashboard - filteredDailyEvolution actualizado:', evolution.labels.length, 'días');
    return evolution;
  }, [filters, currentReport]); // Cambiado para depender de filters y currentReport directamente

  const alarmsByHour = React.useMemo(() => {
    const hours = eventsFilterRef.current ? eventsFilterRef.current.getAlarmsByHour() : [];
    console.log('📊 Dashboard - alarmsByHour actualizado:', hours.length, 'horas');
    return hours;
  }, [filters, currentReport]); // Cambiado para depender de filters y currentReport directamente

  const mostFrequentType = React.useMemo(() => {
    return filteredEvents.reduce((acc, event) => {
      acc[event.alarmType] = (acc[event.alarmType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredEvents]);

  const mostFrequent = React.useMemo(() => {
    return Object.entries(mostFrequentType).sort(([,a], [,b]) => (b as number) - (a as number))[0];
  }, [mostFrequentType]);

  return (
    <LocalizationProvider 
      dateAdapter={AdapterDayjs} 
      adapterLocale="es"
      localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <Box sx={{ 
        p: 3, 
        minHeight: '100vh',
        bgcolor: 'transparent'
      }}>
      {/* Header */}
      <Header 
        title="🚛 Reportes de Conducción"
        subtitle="West Ingeniería - Sistema de Análisis de Alarmas"
      />

      {/* Upload Section */}
      <UploadSection 
        onUpload={() => {}} 
        onUploadStart={() => {
          setModalTitle('Cargando Archivo');
          setModalContent('Procesando archivo Excel. Por favor espere...');
          setModalLoading(true);
          setUploadModalOpen(true);
        }}
        onUploadComplete={() => {
          setModalLoading(false);
          setModalTitle('Carga Completada');
          setModalContent('El archivo se ha procesado exitosamente.');
        }}
        onUploadError={(error) => {
          setModalLoading(false);
          setModalTitle('Error en la Carga');
          setModalContent(error || 'No se pudo procesar el archivo. Por favor intente nuevamente.');
        }}
      />

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)'
          }}
        >
          {error}
        </Alert>
      )}

      {loading && (
        <Box 
          display="flex" 
          justifyContent="center" 
          sx={{ 
            mb: 4,
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <CircularProgress size={48} thickness={4} />
        </Box>
      )}

      {/* Dashboard Content */}
      {currentReport && (
        <>
          {/* Componentes de lógica (no renderizan nada) */}
          <CompanyManager
            ref={companyManagerRef}
            currentReport={currentReport}
            selectedCompany={selectedCompany}
            availableCompanies={availableCompanies}
            onCompanyChange={setSelectedCompany}
            setAvailableCompanies={setAvailableCompanies}
          />
          
          <EventsFilter
            ref={eventsFilterRef}
            currentReport={currentReport}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Componentes de exportación (no renderizan nada) */}
          <ExcelExportImproved
            ref={excelExportRef}
            currentReport={currentReport}
            selectedCompany={selectedCompany}
            getFilteredEvents={() => eventsFilterRef.current?.getFilteredEvents() || []}
            getEventCompanyName={(event) => companyManagerRef.current?.getEventCompanyName(event) || 'Sin empresa'}
            callbacks={exportCallbacks}
            onExportError={(error) => {
              console.error('Error en exportación Excel:', error);
            }}
          />
          
          {/* Analizador de plantilla (para desarrollo) */}
          <TemplateAnalyzer
            onTemplateAnalyzed={(analysis) => {
              console.log('📊 Análisis de plantilla recibido:', analysis);
              // Aquí podemos usar la información para corregir el ExcelExport
            }}
          />
          
          <PDFExport
            ref={pdfExportRef}
            currentReport={currentReport}
            selectedCompany={selectedCompany}
            filteredEvents={filteredEvents}
            filteredEventsCount={filteredEventsCount}
            pieChartRef={pieChartRef}
            areaChartRef={areaChartRef}
            lineChartRef={lineChartRef}
            callbacks={exportCallbacks}
          />

          {/* Metrics Cards */}
          <MetricsCards
            totalAlarms={currentReport.summary.totalAlarms}
            alarmTypesCount={Object.keys(currentReport.summary.alarmTypes).length}
            vehiclePlate={currentReport.vehicle_plate}
            fileName={currentReport.file_name}
            videosRequested={currentReport.summary.videosRequested}
          />

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
            <Grid item xs={12} md={10}>
              <PieChartComponent
                ref={pieChartRef}
                data={Object.entries(filteredAlarmTypes).map(([name, value]) => ({
                  name,
                  value: value as number,
                }))}
                getAlarmColor={getAlarmColor}
              />
            </Grid>
          </Grid>

          {/* Additional Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <AreaChartComponent
                ref={areaChartRef}
                data={filteredDailyEvolution.labels.map((label, index) => ({
                  day: label,
                  alarmas: filteredDailyEvolution.data[index],
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LineChartComponent
                ref={lineChartRef}
                data={alarmsByHour}
              />
            </Grid>
          </Grid>

          {/* Filters and Results Summary - Side by side */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Filters
                filters={filters}
                alarmTypes={Object.keys(currentReport.summary.alarmTypes)}
                vehiclePlate={currentReport.vehicle_plate}
                onFilterChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ResultsSummary
                filteredEventsCount={filteredEventsCount}
                mostFrequentAlarm={mostFrequent ? { type: mostFrequent[0], count: mostFrequent[1] as number } : undefined}
                videosRequested={currentReport.summary.videosRequested}
              />
            </Grid>
          </Grid>

          {/* Export Buttons */}
          <ExportButtons
            onExportExcel={() => {
              console.log('🚀 Dashboard - Iniciando exportación Excel');
              if (excelExportRef.current) {
                excelExportRef.current.click();
              } else {
                console.error('❌ Excel export ref no está disponible');
              }
            }}
            onExportPDF={() => {
              console.log('🚀 Dashboard - Iniciando exportación PDF');
              if (pdfExportRef.current) {
                pdfExportRef.current.click();
              } else {
                console.error('❌ PDF export ref no está disponible');
              }
            }}
            onSaveToDB={() => console.log('Guardar en BD')}
            onRestart={() => {
              // Limpiar el reporte actual y filtros
              dispatch(clearCurrentReport());
              setFilters({
                tipo: ['todos'],
                patente: '',
                fechaInicio: '',
                fechaFin: '',
                comentario: '',
              });
              setSelectedCompany('');
              setAvailableCompanies([]);
            }}
            selectedCompany={selectedCompany}
            availableCompanies={availableCompanies}
            onCompanyChange={setSelectedCompany}
          />

          {/* Events Table */}
          <EventsTable
            events={filteredEvents}
            totalEvents={currentReport ? currentReport.events.length : 0}
            getAlarmColor={getAlarmColor}
          />
        </>
      )}
      
      {/* Modales */}
      <Modal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title={modalTitle}
        content={modalContent}
        loading={modalLoading}
      />
      
      <Modal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title={modalTitle}
        content={modalContent}
        loading={modalLoading}
      />
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 3,
          mt: 'auto',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          backgroundColor: 'background.paper',
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          ® {new Date().getFullYear()} West Ingeniería - Sistema de Análisis de Alarmas
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Creado con ❤️ por Rodrigo Yáñez G. -{' '}
          <Typography
            component="a"
            href="https://ninfasolutions.com"
            target="_blank"
            rel="noopener noreferrer"
            variant="caption"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
          >
            Ninfa Solutions
          </Typography>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          <Typography
            component="a"
            href="mailto:admin@ninfasolutions.com"
            variant="caption"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
          >
            admin@ninfasolutions.com
          </Typography>
        </Typography>
      </Box>
    </Box>
    </LocalizationProvider>
  );
};

export default Dashboard;
