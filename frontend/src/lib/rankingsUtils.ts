import { ProcessedReport } from '../services/excel'

// Tipos de alarmas manejados en el sistema
export const ALARM_TYPES = {
  cinturon: 'Cinturón de seguridad',
  distraido: 'Conductor distraído',
  cruce: 'Cruce de carril',
  distancia: 'Distancia de seguridad',
  fatiga: 'Fatiga',
  frenada: 'Frenada brusca',
  stop: 'Infracción de señal de stop',
  telefono: 'Teléfono móvil',
  boton: 'Botón de Alerta',
  video: 'Video Solicitado'
} as const

// Interfaz para un ítem de ranking
export interface RankingItem {
  id: string
  name: string
  count: number
  percentage?: number
  mostRecurrentEvent?: string
  mostRecurrentVehicle?: string
}

// Interfaz para los datos de rankings completos
export interface RankingsData {
  topAlarms: RankingItem[]
  allAlarms: RankingItem[]
  bestPerformers: RankingItem[]
}

// Tipo para el modo de conteo
export type CountByMode = 'truck' | 'driver'

/**
 * Función principal para calcular rankings a partir de un reporte procesado
 * @param report - Reporte procesado con los eventos
 * @param countBy - Modo de conteo: 'truck' para contar por camión, 'driver' para contar por conductor
 * @returns Objeto con los datos de rankings calculados
 */
export function calculateRankings(report: ProcessedReport, countBy: CountByMode = 'truck'): RankingsData {
  // Extraer y contar las alarmas por el modo seleccionado
  const alarmCounts = countAlarmsByMode(report.events, countBy)
  
  // Obtener el evento más recurrente para cada camión/conductor
  const mostRecurrentEvents = getMostRecurrentEvents(report.events, countBy)
  
  // Calcular el total de alarmas para porcentajes
  const totalAlarms = Object.values(alarmCounts).reduce((sum, count) => sum + count, 0)
  
  // Convertir a array de RankingItem y calcular porcentajes
  const rankingItems = Object.entries(alarmCounts).map(([id, count]) => ({
    id,
    name: id, // El nombre es el mismo que el ID (placa o conductor)
    count,
    percentage: totalAlarms > 0 ? (count / totalAlarms) * 100 : 0,
    mostRecurrentEvent: mostRecurrentEvents[id] || ''
  }))
  
  // Ordenar por cantidad de alarmas (descendente)
  const sortedByAlarms = [...rankingItems].sort((a, b) => b.count - a.count)
  
  // Top 10 con más alarmas
  const topAlarms = sortedByAlarms.slice(0, 10)
  
  // Todas las alarmas ordenadas
  const allAlarms = sortedByAlarms
  
  // Top 10 con menos alarmas (mejores)
  const bestPerformers = [...sortedByAlarms]
    .filter(item => item.count > 0) // Solo incluir los que tienen al menos una alarma
    .reverse() // Ordenar ascendente (menos alarmas primero)
    .slice(0, 10)
  
  return {
    topAlarms,
    allAlarms,
    bestPerformers
  }
}

/**
 * Cuenta las alarmas por camión o conductor
 * @param events - Array de eventos del reporte
 * @param countBy - Modo de conteo: 'truck' para contar por camión, 'driver' para contar por conductor
 * @returns Objeto con el conteo de alarmas por camión o conductor
 */
function countAlarmsByMode(events: ProcessedReport['events'], countBy: CountByMode): Record<string, number> {
  const counts: Record<string, number> = {}
  
  events.forEach(event => {
    // Determinar la clave según el modo de conteo
    const key = countBy === 'truck' ? event.vehiclePlate : event.driver
    
    // Incrementar el contador para esta clave
    if (key) {
      counts[key] = (counts[key] || 0) + 1
    }
  })
  
  return counts
}

/**
 * Determina el tipo de evento más recurrente para cada camión o conductor
 * @param events - Array de eventos del reporte
 * @param countBy - Modo de conteo: 'truck' para contar por camión, 'driver' para contar por conductor
 * @returns Objeto con el tipo de evento más recurrente por camión o conductor
 */
function getMostRecurrentEvents(events: ProcessedReport['events'], countBy: CountByMode): Record<string, string> {
  const eventTypesByEntity: Record<string, Record<string, number>> = {}
  
  events.forEach(event => {
    // Determinar la clave según el modo de conteo
    const key = countBy === 'truck' ? event.vehiclePlate : event.driver
    
    if (key && event.alarmType) {
      // Inicializar el contador para esta entidad si no existe
      if (!eventTypesByEntity[key]) {
        eventTypesByEntity[key] = {}
      }
      
      // Incrementar el contador para este tipo de evento
      eventTypesByEntity[key][event.alarmType] = (eventTypesByEntity[key][event.alarmType] || 0) + 1
    }
  })
  
  // Determinar el tipo de evento más recurrente para cada entidad
  const mostRecurrentEvents: Record<string, string> = {}
  
  Object.entries(eventTypesByEntity).forEach(([entity, eventTypes]) => {
    // Encontrar el tipo de evento con mayor count
    const sortedEventTypes = Object.entries(eventTypes)
      .sort(([, countA], [, countB]) => countB - countA)
    
    if (sortedEventTypes.length > 0) {
      // Obtener el nombre descriptivo del tipo de evento más recurrente
      const [eventType] = sortedEventTypes[0]
      mostRecurrentEvents[entity] = getAlarmTypeName(eventType as keyof typeof ALARM_TYPES)
    }
  })
  
  return mostRecurrentEvents
}

/**
 * Filtra eventos por tipo de alarma específico
 * @param events - Array de eventos del reporte
 * @param alarmType - Tipo de alarma a filtrar
 * @returns Array de eventos filtrados por tipo de alarma
 */
export function filterEventsByAlarmType(events: ProcessedReport['events'], alarmType: keyof typeof ALARM_TYPES): ProcessedReport['events'] {
  return events.filter(event => event.alarmType === alarmType)
}

/**
 * Calcula rankings para un tipo de alarma específico
 * @param report - Reporte procesado con los eventos
 * @param alarmType - Tipo de alarma específico
 * @param countBy - Modo de conteo: 'truck' para contar por camión, 'driver' para contar por conductor
 * @returns Objeto con los datos de rankings para el tipo de alarma especificado
 */
export function calculateRankingsByAlarmType(
  report: ProcessedReport, 
  alarmType: keyof typeof ALARM_TYPES,
  countBy: CountByMode = 'truck'
): RankingsData {
  // Filtrar eventos por tipo de alarma
  const filteredEvents = filterEventsByAlarmType(report.events, alarmType)
  
  // Crear un reporte temporal con solo los eventos filtrados
  const filteredReport: ProcessedReport = {
    ...report,
    events: filteredEvents
  }
  
  // Calcular rankings para los eventos filtrados
  return calculateRankings(filteredReport, countBy)
}

/**
 * Obtiene el nombre descriptivo de un tipo de alarma
 * @param alarmType - Clave del tipo de alarma
 * @returns Nombre descriptivo del tipo de alarma
 */
export function getAlarmTypeName(alarmType: keyof typeof ALARM_TYPES): string {
  return ALARM_TYPES[alarmType] || alarmType
}

/**
 * Verifica si un tipo de alarma es válido
 * @param alarmType - Tipo de alarma a verificar
 * @returns true si el tipo de alarma es válido, false en caso contrario
 */
export function isValidAlarmType(alarmType: string): alarmType is keyof typeof ALARM_TYPES {
  return alarmType in ALARM_TYPES
}

/**
 * Calcula estadísticas adicionales para un ranking
 * @param rankingItems - Array de ítems de ranking
 * @returns Objeto con estadísticas adicionales
 */
export function calculateRankingStats(rankingItems: RankingItem[]): {
  totalItems: number
  totalAlarms: number
  averageAlarms: number
  maxAlarms: number
  minAlarms: number
} {
  const totalItems = rankingItems.length
  const totalAlarms = rankingItems.reduce((sum, item) => sum + item.count, 0)
  const averageAlarms = totalItems > 0 ? totalAlarms / totalItems : 0
  const maxAlarms = totalItems > 0 ? Math.max(...rankingItems.map(item => item.count)) : 0
  const minAlarms = totalItems > 0 ? Math.min(...rankingItems.map(item => item.count)) : 0
  
  return {
    totalItems,
    totalAlarms,
    averageAlarms,
    maxAlarms,
    minAlarms
  }
}

/**
 * Calcula el ranking de tipos de alarma y sus cantidades
 * @param report - Reporte procesado con los eventos
 * @param countBy - Modo de conteo: 'truck' para contar por camión, 'driver' para contar por conductor
 * @returns Array de RankingItem con los tipos de alarma ordenados por cantidad (descendente)
 */
export function calculateAlarmTypesRanking(report: ProcessedReport, countBy: CountByMode = 'truck'): RankingItem[] {
  const alarmTypeCounts: Record<string, number> = {}
  
  // Contar alarmas por tipo
  report.events.forEach(event => {
    if (event.alarmType) {
      alarmTypeCounts[event.alarmType] = (alarmTypeCounts[event.alarmType] || 0) + 1
    }
  })
  
  // Obtener el camión/conductor más recurrente para cada tipo de alarma
  const mostRecurrentVehicles = getMostRecurrentVehicleByAlarmType(report.events, countBy)
  
  // Calcular el total de alarmas para porcentajes
  const totalAlarms = Object.values(alarmTypeCounts).reduce((sum, count) => sum + count, 0)
  
  // Convertir a array de RankingItem y calcular porcentajes
  const rankingItems = Object.entries(alarmTypeCounts).map(([type, count]) => ({
    id: type,
    name: getAlarmTypeName(type as keyof typeof ALARM_TYPES),
    count,
    percentage: totalAlarms > 0 ? (count / totalAlarms) * 100 : 0,
    mostRecurrentVehicle: mostRecurrentVehicles[type] || ''
  }))
  
  // Ordenar por cantidad de alarmas (descendente)
  return rankingItems.sort((a, b) => b.count - a.count)
}

/**
 * Determina el camión o conductor más recurrente para cada tipo de alarma
 * @param events - Array de eventos del reporte
 * @param countBy - Modo de conteo: 'truck' para contar por camión, 'driver' para contar por conductor
 * @returns Objeto con el camión/conductor más recurrente por tipo de alarma
 */
function getMostRecurrentVehicleByAlarmType(events: ProcessedReport['events'], countBy: CountByMode): Record<string, string> {
  const vehicleCountsByAlarmType: Record<string, Record<string, number>> = {}
  
  events.forEach(event => {
    if (event.alarmType) {
      // Determinar la clave según el modo de conteo
      const key = countBy === 'truck' ? event.vehiclePlate : event.driver
      
      if (key) {
        // Inicializar el contador para este tipo de alarma si no existe
        if (!vehicleCountsByAlarmType[event.alarmType]) {
          vehicleCountsByAlarmType[event.alarmType] = {}
        }
        
        // Incrementar el contador para este camión/conductor
        vehicleCountsByAlarmType[event.alarmType][key] = (vehicleCountsByAlarmType[event.alarmType][key] || 0) + 1
      }
    }
  })
  
  // Determinar el camión/conductor más recurrente para cada tipo de alarma
  const mostRecurrentVehicles: Record<string, string> = {}
  
  Object.entries(vehicleCountsByAlarmType).forEach(([alarmType, vehicleCounts]) => {
    // Encontrar el camión/conductor con mayor count
    const sortedVehicles = Object.entries(vehicleCounts)
      .sort(([, countA], [, countB]) => countB - countA)
    
    if (sortedVehicles.length > 0) {
      // Obtener el camión/conductor más recurrente
      const [vehicle] = sortedVehicles[0]
      mostRecurrentVehicles[alarmType] = vehicle
    }
  })
  
  return mostRecurrentVehicles
}

/**
 * Combina rankings de múltiples reportes
 * @param reports - Array de reportes procesados
 * @param countBy - Modo de conteo: 'truck' para contar por camión, 'driver' para contar por conductor
 * @returns Objeto con los datos de rankings combinados
 */
export function combineRankingsFromReports(reports: ProcessedReport[], countBy: CountByMode = 'truck'): RankingsData {
  // Combinar todos los eventos de todos los reportes
  const allEvents = reports.flatMap(report => report.events)
  
  // Crear un reporte combinado temporal
  const combinedReport: ProcessedReport = {
    ...reports[0], // Usar el primer reporte como base para los demás campos
    events: allEvents,
    summary: {
      totalAlarms: allEvents.length,
      alarmTypes: {},
      videosRequested: 0
    }
  }
  
  // Calcular rankings para el reporte combinado
  return calculateRankings(combinedReport, countBy)
}