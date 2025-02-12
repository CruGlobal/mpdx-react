import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AdminAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import theme from '../../../../theme';
import { ResetAccountAccordion } from './ResetAccountAccordion';

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
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('ResetAccountAccordion', () => {
  it('should render Accordion closed', async () => {
    const { getAllByText } = render(
      <Components>
        <GqlMockedProvider>
          <ResetAccountAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={null}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getAllByText('Reset Account').length).toEqual(1);
  });
  it('should reset Account', async () => {
    const mutationSpy = jest.fn();

    const { getAllByText, getAllByRole, getByRole } = render(
      <Components>
        <GqlMockedProvider onCall={mutationSpy}>
          <ResetAccountAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={AdminAccordion.ResetAccount}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getAllByText('Reset Account').length).toEqual(3);

    const button = getAllByRole('button', { name: 'Reset Account' })[1];
    const userNameInput = getByRole('textbox', {
      name: /Okta User Name \/ Email/i,
    });
    const reasonInput = getByRole('textbox', {
      name: /reason \/ helpscout ticket link/i,
    });
    const resetAccountInput = getByRole('textbox', {
      name: /Account Name/i,
    });

    expect(button).toBeDisabled();

    userEvent.type(userNameInput, 'test@test.org');
    userEvent.type(reasonInput, 'Helpscout Ticket');
    userEvent.type(resetAccountInput, 'Test Account');

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
    userEvent.click(button);

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith('Successfully reset account', {
        variant: 'success',
      });
    });

    const resetAccountMutation = mutationSpy.mock.calls[0][0];
    expect(resetAccountMutation.operation.operationName).toEqual(
      'ResetAccountList',
    );
    expect(resetAccountMutation.operation.variables.input).toEqual({
      resettedUserEmail: 'test@test.org',
      accountListName: 'Test Account',
      reason: 'Helpscout Ticket',
    });
  });

  it('should reset fields after form completed', async () => {
    const mutationSpy = jest.fn();

    const { getAllByRole, getByRole } = render(
      <Components>
        <GqlMockedProvider onCall={mutationSpy}>
          <ResetAccountAccordion
            handleAccordionChange={handleAccordionChange}
            expandedAccordion={AdminAccordion.ResetAccount}
          />
        </GqlMockedProvider>
      </Components>,
    );
    const userNameInput = getByRole('textbox', {
      name: /Okta User Name \/ Email/i,
    });
    const reasonInput = getByRole('textbox', {
      name: /reason \/ helpscout ticket link/i,
    });
    const resetAccountInput = getByRole('textbox', {
      name: /Account Name/i,
    });

    userEvent.type(userNameInput, 'test@test.org');
    userEvent.type(reasonInput, 'Helpscout Ticket');
    userEvent.type(resetAccountInput, 'Test Account');
    userEvent.click(getAllByRole('button', { name: 'Reset Account' })[1]);

    expect(userNameInput).toHaveValue('test@test.org');
    expect(reasonInput).toHaveValue('Helpscout Ticket');
    expect(resetAccountInput).toHaveValue('Test Account');
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith('Successfully reset account', {
        variant: 'success',
      });
    });

    expect(userNameInput).toHaveValue('');
    expect(reasonInput).toHaveValue('');
    expect(resetAccountInput).toHaveValue('');
  });
});
