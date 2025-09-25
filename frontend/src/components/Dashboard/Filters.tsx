import React from 'react';
import { Card, CardContent, Box, Typography, Grid, TextField, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Divider } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { DateRangePicker, DateRange } from '../ui/date-range-picker';
import { Dayjs } from 'dayjs';

interface FiltersProps {
  filters: {
    tipo: string[];
    patente: string;
    fechaInicio: string;
    fechaFin: string;
    comentario: string;
  };
  alarmTypes: string[];
  vehiclePlate: string;
  onFilterChange: (field: string, value: any) => void;
}

const Filters: React.FC<FiltersProps> = ({ filters, alarmTypes, vehiclePlate, onFilterChange }) => {

  const handleDateRangeChange = (date: DateRange) => {
    onFilterChange('dateRange', date);
  };

  // The new picker works with `Date` objects (or dayjs objects), not strings.
  // We convert the filter strings to Date objects for the picker.
  const date = {
    from: filters.fechaInicio ? new Date(filters.fechaInicio) : undefined,
    to: filters.fechaFin ? new Date(filters.fechaFin) : undefined,
  };

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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="tipo-alarma-label">Tipo de Alarma</InputLabel>
              <Select
                labelId="tipo-alarma-label"
                multiple
                value={filters.tipo}
                onChange={(e) => {
                  const selectedValues = e.target.value as string[];
                  console.log('🔄 Filters.tsx - onChange:', selectedValues);
                  
                  // Si se selecciona "todos", establecer solo ['todos']
                  if (selectedValues.includes('todos')) {
                    onFilterChange('tipo', ['todos']);
                  } 
                  // Si se deselecciona "todos" pero hay otros valores, mantener esos valores
                  else if (selectedValues.length > 0) {
                    onFilterChange('tipo', selectedValues);
                  }
                  // Si no hay nada seleccionado, establecer todos los tipos
                  else {
                    onFilterChange('tipo', alarmTypes);
                  }
                }}
                input={<OutlinedInput label="Tipo de Alarma" />}
                renderValue={(selected) => {
                  console.log('🔄 Filters.tsx - renderValue:', selected);
                  if (selected.length === 0) {
                    return 'Todos los tipos';
                  }
                  if (selected.includes('todos')) {
                    return 'Todos los tipos';
                  }
                  if (selected.length === alarmTypes.length) {
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="patente-label">Patente</InputLabel>
              <Select
                labelId="patente-label"
                value={filters.patente}
                onChange={(e) => onFilterChange('patente', e.target.value)}
                input={<OutlinedInput label="Patente" />}
              >
                <MenuItem value="">Todas las patentes</MenuItem>
                <MenuItem value={vehiclePlate}>{vehiclePlate}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <DateRangePicker
              date={date}
              onDateChange={handleDateRangeChange}
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
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
