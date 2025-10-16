import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockInvalidAddressesResponse } from 'src/components/Tool/FixMailingAddresses/FixMailingAddressesMock';
import { InvalidAddressesQuery } from 'src/components/Tool/FixMailingAddresses/GetInvalidAddresses.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import FixMailingAddressesPage from './[[...contactId]].page';

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
    '/accountLists/[accountListId]/tools/fix/mailingAddresses/[[...contactId]]',
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
        <I18nextProvider i18n={i18n}>
          <SnackbarProvider>
            <FixMailingAddressesPage />
          </SnackbarProvider>
        </I18nextProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('FixMailingAddressesPage', () => {
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
      `/accountLists/${accountListId}/tools/fix/mailingAddresses/${contactId}`,
    );
  });
});
