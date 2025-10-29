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

export const captureRankingAsImage = async (
  ref: { current: HTMLDivElement | null },
  fileName: string,
  options?: { scale?: number; maxWidth?: number }
): Promise<ChartCaptureResult> => {
  console.log(`Intentando capturar ranking ${fileName}...`)
  console.log(`Referencia recibida:`, ref)
  console.log(`Referencia actual:`, ref?.current)
  
  const element = ref?.current

  if (!element) {
    console.error(`Error: No se encontró el elemento DOM para ${fileName}`)
    return { imageData: '', width: 0, height: 0 }
  }

  let tempContainer: HTMLDivElement | null = null

  try {
    console.log(`Importando html2canvas para ranking ${fileName}...`)
    const html2canvas = (await import('html2canvas')).default
    console.log(`html2canvas importado correctamente para ranking ${fileName}`)
    
    // Esperar a que las fuentes web estén listas
    if (document.fonts && 'ready' in document.fonts) {
      try {
        await document.fonts.ready
      } catch (fontError) {
        console.warn(`No se pudo esperar la carga de fuentes para ${fileName}:`, fontError)
      }
    }

    const rect = element.getBoundingClientRect()
    const originalWidth = Math.max(Math.round(rect.width), element.offsetWidth)
    const originalHeight = Math.max(Math.round(rect.height), element.offsetHeight)

    if (!originalWidth || !originalHeight) {
      throw new Error(`El elemento ${fileName} no tiene dimensiones visibles (width=${originalWidth}, height=${originalHeight})`)
    }

    // Clonar el elemento para capturarlo fuera del flujo visual
    tempContainer = document.createElement('div')
    tempContainer.style.position = 'fixed'
    tempContainer.style.left = '-10000px'
    tempContainer.style.top = '0'
    tempContainer.style.width = `${originalWidth}px`
    tempContainer.style.padding = '0'
    tempContainer.style.margin = '0'
    tempContainer.style.backgroundColor = '#ffffff'
    tempContainer.style.zIndex = '-1'
    tempContainer.setAttribute('data-capture-temp', fileName)

    const clonedElement = element.cloneNode(true) as HTMLElement
    clonedElement.setAttribute('data-capture-id', fileName)
    clonedElement.style.width = `${originalWidth}px`
    clonedElement.style.boxSizing = 'border-box'

    tempContainer.appendChild(clonedElement)
    document.body.appendChild(tempContainer)

    // Verificar si hay imágenes SVG dentro del elemento clonado
    const svgElements = clonedElement.querySelectorAll('img[src*=".svg"]') as NodeListOf<HTMLImageElement>
    console.log(`Se encontraron ${svgElements.length} elementos SVG en ${fileName}:`)
    svgElements.forEach((img, index) => {
      console.log(`  SVG ${index + 1}: src="${img.src}", width=${img.offsetWidth}, height=${img.offsetHeight}`)
    })
    
    // Forzar la carga de todas las imágenes antes de capturar
    const imagePromises = Array.from(clonedElement.querySelectorAll('img')).map(async (img) => {
      if (!img.getAttribute('crossorigin')) {
        img.setAttribute('crossorigin', 'anonymous')
      }
      if (img.crossOrigin !== 'anonymous') {
        img.crossOrigin = 'anonymous'
      }

      if (img.complete && img.naturalHeight !== 0) {
        return true
      }
      
      return new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn(`Timeout esperando carga de imagen: ${img.src}`)
          resolve(false)
        }, 7000)
        
        img.onload = () => {
          clearTimeout(timeout)
          resolve(true)
        }
        
        img.onerror = () => {
          clearTimeout(timeout)
          console.error(`Error cargando imagen: ${img.src}`)
          resolve(false)
        }
        
        if (!img.complete) {
          const currentSrc = img.src
          img.src = ''
          img.src = currentSrc
        }
      })
    })
    
    console.log(`Esperando carga de ${imagePromises.length} imágenes para ${fileName}...`)
    await Promise.all(imagePromises)
    
    // Esperar un momento adicional para asegurar que todo se renderice
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Configuración optimizada para capturar rankings
    const scale = options?.scale || 2 // Mayor escala para mejor calidad
    const maxWidth = options?.maxWidth || 600 // Mayor ancho para capturar más detalles

    const aspectRatio = originalHeight / originalWidth
    
    let targetWidth = Math.min(originalWidth, maxWidth)
    let targetHeight = targetWidth * aspectRatio
    
    console.log(`Iniciando captura de ranking ${fileName} con html2canvas...`)
    console.log(`Dimensiones originales: ${originalWidth}x${originalHeight}`)
    console.log(`Dimensiones objetivo: ${targetWidth}x${targetHeight}`)
    
    const canvas = await html2canvas(clonedElement, {
      backgroundColor: '#ffffff',
      scale: scale,
      useCORS: true,
      allowTaint: false,
      width: originalWidth,
      height: originalHeight,
      logging: true,
      // Ignorar elementos que puedan causar problemas
      ignoreElements: (element) => {
        return element.tagName === 'BUTTON' ||
               element.classList.contains('MuiButton-root') ||
               element.classList.contains('MuiIconButton-root')
      }
    })
    
    console.log(`Captura de ranking ${fileName} completada. Dimensiones canvas: ${canvas.width}x${canvas.height}`)
    
    // Crear un canvas temporal para redimensionar la imagen si es necesario
    const finalCanvas = document.createElement('canvas')
    const finalCtx = finalCanvas.getContext('2d')
    
    if (!finalCtx) {
      throw new Error('No se pudo obtener el contexto del canvas final')
    }
    
    // Establecer dimensiones finales
    finalCanvas.width = targetWidth * scale
    finalCanvas.height = targetHeight * scale
    
    // Dibujar la imagen redimensionada
    finalCtx.drawImage(canvas, 0, 0, finalCanvas.width, finalCanvas.height)
    
    const imageData = finalCanvas.toDataURL('image/png', 0.95)
    console.log(`Imagen de ranking convertida a base64 para ${fileName}. Longitud: ${imageData.length}`)
    
    return {
      imageData,
      width: finalCanvas.width,
      height: finalCanvas.height
    }
  } catch (error) {
    console.error(`Error capturando ranking ${fileName}:`, error)
    return { imageData: '', width: 0, height: 0 }
  } finally {
    if (tempContainer && tempContainer.parentElement) {
      tempContainer.parentElement.removeChild(tempContainer)
    }
    tempContainer = null
  }
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
