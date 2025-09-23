import React from 'react'
import { Box, Typography } from '@mui/material'

interface HeaderProps {
  title: string
  subtitle: string
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700, 
            color: 'primary.main',
            mb: 1,
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {title}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
      <Box
        component="img"
        src="/west_logo.png"
        alt="West Ingeniería"
        sx={{ 
          height: 60, 
          width: 'auto',
          ml: 2,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
        }}
      />
    </Box>
  )
}

export default Header
