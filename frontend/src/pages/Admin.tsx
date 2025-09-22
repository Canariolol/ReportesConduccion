import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store/store.ts'
import { getReports } from '../store/slices/excelSlice.ts'
import { format } from 'date-fns'

const Admin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { reports, loading, error } = useSelector((state: RootState) => state.excel)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedVehicle, setSelectedVehicle] = useState('')

  useEffect(() => {
    dispatch(getReports('demo_user'))
  }, [dispatch])

  const getStats = () => {
    const totalReports = reports.length
    const totalAlarms = reports.reduce((sum, report) => sum + report.summary.totalAlarms, 0)
    const totalVehicles = new Set(reports.map(report => report.vehicle_plate)).size
    const avgAlarmsPerReport = totalReports > 0 ? (totalAlarms / totalReports).toFixed(1) : 0

    return {
      totalReports,
      totalAlarms,
      totalVehicles,
      avgAlarmsPerReport,
    }
  }

  const getAlarmTypeStats = () => {
    const alarmTypes: Record<string, number> = {}
    
    reports.forEach(report => {
      Object.entries(report.summary.alarmTypes).forEach(([type, count]) => {
        alarmTypes[type] = (alarmTypes[type] || 0) + count
      })
    })

    return Object.entries(alarmTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  }

  const getVehicleStats = () => {
    const vehicleStats: Record<string, { reports: number; alarms: number }> = {}
    
    reports.forEach(report => {
      if (!vehicleStats[report.vehicle_plate]) {
        vehicleStats[report.vehicle_plate] = { reports: 0, alarms: 0 }
      }
      vehicleStats[report.vehicle_plate].reports += 1
      vehicleStats[report.vehicle_plate].alarms += report.summary.totalAlarms
    })

    return Object.entries(vehicleStats)
      .sort(([,a], [,b]) => b.alarms - a.alarms)
      .slice(0, 10)
  }

  const filteredReports = reports.filter(report => {
    const matchesDate = !dateRange.start || !dateRange.end || 
      new Date(report.created_at) >= new Date(dateRange.start) &&
      new Date(report.created_at) <= new Date(dateRange.end)
    
    const matchesVehicle = !selectedVehicle || report.vehicle_plate === selectedVehicle
    
    return matchesDate && matchesVehicle
  })

  const stats = getStats()
  const alarmTypeStats = getAlarmTypeStats()
  const vehicleStats = getVehicleStats()

  const exportStats = () => {
    const exportData = {
      stats,
      alarmTypeStats,
      vehicleStats,
      reports: filteredReports,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin_stats_${format(new Date(), 'yyyyMMdd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          ⚙️ Panel de Administración
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => dispatch(getReports('demo_user'))}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportStats}
          >
            Exportar Estadísticas
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DashboardIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Reportes</Typography>
              </Box>
              <Typography variant="h4">{stats.totalReports}</Typography>
              <Typography variant="body2">Total generados</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Alarmas</Typography>
              </Box>
              <Typography variant="h4">{stats.totalAlarms}</Typography>
              <Typography variant="body2">Total registradas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Vehículos</Typography>
              </Box>
              <Typography variant="h4">{stats.totalVehicles}</Typography>
              <Typography variant="body2">Únicos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Promedio</Typography>
              </Box>
              <Typography variant="h4">{stats.avgAlarmsPerReport}</Typography>
              <Typography variant="body2">Alarmas/reporte</Typography>
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
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Fecha Inicio"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Fecha Fin"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Vehículo</InputLabel>
                <Select
                  value={selectedVehicle}
                  label="Vehículo"
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Array.from(new Set(reports.map(r => r.vehicle_plate))).map(vehicle => (
                    <MenuItem key={vehicle} value={vehicle}>{vehicle}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Top Alarm Types */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚨 Tipos de Alarma Más Frecuentes
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Porcentaje</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alarmTypeStats.map(([type, count], index) => {
                      const percentage = ((count / stats.totalAlarms) * 100).toFixed(1)
                      return (
                        <TableRow key={type}>
                          <TableCell>
                            <Chip
                              label={type}
                              size="small"
                              color={index < 3 ? 'error' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">{percentage}%</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Vehicles */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚛 Vehículos con Más Alarmas
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Vehículo</TableCell>
                      <TableCell align="right">Reportes</TableCell>
                      <TableCell align="right">Alarmas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vehicleStats.map(([vehicle, data], index) => (
                      <TableRow key={vehicle}>
                        <TableCell>
                          <Chip
                            label={vehicle}
                            size="small"
                            color={index < 3 ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">{data.reports}</TableCell>
                        <TableCell align="right">{data.alarms}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Reports */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Reportes Recientes ({filteredReports.length})
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Archivo</TableCell>
                    <TableCell>Vehículo</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Alarmas</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.slice(0, 20).map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.file_name}</TableCell>
                      <TableCell>{report.vehicle_plate}</TableCell>
                      <TableCell>{format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Admin
