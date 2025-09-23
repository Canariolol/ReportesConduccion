import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import { Card, CardContent, Box, Typography } from '@mui/material'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'

interface AreaChartProps {
  data: Array<{ day: string; alarmas: number }>
}

const AreaChartComponent = forwardRef<HTMLDivElement, AreaChartProps>(({ data }, ref) => {
  const internalRef = useRef<HTMLDivElement>(null)
  
  // Exponer el ref al componente padre - manejar el caso null
 useImperativeHandle(ref, () => internalRef.current, [])

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ mr: 1, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 21H2V3h2v16h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2V3h2v18zM9 7H7v2h2V7zm4 0h-2v2h2V7zm4 0h-2v2h2V7z"/>
            </svg>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Evolución Diaria de Eventos
          </Typography>
        </Box>
        <Box ref={internalRef} sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAlarmas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="alarmas" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorAlarmas)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
})

AreaChartComponent.displayName = 'AreaChartComponent'

export default AreaChartComponent
