import { ThemeProvider } from '@mui/material/styles';
import { render } from '__tests__/util/testingLibraryReactMock';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { HelpBeacon } from './HelpBeacon';

const helpUrls = {
  'en-us': 'https://google.us',
  'es-419': 'https://google.es',
  'fr-fr': 'https://google.fr',
  default: 'https://google.com',
};

describe('HelpBeacon', () => {
  it('uses the current language', () => {
    i18n.changeLanguage('en-us');

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <HelpBeacon helpUrls={helpUrls} />
      </ThemeProvider>,
    );
    expect(getByRole('link')).toHaveAttribute('href', 'https://google.us');
  });

  it('falls back to the default language', async () => {
    await i18n.changeLanguage('ru');

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <HelpBeacon helpUrls={helpUrls} />
      </ThemeProvider>,
    );
    expect(getByRole('link')).toHaveAttribute('href', 'https://google.com');
  });

  it('renders nothing if there is no fallback', () => {
    i18n.changeLanguage('en-us');

    const { queryByRole } = render(
      <ThemeProvider theme={theme}>
        <HelpBeacon helpUrls={{}} />
      </ThemeProvider>,
    );
    expect(queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders nothing if no help URLs are provided', () => {
    i18n.changeLanguage('en-us');

    const { queryByRole } = render(
      <ThemeProvider theme={theme}>
        <HelpBeacon helpUrls={null} />
      </ThemeProvider>,
    );
    expect(queryByRole('link')).not.toBeInTheDocument();
  });
});
