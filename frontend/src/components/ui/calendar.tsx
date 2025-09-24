import * as React from 'react';
import { DayPicker, DayPickerProps } from 'react-day-picker';
import { styled } from '@mui/material/styles';
import { es } from 'date-fns/locale';

const StyledDayPicker = styled(DayPicker)(({ theme }) => ({
  '& .rdp-months': {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
    },
  },
  '& .rdp-month': {
    margin: theme.spacing(2),
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
    color: theme.palette.text.secondary,
    borderRadius: theme.shape.borderRadius,
    width: '2.25rem',
    fontWeight: 400,
    fontSize: '0.8rem',
  },
  '& .rdp-row': {
    display: 'flex',
    width: '100%',
    marginTop: theme.spacing(1),
  },
  '& .rdp-cell': {
    height: '2.25rem',
    width: '2.25rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    padding: 0,
    position: 'relative',
    '&[aria-selected]': {
      backgroundColor: theme.palette.action.selected,
    },
  },
  '& .rdp-day': {
    height: '2.25rem',
    width: '2.25rem',
    padding: 0,
    fontWeight: 400,
    '&[aria-selected]': {
      opacity: 1,
    },
  },
  '& .rdp-day_selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  '& .rdp-day_today': {
    backgroundColor: theme.palette.action.selected,
  },
  '& .rdp-day_outside': {
    color: theme.palette.text.disabled,
  },
  '& .rdp-day_disabled': {
    color: theme.palette.text.disabled,
  },
  '& .rdp-day_range_middle': {
    backgroundColor: theme.palette.action.hover,
  },
}));

function Calendar(props: DayPickerProps) {
  return (
    <StyledDayPicker
      showOutsideDays
      locale={es}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
