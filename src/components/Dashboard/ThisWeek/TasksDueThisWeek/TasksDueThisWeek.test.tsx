import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import { ActivityTypeEnum } from 'src/graphql/types.generated';
import useTaskModal from '../../../../hooks/useTaskModal';
import theme from '../../../../theme';
import { GetThisWeekQuery } from '../GetThisWeek.generated';
import TasksDueThisWeek from '.';

jest.mock('../../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
    preloadTaskModal: jest.fn(),
  });
});

describe('TasksDueThisWeek', () => {
  it('default', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <TasksDueThisWeek accountListId="abc" />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    expect(getByTestId('TasksDueThisWeekCardContentEmpty')).toBeInTheDocument();
    expect(queryByTestId('TasksDueThisWeekList')).not.toBeInTheDocument();
    expect(
      queryByTestId('TasksDueThisWeekListLoading'),
    ).not.toBeInTheDocument();
  });

  it('loading', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <TasksDueThisWeek loading accountListId="abc" />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    expect(getByTestId('TasksDueThisWeekListLoading')).toBeInTheDocument();
    expect(queryByTestId('TasksDueThisWeekList')).not.toBeInTheDocument();
    expect(
      queryByTestId('TasksDueThisWeekCardContentEmpty'),
    ).not.toBeInTheDocument();
  });

  it('empty', () => {
    const dueTasks: GetThisWeekQuery['dueTasks'] = {
      nodes: [],
      totalCount: 0,
    };
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <TasksDueThisWeek dueTasks={dueTasks} accountListId="abc" />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    expect(getByTestId('TasksDueThisWeekCardContentEmpty')).toBeInTheDocument();
    expect(queryByTestId('TasksDueThisWeekList')).not.toBeInTheDocument();
    expect(
      queryByTestId('TasksDueThisWeekListLoading'),
    ).not.toBeInTheDocument();
  });

  describe('MockDate', () => {
    it('props', async () => {
      const dueTasks: GetThisWeekQuery['dueTasks'] = {
        nodes: [
          {
            id: 'task_1',
            subject: '1 the quick brown fox jumps over the lazy dog',
            activityType: ActivityTypeEnum.PartnerCarePrayerRequest,
            contacts: {
              nodes: [{ name: 'Smith, Roger', id: '1' }],
              totalCount: 1,
            },
            startAt: null,
            completedAt: null,
          },
          {
            id: 'task_2',
            subject: '2 the quick brown fox jumps over the lazy dog',
            activityType: ActivityTypeEnum.AppointmentInPerson,
            contacts: {
              nodes: [{ name: 'Smith, Sarah', id: '2' }],
              totalCount: 1,
            },
            startAt: null,
            completedAt: null,
          },
        ],
        totalCount: 1234,
      };
      const { getByTestId, queryByTestId, getByText, findByText } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <TasksDueThisWeek dueTasks={dueTasks} accountListId="abc" />
          </GqlMockedProvider>
        </ThemeProvider>,
      );
      expect(getByTestId('TasksDueThisWeekList')).toBeInTheDocument();
      expect(getByText('Smith, Roger')).toBeInTheDocument();
      expect(
        queryByTestId('TasksDueThisWeekCardContentEmpty'),
      ).not.toBeInTheDocument();
      expect(
        queryByTestId('TasksDueThisWeekListLoading'),
      ).not.toBeInTheDocument();
      const viewAllElement = getByTestId('TasksDueThisWeekButtonViewAll');
      expect(viewAllElement).toHaveAttribute(
        'href',
        '/accountLists/abc/tasks?completed=false&startAt[max]=2020-01-01',
      );
      expect(viewAllElement.textContent).toEqual('View All (1,234)');
      const task1Element = getByTestId('TasksDueThisWeekListItem-task_1');
      expect(getByText('Smith, Roger')).toBeInTheDocument();
      expect(
        await findByText('Partner Care - Prayer Request'),
      ).toBeInTheDocument();
      expect(
        getByText('1 the quick brown fox jumps over the lazy dog'),
      ).toBeInTheDocument();
      userEvent.click(task1Element);
      expect(openTaskModal).toHaveBeenCalledWith({
        view: TaskModalEnum.Edit,
        taskId: 'task_1',
      });
      expect(
        getByTestId('TasksDueThisWeekListItem-task_2').textContent,
      ).toEqual(
        'Smith, SarahAppointment - In Person2 the quick brown fox jumps over the lazy dog',
      );
    });

    it('multiple contacts', async () => {
      const dueTasks: GetThisWeekQuery['dueTasks'] = {
        nodes: [
          {
            id: 'task_1',
            subject: 'subject_1',
            activityType: ActivityTypeEnum.PartnerCarePrayerRequest,
            contacts: {
              nodes: [
                { name: 'Smith, Roger', id: '1' },
                { name: 'Smith, Sarah', id: '2' },
              ],
              totalCount: 2,
            },
            startAt: null,
            completedAt: null,
          },
        ],
        totalCount: 1234,
      };
      const { getByTestId, getByText } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider>
            <TasksDueThisWeek dueTasks={dueTasks} accountListId="abc" />
          </GqlMockedProvider>
        </ThemeProvider>,
      );
      expect(getByTestId('TasksDueThisWeekList')).toBeInTheDocument();
      expect(getByText('Smith, Roger, +1 more')).toBeInTheDocument();
    });
  });
});
