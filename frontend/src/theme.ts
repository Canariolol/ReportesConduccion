import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',
      light: '#1976D2',
      dark: '#0D47A1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7C3AA8',
      light: '#9B59B6',
      dark: '#5B2C6F',
      contrastText: '#ffffff',
    },
    background: {
      default: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: '#263238',
      secondary: '#546E7A',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#f57c00',
    },
    success: {
      main: '#2e7d32',
    },
    info: {
      main: '#1976d2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '2.5rem',
      letterSpacing: '1px',
    },
    h2: {
      fontWeight: 400,
      fontSize: '2rem',
      letterSpacing: '0.5px',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.5rem',
      letterSpacing: '0.5px',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
      letterSpacing: '0.5px',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.1rem',
      letterSpacing: '0.5px',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    },
    subtitle1: {
      fontWeight: 400,
      fontSize: '1rem',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.4,
    },
    button: {
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(25, 118, 210, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 35px rgba(25, 118, 210, 0.12)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '12px 24px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #1E88E5 100%)',
          boxShadow: '0 4px 20px rgba(21, 101, 192, 0.3)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px 12px',
        },
        head: {
          background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
          fontWeight: 600,
          color: '#1565C0',
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(227, 242, 253, 0.4)',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
})
