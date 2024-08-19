import { useRouter } from 'next/router';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { getSession } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockInvalidNewslettersResponse } from 'src/components/Tool/FixSendNewsletter/FixSendNewsletterMock';
import { InvalidNewsletterQuery } from 'src/components/Tool/FixSendNewsletter/InvalidNewsletter.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import FixSendNewsletterPage from './[[...contactId]].page';

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
const pushFn = jest.fn();
const accountListId = 'account-list-1';
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
      <I18nextProvider i18n={i18n}>
        <SnackbarProvider>
          <GqlMockedProvider<{
            InvalidNewsletter: InvalidNewsletterQuery;
          }>
            mocks={mockInvalidNewslettersResponse as ApolloErgonoMockMap}
          >
            <FixSendNewsletterPage />
          </GqlMockedProvider>
        </SnackbarProvider>
      </I18nextProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('FixSendNewsletterPage', () => {
  beforeEach(() => {
    (getSession as jest.Mock).mockResolvedValue(session);
    (useRouter as jest.Mock).mockReturnValue({
      query: {
        accountListId,
      },
      isReady: true,
      push: pushFn,
    });
  });

  it('should open up contact details', async () => {
    const { findByText, queryByTestId } = render(<Components />);
    await waitFor(() =>
      expect(queryByTestId('LoadingSpinner')).not.toBeInTheDocument(),
    );
    const contactName = await findByText('Baggins, Frodo');

    expect(contactName).toBeInTheDocument();
    userEvent.click(contactName);

    await waitFor(() => {
      expect(pushFn).toHaveBeenCalledWith(
        `/accountLists/${accountListId}/tools/fixSendNewsletter/${'contactId1'}`,
      );
    });
  });
});
