import React from 'react'
import { Box, Typography, Badge, Chip } from '@mui/material'
import { Info, TrendingUp } from '@mui/icons-material'

interface ResultsSummaryProps {
  filteredEventsCount: number
  mostFrequentAlarm?: { type: string; count: number }
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({ filteredEventsCount, mostFrequentAlarm }) => {
  return (
    <Box sx={{ 
      mb: 3, 
      p: 3, 
      bgcolor: 'background.paper', 
      borderRadius: 2,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: 2
    }}>
      <Badge 
        badgeContent={filteredEventsCount} 
        color="primary"
        sx={{ '& .MuiBadge-badge': { fontSize: '1rem', fontWeight: 600 } }}
      >
        <Info sx={{ fontSize: 28, color: 'primary.main' }} />
      </Badge>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Resultados Filtrados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {filteredEventsCount} eventos encontrados
        </Typography>
      </Box>
      {mostFrequentAlarm && (
        <Chip
          icon={<TrendingUp />}
          label={`Más frecuente: ${mostFrequentAlarm.type} (${mostFrequentAlarm.count})`}
          color="primary"
          sx={{ ml: 'auto', fontWeight: 600 }}
        />
      )}
    </Box>
  )
}

export default ResultsSummary
