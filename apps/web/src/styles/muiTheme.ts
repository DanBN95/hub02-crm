import { createTheme } from '@mui/material/styles';

/**
 * Custom MUI dark theme bridged to hub02's OKLCH design tokens.
 * Palette uses hex approximations so MUI's color utilities (lighten/darken)
 * work correctly; component sx overrides then pull CSS variables where needed.
 */
export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: '#7c7ff5', light: '#9b9ef8', dark: '#5a5de0', contrastText: '#fff' },
    secondary: { main: '#b8b8b8', contrastText: '#111' },
    error:     { main: '#e05050', light: '#e87070', dark: '#b83535', contrastText: '#fff' },
    warning:   { main: '#c8901a', light: '#dba030', dark: '#a07010', contrastText: '#fff' },
    success:   { main: '#3aad78', light: '#5ccc96', dark: '#278a5a', contrastText: '#fff' },
    background: { default: '#181818', paper: '#1e1e1e' },
    divider: 'rgba(255,255,255,0.07)',
    text: { primary: '#f5f5f5', secondary: '#b8b8b8', disabled: '#6a6a6a' },
    action: {
      hover:           'rgba(255,255,255,0.05)',
      selected:        'rgba(124,127,245,0.12)',
      disabledBackground: 'rgba(255,255,255,0.06)',
    },
  },

  typography: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontSize: 13,
    h1: { fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' },
    h2: { fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontSize: 13, fontWeight: 600 },
    body1: { fontSize: 13 },
    body2: { fontSize: 12 },
    caption: { fontSize: 11, color: '#6a6a6a' },
    button: { fontSize: 13, fontWeight: 500, textTransform: 'none' },
  },

  shape: { borderRadius: 6 },

  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: '#181818', color: '#f5f5f5' } },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          textTransform: 'none',
          padding: '6px 14px',
        },
        contained: {
          '&.MuiButton-colorPrimary': {
            background: 'var(--color-accent)',
            '&:hover': { background: 'var(--color-accent-hover)', boxShadow: 'none' },
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: 13,
          borderRadius: 6,
          backgroundColor: 'rgba(255,255,255,0.03)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.1)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.2)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-accent)',
            borderWidth: 1,
          },
        },
        input: { padding: '7px 12px', fontSize: 13 },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: 13,
          '&.Mui-focused': { color: 'var(--color-accent)' },
        },
      },
    },

    MuiSelect: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        select: { fontSize: 13, padding: '7px 12px' },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: 13,
          '&.Mui-selected': {
            backgroundColor: 'rgba(124,127,245,0.12)',
            '&:hover': { backgroundColor: 'rgba(124,127,245,0.18)' },
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: 11,
          fontWeight: 500,
          borderRadius: 4,
          height: 24,
        },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'color-mix(in oklch, var(--color-surface) 82%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 24px oklch(0% 0 0 / 0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: { padding: 20, '&:last-child': { paddingBottom: 20 } },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          height: 6,
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
        bar: {
          borderRadius: 999,
          background: 'var(--color-accent)',
        },
      },
    },

    MuiListItem: {
      styleOverrides: {
        root: { paddingTop: 6, paddingBottom: 6 },
      },
    },

    MuiListItemText: {
      styleOverrides: {
        primary:   { fontSize: 13, color: '#f5f5f5' },
        secondary: { fontSize: 11, color: '#6a6a6a' },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(255,255,255,0.07)' },
      },
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#1e1e1e',
          backgroundImage: 'none',
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: 11,
          backgroundColor: '#2a2a2a',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      },
    },
  },
});
