export interface ExportCallbacks {
  setModalTitle: (title: string) => void;
  setModalContent: (content: string) => void;
  setModalLoading: (loading: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
}

export interface ExcelExportProps {
  currentReport: any;
  selectedCompany: string;
  getFilteredEvents: () => any[];
  getEventCompanyName: (event: any) => string;
  callbacks: ExportCallbacks;
}

export interface PDFExportProps {
  currentReport: any;
  selectedCompany: string;
  filteredEvents: any[];
  filteredEventsCount: number;
  pieChartRef: React.RefObject<HTMLDivElement>;
  areaChartRef: React.RefObject<HTMLDivElement>;
  lineChartRef: React.RefObject<HTMLDivElement>;
  callbacks: ExportCallbacks;
}

export interface ExportData {
  totalAlarms: number;
  alarmTypesCount: number;
  videosRequested?: number;
  vehiclePlate: string;
  fileName: string;
  filteredEventsCount: number;
}

export interface CompanyData {
  name: string;
  transformedName: string;
}
