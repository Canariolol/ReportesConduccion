import React from 'react'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button, 
  CircularProgress,
  Box,
  Typography
} from '@mui/material'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  content?: string // Make content optional
  loading?: boolean
  actions?: React.ReactNode
  children?: React.ReactNode // Add children prop
}

const Modal: React.FC<ModalProps> = ({ 
  open, 
  onClose, 
  title, 
  content, 
  loading = false,
  actions, 
  children // Destructure children
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        pb: 2,
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        typography: 'h6', // Apply typography variant directly
        fontWeight: 600,   // Apply font weight directly
      }}>
        {loading && (
          <CircularProgress size={20} thickness={3} />
        )}
        {title}
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        {children || (
          <DialogContentText sx={{ color: 'text.secondary' }}>
            {content || ''}
          </DialogContentText>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        {actions || (
          <Button 
            onClick={onClose} 
            disabled={loading}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3
            }}
          >
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default Modal
