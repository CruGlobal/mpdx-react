import React from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import { getDataForTaskModalMock } from '../Modal/Form/TaskModalForm.mock';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import { ActivityTypeEnum } from '../../../../graphql/types.generated';
import theme from '../../../theme';
import useTaskModal from '../../../hooks/useTaskModal';
import {
  getTasksForTaskListMock,
  getFilteredTasksForTaskListMock,
  getEmptyTasksForTaskListMock,
} from './List.mock';
import TaskList from '.';

const accountListId = 'abc';

const openTaskModal = jest.fn();

jest.mock('../../../hooks/useTaskModal');

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
  });
});

jest.mock('lodash/fp/debounce', () =>
  jest.fn().mockImplementation((_time, fn) => fn),
);

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId },
      isReady: true,
    };
  },
}));

describe('TaskList', () => {
  it('has correct defaults', async () => {
    const mocks = [
      getTasksForTaskListMock(accountListId),
      getDataForTaskModalMock(accountListId),
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
    const { findByText, getByLabelText, getAllByRole, getByRole, getByText } =
      render(
        <ThemeProvider theme={theme}>
          <TestWrapper mocks={mocks}>
            <TaskList />
          </TestWrapper>
        </ThemeProvider>,
      );
    userEvent.click(await findByText('On the Journey with the Johnson Family'));
    expect(openTaskModal).toHaveBeenCalledWith({
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
    userEvent.click(getByLabelText('Filter Table'));
    const buttons = getAllByRole('button').filter((element) => element.id);
    const buttonWithIdThatEndsWith = (value: string): HTMLElement => {
      const button = buttons.find((element) => element.id.endsWith(value));
      if (!button) {
        throw new Error(`buttonWithIdThatEndsWith(${value}) not found`);
      }
      return button;
    };

    userEvent.click(buttonWithIdThatEndsWith('completedAt'));
    userEvent.click(getByText('Incomplete'));
    userEvent.click(buttonWithIdThatEndsWith('activityType'));
    userEvent.click(getByText('APPOINTMENT'));
    userEvent.tab();
    userEvent.click(buttonWithIdThatEndsWith('contacts'));
    userEvent.click(getByText('Anderson, Robert'));
    userEvent.tab();
    userEvent.click(buttonWithIdThatEndsWith('tagList'));
    userEvent.click(getByText('tag-1'));
    userEvent.tab();
    userEvent.click(buttonWithIdThatEndsWith('user'));
    userEvent.click(getByText('Robert Anderson'));
    userEvent.tab();
    userEvent.click(getByLabelText('Close'));
    userEvent.click(getByLabelText('Search'));
    userEvent.type(getByRole('textbox', { hidden: true, name: 'Search' }), 'a');
    userEvent.click(getByLabelText('Rows per page: 100'));
    userEvent.click(getByText('250'));
    expect(getByLabelText('Next Page')).toBeDisabled();
    expect(getByLabelText('Previous Page')).toBeDisabled();
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
    const { getByText, findByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper
          mocks={[
            getFilteredTasksForTaskListMock(accountListId, filter),
            getDataForTaskModalMock(accountListId),
          ]}
        >
          <TaskList initialFilter={filter} />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getByText('APPOINTMENT')).toBeInTheDocument();
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
      { ...getDataForTaskModalMock(accountListId), delay: 100931731455 },
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
        <TestWrapper mocks={mocks}>
          <TaskList
            initialFilter={{
              userIds: ['user-1'],
              contactIds: ['contact-1'],
            }}
          />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(
      getAllByRole('button', { hidden: true, name: 'Loading' }).length,
    ).toEqual(2);
  });

  it('has empty state', () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper
          mocks={[
            getEmptyTasksForTaskListMock(accountListId),
            getDataForTaskModalMock(accountListId),
          ]}
        >
          <TaskList />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(
      queryByTestId('TaskModalCommentListItemAvatar'),
    ).not.toBeInTheDocument();
  });
});
