
import React from 'react';
import { Grid } from '@mui/material';
import MetricsCards from './MetricsCards';
import PieChartComponent from './PieChart';
import AreaChartComponent from './AreaChart';
import LineChartComponent from './LineChart';
import Filters from './Filters';
import ResultsSummary from './ResultsSummary';
import ExportButtons from './ExportButtons';
import EventsTable from './EventsTable';
import { getAlarmColor } from './ExportUtils';

interface DashboardContentProps {
  currentReport: any;
  filteredEventsCount: number;
  mostFrequent: [string, number] | undefined;
  getFilteredAlarmTypes: () => Record<string, number>;
  getFilteredDailyEvolution: () => { labels: string[]; data: number[] };
  getAlarmsByHour: () => { hour: string; alarmas: number }[];
  filters: any;
  handleFilterChange: (field: string, value: any) => void;
  exportToExcel: () => void;
  exportToPDF: () => void;
  clearCurrentReport: () => void;
  selectedCompany: string;
  availableCompanies: string[];
  setSelectedCompany: (company: string) => void;
  pieChartRef: React.RefObject<HTMLDivElement>;
  areaChartRef: React.RefObject<HTMLDivElement>;
  lineChartRef: React.RefObject<HTMLDivElement>;
  filteredEvents: any[];
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  currentReport,
  filteredEventsCount,
  mostFrequent,
  getFilteredAlarmTypes,
  getFilteredDailyEvolution,
  getAlarmsByHour,
  filters,
  handleFilterChange,
  exportToExcel,
  exportToPDF,
  clearCurrentReport,
  selectedCompany,
  availableCompanies,
  setSelectedCompany,
  pieChartRef,
  areaChartRef,
  lineChartRef,
  filteredEvents,
}) => {
  return (
    <>
      <MetricsCards
        totalAlarms={currentReport.summary.totalAlarms}
        alarmTypesCount={Object.keys(currentReport.summary.alarmTypes).length}
        vehiclePlate={currentReport.vehicle_plate}
        fileName={currentReport.file_name}
        videosRequested={currentReport.summary.videosRequested}
      />

      <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
        <Grid item xs={12} md={10}>
          <PieChartComponent
            ref={pieChartRef}
            data={Object.entries(getFilteredAlarmTypes()).map(([name, value]) => ({
              name,
              value,
            }))}
            getAlarmColor={getAlarmColor}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <AreaChartComponent
            ref={areaChartRef}
            data={getFilteredDailyEvolution().labels.map((label, index) => ({
              day: label,
              alarmas: getFilteredDailyEvolution().data[index],
            }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LineChartComponent
            ref={lineChartRef}
            data={getAlarmsByHour()}
          />
        </Grid>
      </Grid>

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
            mostFrequentAlarm={mostFrequent ? { type: mostFrequent[0], count: mostFrequent[1] } : undefined}
            videosRequested={currentReport.summary.videosRequested}
          />
        </Grid>
      </Grid>

      <ExportButtons
        onExportExcel={exportToExcel}
        onExportPDF={exportToPDF}
        onSaveToDB={() => console.log('Guardar en BD')}
        onRestart={clearCurrentReport}
        selectedCompany={selectedCompany}
        availableCompanies={availableCompanies}
        onCompanyChange={setSelectedCompany}
      />

      <EventsTable
        events={filteredEvents}
        totalEvents={currentReport ? currentReport.events.length : 0}
        getAlarmColor={getAlarmColor}
      />
    </>
  );
};

export default DashboardContent;
