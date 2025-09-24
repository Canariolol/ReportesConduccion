/**
 * Utilidades para crear gradientes de colores
 */

/**
 * Crea una versión más oscura de un color hexadecimal
 * @param baseColor Color base en formato hexadecimal (ej: #FF5733)
 * @param type Tipo de gradiente ('darker', 'lighter', 'complementary')
 * @returns Color modificado en formato hexadecimal
 */
export function createGradient(baseColor: string, type: 'darker' | 'lighter' | 'complementary' = 'darker'): string {
  // Remover el # si está presente
  const hex = baseColor.replace('#', '');
  
  // Convertir a RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  switch (type) {
    case 'darker':
      // Oscurecer el color reduciendo cada componente en un 30%
      return `#${Math.max(0, Math.floor(r * 0.7)).toString(16).padStart(2, '0')}${Math.max(0, Math.floor(g * 0.7)).toString(16).padStart(2, '0')}${Math.max(0, Math.floor(b * 0.7)).toString(16).padStart(2, '0')}`;
    
    case 'lighter':
      // Aclarar el color aumentando cada componente en un 30%
      return `#${Math.min(255, Math.floor(r * 1.3)).toString(16).padStart(2, '0')}${Math.min(255, Math.floor(g * 1.3)).toString(16).padStart(2, '0')}${Math.min(255, Math.floor(b * 1.3)).toString(16).padStart(2, '0')}`;
    
    case 'complementary':
      // Crear color complementario (invertir)
      return `#${(255 - r).toString(16).padStart(2, '0')}${(255 - g).toString(16).padStart(2, '0')}${(255 - b).toString(16).padStart(2, '0')}`;
    
    default:
      return baseColor;
  }
}

/**
 * Genera un gradiente lineal para SVG
 * @param startColor Color de inicio
 * @param endColor Color de fin
 * @param angle Ángulo del gradiente en grados
 * @returns String de definición de gradiente para SVG
 */
export function createLinearGradient(startColor: string, endColor: string, angle: number = 45): string {
  const x1 = 0;
  const y1 = 0;
  const x2 = Math.cos((angle * Math.PI) / 180) * 100;
  const y2 = Math.sin((angle * Math.PI) / 180) * 100;
  
  return `
    <linearGradient x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      <stop offset="0%" stopColor="${startColor}" stopOpacity="1" />
      <stop offset="100%" stopColor="${endColor}" stopOpacity="1" />
    </linearGradient>
  `;
}

/**
 * Genera un gradiente radial para SVG
 * @param centerColor Color del centro
 * @param outerColor Color del exterior
 * @returns String de definición de gradiente para SVG
 */
export function createRadialGradient(centerColor: string, outerColor: string): string {
  return `
    <radialGradient cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="${centerColor}" stopOpacity="1" />
      <stop offset="100%" stopColor="${outerColor}" stopOpacity="1" />
    </radialGradient>
  `;
}
