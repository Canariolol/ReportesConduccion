
import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 3,
        mt: 'auto',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        backgroundColor: 'background.paper',
        textAlign: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        ® {new Date().getFullYear()} West Ingeniería - Sistema de Análisis de Alarmas
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Creado con ❤️ por Rodrigo Yáñez G. -{' '}
        <Typography
          component="a"
          href="https://ninfasolutions.com"
          target="_blank"
          rel="noopener noreferrer"
          variant="caption"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            }
          }}
        >
          Ninfa Solutions
        </Typography>
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        <Typography
          component="a"
          href="mailto:admin@ninfasolutions.com"
          variant="caption"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            }
          }}
        >
          admin@ninfasolutions.com
        </Typography>
      </Typography>
    </Box>
  );
};

export default Footer;
