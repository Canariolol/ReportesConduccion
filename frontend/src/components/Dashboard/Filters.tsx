import React from 'react'
import { Card, CardContent, Box, Typography, Grid, TextField, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Divider } from '@mui/material'
import { FilterList } from '@mui/icons-material'
import DateRangePicker from '../ui/DateRangePicker'
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
  // Convert string dates to Date objects for DateRangePicker
  const dateRange = {
    from: filters.fechaInicio ? new Date(filters.fechaInicio) : undefined,
    to: filters.fechaFin ? new Date(filters.fechaFin) : undefined
  }

  const handleDateRangeSelect = (range: { from: Date | undefined; to?: Date | undefined } | undefined) => {
    if (range?.from) {
      onFilterChange('fechaInicio', format(range.from, 'yyyy-MM-dd'))
    } else {
      onFilterChange('fechaInicio', '')
    }
    
    if (range?.to) {
      onFilterChange('fechaFin', format(range.to, 'yyyy-MM-dd'))
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
            <DateRangePicker
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              placeholder="Seleccionar rango de fechas"
            />
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
