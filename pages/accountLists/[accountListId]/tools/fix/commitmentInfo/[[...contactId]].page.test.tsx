import { useRouter } from 'next/router';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import { ErgonoMockShape } from 'graphql-ergonomock';
import { getSession } from 'next-auth/react';
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

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
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
const Components = ({
  mockNodes = mockInvalidStatusesResponse,
}: {
  mockNodes?: ErgonoMockShape[];
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
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
    const { findAllByTestId } = render(<Components />);
    const contactName = await findAllByTestId('contactSelect');
    within(contactName[0]).getByText('Tester 1');

    expect(contactName[0]).toBeInTheDocument();
    expect(contactName[0]).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/tools/fix/commitmentInfo/tester-1?tab=Donations',
    );
  });
});
