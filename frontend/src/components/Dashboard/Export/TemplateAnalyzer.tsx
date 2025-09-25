import React from 'react';
import * as XLSX from 'xlsx';

interface TemplateAnalyzerProps {
  onTemplateAnalyzed: (analysis: TemplateAnalysis) => void;
}

export interface TemplateAnalysis {
  sheetNames: string[];
  sheets: {
    [key: string]: {
      range: string;
      cellCount: number;
      sampleCells: { [key: string]: any };
      structure: string;
    };
  };
}

const TemplateAnalyzer: React.FC<TemplateAnalyzerProps> = ({ onTemplateAnalyzed }) => {
  const analyzeTemplate = async () => {
    try {
      console.log('🔍 Analizando plantilla referenciaReporte.xlsx...');
      
      // Cargar el archivo de plantilla
      const response = await fetch('/referenciaReporte.xlsx');
      if (!response.ok) {
        throw new Error('No se pudo cargar la plantilla de referencia');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const templateData = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(templateData, { type: 'array' });
      
      const analysis: TemplateAnalysis = {
        sheetNames: workbook.SheetNames,
        sheets: {}
      };
      
      // Analizar cada hoja
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const range = sheet['!ref'] || 'A1';
        
        // Obtener todas las celdas de la hoja
        const cells: { [key: string]: any } = {};
        Object.keys(sheet).forEach(cellKey => {
          if (cellKey !== '!ref') {
            cells[cellKey] = sheet[cellKey];
          }
        });
        
        // Analizar estructura básica
        let structure = 'Desconocida';
        if (sheetName.toLowerCase().includes('resumen')) {
          structure = 'Hoja de Resumen';
        } else if (sheetName.toLowerCase().includes('evento')) {
          structure = 'Hoja de Eventos';
        } else if (sheetName.toLowerCase().includes('dato')) {
          structure = 'Hoja de Datos';
        }
        
        analysis.sheets[sheetName] = {
          range,
          cellCount: Object.keys(cells).length,
          sampleCells: cells,
          structure
        };
        
        console.log(`📊 Hoja "${sheetName}":`);
        console.log(`   - Rango: ${range}`);
        console.log(`   - Celdas: ${Object.keys(cells).length}`);
        console.log(`   - Estructura: ${structure}`);
        console.log(`   - Celdas de muestra:`, Object.keys(cells).slice(0, 10));
      });
      
      console.log('✅ Análisis de plantilla completado:', analysis);
      onTemplateAnalyzed(analysis);
      
    } catch (error) {
      console.error('❌ Error al analizar plantilla:', error);
    }
  };

  return (
    <button onClick={analyzeTemplate} style={{ display: 'none' }}>
      Analizar Plantilla
    </button>
  );
};

export default TemplateAnalyzer;
