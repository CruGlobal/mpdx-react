import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { ErgonoMockShape } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockInvalidStatusesResponse } from 'src/components/Tool/FixCommitmentInfo/FixCommitmentInfoMocks';
import { InvalidStatusesQuery } from 'src/components/Tool/FixCommitmentInfo/GetInvalidStatuses.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import FixCommitmentInfoPage from './[[...contactId]].page';

const accountListId = 'account-list-1';
const router = {
  pathname:
    '/accountLists/[accountListId]/tools/fix/commitmentInfo/[[...contactId]]',
  query: { accountListId },
  isReady: true,
};

const Components = ({
  mockNodes = mockInvalidStatusesResponse,
}: {
  mockNodes?: ErgonoMockShape[];
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider<{
        InvalidStatuses: InvalidStatusesQuery;
      }>
        mocks={{
          InvalidStatuses: {
            contacts: {
              nodes: mockNodes,
            },
          },
        }}
      >
        <I18nextProvider i18n={i18n}>
          <SnackbarProvider>
            <VirtuosoMockContext.Provider
              value={{ viewportHeight: 1000, itemHeight: 100 }}
            >
              <FixCommitmentInfoPage />
            </VirtuosoMockContext.Provider>
          </SnackbarProvider>
        </I18nextProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('FixCommitmentInfoPage', () => {
  it('should render contact link correctly with donations tab', async () => {
    const { findByRole } = render(<Components />);

    const contactName = await findByRole('link', {
      name: 'Tester 1',
    });

    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/fix/commitmentInfo/tester-1?tab=Donations`,
    );
  });
});
