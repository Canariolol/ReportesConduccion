import api from './api'

export interface ProcessedReport {
  id?: string
  user_id: string
  file_name: string
  vehicle_plate: string
  date_range: {
    start: string
    end: string
  }
  summary: {
    totalAlarms: number
    alarmTypes: Record<string, number>
    videosRequested: number
  }
  events: Array<{
    timestamp: string
    alarmType: string
    vehiclePlate: string
    driver: string
    comments: string
    severity: string
  }>
  charts: {
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
  created_at: string
  updated_at: string
  status: string
  operation?: string
}

export interface BatchDeleteRequest {
  report_ids: string[]
  user_id: string
}

export interface BatchDeleteResponse {
  deleted_count: number
  total_requested: number
  errors: string[]
  success: boolean
}

export interface FilenameDeleteResponse {
  deleted_count: number
  filename: string
  errors: string[]
  success: boolean
}

class ExcelService {
  // Subir archivo Excel (método original)
  async uploadExcelFile(file: File, userId: string = 'demo_user'): Promise<ProcessedReport> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user_id', userId)

    const response = await api.post('/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }

  // Subir archivo Excel con upsert (nuevo método)
  async uploadExcelUpsert(file: File, userId: string = 'demo_user'): Promise<ProcessedReport> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user_id', userId)

    const response = await api.post('/v1/upload/upsert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }

  // Obtener reporte por ID
  async getReport(reportId: string): Promise<ProcessedReport> {
    const response = await api.get(`/v1/reports/${reportId}`)
    return response.data
  }

  // Obtener reportes de usuario
  async getUserReports(userId: string = 'demo_user', limit: number = 50): Promise<ProcessedReport[]> {
    const response = await api.get('/v1/reports', {
      params: {
        user_id: userId,
        limit,
      },
    })
    return response.data
  }

  // Eliminar reporte individual
  async deleteReport(reportId: string): Promise<{ message: string }> {
    const response = await api.delete(`/v1/reports/${reportId}`)
    return response.data
  }

  // Eliminar múltiples reportes (nuevo método)
  async batchDeleteReports(request: BatchDeleteRequest): Promise<BatchDeleteResponse> {
    const response = await api.post('/v1/reports/batch-delete', request)
    return response.data
  }

  // Eliminar reportes por nombre de archivo (nuevo método)
  async deleteReportsByFilename(filename: string, userId: string = 'demo_user'): Promise<FilenameDeleteResponse> {
    const response = await api.delete(`/v1/reports/by-filename/${filename}`, {
      params: {
        user_id: userId,
      },
    })
    return response.data
  }

  // Obtener reporte por nombre de archivo (nuevo método)
  async getReportByFilename(filename: string, userId: string = 'demo_user'): Promise<ProcessedReport | null> {
    const response = await api.get(`/v1/reports/by-filename/${filename}`, {
      params: {
        user_id: userId,
      },
    })
    return response.data
  }

  // Obtener resumen de reportes
  async getReportsSummary(userId: string = 'demo_user'): Promise<{
    totalReports: number
    totalAlarms: number
    totalVehicles: number
    lastUpdated: string
  }> {
    const response = await api.get('/v1/summary', {
      params: {
        user_id: userId,
      },
    })
    return response.data
  }

  // Verificar salud del API
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await api.get('/v1/health')
    return response.data
  }
}

export default new ExcelService()
