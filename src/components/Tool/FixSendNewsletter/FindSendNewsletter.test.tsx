import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import FixSendNewsletter from './FixSendNewsletter';
import {
  GetInvalidNewsletterQuery,
  useGetInvalidNewsletterQuery,
} from './GetInvalidNewsletter.generated';

jest.mock('./GetInvalidNewsletter.generated');

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const accountListId = 'account-id';
const contactId = 'contact-id';
const router = {
  isReady: true,
};
const setContactFocus = jest.fn();

const TestComponent = () => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ InvalidNewsletters: GetInvalidNewsletterQuery }>>
          <FixSendNewsletter
            accountListId={accountListId}
            setContactFocus={setContactFocus}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('FixSendNewsletter', () => {
  beforeEach(() => {
    setContactFocus.mockClear();
  });
  beforeEach(() => {
    (useGetInvalidNewsletterQuery as jest.Mock).mockReturnValue({
      data: {
        contacts: {
          nodes: [
            {
              id: contactId,
              name: 'Contact Name',
              status: StatusEnum.PartnerPray,
            },
          ],
        },
        constant: {
          status: [{ id: StatusEnum.PartnerPray, value: 'Partner - Pray' }],
        },
      },
    });
  });

  describe('render', () => {
    it('should show the readable value of contact status', async () => {
      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Partner - Pray')).toBeVisible();
      });
    });
  });
});
