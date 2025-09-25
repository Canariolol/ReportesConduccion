'use client'

import { DayPicker, DayPickerProps } from 'react-day-picker';
import { styled } from '@mui/material/styles';
import { es } from 'date-fns/locale';

const StyledDayPicker = styled(DayPicker)(({ theme }) => ({
  margin: theme.spacing(2),
  '& .rdp-months': {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
    },
  },
  '& .rdp-caption': {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(1),
    position: 'relative',
    alignItems: 'center',
  },
  '& .rdp-caption_label': {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  '& .rdp-nav': {
    display: 'flex',
    alignItems: 'center',
  },
  '& .rdp-nav_button': {
    height: '2rem',
    width: '2rem',
    padding: 0,
    backgroundColor: 'transparent',
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '& .rdp-nav_button_previous': {
    position: 'absolute',
    left: theme.spacing(1),
  },
  '& .rdp-nav_button_next': {
    position: 'absolute',
    right: theme.spacing(1),
  },
  '& .rdp-table': {
    width: '100%',
    borderCollapse: 'collapse',
  },
  '& .rdp-head_row': {
    display: 'flex',
  },
  '& .rdp-head_cell': {
    color: theme.palette.text.primary,
    width: '2.5rem',
    fontWeight: 600,
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '& .rdp-row': {
    display: 'flex',
    width: '100%',
    marginTop: theme.spacing(1),
  },
  '& .rdp-cell': {
    height: '2.5rem',
    width: '2.5rem',
    padding: 0,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '& .rdp-day': {
    height: '2.25rem',
    width: '2.25rem',
    borderRadius: '50%',
    transition: 'background-color 0.1s ease-in-out',
    display: 'inline-flex', // Use inline-flex to keep days in a row
    alignItems: 'center',    // Center content vertically
    justifyContent: 'center', // Center content horizontally
    padding: 0,
    fontWeight: 400,
    '&:hover:not([aria-disabled="true"])': {
      backgroundColor: theme.palette.action.hover,
    },
    '&[aria-selected="true"]': {
      opacity: 1,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
  '& .rdp-day_today:not([aria-selected="true"])': {
    fontWeight: 'bold',
    backgroundColor: theme.palette.action.selected,
  },
  '& .rdp-day_outside': {
    color: theme.palette.text.disabled,
  },
  '& .rdp-day_disabled': {
    color: theme.palette.text.disabled,
    opacity: 0.5,
  },
  '& .rdp-day_range_start, & .rdp-day_range_end': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: '50%',
  },
  '& .rdp-day_range_middle:not([aria-selected="true"])': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.dark,
    borderRadius: 0,
  },
  '& .rdp-day_range_preview': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 0,
  },
}));

export function Calendar(props: DayPickerProps) {
  return (
    <StyledDayPicker
      showOutsideDays
      locale={es}
      {...props}
    />
  );
}
