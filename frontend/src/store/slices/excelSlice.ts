import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../services/api'

// Types
interface AlarmEvent {
  timestamp: string
  alarmType: string
  vehiclePlate: string
  driver: string
  comments: string
  severity: string
}

interface ChartData {
  alarmTypeDistribution: {
    labels: string[]
    data: number[]
    backgroundColor: string[]
  }
  dailyEvolution: {
    labels: string[]
    data: number[]
  }
  hourlyDistribution: {
    labels: string[]
    data: number[]
  }
}

interface ReportSummary {
  totalAlarms: number
  alarmTypes: Record<string, number>
  videosRequested: number
}

interface ProcessedReport {
  id: string
  user_id: string
  file_name: string
  vehicle_plate: string
  date_range: {
    start: string
    end: string
  }
  summary: ReportSummary
  events: AlarmEvent[]
  charts: ChartData
  created_at: string
  updated_at: string
  status: string
}

interface ExcelState {
  currentReport: ProcessedReport | null
  reports: ProcessedReport[]
  loading: boolean
  error: string | null
}

const initialState: ExcelState = {
  currentReport: null,
  reports: [],
  loading: false,
  error: null,
}

// Async thunks
export const uploadExcel = createAsyncThunk(
  'excel/uploadExcel',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      console.log('Attempting to upload to v1/upload'); // Log para depuración
      const response = await api.post('v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Error al subir archivo')
    }
  }
)

export const getReports = createAsyncThunk(
  'excel/getReports',
  async (userId: string = 'demo_user', { rejectWithValue }) => {
    try {
      const response = await api.get(`v1/reports?user_id=${userId}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Error al obtener reportes')
    }
  }
)

export const getReport = createAsyncThunk(
  'excel/getReport',
  async (reportId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`v1/reports/${reportId}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Error al obtener reporte')
    }
  }
)

export const deleteReport = createAsyncThunk(
  'excel/deleteReport',
  async (reportId: string, { rejectWithValue }) => {
    try {
      await api.delete(`v1/reports/${reportId}`)
      return reportId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Error al eliminar reporte')
    }
  }
)

const excelSlice = createSlice({
  name: 'excel',
  initialState,
  reducers: {
    clearCurrentReport: (state) => {
      state.currentReport = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Excel
      .addCase(uploadExcel.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadExcel.fulfilled, (state, action: PayloadAction<ProcessedReport>) => {
        state.loading = false
        state.currentReport = action.payload
        state.reports.unshift(action.payload)
      })
      .addCase(uploadExcel.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Get Reports
      .addCase(getReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getReports.fulfilled, (state, action: PayloadAction<ProcessedReport[]>) => {
        state.loading = false
        state.reports = action.payload
      })
      .addCase(getReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Get Report
      .addCase(getReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getReport.fulfilled, (state, action: PayloadAction<ProcessedReport>) => {
        state.loading = false
        state.currentReport = action.payload
      })
      .addCase(getReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete Report
      .addCase(deleteReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteReport.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        state.reports = state.reports.filter(report => report.id !== action.payload)
        if (state.currentReport?.id === action.payload) {
          state.currentReport = null
        }
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCurrentReport, clearError } = excelSlice.actions
export default excelSlice.reducer
