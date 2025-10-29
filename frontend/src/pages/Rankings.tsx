import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
  Alert,
  Grid,
  Container
} from '@mui/material'
import {
  PictureAsPdf,
  LocalShipping,
  Person,
  TrendingUp,
  TrendingDown,
  Assessment
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import Header from '../components/Dashboard/Header'
import Footer from '../components/common/Footer'
import CompanyNameModal from '../components/Dashboard/CompanyNameModal'
import { ProcessedReport } from '../services/excel'
import { calculateRankings, calculateAlarmTypesRanking, RankingsData, RankingItem, CountByMode } from '../lib/rankingsUtils'
import { exportRankingsToPDFOptimized } from '../lib/export_rankings'

// Componente para mostrar iconos de posición
const PositionIcon: React.FC<{ position: number; type: 'top' | 'best' }> = ({ position, type }) => {
  if (position > 3) return null

  const getIconPath = () => {
    if (type === 'top') {
      switch (position) {
        case 1: return '/alarma-roja.svg'
        case 2: return '/alarma-naranja.svg'
        case 3: return '/alarma-amarilla.svg'
        default: return ''
      }
    } else {
      switch (position) {
        case 1: return '/ranking-oro.svg'
        case 2: return '/ranking-plata.svg'
        case 3: return '/ranking-bronce.svg'
        default: return ''
      }
    }
  }

  return (
    <Box
      component="img"
      src={getIconPath()}
      alt={`Posición ${position}`}
      crossOrigin="anonymous"
      draggable={false}
      sx={{ 
        width: 24, 
        height: 24, 
        mr: 1,
        display: 'inline-block'
      }}
    />
  )
}

// Componente de tabla de rankings
const RankingTable: React.FC<{
  title: string
  data: RankingItem[]
  icon: React.ReactNode
  type: 'top' | 'best'
  countBy: 'truck' | 'driver'
  isAlarmTypes?: boolean
  tableRef: React.RefObject<HTMLDivElement>
  captureId: string
}> = ({ title, data, icon, type, countBy, isAlarmTypes = false, tableRef, captureId }) => {
  return (
    <Box
      ref={tableRef}
      data-capture-id={captureId}
      sx={{
        mb: 3,
        height: '100%',
        position: 'relative',
      }}
    >
      <Card
        elevation={3}
        sx={{
          height: '100%',
          backgroundColor: '#ffffff',
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(21, 101, 192, 0.08)',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            {icon}
            <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
              {title}
            </Typography>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Posición</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {isAlarmTypes ? 'Tipo de Alarma' : (countBy === 'truck' ? 'Camión' : 'Conductor')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Total de Alarmas
                  </TableCell>
                  {data[0]?.percentage && (
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Porcentaje
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow 
                    key={item.id} 
                    sx={{ 
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                      '&:first-of-type td': { 
                        borderTop: type === 'top' ? '2px solid #f44336' : '2px solid #4caf50',
                        fontWeight: 700
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PositionIcon position={index + 1} type={type} />
                        #{index + 1}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {item.name}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {item.count}
                    </TableCell>
                    {item.percentage && (
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: type === 'top' ? 'error.main' : 'success.main'
                          }}
                        >
                          {item.percentage.toFixed(1)}%
                        </Typography>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

const Rankings: React.FC = () => {
  const navigate = useNavigate()
  const currentReport = useSelector((state: RootState) => state.excel.currentReport)
  const [countBy, setCountBy] = useState<CountByMode>('truck')
  const [isCompanyNameModalOpen, setIsCompanyNameModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  // Referencias para capturar los rankings como imágenes
  const topAlarmsRef = useRef<HTMLDivElement>(null)
  const allAlarmsRef = useRef<HTMLDivElement>(null)
  const bestPerformersRef = useRef<HTMLDivElement>(null)

  // Calcular los rankings usando useMemo para evitar recálculos innecesarios
  const rankingsData = useMemo(() => {
    if (!currentReport) {
      return {
        topAlarms: [],
        allAlarms: [],
        bestPerformers: []
      } as RankingsData
    }
    
    return calculateRankings(currentReport, countBy)
  }, [currentReport, countBy])

  // Calcular el ranking de tipos de alarma (independiente del toggle)
  const alarmTypesRanking = useMemo(() => {
    if (!currentReport) {
      return []
    }
    
    return calculateAlarmTypesRanking(currentReport)
  }, [currentReport])

  const handleCountByChange = (
    event: React.MouseEvent<HTMLElement>,
    newCountBy: CountByMode | null,
  ) => {
    if (newCountBy !== null) {
      setCountBy(newCountBy)
    }
  }

  const handleExportPDF = () => {
    setIsCompanyNameModalOpen(true)
  }

  const handleCompanyNameModalClose = () => {
    setIsCompanyNameModalOpen(false)
  }

  const handleExportWithCompanyName = async (companyName: string) => {
    if (!currentReport) return
    
    setIsExporting(true)
    
    try {
      console.log('Iniciando exportación de rankings...')
      console.log('Referencias disponibles:')
      console.log('- topAlarmsRef:', topAlarmsRef.current)
      console.log('- allAlarmsRef:', allAlarmsRef.current)
      console.log('- bestPerformersRef:', bestPerformersRef.current)
      
      await exportRankingsToPDFOptimized(
        rankingsData,
        companyName,
        currentReport.file_name,
        countBy,
        () => {}, // setModalTitle - no se usa en este contexto
        () => {}, // setModalContent - no se usa en este contexto
        (loading) => setIsExporting(loading),
        () => {}, // setExportModalOpen - no se usa en este contexto
        topAlarmsRef,
        allAlarmsRef,
        bestPerformersRef
      )
      
      // Cerrar el modal al completar la exportación
      setIsCompanyNameModalOpen(false)
    } catch (error) {
      console.error('Error al exportar rankings:', error)
      setIsExporting(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'transparent' }}>
      <Header 
        title="📊 Rankings de Alarmas"
        subtitle="West Ingeniería - Análisis de Rendimiento"
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Botón de volver y acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            ← Volver al Dashboard
          </Button>

          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={handleExportPDF}
            disabled={!currentReport || rankingsData.topAlarms.length === 0}
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(240, 147, 251, 0.4)',
              }
            }}
          >
            Exportar PDF
          </Button>
        </Box>

        {/* Toggle para contar por camión o conductor */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <ToggleButtonGroup
            value={countBy}
            exclusive
            onChange={handleCountByChange}
            aria-label="Tipo de conteo"
            sx={{
              '& .MuiToggleButton-root': {
                px: 3,
                py: 1,
                fontWeight: 600,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }
              }
            }}
          >
            <ToggleButton value="truck" aria-label="Contar por camión">
              <LocalShipping sx={{ mr: 1 }} />
              Por Camión
            </ToggleButton>
            <ToggleButton value="driver" aria-label="Contar por conductor">
              <Person sx={{ mr: 1 }} />
              Por Conductor
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Contenido de los rankings */}
        {!currentReport ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <Alert severity="info" sx={{ width: '100%', maxWidth: 600 }}>
              No hay datos disponibles para mostrar los rankings. Por favor, cargue un reporte primero desde el Dashboard.
            </Alert>
          </Box>
        ) : rankingsData.topAlarms.length === 0 && rankingsData.allAlarms.length === 0 && rankingsData.bestPerformers.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <Alert severity="warning" sx={{ width: '100%', maxWidth: 600 }}>
              No se encontraron eventos de alarmas en el reporte actual.
            </Alert>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Top 10 con Más Alarmas */}
            <Grid item xs={12} lg={4}>
              <RankingTable
                title={`Top 10 ${countBy === 'truck' ? 'Camiones' : 'Conductores'} con Más Alarmas`}
                data={rankingsData.topAlarms}
                icon={<TrendingUp color="error" />}
                type="top"
                countBy={countBy}
                tableRef={topAlarmsRef}
                captureId="top-alarms"
              />
            </Grid>
            
            {/* Todas las Alarmas por Tipo */}
            <Grid item xs={12} lg={4}>
              <RankingTable
                title="Todas las Alarmas por Tipo"
                data={alarmTypesRanking}
                icon={<Assessment color="primary" />}
                type="top"
                countBy={countBy}
                isAlarmTypes={true}
                tableRef={allAlarmsRef}
                captureId="all-alarms"
              />
            </Grid>
            
            {/* Top 10 con Menos Alarmas */}
            <Grid item xs={12} lg={4}>
              <RankingTable
                title={`Top 10 ${countBy === 'truck' ? 'Camiones' : 'Conductores'} con Menos Alarmas`}
                data={rankingsData.bestPerformers}
                icon={<TrendingDown color="success" />}
                type="best"
                countBy={countBy}
                tableRef={bestPerformersRef}
                captureId="best-performers"
              />
            </Grid>
          </Grid>
        )}
      </Container>
      
      <CompanyNameModal
        isOpen={isCompanyNameModalOpen}
        onClose={handleCompanyNameModalClose}
        onExport={handleExportWithCompanyName}
        isLoading={isExporting}
      />
      
      <Footer />
    </Box>
  )
}

export default Rankings
