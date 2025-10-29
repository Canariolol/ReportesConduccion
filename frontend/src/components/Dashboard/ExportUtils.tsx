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

    // Verificar si hay elementos SVG dentro del elemento clonado (tanto imágenes como SVG directos)
    const svgImageElements = clonedElement.querySelectorAll('img[src*=".svg"]') as NodeListOf<HTMLImageElement>
    const svgDirectElements = clonedElement.querySelectorAll('svg') as NodeListOf<SVGSVGElement>
    
    console.log(`Se encontraron ${svgImageElements.length} imágenes SVG y ${svgDirectElements.length} SVG directos en ${fileName}:`)
    
    // Procesar imágenes SVG (método antiguo)
    svgImageElements.forEach((img, index) => {
      console.log(`  Imagen SVG ${index + 1}: src="${img.src}", width=${img.offsetWidth}, height=${img.offsetHeight}`)
    })
    
    // Procesar SVG directos (nuevo método)
    svgDirectElements.forEach((svg, index) => {
      const rect = svg.getBoundingClientRect()
      console.log(`  SVG directo ${index + 1}: width=${rect.width}, height=${rect.height}`)
    })
    
    const blobToDataUrl = (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    }
    
    // Función para convertir SVG a canvas usando canvg
    const convertSvgWithCanvg = async (img: HTMLImageElement): Promise<void> => {
      try {
        console.log(`Intentando convertir SVG con canvg: ${img.src}`)
        
        // Importar canvg dinámicamente
        const { Canvg } = await import('canvg')
        
        // Obtener el contenido SVG
        const response = await fetch(img.src)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const svgText = await response.text()
        
        // Crear un canvas temporal
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('No se pudo obtener el contexto del canvas')
        }
        
        // Establecer dimensiones del canvas basadas en la imagen original
        canvas.width = img.naturalWidth || 24
        canvas.height = img.naturalHeight || 24
        
        // Renderizar el SVG en el canvas usando canvg
        const v = Canvg.fromString(ctx, svgText)
        await v.render()
        
        // Convertir el canvas a data URL
        const dataUrl = canvas.toDataURL('image/png')
        
        // Reemplazar el src de la imagen con el data URL
        img.src = dataUrl
        img.setAttribute('data-inlined-svg', 'true')
        
        console.log(`SVG convertido exitosamente con canvg: ${img.src.substring(0, 50)}...`)
      } catch (error) {
        console.error(`Error al convertir SVG con canvg:`, error)
        throw error
      }
    }

    // Procesar imágenes SVG (método antiguo)
    const svgImageConversionPromises = Array.from(svgImageElements).map(async (img) => {
      if (!img.src || img.src.startsWith('data:') || img.getAttribute('data-inlined-svg') === 'true') {
        return
      }

      try {
        // Primero intentar con canvg
        await convertSvgWithCanvg(img)
      } catch (canvgError) {
        console.warn(`Falló la conversión con canvg, intentando método tradicional:`, canvgError)
        try {
          // Si canvg falla, intentar con el método tradicional
          const response = await fetch(img.src)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const blob = await response.blob()
          const dataUrl = await blobToDataUrl(blob)

          await new Promise<void>((resolve) => {
            img.onload = () => resolve()
            img.onerror = () => resolve()
            img.src = dataUrl
          })

          img.onload = null
          img.onerror = null

          img.setAttribute('data-inlined-svg', 'true')
          console.log(`SVG convertido a data URL: ${img.src.substring(0, 50)}...`)
        } catch (traditionalError) {
          console.error(`Ambos métodos de conversión SVG fallaron para ${img.src}:`, traditionalError)
          
          // Como último recurso, intentar usar una imagen PNG equivalente si existe
          const pngSrc = img.src.replace('.svg', '.png')
          try {
            const response = await fetch(pngSrc)
            if (response.ok) {
              const blob = await response.blob()
              const dataUrl = await blobToDataUrl(blob)
              
              await new Promise<void>((resolve) => {
                img.onload = () => resolve()
                img.onerror = () => resolve()
                img.src = dataUrl
              })
              
              img.setAttribute('data-inlined-svg', 'true')
              console.log(`Usada imagen PNG como alternativa: ${pngSrc}`)
            }
          } catch (pngError) {
            console.error(`No se pudo encontrar imagen PNG alternativa:`, pngError)
          }
        }
      }
    })

    // Procesar SVG directos (nuevo método)
    const svgDirectConversionPromises = Array.from(svgDirectElements).map(async (svg) => {
      if (svg.getAttribute('data-processed') === 'true') {
        return
      }

      try {
        // Convertir SVG directo a canvas usando canvg
        const { Canvg } = await import('canvg')
        
        // Crear un canvas temporal
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('No se pudo obtener el contexto del canvas')
        }
        
        // Obtener dimensiones del SVG
        const svgRect = svg.getBoundingClientRect()
        canvas.width = svgRect.width || 24
        canvas.height = svgRect.height || 24
        
        // Serializar el SVG a string
        const svgString = new XMLSerializer().serializeToString(svg)
        
        // Renderizar el SVG en el canvas usando canvg
        const v = Canvg.fromString(ctx, svgString)
        await v.render()
        
        // Convertir el canvas a data URL
        const dataUrl = canvas.toDataURL('image/png')
        
        // Crear una imagen para reemplazar el SVG
        const img = document.createElement('img')
        img.src = dataUrl
        img.width = svgRect.width || 24
        img.height = svgRect.height || 24
        img.setAttribute('data-inlined-svg', 'true')
        img.style.width = `${svgRect.width || 24}px`
        img.style.height = `${svgRect.height || 24}px`
        
        // Reemplazar el SVG con la imagen
        svg.parentNode?.replaceChild(img, svg)
        
        console.log(`SVG directo convertido exitosamente: ${dataUrl.substring(0, 50)}...`)
      } catch (error) {
        console.error(`Error al convertir SVG directo:`, error)
        
        // Como fallback, intentar precargar el SVG como imagen
        try {
          const svgString = new XMLSerializer().serializeToString(svg)
          const blob = new Blob([svgString], { type: 'image/svg+xml' })
          const dataUrl = await blobToDataUrl(blob)
          
          const img = document.createElement('img')
          img.src = dataUrl
          img.setAttribute('data-inlined-svg', 'true')
          
          const svgRect = svg.getBoundingClientRect()
          img.width = svgRect.width || 24
          img.height = svgRect.height || 24
          img.style.width = `${svgRect.width || 24}px`
          img.style.height = `${svgRect.height || 24}px`
          
          // Reemplazar el SVG con la imagen
          svg.parentNode?.replaceChild(img, svg)
          
          console.log(`SVG directo convertido usando fallback: ${dataUrl.substring(0, 50)}...`)
        } catch (fallbackError) {
          console.error(`Fallback para SVG directo también falló:`, fallbackError)
        }
      }
    })

    // Combinar todas las promesas de conversión
    const svgConversionPromises = [...svgImageConversionPromises, ...svgDirectConversionPromises]

    await Promise.all(svgConversionPromises)
    
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
    const scale = options?.scale ?? 2 // Reducido de 8 a 2 para optimizar tamaño y legibilidad
    // const maxWidth = options?.maxWidth || 1200 // COMENTADO PARA PERMITIR ZOOM COMPLETO SIN LÍMITES DE ANCHO

    const aspectRatio = originalHeight / originalWidth
    
    // let targetWidth = Math.min(originalWidth, maxWidth) // COMENTADO PARA ELIMINAR LÍMITE Math.min()
    let targetWidth = originalWidth // USAR ANCHO ORIGINAL SIN LÍMITES
    let targetHeight = targetWidth * aspectRatio
    
    console.log(`🔍 ANÁLISIS DE CAPTURA CON HTML2CANVAS PARA "${fileName}":`)
    console.log(`  - Dimensiones originales del elemento: ${originalWidth}x${originalHeight}`)
    console.log(`  - Scale configurado en html2canvas: ${scale}`)
    // console.log(`  - MaxWidth configurado: ${maxWidth}`) // COMENTADO PARA ELIMINAR REFERENCIA A VARIABLE COMENTADA
    console.log(`  - Dimensiones objetivo antes de scale: ${targetWidth}x${targetHeight}`)
    console.log(`  - Dimensiones esperadas del canvas (después de scale): ${targetWidth * scale}x${targetHeight * scale}`)
    console.log(`  - ¿El scale afectará el tamaño final? SÍ, el canvas será ${scale}x más grande`)
    
    // Verificar dimensiones del elemento clonado antes de la captura
    const clonedRect = clonedElement.getBoundingClientRect()
    console.log(`Dimensiones del elemento clonado antes de captura: ${clonedRect.width}x${clonedRect.height}`)
    console.log(`OffsetWidth/Height del elemento clonado: ${clonedElement.offsetWidth}x${clonedElement.offsetHeight}`)
    
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
    console.log(`Dimensiones esperadas vs reales - Esperado: ${targetWidth * scale}x${targetHeight * scale}, Real: ${canvas.width}x${canvas.height}`)
    
    // Verificar si hay diferencia entre las dimensiones esperadas y las reales
    const expectedWidth = targetWidth * scale
    const expectedHeight = targetHeight * scale
    const widthDiff = Math.abs(canvas.width - expectedWidth)
    const heightDiff = Math.abs(canvas.height - expectedHeight)
    
    console.log(`📊 ANÁLISIS DE DIMENSIONES REALES vs ESPERADAS:`)
    console.log(`  - Ancho esperado: ${expectedWidth}, Real: ${canvas.width}, Diferencia: ${widthDiff}`)
    console.log(`  - Alto esperado: ${expectedHeight}, Real: ${canvas.height}, Diferencia: ${heightDiff}`)
    console.log(`  - ¿El canvas tiene las dimensiones esperadas? ${widthDiff <= 5 && heightDiff <= 5 ? 'SÍ' : 'NO'}`)
    
    if (widthDiff > 5 || heightDiff > 5) {
      console.warn(`⚠️ DIFERENCIA SIGNIFICATIVA EN DIMENSIONES para ${fileName}:`)
      console.warn(`  - Esperado: ${expectedWidth}x${expectedHeight}`)
      console.warn(`  - Real: ${canvas.width}x${canvas.height}`)
      console.warn(`  - Diferencia: ${widthDiff}x${heightDiff}`)
    }
    
    // Usar directamente el canvas original sin redimensionamiento
    const imageData = canvas.toDataURL('image/png', 1.0)
    console.log(`Imagen de ranking convertida a base64 para ${fileName}. Longitud: ${imageData.length}`)
    console.log(`Dimensiones retornadas: ${canvas.width}x${canvas.height}`)
    
    return {
      imageData,
      width: canvas.width,
      height: canvas.height
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