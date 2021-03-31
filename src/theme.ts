import { createMuiTheme } from '@material-ui/core/styles';

const defaultTheme = createMuiTheme();

// https://www.cru.org/brand/color/
const cruColors = {
  yellow: '#FFCF07',
  grayDark: '#383F43',
  grayMedium: '#9C9FA1',
  grayLight: '#EBECEC',
};

const mpdxColors = {
  green: '#00CA99',
  blue: '#05699B',
  yellow: '#FFF5CD',
  gray: '#DCDCDC',
};

// https://material-ui.com/customization/palette/#adding-new-colors
declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    cruYellow: Palette['primary'];
    cruGrayDark: Palette['primary'];
    cruGrayMedium: Palette['primary'];
    cruGrayLight: Palette['primary'];
    mpdxGreen: Palette['primary'];
    mpdxBlue: Palette['primary'];
    mpdxYellow: Palette['primary'];
    mpdxGray: Palette['primary'];
  }
  interface PaletteOptions {
    cruYellow: PaletteOptions['primary'];
    cruGrayDark: PaletteOptions['primary'];
    cruGrayMedium: PaletteOptions['primary'];
    cruGrayLight: PaletteOptions['primary'];
    mpdxGreen: PaletteOptions['primary'];
    mpdxBlue: PaletteOptions['primary'];
    mpdxYellow: PaletteOptions['primary'];
    mpdxGray: PaletteOptions['primary'];
  }
}

const theme = createMuiTheme({
  typography: {
    fontFamily: "'Source Sans Pro', sans-serif",
  },
  palette: {
    primary: {
      dark: cruColors.grayDark,
      main: mpdxColors.blue,
    },
    secondary: {
      main: cruColors.yellow,
      dark: cruColors.grayMedium,
    },
    text: {
      primary: cruColors.grayDark,
      secondary: cruColors.grayMedium,
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
    mpdxGreen: {
      main: mpdxColors.green,
    },
    mpdxBlue: {
      main: mpdxColors.blue,
    },
    mpdxYellow: {
      main: mpdxColors.yellow,
    },
    mpdxGray: {
      main: mpdxColors.gray,
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
