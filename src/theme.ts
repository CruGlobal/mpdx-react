import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme();

// https://www.cru.org/brand/color/
const cruColors = {
  yellow: '#FFCF07',
  grayDark: '#383F43',
  grayMedium: '#9C9FA1',
  grayLight: '#EBECEC',
};

const statusColors = {
  success: '#5CB85C',
  warning: '#8A6D3B',
  danger: '#A94442',
};

const mpdxColors = {
  green: '#00CA99',
  blue: '#05699B',
  blueLight: '#e7f2f7',
  yellow: '#FFF5CD',
  gray: '#DCDCDC',
};

const chartColors = {
  blue: '#00C0D8',
  green: '#88E4B6',
  pink: '#EA657F',
  orange: '#F08020',
  gray: '#565652',
  blueLight: '#BBDEFB',
  black: '#000000',
  blueDark: '#007890',
};

const chipColors = {
  yellowDark: '#FFC107',
  yellowLight: '#FFF8E1',
  blueDark: '#2196F3',
  blueLight: '#E3F2FD',
  greenDark: '#4CAF50',
  greenLight: '#E8F5E9',
  grayDark: '#9E9E9E',
  grayLight: '#FAFAFA',
  redDark: '#F44336',
  redLight: '#FEEBEE',
};

const progressBarColors = {
  yellow: '#F9B625',
  orange: '#DD7D1A',
  gray: '#808080',
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
    chartBlue: Palette['primary'];
    chartGreen: Palette['primary'];
    chartPink: Palette['primary'];
    chartOrange: Palette['primary'];
    chartGray: Palette['primary'];
    chartBlueLight: Palette['primary'];
    chartBlack: Palette['primary'];
    chartBlueDark: Palette['primary'];
    chipYellowDark: Palette['primary'];
    chipYellowLight: Palette['primary'];
    chipBlueDark: Palette['primary'];
    chipBlueLight: Palette['primary'];
    chipGreenDark: Palette['primary'];
    chipGreenLight: Palette['primary'];
    chipGrayDark: Palette['primary'];
    chipGrayLight: Palette['primary'];
    chipRedDark: Palette['primary'];
    chipRedLight: Palette['primary'];
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
    chartBlue: PaletteOptions['primary'];
    chartGreen: PaletteOptions['primary'];
    chartPink: PaletteOptions['primary'];
    chartOrange: PaletteOptions['primary'];
    chartGray: PaletteOptions['primary'];
    chartBlueLight: PaletteOptions['primary'];
    chartBlack: PaletteOptions['primary'];
    chartBlueDark: PaletteOptions['primary'];
    chipYellowDark: PaletteOptions['primary'];
    chipYellowLight: PaletteOptions['primary'];
    chipBlueDark: PaletteOptions['primary'];
    chipBlueLight: PaletteOptions['primary'];
    chipGreenDark: PaletteOptions['primary'];
    chipGreenLight: PaletteOptions['primary'];
    chipGrayDark: PaletteOptions['primary'];
    chipGrayLight: PaletteOptions['primary'];
    chipRedDark: PaletteOptions['primary'];
    chipRedLight: PaletteOptions['primary'];
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
    chartBlue: {
      main: chartColors.blue,
    },
    chartGreen: {
      main: chartColors.green,
    },
    chartPink: {
      main: chartColors.pink,
    },
    chartOrange: {
      main: chartColors.orange,
    },
    chartGray: {
      main: chartColors.gray,
    },
    chartBlueLight: {
      main: chartColors.blueLight,
    },
    chartBlack: {
      main: chartColors.black,
    },
    chartBlueDark: {
      main: chartColors.blueDark,
    },
    chipYellowDark: {
      main: chipColors.yellowDark,
    },
    chipYellowLight: {
      main: chipColors.yellowLight,
    },
    chipBlueDark: {
      main: chipColors.blueDark,
    },
    chipBlueLight: {
      main: chipColors.blueLight,
    },
    chipGreenDark: {
      main: chipColors.greenDark,
    },
    chipGreenLight: {
      main: chipColors.greenLight,
    },
    chipGrayDark: {
      main: chipColors.grayDark,
    },
    chipGrayLight: {
      main: chipColors.grayLight,
    },
    chipRedDark: {
      main: chipColors.redDark,
    },
    chipRedLight: {
      main: chipColors.redLight,
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
