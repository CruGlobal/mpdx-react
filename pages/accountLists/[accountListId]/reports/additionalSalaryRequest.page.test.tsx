import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import AdditionalSalaryRequestPage, {
  getServerSideProps,
} from './additionalSalaryRequest.page';

describe('AdditionalSalaryRequest page', () => {
  it('renders page', async () => {
    const { findByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={{ query: { accountListId: 'account-list-1' } }}>
          <SnackbarProvider>
            <I18nextProvider i18n={i18n}>
              <AdditionalSalaryRequestPage />
            </I18nextProvider>
          </SnackbarProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(
      await findByRole('heading', { name: 'About this Form content' }),
    ).toBeInTheDocument();
  });

  it('uses ensureSessionAndAccountList', () => {
    expect(getServerSideProps).toBeDefined();
  });
});
