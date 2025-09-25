import { DateRange } from 'react-day-picker';

export interface FilterState {
  tipo: string[];
  patente: string;
  fechaInicio: string;
  fechaFin: string;
  comentario: string;
}

export interface EventsFilterProps {
  currentReport: any;
  filters: FilterState;
  onFilterChange: (field: string, value: any) => void;
}

export interface FilterResult {
  filteredEvents: any[];
  filteredEventsCount: number;
  filteredAlarmTypes: Record<string, number>;
  filteredDailyEvolution: {
    labels: string[];
    data: number[];
  };
  alarmsByHour: Array<{
    hour: string;
    alarmas: number;
  }>;
}

export interface FilterFunctions {
  getFilteredEvents: () => any[];
  getFilteredAlarmTypes: () => Record<string, number>;
  getFilteredDailyEvolution: () => {
    labels: string[];
    data: number[];
  };
  getAlarmsByHour: () => Array<{
    hour: string;
    alarmas: number;
  }>;
}
