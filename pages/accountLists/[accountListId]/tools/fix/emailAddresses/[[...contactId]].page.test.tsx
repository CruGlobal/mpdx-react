import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { ErgonoMockShape } from 'graphql-ergonomock';
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
    '/accountLists/[accountListId]/tools/fix/emailAddresses/[[...contactId]]',
  query: { accountListId },
  isReady: true,
};
const Components = ({
  mockNodes = mockInvalidEmailAddressesResponse,
}: {
  mockNodes?: ErgonoMockShape[];
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
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
  it('should render contact link correctly', async () => {
    const { findByRole } = render(<Components />);

    const contactName = await findByRole('link', {
      name: 'Test Contact',
    });

    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/fix/emailAddresses/${contactId}`,
    );
  });
});
