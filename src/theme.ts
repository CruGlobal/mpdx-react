import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme();

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
  blueLight: '#E7F2F7',
  yellow: '#FFF5CD',
  gray: '#DCDCDC',
};

const progressBarColors = {
  yellow: '#F9B625',
  orange: '#DD7D1A',
  gray: '#808080',
};

const statusColors = {
  // Green from the Cru brand colors
  success: '#24C976',
  // Vermillion from the Cru brand colors
  warning: '#D34400',
  // Ruby from the Cru brand colors
  danger: '#991313',
};

const graphColors = {
  blue1: '#007398',
  blue2: '#1FC0D2',
  blue3: '#30F2F2',
  teal: '#17AEBF',
};

// https://material-ui.com/customization/palette/#adding-new-colors
declare module '@mui/material/styles/createPalette' {
  interface Palette {
    cruYellow: Palette['primary'];
    cruGrayDark: Palette['primary'];
    cruGrayMedium: Palette['primary'];
    cruGrayLight: Palette['primary'];
    mpdxGreen: Palette['primary'];
    mpdxBlue: Palette['primary'];
    mpdxYellow: Palette['primary'];
    mpdxGray: Palette['primary'];
    progressBarYellow: Palette['primary'];
    progressBarOrange: Palette['primary'];
    progressBarGray: Palette['primary'];
    statusSuccess: Palette['primary'];
    statusWarning: Palette['primary'];
    statusDanger: Palette['primary'];
    graphBlue1: Palette['primary'];
    graphBlue2: Palette['primary'];
    graphBlue3: Palette['primary'];
    graphTeal: Palette['primary'];
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
    progressBarYellow: PaletteOptions['primary'];
    progressBarOrange: PaletteOptions['primary'];
    progressBarGray: PaletteOptions['primary'];
    statusSuccess: PaletteOptions['primary'];
    statusWarning: PaletteOptions['primary'];
    statusDanger: PaletteOptions['primary'];
    graphBlue1: PaletteOptions['primary'];
    graphBlue2: PaletteOptions['primary'];
    graphBlue3: PaletteOptions['primary'];
    graphTeal: PaletteOptions['primary'];
  }
}

const theme = createTheme({
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
      light: mpdxColors.blueLight,
    },
    mpdxYellow: {
      main: mpdxColors.yellow,
    },
    mpdxGray: {
      main: mpdxColors.gray,
    },
    progressBarYellow: {
      main: progressBarColors.yellow,
    },
    progressBarOrange: {
      main: progressBarColors.orange,
    },
    progressBarGray: {
      main: progressBarColors.gray,
    },
    statusSuccess: {
      main: statusColors.success,
    },
    statusWarning: {
      main: statusColors.warning,
    },
    statusDanger: {
      main: statusColors.danger,
    },
    graphBlue1: {
      main: graphColors.blue1,
    },
    graphBlue2: {
      main: graphColors.blue2,
    },
    graphBlue3: {
      main: graphColors.blue3,
    },
    graphTeal: {
      main: graphColors.teal,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
          backgroundColor: '#fff',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #EBECEC',
        },
        title: {
          fontSize: '1.2rem',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: defaultTheme.spacing(4),
          [defaultTheme.breakpoints.down('sm')]: {
            padding: defaultTheme.spacing(2),
          },
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          borderTop: '1px solid #EBECEC',
          justifyContent: 'flex-end',
          [defaultTheme.breakpoints.down('xs')]: {
            justifyContent: 'center',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          cursor: 'pointer',
        },
      },
      defaultProps: { underline: 'hover' },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        colorSecondary: {
          color: cruColors.grayMedium,
          '&.Mui-checked, &.MuiCheckbox-indeterminate': {
            color: cruColors.grayDark,
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor: '#f6f7f9',
        },
        body: {
          backgroundColor: mpdxColors.blue,
          overflowX: 'hidden',
        },
      },
    },
  },
});

export default theme;
