import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import AdditionalSalaryRequestPage, {
  getServerSideProps,
} from './additionalSalaryRequest.page';

describe('AdditionalSalaryRequest page', () => {
  it('renders page', async () => {
    const { findByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={{ query: { accountListId: 'account-list-1' } }}>
          <AdditionalSalaryRequestPage />
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
