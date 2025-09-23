import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import { Card, CardContent, Box, Typography } from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'

interface LineChartProps {
  data: Array<{ hour: string; alarmas: number }>
}

const LineChartComponent = forwardRef<HTMLDivElement, LineChartProps>(({ data }, ref) => {
  const internalRef = useRef<HTMLDivElement>(null)
  
  // Exponer el ref al componente padre - manejar el caso null
  useImperativeHandle(ref, () => internalRef.current, [])

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ mr: 1, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
            </svg>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Alarmas por Hora del Día
          </Typography>
        </Box>
        <Box ref={internalRef} sx={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 11, fontWeight: 500 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="alarmas" 
                stroke="#df5353ff" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
})

LineChartComponent.displayName = 'LineChartComponent'

export default LineChartComponent
