import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme();

// https://www.cru.org/brand/color/
const cruColors = {
  lemon: '#FFE378',
  yellow: '#FFD000',
  orange: '#F08020',
  vermilion: '#D34400',
  rose: '#FFB4C8',
  pink: '#EA657F',
  cerise: '#C23C49',
  ruby: '#991313',
  sky: '#89EFF7',
  cyan: '#00C0D8',
  turquoise: '#007890',
  navy: '#1F1F47',
  mint: '#88E4B6',
  green: '#24C976',
  moss: '#476052',
  oliveDrab: '#2E3A33',
  white: '#FFFFFF',
  gray: '#F0EFEE',
  graphite: '#565652',
  black: '#000000',
};

const mpdxColors = {
  green: '#00CA99',
  blue: '#05699B',
  blueLight: '#E7F2F7',
  yellow: '#FFF5CD',
  gray: '#DCDCDC',
  grayDark: '#383F43',
  grayMedium: '#9C9FA1',
  grayLight: '#EBECEC',
};

const progressBarColors = {
  yellow: '#F9B625',
  orange: '#DD7D1A',
  gray: '#808080',
};

const statusColors = {
  success: cruColors.green,
  warning: cruColors.vermilion,
  danger: cruColors.ruby,
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
    lemon: Palette['primary'];
    yellow: Palette['primary'];
    orange: Palette['primary'];
    vermilion: Palette['primary'];
    rose: Palette['primary'];
    pink: Palette['primary'];
    cerise: Palette['primary'];
    ruby: Palette['primary'];
    sky: Palette['primary'];
    cyan: Palette['primary'];
    turquoise: Palette['primary'];
    navy: Palette['primary'];
    mint: Palette['primary'];
    green: Palette['primary'];
    moss: Palette['primary'];
    oliveDrab: Palette['primary'];
    white: Palette['primary'];
    gray: Palette['primary'];
    graphite: Palette['primary'];
    black: Palette['primary'];
    mpdxGreen: Palette['primary'];
    mpdxBlue: Palette['primary'];
    mpdxYellow: Palette['primary'];
    mpdxGray: Palette['primary'];
    mpdxGrayLight: Palette['primary'];
    mpdxGrayMedium: Palette['primary'];
    mpdxGrayDark: Palette['primary'];
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
    lemon: PaletteOptions['primary'];
    yellow: PaletteOptions['primary'];
    orange: PaletteOptions['primary'];
    vermilion: PaletteOptions['primary'];
    rose: PaletteOptions['primary'];
    pink: PaletteOptions['primary'];
    cerise: PaletteOptions['primary'];
    ruby: PaletteOptions['primary'];
    sky: PaletteOptions['primary'];
    cyan: PaletteOptions['primary'];
    turquoise: PaletteOptions['primary'];
    navy: PaletteOptions['primary'];
    mint: PaletteOptions['primary'];
    green: PaletteOptions['primary'];
    moss: PaletteOptions['primary'];
    oliveDrab: PaletteOptions['primary'];
    white: PaletteOptions['primary'];
    gray: PaletteOptions['primary'];
    graphite: PaletteOptions['primary'];
    black: PaletteOptions['primary'];
    mpdxGreen: PaletteOptions['primary'];
    mpdxBlue: PaletteOptions['primary'];
    mpdxYellow: PaletteOptions['primary'];
    mpdxGray: PaletteOptions['primary'];
    mpdxGrayLight: PaletteOptions['primary'];
    mpdxGrayMedium: PaletteOptions['primary'];
    mpdxGrayDark: PaletteOptions['primary'];
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
      dark: mpdxColors.grayDark,
      main: mpdxColors.blue,
    },
    secondary: {
      main: cruColors.yellow,
      dark: mpdxColors.grayMedium,
    },
    text: {
      primary: mpdxColors.grayDark,
      secondary: mpdxColors.grayMedium,
    },
    lemon: { main: cruColors.lemon },
    yellow: { main: cruColors.yellow },
    orange: { main: cruColors.orange },
    vermilion: { main: cruColors.vermilion },
    rose: { main: cruColors.rose },
    pink: { main: cruColors.pink },
    cerise: { main: cruColors.cerise },
    ruby: { main: cruColors.ruby },
    sky: { main: cruColors.sky },
    cyan: { main: cruColors.cyan },
    turquoise: { main: cruColors.turquoise },
    navy: { main: cruColors.navy },
    mint: { main: cruColors.mint },
    green: { main: cruColors.green },
    moss: { main: cruColors.moss },
    oliveDrab: { main: cruColors.oliveDrab },
    white: { main: cruColors.white },
    gray: { main: cruColors.gray },
    graphite: { main: cruColors.graphite },
    black: { main: cruColors.black },

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
    mpdxGrayDark: {
      main: mpdxColors.grayDark,
    },
    mpdxGrayMedium: {
      main: mpdxColors.grayMedium,
    },
    mpdxGrayLight: {
      main: mpdxColors.grayLight,
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
          borderBottom: `1px solid ${mpdxColors.grayLight}`,
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
          borderTop: `1px solid ${mpdxColors.grayLight}`,
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
          color: mpdxColors.grayMedium,
          '&.Mui-checked, &.MuiCheckbox-indeterminate': {
            color: mpdxColors.grayDark,
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
