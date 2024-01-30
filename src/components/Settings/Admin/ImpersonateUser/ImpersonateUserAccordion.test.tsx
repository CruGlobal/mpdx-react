import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { GetUserIdQuery } from './GetUserId.generated';
import { ImpersonateUserAccordion } from './ImpersonateUserAccordion';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const router = {
  query: { accountListId, contactId: [contactId] },
  isReady: true,
};

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

const GetUserId = {
  GetUserId: {
    user: {
      id: '134456',
    },
  },
};

const handleAccordionChange = jest.fn();

interface ComponentsProps {
  expandedPanel: string;
  mutationSpy?: () => void;
}

const Components = ({ mutationSpy, expandedPanel }: ComponentsProps) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ GetUserId: GetUserIdQuery }>
          mocks={{
            ...GetUserId,
          }}
          onCall={mutationSpy}
        >
          <ImpersonateUserAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={expandedPanel}
          />
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('ImpersonateUserAccordion', () => {
  describe('Handling Errors', () => {
    it('should handle returned errors', async () => {
      const fetch = jest.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            errors: [
              {
                detail: 'Error1',
              },
              {
                detail: 'Error2',
              },
            ],
          }),
        status: 400,
      });
      window.fetch = fetch;

      const mutationSpy = jest.fn();

      const { getByTestId } = render(
        <Components
          mutationSpy={mutationSpy}
          expandedPanel={'Impersonate User'}
        />,
      );

      userEvent.type(getByTestId('impersonateUsername'), 'test@test.org');
      userEvent.type(getByTestId('impersonateReason'), 'Helpscout Ticket');

      await waitFor(() => {
        expect(getByTestId('action-button')).not.toBeDisabled();
      });
      userEvent.click(getByTestId('action-button'));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith('Error1', {
          variant: 'error',
        });
        expect(mockEnqueue).toHaveBeenCalledWith('Error2', {
          variant: 'error',
        });
      });
    });

    it('should catch unknown error', async () => {
      const fetch = jest
        .fn()
        .mockResolvedValue(Promise.reject(new Error('Unknown Error')));
      window.fetch = fetch;

      const mutationSpy = jest.fn();

      const { getByTestId } = render(
        <Components
          mutationSpy={mutationSpy}
          expandedPanel={'Impersonate User'}
        />,
      );

      userEvent.type(getByTestId('impersonateUsername'), 'test@test.org');
      userEvent.type(getByTestId('impersonateReason'), 'Helpscout Ticket');

      await waitFor(() => {
        expect(getByTestId('action-button')).not.toBeDisabled();
      });
      userEvent.click(getByTestId('action-button'));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith('Unknown Error', {
          variant: 'error',
        });
      });
    });

    it('should show error when enter non-email value', async () => {
      const fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ errors: [] }),
        status: 200,
      });
      window.fetch = fetch;

      const mutationSpy = jest.fn();

      const { getByText, getByTestId } = render(
        <Components
          mutationSpy={mutationSpy}
          expandedPanel={'Impersonate User'}
        />,
      );

      userEvent.type(getByTestId('impersonateUsername'), 'testtestorg');
      userEvent.type(getByTestId('impersonateReason'), 'Helpscout Ticket');

      await waitFor(() => {
        expect(getByText('user must be a valid email')).toBeVisible();
        expect(getByTestId('action-button')).toBeDisabled();
      });
    });
  });

  describe('Handling user actions', () => {
    const fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ errors: [] }),
      status: 200,
    });
    beforeEach(() => {
      window.fetch = fetch;
    });

    it('should render Accordion closed', async () => {
      const { getAllByText } = render(<Components expandedPanel={''} />);
      expect(getAllByText('Impersonate User').length).toEqual(1);
    });

    it('should impersonate user', async () => {
      const mutationSpy = jest.fn();

      const { getAllByText, getByTestId } = render(
        <Components
          mutationSpy={mutationSpy}
          expandedPanel={'Impersonate User'}
        />,
      );
      expect(getAllByText('Impersonate User').length).toEqual(3);

      expect(getByTestId('action-button')).toBeDisabled();

      userEvent.type(getByTestId('impersonateUsername'), 'test@test.org');
      userEvent.type(getByTestId('impersonateReason'), 'Helpscout Ticket');

      await waitFor(() => {
        expect(getByTestId('action-button')).not.toBeDisabled();
      });
      userEvent.click(getByTestId('action-button'));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Redirecting you to home screen to impersonate user...',
          {
            variant: 'success',
          },
        );
      });
    });
  });
});
