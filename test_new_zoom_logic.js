// Script para probar la nueva lógica de zoom
console.log('🔍 PROBANDO NUEVA LÓGICA DE ZOOM');
console.log('===================================');

// Configuración
const RANKING_ZOOM_FACTOR = 3;
const CAPTURE_MAX_WIDTH = 600;

// Dimensiones de la página PDF (A4 horizontal)
const pageWidth = 297;  // mm
const pageHeight = 210; // mm

// Configuración de márgenes
const margin = 20; // mm
const headerHeight = 20; // mm
const footerHeight = 15; // mm

// Dimensiones disponibles para la imagen (en mm)
const availableWidth = pageWidth - (margin * 2);
const availableHeight = pageHeight - headerHeight - footerHeight - margin;

console.log('📄 CONFIGURACIÓN:');
console.log(`  - Factor de zoom: ${RANKING_ZOOM_FACTOR}x`);
console.log(`  - Ancho máximo de captura: ${CAPTURE_MAX_WIDTH}px`);
console.log(`  - Espacio disponible en página: ${availableWidth}x${availableHeight} mm`);

// Simular diferentes tamaños de rankings
const testCases = [
  { name: 'Ranking pequeño', width: 400, height: 300 },
  { name: 'Ranking mediano', width: 600, height: 450 },
  { name: 'Ranking grande', width: 800, height: 600 },
  { name: 'Ranking muy grande', width: 1200, height: 900 }
];

testCases.forEach((testCase, index) => {
  console.log(`\n📊 CASO ${index + 1}: ${testCase.name}`);
  console.log(`  - Dimensiones originales: ${testCase.width}x${testCase.height}px`);
  
  // Convertir a mm (aproximado)
  const pxToMm = 0.264583;
  const widthInMm = testCase.width * pxToMm;
  const heightInMm = testCase.height * pxToMm;
  
  console.log(`  - Convertido a mm: ${widthInMm.toFixed(2)}x${heightInMm.toFixed(2)}mm`);
  
  // Aplicar nueva lógica
  const aspectRatio = testCase.height / testCase.width;
  
  // Calcular el tamaño máximo que puede tener la imagen DESPUÉS de aplicar el zoom
  let maxBaseWidth = availableWidth / RANKING_ZOOM_FACTOR;
  let maxBaseHeight = availableHeight / RANKING_ZOOM_FACTOR;
  
  console.log(`  - Dimensiones máximas base (antes de zoom): ${maxBaseWidth.toFixed(2)}x${maxBaseHeight.toFixed(2)}mm`);
  
  // Calcular dimensiones base respetando el aspect ratio y los límites máximos
  let baseWidth = Math.min(maxBaseWidth, widthInMm);
  let baseHeight = baseWidth * aspectRatio;
  
  // Ajustar si excede el alto máximo base
  if (baseHeight > maxBaseHeight) {
    baseHeight = maxBaseHeight;
    baseWidth = baseHeight / aspectRatio;
  }
  
  console.log(`  - Dimensiones base calculadas: ${baseWidth.toFixed(2)}x${baseHeight.toFixed(2)}mm`);
  
  // Aplicar zoom
  let drawWidth = baseWidth * RANKING_ZOOM_FACTOR;
  let drawHeight = drawWidth * aspectRatio;
  
  console.log(`  - Dimensiones con zoom aplicado: ${drawWidth.toFixed(2)}x${drawHeight.toFixed(2)}mm`);
  console.log(`  - ¿Cabe en la página? ${drawWidth <= availableWidth && drawHeight <= availableHeight ? 'SÍ ✅' : 'NO ❌'}`);
  
  // Calcular zoom efectivo
  const effectiveZoom = drawWidth / baseWidth;
  console.log(`  - Zoom efectivo aplicado: ${effectiveZoom.toFixed(2)}x`);
  
  // Comparar con el método anterior
  console.log(`  - Con el método anterior, el zoom habría sido limitado: ${widthInMm * RANKING_ZOOM_FACTOR > availableWidth ? 'SÍ' : 'NO'}`);
});

console.log('\n🎯 CONCLUSIÓN:');
console.log('===================================');
console.log('La nueva lógica calcula primero el tamaño máximo base que permitirá');
console.log('que el zoom quepa en la página, luego aplica el zoom.');
console.log('Esto asegura que el zoom se aplique completamente sin ser limitado.');