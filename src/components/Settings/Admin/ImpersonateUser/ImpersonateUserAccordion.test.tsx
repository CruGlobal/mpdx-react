import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AdminAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import theme from '../../../../theme';
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

const handleAccordionChange = jest.fn();

interface ComponentsProps {
  expandedAccordion: AdminAccordion | null;
  mutationSpy?: () => void;
}

const Components = ({ mutationSpy, expandedAccordion }: ComponentsProps) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={mutationSpy}>
          <ImpersonateUserAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={expandedAccordion}
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

      const { getAllByRole, getByRole } = render(
        <Components
          mutationSpy={mutationSpy}
          expandedAccordion={AdminAccordion.ImpersonateUser}
        />,
      );

      const button = getAllByRole('button', { name: 'Impersonate User' })[1];
      const userNameInput = getByRole('textbox', {
        name: /Okta User Name \/ Email/i,
      });
      const reasonInput = getByRole('textbox', {
        name: /reason \/ helpscout ticket link/i,
      });

      userEvent.type(userNameInput, 'test@test.org');
      userEvent.type(reasonInput, 'Helpscout Ticket');

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
      userEvent.click(button);

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

      const { getAllByRole, getByRole } = render(
        <Components
          mutationSpy={mutationSpy}
          expandedAccordion={AdminAccordion.ImpersonateUser}
        />,
      );

      const button = getAllByRole('button', { name: 'Impersonate User' })[1];
      const userNameInput = getByRole('textbox', {
        name: /Okta User Name \/ Email/i,
      });
      const reasonInput = getByRole('textbox', {
        name: /reason \/ helpscout ticket link/i,
      });

      userEvent.type(userNameInput, 'test@test.org');
      userEvent.type(reasonInput, 'Helpscout Ticket');

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
      userEvent.click(button);

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

      const { getByText, getAllByRole, getByRole } = render(
        <Components
          mutationSpy={mutationSpy}
          expandedAccordion={AdminAccordion.ImpersonateUser}
        />,
      );

      const button = getAllByRole('button', { name: 'Impersonate User' })[1];
      const userNameInput = getByRole('textbox', {
        name: /Okta User Name \/ Email/i,
      });
      const reasonInput = getByRole('textbox', {
        name: /reason \/ helpscout ticket link/i,
      });

      userEvent.type(userNameInput, 'testtestorg');
      userEvent.type(reasonInput, 'Helpscout Ticket');

      await waitFor(() => {
        expect(getByText('user must be a valid email')).toBeVisible();
        expect(button).toBeDisabled();
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
      const { getAllByText } = render(<Components expandedAccordion={null} />);
      expect(getAllByText('Impersonate User').length).toEqual(1);
    });

    it('should impersonate user', async () => {
      const mutationSpy = jest.fn();

      const { getAllByText, getAllByRole, getByRole } = render(
        <Components
          mutationSpy={mutationSpy}
          expandedAccordion={AdminAccordion.ImpersonateUser}
        />,
      );
      expect(getAllByText('Impersonate User').length).toEqual(3);

      const button = getAllByRole('button', { name: 'Impersonate User' })[1];
      const userNameInput = getByRole('textbox', {
        name: /Okta User Name \/ Email/i,
      });
      const reasonInput = getByRole('textbox', {
        name: /reason \/ helpscout ticket link/i,
      });

      expect(button).toBeDisabled();

      userEvent.type(userNameInput, 'test@test.org');
      userEvent.type(reasonInput, 'Helpscout Ticket');

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
      userEvent.click(button);

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
