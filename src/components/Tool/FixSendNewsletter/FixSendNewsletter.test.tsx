import { ApolloCache, InMemoryCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import FixSendNewsletter from './FixSendNewsletter';
import {
  mockInvalidNewslettersResponse,
  mockUploadNewsletterChange,
} from './FixSendNewsletterMock';
import { GetInvalidNewsletterQuery } from './GetInvalidNewsletter.generated';
import { UpdateContactNewsletterMutation } from './UpdateNewsletter.generated';

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
const router = {
  isReady: true,
};
const setContactFocus = jest.fn();

const TestComponent = ({
  mocks,
  cache,
  onCall,
}: {
  mocks: ApolloErgonoMockMap;
  cache?: ApolloCache<object>;
  onCall?: MockLinkCallHandler;
}) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetInvalidNewsletter: GetInvalidNewsletterQuery;
          UpdateContactNewsletter: UpdateContactNewsletterMutation;
        }>
          mocks={mocks}
          cache={cache}
          onCall={onCall}
        >
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

  describe('render', () => {
    it('should show the confirm button', async () => {
      const { getAllByRole } = render(
        <TestComponent
          mocks={{
            GetInvalidNewsletter: {
              ...mockInvalidNewslettersResponse.GetInvalidNewsletter,
            },
          }}
        />,
      );

      await waitFor(() => {
        expect(getAllByRole('button', { name: 'Confirm' })[0]).toBeVisible();
      });
    });
  });

  describe('confirm single', () => {
    const name =
      mockInvalidNewslettersResponse.GetInvalidNewsletter.contacts.nodes[0]
        .name;
    const otherName =
      mockInvalidNewslettersResponse.GetInvalidNewsletter.contacts.nodes[1]
        .name;
    const initialNewsletterValue = 'None';
    const newNewsletterValue = 'Physical';

    it('should successfully update the newsletter', async () => {
      const cache = new InMemoryCache();
      jest.spyOn(cache, 'readQuery').mockReturnValue({
        ...mockInvalidNewslettersResponse.GetInvalidNewsletter,
      });

      const { getAllByRole, queryByText, queryByRole } = render(
        <TestComponent
          mocks={{
            GetInvalidNewsletter: {
              ...mockInvalidNewslettersResponse.GetInvalidNewsletter,
            },
            UpdateContactNewsletter: {
              ...mockUploadNewsletterChange.UpdateContactNewsletter,
            },
          }}
          cache={cache}
        />,
      );
      await waitFor(() =>
        expect(queryByRole('progressbar')).not.toBeInTheDocument(),
      );

      const newsletterDropdown = getAllByRole('combobox')[0];
      await waitFor(() => {
        expect(newsletterDropdown).toHaveDisplayValue([initialNewsletterValue]);
      });
      userEvent.selectOptions(newsletterDropdown, newNewsletterValue);
      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);
      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith('Newsletter updated!', {
          variant: 'success',
        });
        expect(queryByText(name)).not.toBeInTheDocument();
        expect(queryByText(otherName)).toBeInTheDocument();
      });
    });

    it('should handle an error', async () => {
      const { getAllByRole, queryByRole } = render(
        <TestComponent
          mocks={{
            GetInvalidNewsletter: {
              ...mockInvalidNewslettersResponse.GetInvalidNewsletter,
            },
            UpdateContactNewsletter: () => {
              throw new Error('Server Error');
            },
          }}
        />,
      );

      await waitFor(() =>
        expect(queryByRole('progressbar')).not.toBeInTheDocument(),
      );

      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          `Error updating contact ${name}`,
          {
            variant: 'error',
            autoHideDuration: 7000,
          },
        );
      });
    });
  });
});
