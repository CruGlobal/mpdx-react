import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { OrganizationsContextProvider } from 'pages/accountLists/[accountListId]/settings/organizations.page';
import { OrganizationAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { clearSessionData } from 'src/lib/clearSessionData';
import theme from '../../../../theme';
import { ImpersonateUserAccordion } from './ImpersonateUserAccordion';

jest.mock('src/lib/clearSessionData');

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

const push = jest.fn();

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={{ ...router, push }}>
      <ThemeProvider theme={theme}>
        <OrganizationsContextProvider selectedOrganizationId="">
          {children}
        </OrganizationsContextProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('ImpersonateUserAccordion', () => {
  const fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ errors: [] }),
    status: 200,
  });
  beforeEach(() => {
    window.fetch = fetch;
  });

  it('should render accordion closed', async () => {
    const { getAllByText } = render(
      <Components>
        <GqlMockedProvider>
          <ImpersonateUserAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={null}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getAllByText('Impersonate User')[1]).toBeUndefined();
  });
  it('should impersonate user', async () => {
    const mutationSpy = jest.fn();

    const { getAllByText, getByTestId } = render(
      <Components>
        <GqlMockedProvider onCall={mutationSpy}>
          <ImpersonateUserAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={OrganizationAccordion.ImpersonateUser}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getAllByText('Impersonate User')[1]).toBeVisible();

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

  describe('Clearing session data', () => {
    const submitForm = async () => {
      const { getByTestId } = render(
        <Components>
          <GqlMockedProvider>
            <ImpersonateUserAccordion
              handleAccordionChange={handleAccordionChange}
              expandedAccordion={OrganizationAccordion.ImpersonateUser}
            />
          </GqlMockedProvider>
        </Components>,
      );

      userEvent.type(getByTestId('impersonateUsername'), 'test@test.org');
      userEvent.type(getByTestId('impersonateReason'), 'Helpscout Ticket');

      await waitFor(() => {
        expect(getByTestId('action-button')).not.toBeDisabled();
      });
      userEvent.click(getByTestId('action-button'));
    };

    it('clears session data before redirecting to login', async () => {
      await submitForm();

      await waitFor(() => expect(clearSessionData).toHaveBeenCalled());
      await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
      expect(
        (clearSessionData as jest.Mock).mock.invocationCallOrder[0],
      ).toBeLessThan(push.mock.invocationCallOrder[0]);
    });

    it('keeps session data when impersonation fails', async () => {
      window.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ errors: [{ detail: 'nope' }] }),
        status: 400,
      });

      await submitForm();

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith('nope', { variant: 'error' }),
      );
      expect(clearSessionData).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
    });
  });
});
