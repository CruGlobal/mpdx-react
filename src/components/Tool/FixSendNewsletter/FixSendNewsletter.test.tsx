import { ApolloCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
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
import { InvalidNewsletterQuery } from './InvalidNewsletter.generated';
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
          InvalidNewsletter: InvalidNewsletterQuery;
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
  const deceasedName =
    mockInvalidNewslettersResponse.InvalidNewsletter.contacts.nodes[2].name;

  beforeEach(() => {
    setContactFocus.mockClear();
  });

  describe('render', () => {
    it('should show the readable value of contact status', async () => {
      const { getByText } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
          }}
        />,
      );

      await waitFor(() => {
        expect(getByText('Partner - Pray')).toBeVisible();
      });
    });

    it('should show the confirm button', async () => {
      const { getAllByRole } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
          }}
        />,
      );

      await waitFor(() => {
        expect(getAllByRole('button', { name: 'Confirm' })[0]).toBeVisible();
      });
    });

    it('should not show deceased contacts', async () => {
      const { queryByRole, queryByText } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
          }}
        />,
      );

      await waitFor(() =>
        expect(queryByRole('progressbar')).not.toBeInTheDocument(),
      );

      await waitFor(() => {
        expect(queryByText(deceasedName)).not.toBeInTheDocument();
      });
    });
  });

  describe('confirm single', () => {
    const name =
      mockInvalidNewslettersResponse.InvalidNewsletter.contacts.nodes[0].name;
    const otherName =
      mockInvalidNewslettersResponse.InvalidNewsletter.contacts.nodes[1].name;
    const initialNewsletterValue = 'None';
    const newNewsletterValue = 'Physical';

    it('should successfully update the newsletter', async () => {
      const mutationSpy = jest.fn();
      const { getAllByRole, queryByText, queryByRole, getByText } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
            UpdateContactNewsletter: {
              ...mockUploadNewsletterChange.UpdateContactNewsletter,
            },
          }}
          onCall={mutationSpy}
        />,
      );
      await waitFor(() =>
        expect(queryByRole('progressbar')).not.toBeInTheDocument(),
      );

      const newsletterDropdown = getAllByRole('combobox')[0];
      await waitFor(() => {
        expect(
          within(newsletterDropdown).getByText(initialNewsletterValue),
        ).toBeInTheDocument();
        userEvent.click(newsletterDropdown);
        userEvent.click(getByText(newNewsletterValue));
      });
      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);
      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith('Newsletter updated!', {
          variant: 'success',
        });
      });
      await waitFor(() => {
        expect(mutationSpy.mock.calls[1][0]).toMatchObject({
          operation: {
            operationName: 'UpdateContactNewsletter',
            variables: {
              accountListId: 'account-id',
              attributes: {
                sendNewsletter: 'PHYSICAL',
              },
            },
          },
        });
        expect(queryByText(otherName)).toBeInTheDocument();
      });
    });

    it('should handle an error', async () => {
      const { getAllByRole, queryByRole } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
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

    it('should filter out deceased', async () => {
      const { getAllByRole, queryByText, queryByRole, getByText } = render(
        <TestComponent
          mocks={{
            InvalidNewsletter: {
              ...mockInvalidNewslettersResponse.InvalidNewsletter,
            },
            UpdateContactNewsletter: {
              ...mockUploadNewsletterChange.UpdateContactNewsletter,
            },
          }}
        />,
      );
      await waitFor(() =>
        expect(queryByRole('progressbar')).not.toBeInTheDocument(),
      );

      const newsletterDropdown = getAllByRole('combobox')[0];
      userEvent.click(newsletterDropdown);
      userEvent.click(getByText(newNewsletterValue));
      userEvent.click(getAllByRole('button', { name: 'Confirm' })[0]);
      await waitFor(() => {
        expect(queryByText(deceasedName)).not.toBeInTheDocument();
        expect(queryByText(otherName)).toBeInTheDocument();
      });
    });
  });
});
