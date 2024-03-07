import { useRouter } from 'next/router';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { suggestArticles } from 'src/lib/helpScout';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import ManageCoaching, { suggestedArticles } from './manageCoaches.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('src/lib/helpScout', () => ({
  suggestArticles: jest.fn(),
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
            <ManageCoaching />
          </SnackbarProvider>
        </I18nextProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('ManageCoaching', () => {
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

  it('should open Coaching Access accordion', async () => {
    const { getAllByText } = render(<Components />);
    await waitFor(() => {
      expect(getAllByText('Manage Account Coaching Access').length).toEqual(2);
    });
  });
});
