import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import { Card, CardContent, Box, Typography } from '@mui/material'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'

interface PieChartProps {
  data: Array<{ name: string; value: number }>
  getAlarmColor: (type: string) => string
}

// No mostrar etiquetas en el grafico cuando el porcentaje es muy pequeno
const MIN_PERCENT_FOR_LABEL = 0.04

const PieChartComponent = forwardRef<HTMLDivElement, PieChartProps>(({ data, getAlarmColor }, ref) => {
  const internalRef = useRef<HTMLDivElement>(null)
  
  // Exponer el ref al componente padre
  useImperativeHandle(ref, () => internalRef.current as HTMLDivElement)

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    if (!percent || percent < MIN_PERCENT_FOR_LABEL) {
      return null
    }
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize="16"
        fontWeight="bold"
        style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.9)'
        }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  return (
    <Card sx={{ 
      height: 550,
      maxWidth: 800, // Ancho máximo de 800px
      mx: 'auto' // Centrar horizontalmente
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ mr: 1, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z"/>
            </svg>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Distribución de Tipos de Alarmas
          </Typography>
        </Box>
        <Box ref={internalRef} sx={{ width: '100%', height: 430 }}>
          <ResponsiveContainer width="100%" height={430}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={150}
                paddingAngle={0}
                dataKey="value"
                label={renderCustomizedLabel}
                labelLine={false}
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-out"
                animationBegin={0}
              >
                {data.map((entry, index) => {
                  const baseColor = getAlarmColor(entry.name)
                  
                  return (
                    <Cell key={entry.name} fill={baseColor} stroke="white" strokeWidth={2} />
                  )
                })}
              </Pie>
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                formatter={(value, entry, index) => {
                  const alarmType = data.find(item => item.name === value)
                  const count = alarmType ? alarmType.value : 0
                  const percent = ((entry.payload as any).percent * 100).toFixed(1)
                  return (
                    <span style={{ color: getAlarmColor(value as string), fontWeight: 500 }}>
                      {value}: {count} ({percent}%)
                    </span>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
})

PieChartComponent.displayName = 'PieChartComponent'

export default PieChartComponent

