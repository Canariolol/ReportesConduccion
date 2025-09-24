import React from 'react'
import { Card, CardContent, Box, Typography, Grid, TextField, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Divider } from '@mui/material'
import { FilterList } from '@mui/icons-material'
import DateRangePicker from '../ui/date-range-picker'
import { CalendarDate } from '@internationalized/date'
import { format } from 'date-fns'

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
  // Convert string dates to CalendarDate objects for JollyDateRangePicker
  const dateRange: any = {
    start: filters.fechaInicio ? new CalendarDate(parseInt(filters.fechaInicio.split('-')[2]), parseInt(filters.fechaInicio.split('-')[1]), parseInt(filters.fechaInicio.split('-')[0])) : undefined,
    end: filters.fechaFin ? new CalendarDate(parseInt(filters.fechaFin.split('-')[2]), parseInt(filters.fechaFin.split('-')[1]), parseInt(filters.fechaFin.split('-')[0])) : undefined
  }

  const handleDateRangeSelect = (range: any) => {
    if (range?.start) {
      onFilterChange('fechaInicio', `${range.start.day.toString().padStart(2, '0')}-${range.start.month.toString().padStart(2, '0')}-${range.start.year}`)
    } else {
      onFilterChange('fechaInicio', '')
    }
    
    if (range?.end) {
      onFilterChange('fechaFin', `${range.end.day.toString().padStart(2, '0')}-${range.end.month.toString().padStart(2, '0')}-${range.end.year}`)
    } else {
      onFilterChange('fechaFin', '')
    }
  }

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
                onChange={(e) => {
                  const selectedValues = e.target.value as string[];
                  
                  // Si se selecciona "todos", manejar la lógica especial
                  if (selectedValues.includes('todos')) {
                    // Si "todos" ya estaba seleccionado, deseleccionarlo y seleccionar todos los tipos individuales
                    if (filters.tipo.includes('todos')) {
                      // Deseleccionar "todos" y seleccionar todos los tipos individuales
                      onFilterChange('tipo', alarmTypes);
                    } else {
                      // Seleccionar "todos" y deseleccionar todo lo demás
                      onFilterChange('tipo', ['todos']);
                    }
                  } else {
                    // Si no se seleccionó "todos", simplemente actualizar los valores
                    onFilterChange('tipo', selectedValues);
                  }
                }}
                input={<OutlinedInput label="Tipo de Alarma" />}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                renderValue={(selected) => {
                  if (selected.length === 0 || selected.includes('todos')) {
                    return 'Todos los tipos';
                  }
                  return selected.join(', ');
                }}
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
            <FormControl fullWidth>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                border: '1px solid rgba(0, 0, 0, 0.23)',
                borderRadius: 1,
                px: 2,
                py: 1,
                '&:hover': {
                  borderColor: 'rgba(0, 0, 0, 0.87)',
                },
                '&.Mui-focused': {
                  borderColor: '#1976d2',
                  borderWidth: 2,
                }
              }}>
                <TextField
                  value={filters.fechaInicio || ''}
                  onChange={(e) => onFilterChange('fechaInicio', e.target.value)}
                  placeholder="Fecha inicio"
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    style: { fontSize: '14px' }
                  }}
                  sx={{ flex: 1 }}
                />
                <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>-</span>
                <TextField
                  value={filters.fechaFin || ''}
                  onChange={(e) => onFilterChange('fechaFin', e.target.value)}
                  placeholder="Fecha fin"
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    style: { fontSize: '14px' }
                  }}
                  sx={{ flex: 1 }}
                />
                <DateRangePicker
                  selected={dateRange}
                  onSelect={handleDateRangeSelect}
                />
              </Box>
            </FormControl>
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
    </Card>
  )
}

export default Filters
