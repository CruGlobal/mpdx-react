import { createMuiTheme } from '@material-ui/core/styles';

const defaultTheme = createMuiTheme();

const theme = createMuiTheme({
  typography: {
    fontFamily: "'Source Sans Pro', sans-serif",
  },
  palette: {
    primary: {
      dark: '#383F43',
      main: '#05699b',
    },
    secondary: {
      main: '#f5be19',
      dark: '#9C9FA1',
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
        borderRadius: '5px',
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
