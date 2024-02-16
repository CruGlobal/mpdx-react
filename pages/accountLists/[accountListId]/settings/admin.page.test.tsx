import { useRouter } from 'next/router';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { getSession } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { suggestArticles } from 'src/lib/helpScout';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import Admin, { suggestedArticles } from './admin.page';

jest.mock('next-auth/react');
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

const session = {
  expires: '2021-10-28T14:48:20.897Z',
  user: {
    email: 'Chair Library Bed',
    image: null,
    name: 'Dung Tapestry',
    token: 'superLongJwtString',
  },
};

const Components = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider>
        <I18nextProvider i18n={i18n}>
          <SnackbarProvider>
            <Admin />
          </SnackbarProvider>
        </I18nextProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('Admin', () => {
  beforeEach(() => {
    (getSession as jest.Mock).mockResolvedValue(session);
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      isReady: true,
    });
  });

  it('should fire suggestArticles on intital render', async () => {
    render(<Components />);
    await waitFor(() =>
      expect(suggestArticles).toHaveBeenCalledWith(suggestedArticles),
    );
  });

  it('should keep impersonate user accordion close', async () => {
    const { getAllByText } = render(<Components />);
    await waitFor(() => {
      expect(getAllByText('Impersonate User')).toHaveLength(3);
      expect(getAllByText('Reset Account').length).toEqual(1);
    });
  });

  it('should open impersonate user accordion', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {
        selectedTab: 'Reset Account',
      },
      isReady: true,
    });
    const { getAllByText } = render(<Components />);
    await waitFor(() => {
      expect(getAllByText('Impersonate User').length).toEqual(1);
      expect(getAllByText('Reset Account').length).toEqual(3);
    });
  });
});
