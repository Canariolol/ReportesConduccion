import React from 'react'
import { Box } from '@mui/material'

// Componente para mostrar iconos de posición
const PositionIcon: React.FC<{ position: number; type: 'top' | 'best' }> = ({ position, type }) => {
  if (position > 3) return null

  const getIconPath = () => {
    if (type === 'top') {
      switch (position) {
        case 1: return '/alarma-roja.svg'
        case 2: return '/alarma-naranja.svg'
        case 3: return '/alarma-amarilla.svg'
        default: return ''
      }
    } else {
      switch (position) {
        case 1: return '/ranking-oro.svg'
        case 2: return '/ranking-plata.svg'
        case 3: return '/ranking-bronce.svg'
        default: return ''
      }
    }
  }

  const [svgContent, setSvgContent] = React.useState<string>('')
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false)

  React.useEffect(() => {
    const iconPath = getIconPath()
    if (iconPath) {
      // Cargar el SVG como texto directamente para compatibilidad con html2canvas
      fetch(iconPath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          return response.text()
        })
        .then(svgText => {
          // Modificar el SVG para asegurar que tenga dimensiones explícitas
          const modifiedSvg = svgText.replace(
            /<svg([^>]*)>/,
            '<svg$1 width="24" height="24" viewBox="0 0 24 24">'  // 4x más grande
          )
          // Guardar el contenido SVG directamente
          setSvgContent(modifiedSvg)
          setIsLoaded(true)
        })
        .catch(error => {
          console.error(`Error cargando icono ${iconPath}:`, error)
          setIsLoaded(true) // Marcar como cargado aunque haya error
        })
    }
  }, [position, type])

  if (!isLoaded) {
    // Mostrar un placeholder mientras se carga el icono
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          mr: 1,
          display: 'inline-block',
          backgroundColor: '#f0f0f0',
          borderRadius: '50%'
        }}
      />
    )
  }

  // Si no hay contenido SVG, mostrar placeholder
  if (!svgContent) {
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          mr: 1,
          display: 'inline-block',
          backgroundColor: '#f0f0f0',
          borderRadius: '50%'
        }}
      />
    )
  }

  // Renderizar el SVG directamente como un elemento DOM
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        mr: 1,
        display: 'inline-block'
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}

export default PositionIcon