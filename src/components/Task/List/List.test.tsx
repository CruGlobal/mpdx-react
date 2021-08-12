import React from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import { getDataForTaskDrawerMock } from '../Drawer/Form/Form.mock';
import {
  render,
  waitFor,
} from '../../../../__tests__/util/testingLibraryReactMock';
import { useApp } from '../../App';
import { ActivityTypeEnum } from '../../../../graphql/types.generated';
import theme from '../../../theme';
import {
  getTasksForTaskListMock,
  getFilteredTasksForTaskListMock,
  getEmptyTasksForTaskListMock,
  getTasksForTaskListErrorMock,
} from './List.mock';
import TaskList from '.';

const accountListId = 'abc';

const openTaskDrawer = jest.fn();

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

jest.mock('../../App', () => ({
  useApp: jest.fn(),
}));

beforeEach(() => {
  (useApp as jest.Mock).mockReturnValue({
    openTaskDrawer,
    state: { accountListId },
  });
});

jest.mock('lodash/fp/debounce', () =>
  jest.fn().mockImplementation((_time, fn) => fn),
);

describe('TaskList', () => {
  it('has correct defaults', async () => {
    const mocks = [
      getTasksForTaskListMock(accountListId),
      getDataForTaskDrawerMock(accountListId),
      getFilteredTasksForTaskListMock(accountListId, { completed: false }),
      getFilteredTasksForTaskListMock(accountListId, {
        activityType: [ActivityTypeEnum.Appointment],
        completed: false,
      }),
      getFilteredTasksForTaskListMock(accountListId, {
        contactIds: ['contact-1'],
        activityType: [ActivityTypeEnum.Appointment],
        completed: false,
      }),
      getFilteredTasksForTaskListMock(accountListId, {
        tags: ['tag-1'],
        contactIds: ['contact-1'],
        activityType: [ActivityTypeEnum.Appointment],
        completed: false,
      }),
      getFilteredTasksForTaskListMock(accountListId, {
        userIds: ['user-1'],
        tags: ['tag-1'],
        contactIds: ['contact-1'],
        activityType: [ActivityTypeEnum.Appointment],
        completed: false,
      }),
      getFilteredTasksForTaskListMock(accountListId, {
        userIds: ['user-1'],
        tags: ['tag-1'],
        contactIds: ['contact-1'],
        activityType: [ActivityTypeEnum.Appointment],
        completed: false,
        wildcardSearch: 'a',
      }),
      getFilteredTasksForTaskListMock(accountListId, {
        userIds: ['user-1'],
        tags: ['tag-1'],
        contactIds: ['contact-1'],
        activityType: [ActivityTypeEnum.Appointment],
        completed: false,
        wildcardSearch: 'a',
        first: 250,
      }),
      getFilteredTasksForTaskListMock(accountListId, {
        userIds: ['user-1'],
        tags: ['tag-1'],
        contactIds: ['contact-1'],
        activityType: [ActivityTypeEnum.Appointment],
        completed: false,
        wildcardSearch: 'a',
        first: 250,
        after: 'B',
      }),
      getFilteredTasksForTaskListMock(accountListId, {
        userIds: ['user-1'],
        tags: ['tag-1'],
        contactIds: ['contact-1'],
        activityType: [ActivityTypeEnum.Appointment],
        completed: false,
        wildcardSearch: 'a',
        first: 250,
        before: 'A',
      }),
    ];
    const { findByText, getByRole, getAllByRole } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks} disableAppProvider>
          <TaskList />
        </TestWrapper>
      </ThemeProvider>,
    );
    userEvent.click(await findByText('On the Journey with the Johnson Family'));
    expect(openTaskDrawer).toHaveBeenCalledWith({
      taskId: 'task-1',
      filter: {
        userIds: [],
        tags: [],
        contactIds: [],
        activityType: [],
        completed: null,
        startAt: null,
        before: null,
        after: null,
      },
      rowsPerPage: 100,
    });
    userEvent.click(getByRole('button', { name: 'Filter Table' }));
    const buttons = getAllByRole('button').filter((element) => element.id);
    const buttonWithIdThatEndsWith = (value: string): HTMLElement => {
      const button = buttons.find((element) => element.id.endsWith(value));
      if (!button) {
        throw new Error(`buttonWithIdThatEndsWith(${value}) not found`);
      }
      return button;
    };
    userEvent.click(buttonWithIdThatEndsWith('completedAt'));
    userEvent.click(getByRole('option', { name: 'Incomplete' }));
    userEvent.click(buttonWithIdThatEndsWith('activityType'));
    userEvent.click(getByRole('option', { name: 'Appointment' }));
    userEvent.tab();
    userEvent.click(buttonWithIdThatEndsWith('contacts'));
    userEvent.click(getByRole('option', { name: 'Anderson, Robert' }));
    userEvent.tab();
    userEvent.click(buttonWithIdThatEndsWith('tagList'));
    userEvent.click(getByRole('option', { name: 'tag-1' }));
    userEvent.tab();
    userEvent.click(buttonWithIdThatEndsWith('user'));
    userEvent.click(getByRole('option', { name: 'Robert Anderson' }));
    userEvent.tab();
    userEvent.click(getByRole('button', { name: 'Close' }));
    userEvent.click(getByRole('button', { name: 'Search' }));
    userEvent.type(getByRole('textbox', { name: 'Search' }), 'a');
    userEvent.click(getByRole('button', { name: 'Rows per page: 100' }));
    userEvent.click(getByRole('option', { name: '250' }));
    userEvent.click(getByRole('button', { name: 'Next Page' }));
    userEvent.click(getByRole('button', { name: 'Previous Page' }));
  });

  it('has correct overrides', async () => {
    const filter = {
      accountListId,
      activityType: [ActivityTypeEnum.Appointment],
      completed: true,
      tags: ['tag-1', 'tag-2'],
      userIds: ['user-1'],
      contactIds: ['contact-1'],
      wildcardSearch: 'journey',
      startAt: { min: '2020-10-10', max: '2020-12-10' },
    };
    const { getByRole, getByText, findByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper
          mocks={[
            getFilteredTasksForTaskListMock(accountListId, filter),
            getDataForTaskDrawerMock(accountListId),
          ]}
          disableAppProvider
        >
          <TaskList initialFilter={filter} />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getByText('Appointment')).toBeInTheDocument();
    expect(getByText('Complete')).toBeInTheDocument();
    expect(getByText('Tag: tag-1')).toBeInTheDocument();
    expect(getByText('Tag: tag-2')).toBeInTheDocument();
    expect(getByText('Minimum Due Date: Oct 10, 2020')).toBeInTheDocument();
    expect(getByText('Maximum Due Date: Dec 10, 2020')).toBeInTheDocument();
    expect(getByRole('textbox')).toHaveValue('journey');
    expect(await findByText('Anderson, Robert')).toBeInTheDocument();
    expect(getByText('Robert Anderson')).toBeInTheDocument();
  });

  it('has loading state', () => {
    const mocks = [
      { ...getDataForTaskDrawerMock(accountListId), delay: 100931731455 },
      {
        ...getFilteredTasksForTaskListMock(accountListId, {
          userIds: ['user-1'],
          contactIds: ['contact-1'],
        }),
        delay: 100931731455,
      },
    ];
    const { getAllByRole } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks} disableAppProvider>
          <TaskList
            initialFilter={{
              userIds: ['user-1'],
              contactIds: ['contact-1'],
            }}
          />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getAllByRole('button', { name: 'Loading' }).length).toEqual(2);
  });

  it('has empty state', () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper
          mocks={[
            getEmptyTasksForTaskListMock(accountListId),
            getDataForTaskDrawerMock(accountListId),
          ]}
          disableAppProvider
        >
          <TaskList />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(
      queryByTestId('TaskDrawerCommentListItemAvatar'),
    ).not.toBeInTheDocument();
  });

  it('error', async () => {
    render(
      <ThemeProvider theme={theme}>
        <TestWrapper
          mocks={[
            getTasksForTaskListErrorMock(accountListId),
            getDataForTaskDrawerMock(accountListId),
          ]}
          disableAppProvider
        >
          <TaskList />
        </TestWrapper>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Error loading data.  Try again.',
        {
          variant: 'error',
        },
      ),
    );
  });
});
