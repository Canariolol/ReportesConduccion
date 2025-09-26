import React, { useRef } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { clearCurrentReport } from '../store/slices/excelSlice';
import { useDashboardState } from '../hooks/useDashboardState';
import { exportToExcel, exportToPDF } from '../lib/export';

// Componentes especializados
import Header from '../components/Dashboard/Header';
import UploadSection from '../components/Dashboard/UploadSection';
import DashboardContent from '../components/Dashboard/DashboardContent';
import Footer from '../components/common/Footer';
import Modal from '../components/ui/Modal';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
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
    currentReport,
    loading,
    error,
    handleFilterChange,
    getFilteredEvents,
    getAlarmsByHour,
    getFilteredAlarmTypes,
    getFilteredDailyEvolution,
    getEventCompanyName,
  } = useDashboardState();

  const pieChartRef = useRef<HTMLDivElement>(null);
  const areaChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);

  const handleExportExcel = () => {
    exportToExcel(
      currentReport,
      getFilteredEvents(),
      selectedCompany,
      getEventCompanyName,
      setModalTitle,
      setModalContent,
      setModalLoading,
      setExportModalOpen
    );
  };

  const handleExportPDF = () => {
    exportToPDF(
      currentReport,
      getFilteredEvents(),
      selectedCompany,
      pieChartRef,
      areaChartRef,
      lineChartRef,
      setModalTitle,
      setModalContent,
      setModalLoading,
      setExportModalOpen
    );
  };

  const handleClearReport = () => {
    dispatch(clearCurrentReport());
    setFilters({
      tipo: [],
      patente: '',
      fechaInicio: '',
      fechaFin: '',
      comentario: '',
    });
    setSelectedCompany('');
  };

  const filteredEvents = getFilteredEvents();
  const mostFrequentType = filteredEvents.reduce((acc, event) => {
    acc[event.alarmType] = (acc[event.alarmType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostFrequent = Object.entries(mostFrequentType).sort(([,a], [,b]) => b - a)[0];

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'transparent' }}>
      <Header 
        title="🚛 Reportes de Conducción"
        subtitle="West Ingeniería - Sistema de Análisis de Alarmas"
      />

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

      {currentReport && (
        <DashboardContent
          currentReport={currentReport}
          filteredEventsCount={filteredEventsCount}
          mostFrequent={mostFrequent}
          getFilteredAlarmTypes={getFilteredAlarmTypes}
          getFilteredDailyEvolution={getFilteredDailyEvolution}
          getAlarmsByHour={getAlarmsByHour}
          filters={filters}
          handleFilterChange={handleFilterChange}
          exportToExcel={handleExportExcel}
          exportToPDF={handleExportPDF}
          clearCurrentReport={handleClearReport}
          selectedCompany={selectedCompany}
          availableCompanies={availableCompanies}
          setSelectedCompany={setSelectedCompany}
          pieChartRef={pieChartRef}
          areaChartRef={areaChartRef}
          lineChartRef={lineChartRef}
          filteredEvents={filteredEvents}
        />
      )}
      
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
      
      <Footer />
    </Box>
  );
};

export default Dashboard;