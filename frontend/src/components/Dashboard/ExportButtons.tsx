import React from 'react'
import { Box, Button } from '@mui/material'
import { GetApp, PictureAsPdf, Save } from '@mui/icons-material'

interface ExportButtonsProps {
  onExportExcel: () => void
  onExportPDF: () => void
  onSaveToDB: () => void
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ 
  onExportExcel, 
  onExportPDF, 
  onSaveToDB 
}) => {
  return (
    <Box sx={{ 
      mb: 4, 
      display: 'flex', 
      gap: 2,
      p: 3,
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
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
  )
}

export default ExportButtons
