import React from 'react'
import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import { Warning, Analytics, Speed, Assessment } from '@mui/icons-material'

interface MetricsCardsProps {
  totalAlarms: number
  alarmTypesCount: number
  vehiclePlate: string
  fileName: string
}

const MetricsCards: React.FC<MetricsCardsProps> = ({
  totalAlarms,
  alarmTypesCount,
  vehiclePlate,
  fileName
}) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            height: '140px',
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
          <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Warning sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totalAlarms}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
              Total Alarmas
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            height: '140px',
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
          <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Analytics sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {alarmTypesCount}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
              Tipos de Alarma
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            height: '140px',
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
          <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Speed sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {vehiclePlate}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
              Vehículo
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #5ec581ff 0%, #4eb9a6ff 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            height: '140px',
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
          <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Assessment sx={{ mr: 1, fontSize: 28 }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1rem',
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {fileName}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
              Archivo
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default MetricsCards
