import React from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, Box, Typography, Chip } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import { uploadExcel } from '../../store/slices/excelSlice.ts'
import { AppDispatch } from '../../store/store.ts'

interface UploadSectionProps {
  onUpload: (file: File) => void
  onUploadStart: () => void
  onUploadComplete: () => void
  onUploadError: (error: string) => void
}

const UploadSection: React.FC<UploadSectionProps> = ({ 
  onUpload, 
  onUploadStart, 
  onUploadComplete, 
  onUploadError 
}) => {
  const dispatch = useDispatch<AppDispatch>()

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Notificar inicio de carga
      onUploadStart()
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', 'demo_user')
      
      // Dispatch la acción de upload
      dispatch(uploadExcel(formData))
        .unwrap()
        .then(() => {
          // Notificar carga completada
          onUploadComplete()
          onUpload(file)
        })
        .catch((error) => {
          // Notificar error en carga
          onUploadError(error.message || 'Error al procesar el archivo')
        })
    }
  }, [dispatch, onUpload, onUploadStart, onUploadComplete, onUploadError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  })

  return (
    <Card 
      sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: '620px',
        mx: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.05,
        }
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', p: 2 }}>
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
            borderRadius: 4,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.08)',
              borderColor: 'rgba(255,255,255,0.8)',
            },
            width: '100%',
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 64, color: 'white', mb: 2, opacity: 0.9 }} />
          <Typography variant="h5" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
            {isDragActive ? '🎯 Suelta el archivo aquí' : '📁 Arrastra y suelta un archivo Excel aquí'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
            o haz clic para seleccionar un archivo
          </Typography>
          <Chip 
            label="Formatos: .xlsx, .xls (máx. 50MB)" 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontWeight: 500
            }} 
          />
        </Box>
      </CardContent>
    </Card>
  )
}

export default UploadSection
