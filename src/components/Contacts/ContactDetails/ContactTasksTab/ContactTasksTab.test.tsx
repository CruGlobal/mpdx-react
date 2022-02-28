import { ThemeProvider } from '@material-ui/core';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import useTaskDrawer from '../../../../hooks/useTaskDrawer';
import theme from '../../../../theme';
import { ContactTasksTab } from './ContactTasksTab';
import { ContactTasksTabQuery } from './ContactTasksTab.generated';

jest.mock('../../../../hooks/useTaskDrawer');

const openTaskDrawer = jest.fn();

beforeEach(() => {
  (useTaskDrawer as jest.Mock).mockReturnValue({
    openTaskDrawer,
  });
});

const accountListId = '123';
const contactId = 'abc';

describe('ContactTasksTab', () => {
  it('default', async () => {
    const querySpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactTasksTabQuery> onCall={querySpy}>
          <ContactTasksTab
            accountListId={accountListId}
            contactId={contactId}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('loadingRow')).not.toBeInTheDocument(),
    );
    const { operation, response } = querySpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.tasksFilter.contactIds).toEqual([contactId]);
    await waitFor(() =>
      expect(
        getByText(response.data.tasks.nodes[0].subject),
      ).toBeInTheDocument(),
    );
  });

  it('loading', async () => {
    const { getAllByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactTasksTabQuery>>
          <ContactTasksTab
            accountListId={accountListId}
            contactId={contactId}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    expect(getAllByTestId('loadingRow')[0]).toBeInTheDocument();
  });

  it('handles add task click', async () => {
    const querySpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactTasksTabQuery> onCall={querySpy}>
          <ContactTasksTab
            accountListId={accountListId}
            contactId={contactId}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('loadingRow')).not.toBeInTheDocument(),
    );
    const { operation, response } = querySpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.tasksFilter.contactIds).toEqual([contactId]);
    await waitFor(() =>
      expect(
        getByText(response.data.tasks.nodes[0].subject),
      ).toBeInTheDocument(),
    );

    userEvent.click(getByText('add task'));
    expect(openTaskDrawer).toHaveBeenCalledWith({});
  });

  it('handles log task click', async () => {
    const querySpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactTasksTabQuery> onCall={querySpy}>
          <ContactTasksTab
            accountListId={accountListId}
            contactId={contactId}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('loadingRow')).not.toBeInTheDocument(),
    );
    const { operation, response } = querySpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.tasksFilter.contactIds).toEqual([contactId]);
    await waitFor(() =>
      expect(
        getByText(response.data.tasks.nodes[0].subject),
      ).toBeInTheDocument(),
    );
    userEvent.click(getByText('log task'));
    expect(openTaskDrawer).toHaveBeenCalledWith({
      defaultValues: { completedAt: DateTime.local().toISO() },
    });
  });
});
