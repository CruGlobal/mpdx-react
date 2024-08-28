import { useRouter } from 'next/router';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import ManageAccounts, { suggestedArticles } from './manageAccounts.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: jest.fn(),
    };
  },
}));

const Components = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider>
        <I18nextProvider i18n={i18n}>
          <SnackbarProvider>
            <ManageAccounts />
          </SnackbarProvider>
        </I18nextProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('ManageAccounts', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      isReady: true,
    });
  });

  it('should fire suggestArticles on initial render', async () => {
    render(<Components />);
    await waitFor(() =>
      expect(suggestArticles).toHaveBeenCalledWith(suggestedArticles),
    );
  });

  it('should open `Manage Account Access` accordion', async () => {
    const { getAllByText } = render(<Components />);
    await waitFor(() => {
      expect(getAllByText('Manage Account Access').length).toEqual(2);
    });
  });

  it('should open `Merge Your Accounts` accordion', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {
        selectedTab: 'Merge Your Accounts',
      },
      isReady: true,
    });
    const { getAllByText } = render(<Components />);
    await waitFor(() => {
      expect(getAllByText('Manage Account Access').length).toEqual(1);
      expect(getAllByText('Merge Your Accounts').length).toEqual(2);
    });
  });
});
