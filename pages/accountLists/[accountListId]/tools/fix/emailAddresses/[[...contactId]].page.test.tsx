import { useRouter } from 'next/router';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErgonoMockShape } from 'graphql-ergonomock';
import { getSession } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockInvalidEmailAddressesResponse } from 'src/components/Tool/FixEmailAddresses/FixEmailAddressesMocks';
import { InvalidAddressesQuery } from 'src/components/Tool/FixMailingAddresses/GetInvalidAddresses.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import FixEmailAddressesPage from './[[...contactId]].page';

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
const contactId = 'contactId';
const session = {
  expires: '2021-10-28T14:48:20.897Z',
  user: {
    email: 'Chair Library Bed',
    image: null,
    name: 'Dung Tapestry',
    token: 'superLongJwtString',
  },
};
const Components = ({
  mockNodes = mockInvalidEmailAddressesResponse,
}: {
  mockNodes?: ErgonoMockShape[];
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <VirtuosoMockContext.Provider
        value={{ viewportHeight: 1000, itemHeight: 100 }}
      >
        <GqlMockedProvider<{
          InvalidAddresses: InvalidAddressesQuery;
        }>
          mocks={{
            GetInvalidEmailAddresses: {
              people: {
                nodes: mockNodes,
              },
            },
          }}
        >
          <I18nextProvider i18n={i18n}>
            <SnackbarProvider>
              <FixEmailAddressesPage />
            </SnackbarProvider>
          </I18nextProvider>
        </GqlMockedProvider>
      </VirtuosoMockContext.Provider>
    </TestRouter>
  </ThemeProvider>
);

describe('FixEmailAddressesPage', () => {
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
      expect(queryByTestId('loading')).not.toBeInTheDocument(),
    );

    const contactName = await findByText('Test Contact');

    expect(contactName).toBeInTheDocument();
    userEvent.click(contactName);

    await waitFor(() => {
      expect(pushFn).toHaveBeenCalledWith(
        `/accountLists/${accountListId}/tools/fix/emailAddresses/${contactId}`,
      );
    });
  });
});
