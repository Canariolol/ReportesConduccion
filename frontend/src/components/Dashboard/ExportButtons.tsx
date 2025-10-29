import React, { useState } from 'react'
import { Box, Button, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material'
import { GetApp, PictureAsPdf, Save, Business, Refresh } from '@mui/icons-material'
import { ProcessedReport } from '../../services/excel'

interface ExportButtonsProps {
  onExportExcel: () => void
  onExportPDF: () => void
  onSaveToDB: () => void
  onRestart: () => void
  selectedCompany: string
  availableCompanies: string[]
  onCompanyChange: (company: string) => void
  currentReport: ProcessedReport | null
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportExcel,
  onExportPDF,
  onSaveToDB,
  onRestart,
  selectedCompany,
  availableCompanies,
  onCompanyChange,
  currentReport
}) => {
  return (
    <Box sx={{ 
      mb: 4, 
      display: 'flex', 
      flexDirection: 'column',
      gap: 3,
      p: 3,
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      {/* Empresa y Botones */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Selector de Empresa */}
        <FormControl 
          sx={{ 
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'primary.main',
              },
              '&:hover fieldset': {
                borderColor: 'primary.dark',
              },
            }
          }}
        >
          <InputLabel 
            id="company-select-label"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: 'primary.main',
              '&.Mui-focused': {
                color: 'primary.dark',
              }
            }}
          >
            <Business fontSize="small" />
            Empresa
          </InputLabel>
          <Select
            labelId="company-select-label"
            value={selectedCompany}
            onChange={(e) => onCompanyChange(e.target.value)}
            label="Empresa"
          >
            <MenuItem value="">
              <em>Todas las empresas</em>
            </MenuItem>
            {availableCompanies.map((company) => (
              <MenuItem key={company} value={company}>
                {company}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Botones de Exportación */}
        <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
          <Button
            variant="contained"
            startIcon={<GetApp />}
            onClick={onExportExcel}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              }
            }}
          >
            Exportar Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={onExportPDF}
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(240, 147, 251, 0.4)',
              }
            }}
          >
            Exportar PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<Save />}
            onClick={onSaveToDB}
            sx={{
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: 'primary.main',
                color: 'white',
              }
            }}
          >
            Guardar en BD
          </Button>
        </Box>
      </Box>

      {/* Botón de Empezar de Nuevo */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        pt: 2,
        borderTop: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={onRestart}
          sx={{
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderColor: 'error.main',
            color: 'error.main',
            '&:hover': {
              borderColor: 'error.dark',
              bgcolor: 'error.main',
              color: 'white',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
            }
          }}
        >
          Empezar de Nuevo
        </Button>
      </Box>

      {/* Información de exportación */}
      {selectedCompany && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          p: 2,
          bgcolor: 'rgba(33, 150, 243, 0.1)',
          borderRadius: 1,
          border: '1px solid rgba(33, 150, 243, 0.3)'
        }}>
          <Business sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
            Exportando para: <strong>{selectedCompany}</strong>
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default ExportButtons
