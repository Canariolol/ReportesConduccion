import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  LinearProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  GetApp as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  SelectAll as SelectAllIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store/store.ts'
import { 
  getReports, 
  deleteReport, 
  batchDeleteReports, 
  deleteReportsByFilename,
  getReportByFilename 
} from '../../store/slices/excelSlice.ts'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import excelService, { BatchDeleteRequest } from '../../services/excel.ts'

interface ReportsManagementProps {
  onNewReport?: () => void
}

const ReportsManagement: React.FC<ReportsManagementProps> = ({ onNewReport }) => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { reports, loading, error } = useSelector((state: RootState) => state.excel)
  
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false)
  const [filenameSearchDialogOpen, setFilenameSearchDialogOpen] = useState(false)
  const [filenameDeleteDialogOpen, setFilenameDeleteDialogOpen] = useState(false)
  const [searchFilename, setSearchFilename] = useState('')
  const [deleteFilename, setDeleteFilename] = useState('')
  const [operationResult, setOperationResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Filtrar reportes basado en término de búsqueda
  const filteredReports = reports.filter(report =>
    report.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectReport = (reportId: string) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    )
  }

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(filteredReports.map(report => report.id!))
    }
  }

  const handleDelete = (reportId: string) => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedReports.length === 1) {
      dispatch(deleteReport(selectedReports[0]))
      setSelectedReports([])
    }
    setDeleteDialogOpen(false)
  }

  const handleBatchDelete = () => {
    setBatchDeleteDialogOpen(true)
  }

  const confirmBatchDelete = () => {
    const request: BatchDeleteRequest = {
      report_ids: selectedReports,
      user_id: 'demo_user'
    }
    
    dispatch(batchDeleteReports(request))
      .unwrap()
      .then((result) => {
        if (result.success) {
          setOperationResult({
            type: 'success',
            message: `Se eliminaron ${result.deleted_count} reportes exitosamente`
          })
        } else {
          setOperationResult({
            type: 'error',
            message: `Error: ${result.errors.join(', ')}`
          })
        }
        setSelectedReports([])
      })
      .catch((error) => {
        setOperationResult({
          type: 'error',
          message: `Error al eliminar reportes: ${error}`
        })
      })
    
    setBatchDeleteDialogOpen(false)
  }

  const handleSearchByFilename = () => {
    setFilenameSearchDialogOpen(true)
  }

  const confirmSearchByFilename = () => {
    if (searchFilename.trim()) {
      dispatch(getReportByFilename({ filename: searchFilename, userId: 'demo_user' }))
        .unwrap()
        .then((result) => {
          if (result) {
            setOperationResult({
              type: 'success',
              message: `Reporte encontrado: ${result.file_name}`
            })
            // Navegar al reporte encontrado
            navigate(`/reports/${result.id}`)
          } else {
            setOperationResult({
              type: 'error',
              message: `No se encontró ningún reporte con el nombre: ${searchFilename}`
            })
          }
        })
        .catch((error) => {
          setOperationResult({
            type: 'error',
            message: `Error al buscar reporte: ${error}`
          })
        })
    }
    setFilenameSearchDialogOpen(false)
    setSearchFilename('')
  }

  const handleDeleteByFilename = () => {
    setFilenameDeleteDialogOpen(true)
  }

  const confirmDeleteByFilename = () => {
    if (deleteFilename.trim()) {
      dispatch(deleteReportsByFilename({ filename: deleteFilename, userId: 'demo_user' }))
        .unwrap()
        .then((result) => {
          if (result.success) {
            setOperationResult({
              type: 'success',
              message: `Se eliminaron ${result.deleted_count} reportes con el nombre "${result.filename}"`
            })
          } else {
            setOperationResult({
              type: 'error',
              message: `Error: ${result.errors.join(', ')}`
            })
          }
        })
        .catch((error) => {
          setOperationResult({
            type: 'error',
            message: `Error al eliminar reportes: ${error}`
          })
        })
    }
    setFilenameDeleteDialogOpen(false)
    setDeleteFilename('')
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

  return (
    <Box>
      {/* Resultados de operaciones */}
      {operationResult && (
        <Alert 
          severity={operationResult.type} 
          sx={{ mb: 2 }}
          onClose={() => setOperationResult(null)}
        >
          {operationResult.message}
        </Alert>
      )}

      {/* Header con acciones */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4">
              📋 Gestión de Reportes
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onNewReport || (() => navigate('/'))}
              >
                Nuevo Reporte
              </Button>
              
              {selectedReports.length > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBatchDelete}
                >
                  Eliminar Seleccionados ({selectedReports.length})
                </Button>
              )}
              
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={handleSearchByFilename}
              >
                Buscar por Nombre
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteByFilename}
              >
                Eliminar por Nombre
              </Button>
            </Box>
          </Box>

          {/* Barra de búsqueda y filtros */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Buscar por archivo o patente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 300, flexGrow: 1 }}
              size="small"
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">
                {filteredReports.length} reportes encontrados
              </Typography>
              {filteredReports.length > 0 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedReports.length === filteredReports.length}
                      indeterminate={selectedReports.length > 0 && selectedReports.length < filteredReports.length}
                      onChange={handleSelectAll}
                    />
                  }
                  label="Seleccionar todos"
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de reportes */}
      {loading && reports.length === 0 ? (
        <Card>
          <CardContent>
            <LinearProgress />
            <Typography sx={{ textAlign: 'center', mt: 2 }}>
              Cargando reportes...
            </Typography>
          </CardContent>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'No se encontraron reportes que coincidan con la búsqueda' : 'No hay reportes guardados'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Sube un archivo Excel para generar tu primer reporte'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onNewReport || (() => navigate('/'))}
            >
              {searchTerm ? 'Nueva Búsqueda' : 'Crear Primer Reporte'}
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
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedReports.length === filteredReports.length}
                        indeterminate={selectedReports.length > 0 && selectedReports.length < filteredReports.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Archivo</TableCell>
                    <TableCell>Vehículo</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Total Alarmas</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Operación</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow 
                      key={report.id} 
                      selected={selectedReports.includes(report.id!)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedReports.includes(report.id!)}
                          onChange={() => handleSelectReport(report.id!)}
                        />
                      </TableCell>
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
                        {report.operation && (
                          <Chip
                            label={report.operation === 'created' ? 'Creado' : 'Actualizado'}
                            color={report.operation === 'created' ? 'info' : 'secondary'}
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver reporte">
                          <IconButton
                            size="small"
                            onClick={() => handleView(report.id!)}
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
                            onClick={() => {
                              setSelectedReports([report.id!])
                              handleDelete(report.id!)
                            }}
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

      {/* Diálogos de confirmación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que quieres eliminar {selectedReports.length} reporte(s)?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={batchDeleteDialogOpen} onClose={() => setBatchDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación Masiva</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que quieres eliminar {selectedReports.length} reportes seleccionados? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmBatchDelete} color="error" variant="contained">
            Eliminar {selectedReports.length} Reportes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={filenameSearchDialogOpen} onClose={() => setFilenameSearchDialogOpen(false)}>
        <DialogTitle>Buscar Reporte por Nombre</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del archivo (sin extensión)"
            fullWidth
            variant="outlined"
            value={searchFilename}
            onChange={(e) => setSearchFilename(e.target.value)}
            placeholder="ej: reporte_enero"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilenameSearchDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmSearchByFilename} variant="contained">
            Buscar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={filenameDeleteDialogOpen} onClose={() => setFilenameDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Reportes por Nombre</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del archivo (sin extensión)"
            fullWidth
            variant="outlined"
            value={deleteFilename}
            onChange={(e) => setDeleteFilename(e.target.value)}
            placeholder="ej: reporte_enero"
          />
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Esto eliminará TODOS los reportes con este nombre de archivo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilenameDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDeleteByFilename} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ReportsManagement
