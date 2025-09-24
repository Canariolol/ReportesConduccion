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
  content: string
  loading?: boolean
  actions?: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ 
  open, 
  onClose, 
  title, 
  content, 
  loading = false,
  actions 
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
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        {loading && (
          <CircularProgress size={20} thickness={3} />
        )}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <DialogContentText sx={{ color: 'text.secondary' }}>
          {content}
        </DialogContentText>
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
