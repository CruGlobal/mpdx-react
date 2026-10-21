import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockInvalidAddressesResponse } from 'src/components/Tool/MailingAddresses/ConfirmAddresses/ConfirmAddressesMock';
import { InvalidAddressesQuery } from 'src/components/Tool/MailingAddresses/ConfirmAddresses/GetInvalidAddresses.generated';
import theme from 'src/theme';
import MailingAddressesPage from './[[...contactId]].page';

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

const accountListId = 'account-list-1';
const contactId = 'contactId';
const router = {
  pathname:
    '/accountLists/[accountListId]/tools/mailingAddresses/[[...contactId]]',
  query: { accountListId },
  isReady: true,
};
const Components = ({ mocks }: { mocks: ApolloErgonoMockMap }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider<{
        InvalidAddresses: InvalidAddressesQuery;
      }>
        mocks={mocks}
      >
        <SnackbarProvider>
          <MailingAddressesPage />
        </SnackbarProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('MailingAddressesPage', () => {
  it('should render contact link correctly', async () => {
    const { findByRole } = render(
      <Components
        mocks={{
          InvalidAddresses: {
            ...mockInvalidAddressesResponse.InvalidAddresses,
          },
        }}
      />,
    );

    const contactName = await findByRole('link', {
      name: 'Baggins, Frodo',
    });

    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/mailingAddresses/${contactId}`,
    );
  });
});
