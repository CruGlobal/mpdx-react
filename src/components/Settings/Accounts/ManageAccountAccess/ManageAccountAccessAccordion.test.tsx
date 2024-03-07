import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { GetAccountsSharingWithQuery } from './ManageAccountAccess.generated';
import { ManageAccountAccessAccordion } from './ManageAccountAccessAccordion';

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

describe('ManageAccountAccessAccordion', () => {
  it('should render accordion closed', async () => {
    const { queryByText } = render(
      <Components>
        <GqlMockedProvider>
          <ManageAccountAccessAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={''}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(
      queryByText('Share this ministry account with other team members'),
    ).not.toBeInTheDocument();
  });
  it('should render accordion open', async () => {
    const { getByText } = render(
      <Components>
        <GqlMockedProvider>
          <ManageAccountAccessAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Account Access'}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(
      getByText('Share this ministry account with other team members'),
    ).toBeVisible();
  });

  it('should remove user access and update cache', async () => {
    const mutationSpy = jest.fn();
    const { queryByText, getAllByTestId } = render(
      <Components>
        <GqlMockedProvider<{
          GetAccountsSharingWith: GetAccountsSharingWithQuery;
        }>
          onCall={mutationSpy}
          mocks={{
            GetAccountsSharingWith: {
              accountListUsers: {
                nodes: [
                  {
                    id: 'user1',
                    user: {
                      id: '111111',
                      firstName: 'firstName1',
                      lastName: 'lastName1',
                    },
                  },
                  {
                    id: 'user2',
                    user: {
                      id: '222222',
                      firstName: 'firstName2',
                      lastName: 'lastName2',
                    },
                  },
                ],
              },
            },
          }}
        >
          <ManageAccountAccessAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Account Access'}
          />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() => {
      expect(queryByText('Account currently shared with')).toBeInTheDocument();
      expect(queryByText('firstName1 lastName1')).toBeInTheDocument();
      expect(queryByText('firstName2 lastName2')).toBeInTheDocument();
    });

    const deleteIcons = getAllByTestId('DeleteIcon');

    userEvent.click(deleteIcons[0]);

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        '{{appName}} removed the user successfully',
        { variant: 'success' },
      );
      expect(queryByText('firstName1 lastName1')).not.toBeInTheDocument();
      expect(queryByText('firstName2 lastName2')).toBeInTheDocument();
    });
  });
});
