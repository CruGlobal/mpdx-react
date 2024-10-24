import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetTasksForAddingTagsQuery } from 'src/components/Task/MassActions/AddTags/TasksAddTags.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import i18n from 'src/lib/i18n';
import theme from '../../../theme';
import { TasksMassActionsDropdown } from './TasksMassActionsDropdown';

const selectedIds: string[] = ['abc'];
const massDeselectAll = jest.fn();
const mockEnqueue = jest.fn();
const mocks = {
  GetTasksForAddingTags: {
    tasks: {
      nodes: [
        {
          tagList: ['tag1', 'tag2'],
        },
        {
          tagList: ['tag2'],
        },
      ],
      pageInfo: {
        endCursor: 'Mg',
        hasNextPage: false,
      },
    },
  },
  GetTaskTagList: {
    taskTagList: ['tag1', 'tag2'],
  },
};

jest.mock('src/hooks/useAccountListId');
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

const TaskComponents = () => (
  <I18nextProvider i18n={i18n}>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <TasksMassActionsDropdown
              selectedIdCount={selectedIds?.length ?? 0}
              selectedIds={selectedIds}
              massDeselectAll={massDeselectAll}
            />
          </SnackbarProvider>
        </LocalizationProvider>
      </GqlMockedProvider>
    </ThemeProvider>
  </I18nextProvider>
);

beforeEach(() => {
  (useAccountListId as jest.Mock).mockReturnValue('123456789');
  massDeselectAll.mockClear();
});

describe('TasksMassActionsDropdown', () => {
  it('opens the more actions menu and clicks the complete tasks action', async () => {
    const { getByRole, getByText, findByTestId, queryByTestId, queryByText } =
      render(<TaskComponents />);

    expect(queryByText('Complete Tasks')).not.toBeInTheDocument();
    userEvent.click(getByText('Actions'));
    userEvent.click(getByText('Complete Tasks'));
    expect(
      await findByTestId('CompleteAndDeleteTasksModal'),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Yes' }));
    await waitFor(() =>
      expect(
        queryByTestId('CompleteAndDeleteTasksModal'),
      ).not.toBeInTheDocument(),
    );
    expect(mockEnqueue).toHaveBeenCalledWith('Task(s) completed successfully', {
      variant: 'success',
    });
  });

  it('opens the more actions menu and clicks the edit tasks action', async () => {
    const {
      queryByTestId,
      getByText,
      queryByText,
      getByLabelText,
      getByRole,
      findByLabelText,
    } = render(<TaskComponents />);

    expect(queryByText('Edit Tasks')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    expect(getByText('Edit Tasks')).toBeInTheDocument();
    userEvent.click(getByText('Edit Tasks'));
    await waitFor(() =>
      expect(queryByTestId('EditTasksModal')).toBeInTheDocument(),
    );
    userEvent.click(getByLabelText('Task Type'));
    userEvent.click(
      within(getByRole('listbox', { name: 'Task Type' })).getByText(
        'Appointment',
      ),
    );
    userEvent.click(await findByLabelText('Action'));
    userEvent.click(
      within(getByRole('listbox', { hidden: true, name: 'Action' })).getByText(
        'In Person',
      ),
    );
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(
        queryByTestId('EditTasksModal') as HTMLInputElement,
      ).not.toBeInTheDocument(),
    );
  });

  it('opens the more actions menu and clicks the delete tasks action', async () => {
    const { queryByTestId, getByText, queryByText } = render(
      <TaskComponents />,
    );
    expect(queryByText('Delete Tasks')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    expect(getByText('Delete Tasks')).toBeInTheDocument();
    userEvent.click(getByText('Delete Tasks'));
    expect(queryByTestId('CompleteAndDeleteTasksModal')).toBeInTheDocument();
    userEvent.click(getByText('Yes'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Task(s) deleted successfully', {
        variant: 'success',
      }),
    );
    await waitFor(() => expect(massDeselectAll).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        queryByTestId('CompleteAndDeleteTasksModal') as HTMLInputElement,
      ).not.toBeInTheDocument(),
    );
  });

  it('opens the more actions menu and clicks the delete tasks action then cancels', async () => {
    const { queryByTestId, getByText, queryByText } = render(
      <TaskComponents />,
    );
    expect(queryByText('Delete Tasks')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    expect(getByText('Delete Tasks')).toBeInTheDocument();
    userEvent.click(getByText('Delete Tasks'));
    expect(queryByTestId('CompleteAndDeleteTasksModal')).toBeInTheDocument();
    userEvent.click(getByText('No'));
    await waitFor(() =>
      expect(
        queryByTestId('CompleteAndDeleteTasksModal') as HTMLInputElement,
      ).not.toBeInTheDocument(),
    );
  });

  it('opens the more actions menu and clicks the add tags (tasks) action', async () => {
    const mutationSpy = jest.fn();
    const { queryByTestId, getByText, queryByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetTasksForAddingTags: GetTasksForAddingTagsQuery;
        }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <TasksMassActionsDropdown
                selectedIdCount={selectedIds?.length ?? 0}
                selectedIds={selectedIds}
                massDeselectAll={massDeselectAll}
              />
            </SnackbarProvider>
          </LocalizationProvider>
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(queryByText('Add Tag(s)')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    expect(getByText('Add Tag(s)')).toBeInTheDocument();
    userEvent.click(getByText('Add Tag(s)'));
    await waitFor(() =>
      expect(queryByTestId('AddTagsModal')).toBeInTheDocument(),
    );
    const input = getByRole('combobox') as HTMLInputElement;
    userEvent.type(input, 'tag3');
    expect(input.value).toBe('tag3');
    userEvent.type(input, '{enter}');
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Tags added to tasks!', {
        variant: 'success',
      }),
    );
    await waitFor(() =>
      expect(
        queryByTestId('AddTagsModal') as HTMLInputElement,
      ).not.toBeInTheDocument(),
    );
  });

  it('opens the more actions menu and clicks the remove tags (tasks) action', async () => {
    const mutationSpy = jest.fn();
    const { queryByTestId, getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetTasksForAddingTags: GetTasksForAddingTagsQuery;
        }>
          mocks={mocks}
          onCall={mutationSpy}
        >
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <TasksMassActionsDropdown
                selectedIdCount={selectedIds?.length ?? 0}
                selectedIds={selectedIds}
                massDeselectAll={massDeselectAll}
              />
            </SnackbarProvider>
          </LocalizationProvider>
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(queryByText('Remove Tag(s)')).not.toBeInTheDocument();
    const actionsButton = getByText('Actions') as HTMLInputElement;
    userEvent.click(actionsButton);
    const button = getByText('Remove Tag(s)');
    expect(button).toBeInTheDocument();
    userEvent.click(button);
    await waitFor(() =>
      expect(queryByTestId('RemoveTagsModal')).toBeInTheDocument(),
    );
    await waitFor(() => expect(getByText('tag2')).toBeInTheDocument());
    userEvent.click(getByText('tag2'));
    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Tags removed from task(s)!', {
        variant: 'success',
      }),
    );
    await waitFor(() =>
      expect(
        queryByTestId('RemoveTagsModal') as HTMLInputElement,
      ).not.toBeInTheDocument(),
    );
  });
});
