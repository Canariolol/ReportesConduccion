import React, { useState } from 'react'
import { Card, CardContent, Box, Typography, Grid, TextField, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Divider, Button, Popover, Stack } from '@mui/material'
import { FilterList, CalendarToday, Clear } from '@mui/icons-material'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface FiltersProps {
  filters: {
    tipo: string[]
    patente: string
    fechaInicio: string
    fechaFin: string
    comentario: string
  }
  alarmTypes: string[]
  vehiclePlate: string
  onFilterChange: (field: string, value: string | string[]) => void
}

const Filters: React.FC<FiltersProps> = ({ filters, alarmTypes, vehiclePlate, onFilterChange }) => {
  const [dateRangeAnchorEl, setDateRangeAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null)

  const handleDateRangeOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDateRangeAnchorEl(event.currentTarget)
    // Parse existing dates if they exist
    if (filters.fechaInicio) {
      setTempStartDate(new Date(filters.fechaInicio))
    }
    if (filters.fechaFin) {
      setTempEndDate(new Date(filters.fechaFin))
    }
  }

  const handleDateRangeClose = () => {
    setDateRangeAnchorEl(null)
  }

  const handleDateRangeApply = () => {
    if (tempStartDate) {
      onFilterChange('fechaInicio', format(tempStartDate, 'yyyy-MM-dd'))
    } else {
      onFilterChange('fechaInicio', '')
    }
    
    if (tempEndDate) {
      onFilterChange('fechaFin', format(tempEndDate, 'yyyy-MM-dd'))
    } else {
      onFilterChange('fechaFin', '')
    }
    
    handleDateRangeClose()
  }

  const handleDateRangeClear = () => {
    setTempStartDate(null)
    setTempEndDate(null)
    onFilterChange('fechaInicio', '')
    onFilterChange('fechaFin', '')
    handleDateRangeClose()
  }

  const getDateRangeText = () => {
    if (!filters.fechaInicio && !filters.fechaFin) {
      return 'Seleccionar rango de fechas'
    }
    
    const startDate = filters.fechaInicio ? format(new Date(filters.fechaInicio), 'dd/MM/yyyy') : ''
    const endDate = filters.fechaFin ? format(new Date(filters.fechaFin), 'dd/MM/yyyy') : ''
    
    if (startDate && endDate) {
      return `${startDate} - ${endDate}`
    } else if (startDate) {
      return `Desde: ${startDate}`
    } else if (endDate) {
      return `Hasta: ${endDate}`
    }
    
    return 'Seleccionar rango de fechas'
  }

  const open = Boolean(dateRangeAnchorEl)

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FilterList sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Filtros Avanzados
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="tipo-alarma-label">Tipo de Alarma</InputLabel>
              <Select
                labelId="tipo-alarma-label"
                multiple
                value={filters.tipo}
                onChange={(e) => onFilterChange('tipo', e.target.value)}
                input={<OutlinedInput label="Tipo de Alarma" />}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="todos">
                  <em>Todos los tipos</em>
                </MenuItem>
                <Divider />
                {alarmTypes.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="patente-label">Patente</InputLabel>
              <Select
                labelId="patente-label"
                value={filters.patente}
                onChange={(e) => onFilterChange('patente', e.target.value)}
                input={<OutlinedInput label="Patente" />}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="">Todas las patentes</MenuItem>
                <MenuItem value={vehiclePlate}>{vehiclePlate}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleDateRangeOpen}
              startIcon={<CalendarToday />}
              endIcon={(filters.fechaInicio || filters.fechaFin) ? <Clear fontSize="small" onClick={(e) => {
                e.stopPropagation()
                handleDateRangeClear()
              }} /> : null}
              sx={{
                height: '56px',
                justifyContent: 'flex-start',
                borderColor: filters.fechaInicio || filters.fechaFin ? 'primary.main' : 'rgba(0, 0, 0, 0.23)',
                color: filters.fechaInicio || filters.fechaFin ? 'primary.main' : 'inherit',
                '&:hover': {
                  borderColor: 'primary.main',
                }
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  color: filters.fechaInicio || filters.fechaFin ? 'primary.main' : 'inherit',
                  fontWeight: filters.fechaInicio || filters.fechaFin ? 500 : 400
                }}
              >
                {getDateRangeText()}
              </Typography>
            </Button>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Comentarios"
              value={filters.comentario}
              onChange={(e) => onFilterChange('comentario', e.target.value)}
              variant="outlined"
              placeholder="Buscar por palabras clave en comentarios..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
        </Grid>
      </CardContent>

      {/* Popover para selector de rango de fechas */}
      <Popover
        open={open}
        anchorEl={dateRangeAnchorEl}
        onClose={handleDateRangeClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            p: 2,
            minWidth: 320,
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Seleccionar Rango de Fechas
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Fecha Inicio"
              type="date"
              value={tempStartDate ? format(tempStartDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                setTempStartDate(e.target.value ? new Date(e.target.value) : null)
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="Fecha Fin"
              type="date"
              value={tempEndDate ? format(tempEndDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                setTempEndDate(e.target.value ? new Date(e.target.value) : null)
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Stack>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={handleDateRangeClear}
              size="small"
            >
              Limpiar
            </Button>
            <Button 
              variant="contained" 
              onClick={handleDateRangeApply}
              size="small"
            >
              Aplicar
            </Button>
          </Box>
        </Box>
      </Popover>
    </Card>
  )
}

export default Filters
