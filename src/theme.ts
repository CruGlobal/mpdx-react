import { createMuiTheme } from '@material-ui/core/styles';

const defaultTheme = createMuiTheme();

// https://www.cru.org/brand/color/
const cruColors = {
  yellow: '#FFCF07',
  grayDark: '#383F43',
  grayMedium: '#9C9FA1',
  grayLight: '#EBECEC',
};

// https://material-ui.com/customization/palette/#adding-new-colors
declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    cruYellow: Palette['primary'];
    cruGrayDark: Palette['primary'];
    cruGrayMedium: Palette['primary'];
    cruGrayLight: Palette['primary'];
  }
  interface PaletteOptions {
    cruYellow: PaletteOptions['primary'];
    cruGrayDark: PaletteOptions['primary'];
    cruGrayMedium: PaletteOptions['primary'];
    cruGrayLight: PaletteOptions['primary'];
  }
}

const theme = createMuiTheme({
  typography: {
    fontFamily: "'Source Sans Pro', sans-serif",
  },
  palette: {
    common: {
      black: '#000',
      white: '#fff',
    },
    background: {
      paper: '#fff',
      default: '#fafafa',
    },
    primary: {
      dark: '#383F43',
      main: '#05699b',
      light: '#3787a',
    },
    secondary: {
      main: '#f5be19',
      light: '#F7CB47',
      dark: '#9C9FA1',
    },
    error: {
      main: '#F44336',
      dark: '#C9302F',
    },
    text: {
      primary: '#383F43',
      secondary: '#9C9FA1',
    },
    cruYellow: {
      main: cruColors.yellow,
    },
    cruGrayDark: {
      main: cruColors.grayDark,
    },
    cruGrayMedium: {
      main: cruColors.grayMedium,
    },
    cruGrayLight: {
      main: cruColors.grayLight,
    },
  },
  overrides: {
    MuiCard: {
      root: {
        borderRadius: '10px',
      },
    },
    MuiChip: {
      root: {
        borderRadius: '16px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
        backgroundColor: '#fff',
      },
    },
    MuiCardHeader: {
      root: {
        borderBottom: '1px solid #EBECEC',
      },
      title: {
        fontSize: '1.2rem',
      },
    },
    MuiCardContent: {
      root: {
        padding: defaultTheme.spacing(4),
        [defaultTheme.breakpoints.down('sm')]: {
          padding: defaultTheme.spacing(2),
        },
      },
    },
    MuiCardActions: {
      root: {
        borderTop: '1px solid #EBECEC',
        justifyContent: 'flex-end',
        [defaultTheme.breakpoints.down('xs')]: {
          justifyContent: 'center',
        },
      },
    },
    MuiTableCell: {
      head: {
        fontWeight: 700,
      },
    },
    MuiCssBaseline: {
      '@global': {
        html: {
          backgroundColor: '#f6f7f9',
        },
        body: {
          backgroundColor: '#05699b',
        },
      },
    },
  },
});

export default theme;
