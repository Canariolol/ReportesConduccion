import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress
} from '@mui/material'
import Modal from '../ui/Modal'

interface CompanyNameModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (companyName: string) => void
  isLoading: boolean
}

const CompanyNameModal: React.FC<CompanyNameModalProps> = ({
  isOpen,
  onClose,
  onExport,
  isLoading
}) => {
  const [companyName, setCompanyName] = useState('')

  const handleExport = () => {
    if (companyName.trim()) {
      onExport(companyName.trim())
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setCompanyName('')
      onClose()
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Exportar Reporte de Rankings"
      loading={isLoading}
      actions={
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            onClick={handleClose}
            disabled={isLoading}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={isLoading || !companyName.trim()}
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(240, 147, 251, 0.4)',
              }
            }}
          >
            {isLoading ? 'Exportando...' : 'Exportar'}
          </Button>
        </Box>
      }
    >
      <Box sx={{ py: 2 }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Por favor, ingrese el nombre de la empresa para el reporte de rankings que se va a exportar a PDF.
        </Typography>
        
        <TextField
          fullWidth
          label="Nombre de la Empresa"
          variant="outlined"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          disabled={isLoading}
          placeholder="Ej: Transportes S.A."
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
          inputProps={{
            maxLength: 100
          }}
        />
        
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
          Este nombre aparecerá en el encabezado del reporte PDF.
        </Typography>
      </Box>
    </Modal>
  )
}

export default CompanyNameModal