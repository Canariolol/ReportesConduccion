import React from 'react'
import { Box, Typography, Badge, Chip, Card, CardContent, Grid } from '@mui/material'
import { Info, TrendingUp, VideoLibrary } from '@mui/icons-material'

interface ResultsSummaryProps {
  filteredEventsCount: number
  mostFrequentAlarm?: { type: string; count: number }
  videosRequested?: number
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({ 
  filteredEventsCount, 
  mostFrequentAlarm,
  videosRequested = 0 
}) => {
  return (
    <Box>
      {/* Tarjeta de Resultados Filtrados */}
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

      {/* Tarjeta de Videos Solicitados */}
      <Card 
        sx={{ 
          mb: 3,
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          }
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VideoLibrary sx={{ mr: 2, fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Videos Solicitados
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {videosRequested}
                </Typography>
              </Box>
            </Box>
            <Badge 
              badgeContent={videosRequested} 
              color="secondary"
              sx={{ '& .MuiBadge-badge': { fontSize: '1.2rem', fontWeight: 700 } }}
            >
              <VideoLibrary sx={{ fontSize: 36, opacity: 0.8 }} />
            </Badge>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ResultsSummary
