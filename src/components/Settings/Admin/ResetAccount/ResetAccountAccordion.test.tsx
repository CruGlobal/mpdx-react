import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
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
            expandedPanel={''}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getAllByText('Reset Account').length).toEqual(1);
  });
  it('should reset Account', async () => {
    const mutationSpy = jest.fn();

    const { getAllByText, getByTestId } = render(
      <Components>
        <GqlMockedProvider onCall={mutationSpy}>
          <ResetAccountAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Reset Account'}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getAllByText('Reset Account').length).toEqual(2);

    expect(getByTestId('action-button')).toBeDisabled();

    userEvent.type(getByTestId('resetUserName'), 'test@test.org');
    userEvent.type(getByTestId('resetReason'), 'Helpscout Ticket');
    userEvent.type(getByTestId('resetAccountName'), 'Test Account');

    await waitFor(() => {
      expect(getByTestId('action-button')).not.toBeDisabled();
    });
    userEvent.click(getByTestId('action-button'));

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

    const { getByTestId } = render(
      <Components>
        <GqlMockedProvider onCall={mutationSpy}>
          <ResetAccountAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Reset Account'}
          />
        </GqlMockedProvider>
      </Components>,
    );
    userEvent.type(getByTestId('resetUserName'), 'test@test.org');
    userEvent.type(getByTestId('resetReason'), 'Helpscout Ticket');
    userEvent.type(getByTestId('resetAccountName'), 'Test Account');
    userEvent.click(getByTestId('action-button'));

    expect(getByTestId('resetUserName')).toHaveValue('test@test.org');
    expect(getByTestId('resetReason')).toHaveValue('Helpscout Ticket');
    expect(getByTestId('resetAccountName')).toHaveValue('Test Account');
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith('Successfully reset account', {
        variant: 'success',
      });
    });

    expect(getByTestId('resetUserName')).toHaveValue('');
    expect(getByTestId('resetReason')).toHaveValue('');
    expect(getByTestId('resetAccountName')).toHaveValue('');
  });
});
