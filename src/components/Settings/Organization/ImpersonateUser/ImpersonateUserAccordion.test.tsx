import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { OrganizationsContextProvider } from 'pages/accountLists/[accountListId]/settings/organizations.page';
import { OrganizationAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
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

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
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
});
