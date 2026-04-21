import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockInvalidNewslettersResponse } from 'src/components/Tool/FixSendNewsletter/FixSendNewsletterMock';
import { InvalidNewsletterQuery } from 'src/components/Tool/FixSendNewsletter/InvalidNewsletter.generated';
import theme from 'src/theme';
import FixSendNewsletterPage from './[[...contactId]].page';

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
const router = {
  pathname:
    '/accountLists/[accountListId]/tools/fix/sendNewsletter/[[...contactId]]',
  query: { accountListId },
  isReady: true,
};

const Components = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          InvalidNewsletter: InvalidNewsletterQuery;
        }>
          mocks={mockInvalidNewslettersResponse as ApolloErgonoMockMap}
        >
          <FixSendNewsletterPage />
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('FixSendNewsletterPage', () => {
  it('should render contact link correctly', async () => {
    const { findByRole } = render(<Components />);

    const contactName = await findByRole('link', {
      name: 'Baggins, Frodo',
    });

    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/fix/sendNewsletter/contactId1`,
    );
  });
});
