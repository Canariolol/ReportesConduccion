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
    'distraido': '#e65100',
    'cruce': '#6a1b9a',
    'distancia': '#0d47a1',
    'fatiga': '#f9a825',
    'frenada': '#1b5e20',
    'stop': '#424242',
    'telefono': '#004d40',
    'boton': '#2e7d32',
    'video': '#8e24aa',
  }
  
  const normalized = type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const [key, color] of Object.entries(colors)) {
    if (normalized.includes(key)) return color
  }
  return '#64b5f6'
}

export const formatTimestamp = (timestamp: string): string => {
  try {
    const eventDate = new Date(timestamp)
    if (!isNaN(eventDate.getTime())) {
      return format(eventDate, 'dd/MM HH:mm')
    } else {
      return timestamp || 'Fecha inválida'
    }
  } catch (error) {
    console.error('Error parsing timestamp:', timestamp, error)
    return timestamp || 'Fecha inválida'
  }
}
