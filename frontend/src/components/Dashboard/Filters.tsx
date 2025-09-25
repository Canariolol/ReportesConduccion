import React from 'react';
import { Card, CardContent, Box, Typography, Grid, TextField, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Divider } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { DateRangePicker } from '../ui/date-range-picker';
import { DateRange } from 'react-day-picker';

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

  const handleDateRangeChange = (date: DateRange | undefined) => {
    onFilterChange('dateRange', date);
  };

  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month - 1, day);
      }
    }
    return new Date(dateString); // Fallback for other formats
  };

  const date: DateRange | undefined = filters.fechaInicio ? {
    from: parseDate(filters.fechaInicio),
    to: filters.fechaFin ? parseDate(filters.fechaFin) : undefined
  } : undefined;

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
                  if (selectedValues.includes('todos')) {
                    if (filters.tipo.includes('todos')) {
                      onFilterChange('tipo', alarmTypes);
                    } else {
                      onFilterChange('tipo', ['todos']);
                    }
                  } else {
                    onFilterChange('tipo', selectedValues);
                  }
                }}
                input={<OutlinedInput label="Tipo de Alarma" />}
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