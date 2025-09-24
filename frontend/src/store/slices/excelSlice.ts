import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import excelService, { ProcessedReport, BatchDeleteRequest, BatchDeleteResponse, FilenameDeleteResponse } from '../../services/excel'

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
      const file = formData.get('file') as File
      const userId = formData.get('user_id') as string
      const response = await excelService.uploadExcelUpsert(file, userId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Error al subir archivo')
    }
  }
)

export const getReports = createAsyncThunk(
  'excel/getReports',
  async (userId: string = 'demo_user', { rejectWithValue }) => {
    try {
      const response = await excelService.getUserReports(userId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Error al obtener reportes')
    }
  }
)

export const getReport = createAsyncThunk(
  'excel/getReport',
  async (reportId: string, { rejectWithValue }) => {
    try {
      const response = await excelService.getReport(reportId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Error al obtener reporte')
    }
  }
)

export const deleteReport = createAsyncThunk(
  'excel/deleteReport',
  async (reportId: string, { rejectWithValue }) => {
    try {
      await excelService.deleteReport(reportId)
      return reportId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Error al eliminar reporte')
    }
  }
)

// Nuevos async thunks para las funcionalidades solicitadas
export const uploadExcelUpsert = createAsyncThunk(
  'excel/uploadExcelUpsert',
  async ({ file, userId }: { file: File; userId: string }, { rejectWithValue }) => {
    try {
      const response = await excelService.uploadExcelUpsert(file, userId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Error al subir archivo')
    }
  }
)

export const batchDeleteReports = createAsyncThunk(
  'excel/batchDeleteReports',
  async (request: BatchDeleteRequest, { rejectWithValue }) => {
    try {
      const response = await excelService.batchDeleteReports(request)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Error al eliminar reportes')
    }
  }
)

export const deleteReportsByFilename = createAsyncThunk(
  'excel/deleteReportsByFilename',
  async ({ filename, userId }: { filename: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await excelService.deleteReportsByFilename(filename, userId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Error al eliminar reportes por nombre de archivo')
    }
  }
)

export const getReportByFilename = createAsyncThunk(
  'excel/getReportByFilename',
  async ({ filename, userId }: { filename: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await excelService.getReportByFilename(filename, userId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Error al obtener reporte por nombre de archivo')
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
        
        // Si es una actualización, reemplazar el reporte existente
        const existingIndex = state.reports.findIndex(report => report.id === action.payload.id)
        if (existingIndex !== -1) {
          state.reports[existingIndex] = action.payload
        } else {
          state.reports.unshift(action.payload)
        }
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
      // Upload Excel Upsert (nuevo)
      .addCase(uploadExcelUpsert.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadExcelUpsert.fulfilled, (state, action: PayloadAction<ProcessedReport>) => {
        state.loading = false
        state.currentReport = action.payload
        
        // Si es una actualización, reemplazar el reporte existente
        const existingIndex = state.reports.findIndex(report => report.id === action.payload.id)
        if (existingIndex !== -1) {
          state.reports[existingIndex] = action.payload
        } else {
          state.reports.unshift(action.payload)
        }
      })
      .addCase(uploadExcelUpsert.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Batch Delete Reports (nuevo)
      .addCase(batchDeleteReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(batchDeleteReports.fulfilled, (state, action: PayloadAction<BatchDeleteResponse>) => {
        state.loading = false
        if (action.payload.success) {
          // Por ahora, simplemente recargamos los reportes ya que el batch delete no devuelve los IDs eliminados
          // En una implementación más avanzada, podrías modificar el backend para devolver los IDs eliminados
          state.reports = state.reports // Mantenemos el estado actual, el frontend debería recargar
        }
      })
      .addCase(batchDeleteReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete Reports by Filename (nuevo)
      .addCase(deleteReportsByFilename.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteReportsByFilename.fulfilled, (state, action: PayloadAction<FilenameDeleteResponse>) => {
        state.loading = false
        if (action.payload.success) {
          const filename = action.payload.filename
          // Eliminar reportes con ese filename
          state.reports = state.reports.filter(report => report.file_name !== filename)
          
          // Limpiar currentReport si tiene ese filename
          if (state.currentReport?.file_name === filename) {
            state.currentReport = null
          }
        }
      })
      .addCase(deleteReportsByFilename.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Get Report by Filename (nuevo)
      .addCase(getReportByFilename.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getReportByFilename.fulfilled, (state, action: PayloadAction<ProcessedReport | null>) => {
        state.loading = false
        state.currentReport = action.payload
      })
      .addCase(getReportByFilename.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCurrentReport, clearError } = excelSlice.actions
export default excelSlice.reducer
