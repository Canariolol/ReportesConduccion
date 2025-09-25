export interface CompanyManagerProps {
  currentReport: any;
  selectedCompany: string;
  availableCompanies: string[];
  onCompanyChange: (company: string) => void;
  setAvailableCompanies: (companies: string[]) => void;
}

export interface CompanyData {
  name: string;
  transformedName: string;
}

export interface CompanyTransformResult {
  companies: string[];
  transformedCompanies: string[];
}
