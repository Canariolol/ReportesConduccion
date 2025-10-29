// Script para probar el problema del zoom en la generación de PDF
// Este script simula el flujo de generación para identificar el problema

console.log('🔍 INICIANDO ANÁLISIS DEL PROBLEMA DE ZOOM');
console.log('===========================================');

// Simular las dimensiones típicas de un ranking
const typicalRankingWidth = 800;  // px
const typicalRankingHeight = 600; // px

// Simular las dimensiones de una página A4 horizontal (en mm)
const pageWidth = 297;  // mm (A4 horizontal)
const pageHeight = 210; // mm (A4 horizontal)

// Configuración de márgenes
const margin = 20; // mm
const headerHeight = 20; // mm
const footerHeight = 15; // mm

// Dimensiones disponibles para la imagen (en mm)
const availableWidth = pageWidth - (margin * 2);
const availableHeight = pageHeight - headerHeight - footerHeight - margin;

console.log('📄 DIMENSIONES DE LA PÁGINA PDF:');
console.log(`  - Página A4 horizontal: ${pageWidth}x${pageHeight} mm`);
console.log(`  - Margen: ${margin} mm`);
console.log(`  - Header: ${headerHeight} mm`);
console.log(`  - Footer: ${footerHeight} mm`);
console.log(`  - Espacio disponible: ${availableWidth}x${availableHeight} mm`);

// Factor de conversión de px a mm (aproximado)
const pxToMm = 0.264583; // 1px = 0.264583mm a 96dpi

console.log('\n🖼️ DIMENSIONES DEL RANKING ORIGINAL:');
console.log(`  - Tamaño original: ${typicalRankingWidth}x${typicalRankingHeight} px`);
console.log(`  - Convertido a mm: ${(typicalRankingWidth * pxToMm).toFixed(2)}x${(typicalRankingHeight * pxToMm).toFixed(2)} mm`);

// Simular el proceso de escalado actual
const aspectRatio = typicalRankingHeight / typicalRankingWidth;
let baseWidth = availableWidth;
let baseHeight = baseWidth * aspectRatio;

console.log('\n📐 CÁLCULO DE DIMENSIONES BASE (SIN ZOOM):');
console.log(`  - Aspect ratio: ${aspectRatio.toFixed(2)}`);
console.log(`  - Base width (ajustado a availableWidth): ${baseWidth.toFixed(2)} mm`);
console.log(`  - Base height: ${baseHeight.toFixed(2)} mm`);

// Verificar si excede el alto disponible
if (baseHeight > availableHeight) {
  baseHeight = availableHeight;
  baseWidth = baseHeight / aspectRatio;
  console.log(`  - ⚠️ Ajustado por alto: ${baseWidth.toFixed(2)}x${baseHeight.toFixed(2)} mm`);
}

// Aplicar zoom (valor actual en el código)
const RANKING_ZOOM_FACTOR = 3;
console.log('\n🔍 APLICANDO ZOOM:');
console.log(`  - Factor de zoom configurado: ${RANKING_ZOOM_FACTOR}`);

const zoomedWidth = baseWidth * RANKING_ZOOM_FACTOR;
const zoomedHeight = zoomedWidth * aspectRatio;

console.log(`  - Dimensiones con zoom teórico: ${zoomedWidth.toFixed(2)}x${zoomedHeight.toFixed(2)} mm`);

// Aplicar límites de la página (Math.min)
let drawWidth = Math.min(baseWidth * RANKING_ZOOM_FACTOR, availableWidth);
let drawHeight = drawWidth * aspectRatio;

console.log(`  - Después de Math.min(): ${drawWidth.toFixed(2)}x${drawHeight.toFixed(2)} mm`);
console.log(`  - ¿El zoom fue limitado por availableWidth? ${zoomedWidth > availableWidth ? 'SÍ ⚠️' : 'NO'}`);

// Ajustar si excede el alto disponible
if (drawHeight > availableHeight) {
  console.log(`  - ⚠️ Ajustando por alto disponible...`);
  drawHeight = availableHeight;
  drawWidth = drawHeight / aspectRatio;
  console.log(`  - Dimensiones finales: ${drawWidth.toFixed(2)}x${drawHeight.toFixed(2)} mm`);
  console.log(`  - ¿El zoom fue limitado por availableHeight? SÍ ⚠️`);
}

const effectiveZoom = drawWidth / (availableWidth / RANKING_ZOOM_FACTOR);
console.log(`  - Zoom efectivo aplicado: ${effectiveZoom.toFixed(2)}x`);

console.log('\n🎯 ANÁLISIS DEL PROBLEMA:');
console.log('===========================================');
console.log('El problema principal es que el zoom se aplica correctamente,');
console.log('pero luego se limita para que quepa en la página.');
console.log('');
console.log('Con un factor de zoom de 3:');
console.log(`  - La imagen intentaría ser ${zoomedWidth.toFixed(2)} mm de ancho`);
console.log(`  - Pero la página solo tiene ${availableWidth} mm disponibles`);
console.log(`  - Por lo tanto, el zoom se reduce a ${(availableWidth / (availableWidth / RANKING_ZOOM_FACTOR)).toFixed(2)}x`);
console.log('');
console.log('SOLUCIÓN PROPUESTA:');
console.log('1. Reducir las dimensiones originales de la captura (maxWidth)');
console.log('2. O aumentar el tamaño de la página del PDF');
console.log('3. O aplicar el zoom antes de ajustar a la página');