import React, { useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Add as AddIcon,
  GetApp as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store/store.ts'
import { getReports, deleteReport } from '../store/slices/excelSlice.ts'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const Reports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { reports, loading, error } = useSelector((state: RootState) => state.excel)

  useEffect(() => {
    dispatch(getReports('demo_user'))
  }, [dispatch])

  const handleDelete = (reportId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      dispatch(deleteReport(reportId))
    }
  }

  const handleView = (reportId: string) => {
    navigate(`/reports/${reportId}`)
  }

  const getAlarmColor = (type: string): string => {
    const colors: Record<string, string> = {
      'cinturon': '#d32f2f',
      'distraido': '#f57c00',
      'cruce': '#7b1fa2',
      'distancia': '#1976d2',
      'fatiga': '#ebe983',
      'frenada': '#26b170',
      'stop': '#665757',
      'telefono': '#00695c',
      'boton': '#5eb8a1',
      'video': '#c290e0',
    }
    
    const normalized = type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    for (const [key, color] of Object.entries(colors)) {
      if (normalized.includes(key)) return color
    }
    return '#64b5f6'
  }

  if (loading && reports.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          📋 Reportes Guardados
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/')}
        >
          Nuevo Reporte
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {reports.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay reportes guardados
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Sube un archivo Excel para generar tu primer reporte
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/')}
            >
              Crear Primer Reporte
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Archivo</TableCell>
                    <TableCell>Vehículo</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Total Alarmas</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.file_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.vehicle_plate}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.summary.totalAlarms}
                          color={report.summary.totalAlarms > 10 ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          color={report.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver reporte">
                          <IconButton
                            size="small"
                            onClick={() => handleView(report.id)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Descargar">
                          <IconButton size="small" color="secondary">
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(report.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default Reports
