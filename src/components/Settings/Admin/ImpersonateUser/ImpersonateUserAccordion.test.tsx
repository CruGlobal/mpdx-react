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
  query: { accountListId, contactId: [contactId] } as Record<
    string,
    string | string[]
  >,
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
  routerOverride?: typeof router;
}

const Components = ({
  mutationSpy,
  expandedAccordion,
  routerOverride,
}: ComponentsProps) => (
  <SnackbarProvider>
    <TestRouter router={routerOverride ?? router}>
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

  describe('Query param prefill and auto-submit', () => {
    const fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ errors: [] }),
      status: 200,
    });
    beforeEach(() => {
      fetch.mockClear();
      window.fetch = fetch;
    });

    it('should auto-submit when both email and reason params are present', async () => {
      render(
        <Components
          expandedAccordion={AdminAccordion.ImpersonateUser}
          routerOverride={{
            ...router,
            query: {
              ...router.query,
              email: 'test@test.org',
              reason: 'HS-1234',
            },
          }}
        />,
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/auth/impersonate/impersonateUser',
          {
            method: 'POST',
            body: JSON.stringify({
              user: 'test@test.org',
              reason: 'HS-1234',
            }),
          },
        );
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Redirecting you to home screen to impersonate user...',
          {
            variant: 'success',
          },
        );
      });
    });

    it('should not auto-submit while the router is not ready', async () => {
      const baseRouter = {
        ...router,
        query: {
          ...router.query,
          email: 'test@test.org',
          reason: 'HS-1234',
        },
      };

      const { rerender } = render(
        <Components
          expandedAccordion={AdminAccordion.ImpersonateUser}
          routerOverride={{ ...baseRouter, isReady: false }}
        />,
      );

      await waitFor(() => expect(fetch).not.toHaveBeenCalled());

      rerender(
        <Components
          expandedAccordion={AdminAccordion.ImpersonateUser}
          routerOverride={{ ...baseRouter, isReady: true }}
        />,
      );

      await waitFor(() =>
        expect(fetch).toHaveBeenCalledWith(
          '/api/auth/impersonate/impersonateUser',
          {
            method: 'POST',
            body: JSON.stringify({
              user: 'test@test.org',
              reason: 'HS-1234',
            }),
          },
        ),
      );
    });

    it('should prefill without auto-submitting when only email is present', async () => {
      const { getByRole } = render(
        <Components
          expandedAccordion={AdminAccordion.ImpersonateUser}
          routerOverride={{
            ...router,
            query: { ...router.query, email: 'test@test.org' },
          }}
        />,
      );

      await waitFor(() => {
        expect(
          getByRole('textbox', { name: /Okta User Name \/ Email/i }),
        ).toHaveValue('test@test.org');
      });
      expect(
        getByRole('textbox', { name: /reason \/ helpscout ticket link/i }),
      ).toHaveValue('');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should not prefill or auto-submit when email param is an array', async () => {
      const { getByRole, queryByRole } = render(
        <Components
          expandedAccordion={AdminAccordion.ImpersonateUser}
          routerOverride={{
            ...router,
            query: {
              ...router.query,
              email: ['a@b.org', 'c@d.org'],
              reason: 'HS-1234',
            },
          }}
        />,
      );

      // Repeated params (?email=a&email=b) arrive as an array
      await waitFor(() => {
        expect(
          getByRole('textbox', { name: /Okta User Name \/ Email/i }),
        ).toHaveValue('');
      });
      expect(
        getByRole('textbox', { name: /reason \/ helpscout ticket link/i }),
      ).toHaveValue('HS-1234');
      expect(queryByRole('alert')).not.toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should not auto-submit a second time when the effect re-runs', async () => {
      const baseRouter = {
        ...router,
        query: {
          ...router.query,
          email: 'test@test.org',
          reason: 'HS-1234',
        },
      };

      const { rerender } = render(
        <Components
          expandedAccordion={AdminAccordion.ImpersonateUser}
          routerOverride={{ ...baseRouter, isReady: false }}
        />,
      );

      expect(fetch).not.toHaveBeenCalled();

      rerender(
        <Components
          expandedAccordion={AdminAccordion.ImpersonateUser}
          routerOverride={{ ...baseRouter, isReady: true }}
        />,
      );

      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

      // Changing a query param re-runs the effect, but the autoSubmitted ref
      // prevents a second submission
      rerender(
        <Components
          expandedAccordion={AdminAccordion.ImpersonateUser}
          routerOverride={{
            ...baseRouter,
            isReady: true,
            query: { ...baseRouter.query, reason: 'HS-9999' },
          }}
        />,
      );

      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should not auto-submit when the accordion is collapsed', async () => {
      render(
        <Components
          expandedAccordion={null}
          routerOverride={{
            ...router,
            query: {
              ...router.query,
              email: 'test@test.org',
              reason: 'HS-1234',
            },
          }}
        />,
      );

      await waitFor(() => expect(fetch).not.toHaveBeenCalled());
    });

    it('should prefill without auto-submitting when email param is invalid', async () => {
      const { getByRole } = render(
        <Components
          expandedAccordion={AdminAccordion.ImpersonateUser}
          routerOverride={{
            ...router,
            query: { ...router.query, email: 'notanemail', reason: 'HS-1234' },
          }}
        />,
      );

      await waitFor(() => {
        expect(
          getByRole('textbox', { name: /Okta User Name \/ Email/i }),
        ).toHaveValue('notanemail');
      });
      expect(
        getByRole('textbox', { name: /reason \/ helpscout ticket link/i }),
      ).toHaveValue('HS-1234');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should show an error alert when the email param is invalid', async () => {
      const { findByRole } = render(
        <Components
          expandedAccordion={AdminAccordion.ImpersonateUser}
          routerOverride={{
            ...router,
            query: { ...router.query, email: 'notanemail', reason: 'HS-1234' },
          }}
        />,
      );

      expect(await findByRole('alert')).toHaveTextContent(
        'The email address provided in the link is not a valid email address, so impersonation could not start automatically.',
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should not show an error alert when the email param is valid', async () => {
      const { getByRole, queryByRole } = render(
        <Components
          expandedAccordion={AdminAccordion.ImpersonateUser}
          routerOverride={{
            ...router,
            query: { ...router.query, email: 'test@test.org' },
          }}
        />,
      );

      await waitFor(() => {
        expect(
          getByRole('textbox', { name: /Okta User Name \/ Email/i }),
        ).toHaveValue('test@test.org');
      });
      expect(queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Environment gating', () => {
    const fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ errors: [] }),
      status: 200,
    });
    const originalNodeEnv = process.env.NODE_ENV;
    const originalApiUrl = process.env.API_URL;

    beforeEach(() => {
      fetch.mockClear();
      window.fetch = fetch;
    });

    afterEach(() => {
      (process.env as Record<string, string | undefined>).NODE_ENV =
        originalNodeEnv;
      process.env.API_URL = originalApiUrl;
    });

    it('should ignore query params in production', async () => {
      (process.env as Record<string, string | undefined>).NODE_ENV =
        'production';
      process.env.API_URL = 'https://api.mpdx.org/graphql';

      const { getByRole } = render(
        <Components
          expandedAccordion={AdminAccordion.ImpersonateUser}
          routerOverride={{
            ...router,
            query: {
              ...router.query,
              email: 'test@test.org',
              reason: 'HS-1234',
            },
          }}
        />,
      );

      await waitFor(() => {
        expect(
          getByRole('textbox', { name: /Okta User Name \/ Email/i }),
        ).toHaveValue('');
      });
      expect(
        getByRole('textbox', { name: /reason \/ helpscout ticket link/i }),
      ).toHaveValue('');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should allow query params in a production build pointed at the staging API', async () => {
      (process.env as Record<string, string | undefined>).NODE_ENV =
        'production';
      process.env.API_URL = 'https://api.stage.mpdx.org/graphql';

      render(
        <Components
          expandedAccordion={AdminAccordion.ImpersonateUser}
          routerOverride={{
            ...router,
            query: {
              ...router.query,
              email: 'test@test.org',
              reason: 'HS-1234',
            },
          }}
        />,
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/auth/impersonate/impersonateUser',
          {
            method: 'POST',
            body: JSON.stringify({
              user: 'test@test.org',
              reason: 'HS-1234',
            }),
          },
        );
      });
    });
  });
});
