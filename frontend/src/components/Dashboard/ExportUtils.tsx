import { format } from 'date-fns'

interface ChartCaptureResult {
  imageData: string
  width: number
  height: number
}

export const captureChartAsImage = async (
  ref: { current: HTMLDivElement | null }, 
  fileName: string
): Promise<ChartCaptureResult> => {
  console.log(`Intentando capturar ${fileName}...`)
  console.log(`Referencia recibida:`, ref)
  console.log(`Referencia actual:`, ref?.current)
  
  if (!ref?.current) {
    console.error(`Error: No se encontró el elemento DOM para ${fileName}`)
    return { imageData: '', width: 0, height: 0 }
  }
  
  try {
    console.log(`Importando html2canvas para ${fileName}...`)
    const html2canvas = (await import('html2canvas')).default
    console.log(`html2canvas importado correctamente para ${fileName}`)
    
    console.log(`Iniciando captura de ${fileName} con html2canvas...`)
    const canvas = await html2canvas(ref.current, {
      backgroundColor: '#ffffff',
      scale: 2, // Mayor calidad
      useCORS: true,
      allowTaint: true,
      width: ref.current.offsetWidth,
      height: ref.current.offsetHeight,
      logging: true, // Habilitar logging para depuración
    })
    
    console.log(`Captura de ${fileName} completada. Dimensiones: ${canvas.width}x${canvas.height}`)
    
    const imageData = canvas.toDataURL('image/png')
    console.log(`Imagen convertida a base64 para ${fileName}. Longitud: ${imageData.length}`)
    
    return {
      imageData,
      width: canvas.width,
      height: canvas.height
    }
  } catch (error) {
    console.error(`Error capturando ${fileName}:`, error)
    return { imageData: '', width: 0, height: 0 }
  }
}

export const getAlarmColor = (type: string): string => {
  const colors: Record<string, string> = {
    'cinturon': '#b71c1c',
    'distraido': '#ffa724ff',
    'cruce': '#7c14a5ff',
    'distancia': '#0d47a1',
    'fatiga': '#42b4b8ff',
    'frenada': '#7fc079ff',
    'stop': '#424242',
    'telefono': '#2e7400ff',
    'boton': '#f7d73aff',
    'video': '#fc96ffff',
  }
  
  const normalized = type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const [key, color] of Object.entries(colors)) {
    if (normalized.includes(key)) return color
  }
  return '#64b5f6'
}

export const formatTimestamp = (timestamp: string): string => {
  try {
    // Si es un timestamp numérico (Unix), convertirlo y ajustar a zona horaria de Santiago
    if (/^\d+$/.test(timestamp)) {
      const unixTimestamp = parseInt(timestamp)
      const date = new Date(unixTimestamp * 1000) // Convertir a milisegundos
      
      // Formatear en zona horaria de America/Santiago
      return new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(date).replace(/\//g, '/').replace(/,/g, ',')
    }
    
    // Parsear el timestamp en formato "14/09/25, 11:38:35"
    const timestampStr = timestamp
    const [datePart, timePart] = timestampStr.split(', ')
    const [day, month, year] = datePart.split('/')
    const [hours, minutes, seconds] = timePart.split(':')
    
    // Crear fecha con formato correcto (añadir 2000 al año de 2 dígitos)
    const fullYear = `20${year}`
    
    // Crear fecha en UTC y luego convertir a zona horaria de Santiago
    const utcDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours}:${minutes}:${seconds}Z`)
    
    if (!isNaN(utcDate.getTime())) {
      // Formatear en zona horaria de America/Santiago
      return new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(utcDate).replace(/\//g, '/').replace(/,/g, ',')
    } else {
      // Si falla el parsing, intentar con el timestamp original
      const originalDate = new Date(timestamp)
      if (!isNaN(originalDate.getTime())) {
        // Formatear en zona horaria de America/Santiago
        return new Intl.DateTimeFormat('es-CL', {
          timeZone: 'America/Santiago',
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(originalDate).replace(/\//g, '/').replace(/,/g, ',')
      } else {
        return timestamp || 'Fecha inválida'
      }
    }
  } catch (error) {
    console.error('Error parsing timestamp:', timestamp, error)
    // Si hay error en el parsing, intentar con el timestamp original
    try {
      const eventDate = new Date(timestamp)
      if (!isNaN(eventDate.getTime())) {
        // Formatear en zona horaria de America/Santiago
        return new Intl.DateTimeFormat('es-CL', {
          timeZone: 'America/Santiago',
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(eventDate).replace(/\//g, '/').replace(/,/g, ',')
      }
    } catch (secondError) {
      console.error('Error en segundo intento de parsing:', timestamp, secondError)
    }
    return timestamp || 'Fecha inválida'
  }
}
