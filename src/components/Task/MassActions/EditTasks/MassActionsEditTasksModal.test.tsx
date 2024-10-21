import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MassActionsEditTasksModal } from './MassActionsEditTasksModal';

const accountListId = 'abc';

describe('MassActionsEditTasksModal', () => {
  it('updates comment', async () => {
    const handleClose = jest.fn();
    const mutationSpy = jest.fn();
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <GqlMockedProvider onCall={mutationSpy}>
              <MassActionsEditTasksModal
                accountListId={accountListId}
                ids={['task-1', 'task-2']}
                selectedIdCount={2}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </LocalizationProvider>,
    );

    userEvent.type(
      getByRole('textbox', { name: 'Add New Comment' }),
      'Comment',
    );
    userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(mutationSpy.mock.calls[2][0]).toMatchObject({
        operation: {
          operationName: 'CreateTaskComment',
          variables: {
            accountListId,
            attributes: {
              body: 'Comment',
            },
            taskId: 'task-1',
          },
        },
      });
      expect(mutationSpy.mock.calls[3][0]).toMatchObject({
        operation: {
          operationName: 'CreateTaskComment',
          variables: {
            accountListId,
            attributes: {
              body: 'Comment',
            },
            taskId: 'task-2',
          },
        },
      });
    });
    expect(handleClose).toHaveBeenCalled();
  });
  it('displays warning message', async () => {
    const handleClose = jest.fn();
    const mutationSpy = jest.fn();
    const { getByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <GqlMockedProvider onCall={mutationSpy}>
              <MassActionsEditTasksModal
                accountListId={accountListId}
                ids={['task-1', 'task-2']}
                selectedIdCount={2}
                handleClose={handleClose}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </LocalizationProvider>,
    );
    expect(getByText('Blank fields will not be affected!')).toBeInTheDocument();
  });
});

it('shows correct Action field options based on the Task Type', async () => {
  const handleClose = jest.fn();
  const { queryByText, findByRole } = render(
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <GqlMockedProvider>
            <MassActionsEditTasksModal
              accountListId={accountListId}
              ids={['task-1', 'task-2']}
              selectedIdCount={2}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </LocalizationProvider>,
  );
  const taskTypeField = await findByRole('combobox', { name: 'Task Type' });
  const actionField = await findByRole('combobox', { name: 'Action' });

  expect(actionField).toBeDisabled();

  userEvent.click(taskTypeField);
  userEvent.click(await findByRole('option', { name: 'Appointment' }));
  userEvent.click(actionField);
  userEvent.click(await findByRole('option', { name: 'In Person' }));

  userEvent.click(taskTypeField);
  userEvent.click(await findByRole('option', { name: 'Partner Care' }));
  await waitFor(() => {
    expect(queryByText('In Person')).not.toBeInTheDocument();
  });
  userEvent.click(actionField);
  userEvent.click(await findByRole('option', { name: 'Digital Newsletter' }));

  userEvent.clear(taskTypeField);
  await waitFor(() => {
    expect(queryByText('In Person')).not.toBeInTheDocument();
  });
  expect(actionField).toBeDisabled();
});
