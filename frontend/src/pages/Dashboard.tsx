import React, { useState, useCallback } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useDropzone } from 'react-dropzone'
import { CloudUpload, GetApp, PictureAsPdf, Save } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store/store.ts'
import { uploadExcel, getReports, clearCurrentReport } from '../store/slices/excelSlice.ts'
import { format } from 'date-fns'

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentReport, loading, error, reports } = useSelector((state: RootState) => state.excel)
  const [filters, setFilters] = useState({
    tipo: '',
    patente: '',
    fecha: '',
    comentario: '',
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', 'demo_user')
      dispatch(uploadExcel(formData))
    }
  }, [dispatch])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  })

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const getFilteredEvents = () => {
    if (!currentReport) return []
    
    return currentReport.events.filter(event => {
      return (
        (!filters.tipo || event.alarmType.toLowerCase().includes(filters.tipo.toLowerCase())) &&
        (!filters.patente || event.vehiclePlate.toLowerCase().includes(filters.patente.toLowerCase())) &&
        (!filters.comentario || (event.comments && event.comments.toLowerCase().includes(filters.comentario.toLowerCase())))
      )
    })
  }

  const exportToExcel = () => {
    if (!currentReport) return
    
    // Importación dinámica para evitar errores de compilación
    import('xlsx').then(XLSX => {
      const worksheet = XLSX.utils.json_to_sheet(getFilteredEvents())
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Eventos Filtrados')
      XLSX.writeFile(workbook, `reporte_filtrado_${format(new Date(), 'yyyyMMdd')}.xlsx`)
    }).catch(error => {
      console.error('Error al exportar a Excel:', error)
    })
  }

  const exportToPDF = () => {
    if (!currentReport) return
    
    // Implement PDF export logic here
    console.log('Export to PDF')
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

  const filteredEvents = getFilteredEvents()
  const mostFrequentType = filteredEvents.reduce((acc, event) => {
    acc[event.alarmType] = (acc[event.alarmType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostFrequent = Object.entries(mostFrequentType).sort(([,a], [,b]) => (b as number) - (a as number))[0]

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🚛 Reportes de Conducción - West Ingeniería
      </Typography>

      {/* Upload Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              transition: 'all 0.3s ease',
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta un archivo Excel aquí'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              o haz clic para seleccionar un archivo
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Formatos soportados: .xlsx, .xls (máx. 50MB)
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" sx={{ mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Dashboard Content */}
      {currentReport && (
        <>
          {/* Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="h4">{currentReport.summary.totalAlarms}</Typography>
                  <Typography>Total Alarmas</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="h4">{Object.keys(currentReport.summary.alarmTypes).length}</Typography>
                  <Typography>Tipos de Alarma</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#c0392b', color: 'white' }}>
                <CardContent>
                  <Typography variant="h4">{currentReport.vehicle_plate}</Typography>
                  <Typography>Vehículo</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#148844', color: 'white' }}>
                <CardContent>
                  <Typography variant="h4">{currentReport.file_name}</Typography>
                  <Typography>Archivo</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tipos de Alarmas
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(currentReport.summary.alarmTypes).map(([name, value]) => ({
                          name,
                          value,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(currentReport.summary.alarmTypes).map(([name]) => (
                          <Cell key={name} fill={getAlarmColor(name)} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Evolución Diaria
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={currentReport.charts.dailyEvolution.labels.map((label, index) => ({
                      day: label,
                      alarmas: currentReport.charts.dailyEvolution.data[index],
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="alarmas" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔍 Filtros
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Tipo"
                    value={filters.tipo}
                    onChange={(e) => handleFilterChange('tipo', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Patente"
                    value={filters.patente}
                    onChange={(e) => handleFilterChange('patente', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Fecha"
                    value={filters.fecha}
                    onChange={(e) => handleFilterChange('fecha', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Comentarios"
                    value={filters.comentario}
                    onChange={(e) => handleFilterChange('comentario', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">
              Resultados filtrados: <strong>{filteredEvents.length}</strong> eventos
            </Typography>
            {mostFrequent && (
              <Chip
                label={`Tipo más frecuente: ${mostFrequent[0]} (${mostFrequent[1]})`}
                color="primary"
              />
            )}
          </Box>

          {/* Export Buttons */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={exportToExcel}
            >
              Exportar Excel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PictureAsPdf />}
              onClick={exportToPDF}
            >
              Exportar PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={() => console.log('Guardar en BD')}
            >
              Guardar BD
            </Button>
          </Box>

          {/* Events Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Eventos Filtrados
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Patente</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Conductor</TableCell>
                      <TableCell>Comentarios</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEvents.map((event, index) => (
                      <TableRow key={index}>
                        <TableCell>{event.timestamp}</TableCell>
                        <TableCell>{event.vehiclePlate}</TableCell>
                        <TableCell>
                          <Chip
                            label={event.alarmType}
                            size="small"
                            sx={{
                              bgcolor: getAlarmColor(event.alarmType),
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell>{event.driver}</TableCell>
                        <TableCell>
                          <Tooltip title={event.comments || ''}>
                            <span>
                              {event.comments
                                ? event.comments.length > 30
                                  ? `${event.comments.substring(0, 30)}...`
                                  : event.comments
                                : 'Sin comentarios'}
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}

export default Dashboard
