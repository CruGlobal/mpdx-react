import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { GetAccountListCoachesQuery } from './ManageAccountAccess.generated';
import { ManageCoachesAccessAccordian } from './ManageCoachesAccessAccordian';

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

describe('ManageCoachesAccessAccordian', () => {
  it('should render accordian closed', async () => {
    const { queryByText } = render(
      <Components>
        <GqlMockedProvider>
          <ManageCoachesAccessAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={''}
          />
        </GqlMockedProvider>
        ,
      </Components>,
    );
    expect(
      queryByText('Share this ministry account with other team members'),
    ).toBeNull();
  });
  it('should render accordian open', async () => {
    const { getByText } = render(
      <Components>
        <GqlMockedProvider>
          <ManageCoachesAccessAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Account Coaching Access'}
          />
        </GqlMockedProvider>
        ,
      </Components>,
    );
    expect(
      getByText('Share this ministry account with other team members'),
    ).toBeVisible();
  });

  it('should delete coach access', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getAllByLabelText } = render(
      <Components>
        <GqlMockedProvider<{
          GetAccountListCoaches: GetAccountListCoachesQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            GetAccountListCoaches: {
              accountListCoaches: {
                nodes: [
                  {
                    firstName: 'firstName',
                    lastName: 'lastName',
                    id: '123',
                  },
                ],
              },
            },
          }}
        >
          <ManageCoachesAccessAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Account Coaching Access'}
          />
        </GqlMockedProvider>
        ,
      </Components>,
    );

    await waitFor(() => {
      expect(getByText('Account currently coached by')).toBeInTheDocument();
    });
    userEvent.click(getAllByLabelText('Delete Access')[0]);
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        '{{appName}} removed the coach successfully',
        {
          variant: 'success',
        },
      );
    });

    expect(mutationSpy.mock.calls[3][0].operation.operationName).toEqual(
      'DeleteAccountListCoach',
    );
    expect(mutationSpy.mock.calls[3][0].operation.variables.input).toEqual({
      id: '123',
    });
  });
});
