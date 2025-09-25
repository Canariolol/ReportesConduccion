import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { CompanyManagerProps } from './CompanyTypes';

export interface CompanyManagerRef {
  transformCompanyName: (companyName: string) => string;
  getEventCompanyName: (event: any) => string;
  extractCompaniesFromData: () => string[];
}

const CompanyManager = forwardRef<CompanyManagerRef, CompanyManagerProps>(({
  currentReport,
  selectedCompany,
  availableCompanies,
  onCompanyChange,
  setAvailableCompanies
}, ref) => {
  // Función para transformar nombres de empresas
  const transformCompanyName = (companyName: string): string => {
    const companyMap: Record<string, string> = {
      'TPF': 'TRANS PACIFIC FIBRE SA',
      'Bosque Los Lagos': 'BOSQUES LOS LAGOS SPA',
      'Llico': 'SOC. DE TRANSP. LLICO LTDA.'
    };
    
    return companyMap[companyName] || companyName;
  };
  
  // Función para extraer empresas de los datos del conductor
  const extractCompaniesFromData = (): string[] => {
    if (!currentReport) return [];
    
    const companies = new Set<string>();
    const validCompanies = ['Bosque Los Lagos', 'TPF', 'Llico'];
    
    currentReport.events.forEach((event: any) => {
      if (event.driver) {
        // Buscar empresas entre paréntesis en el nombre del conductor
        const match = event.driver.match(/\(([^)]+)\)/);
        if (match) {
          const company = match[1].trim();
          if (validCompanies.includes(company)) {
            companies.add(company);
          }
        }
      }
    });
    
    return Array.from(companies);
  };
  
  // Función para obtener el nombre completo de la empresa del evento
  const getEventCompanyName = (event: any): string => {
    if (!event.driver) return 'Sin empresa';
    
    // Buscar empresas entre paréntesis en el nombre del conductor
    const match = event.driver.match(/\(([^)]+)\)/);
    if (match) {
      const company = match[1].trim();
      return transformCompanyName(company);
    }
    
    return 'Sin empresa';
  };

  // Exponer funciones para que sean usadas por otros componentes
  useImperativeHandle(ref, () => ({
    transformCompanyName,
    getEventCompanyName,
    extractCompaniesFromData
  }));

  // Actualizar empresas disponibles cuando cambie el reporte
  useEffect(() => {
    if (currentReport) {
      const companies = extractCompaniesFromData();
      const transformedCompanies = companies.map(transformCompanyName);
      setAvailableCompanies(transformedCompanies);
      if (transformedCompanies.length > 0 && !selectedCompany) {
        onCompanyChange(transformedCompanies[0]);
      }
    }
  }, [currentReport, selectedCompany, onCompanyChange, setAvailableCompanies]);

  return null; // Este componente no renderiza nada, solo proporciona lógica
});

CompanyManager.displayName = 'CompanyManager';

export default CompanyManager;
