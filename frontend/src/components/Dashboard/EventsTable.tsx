import React from 'react'
import { Card, CardContent, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Chip } from '@mui/material'
import { Assessment } from '@mui/icons-material'

interface Event {
  timestamp: string
  vehiclePlate: string
  alarmType: string
  driver: string
  comments?: string
}

interface EventsTableProps {
  events: Event[]
  totalEvents: number
  getAlarmColor: (type: string) => string
}

const EventsTable: React.FC<EventsTableProps> = ({ events, totalEvents, getAlarmColor }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Assessment sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Eventos Filtrados
          </Typography>
        </Box>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Patente</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Conductor</TableCell>
                <TableCell>Comentarios</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event, index) => (
                <TableRow key={index} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{event.timestamp}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {event.vehiclePlate}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={event.alarmType}
                      size="small"
                      sx={{
                        bgcolor: getAlarmColor(event.alarmType),
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        px: 1,
                        py: 0.5,
                      }}
                    />
                  </TableCell>
                  <TableCell>{event.driver}</TableCell>
                  <TableCell>
                    <Tooltip title={event.comments || ''}>
                      <span>
                        {event.comments
                          ? event.comments.length > 30
                            ? `${event.comments.substring(0, 30)}...`
                            : event.comments
                          : 'Sin comentarios'}
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Mostrando {events.length} de {totalEvents} eventos
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default EventsTable
