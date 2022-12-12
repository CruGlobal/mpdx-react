import React from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '../../../../../__tests__/util/testingLibraryReactMock';
import { GetThisWeekQuery } from '../GetThisWeek.generated';
import { ActivityTypeEnum } from '../../../../../graphql/types.generated';
import theme from '../../../../theme';
import useTaskModal from '../../../../hooks/useTaskModal';
import TasksDueThisWeek from '.';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';

jest.mock('../../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
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
            subject: 'the quick brown fox jumps over the lazy dog',
            activityType: ActivityTypeEnum.PrayerRequest,
            contacts: {
              nodes: [{ hidden: true, name: 'Smith, Roger', id: '1' }],
              totalCount: 1,
            },
            startAt: null,
            completedAt: null,
          },
          {
            id: 'task_2',
            subject: 'the quick brown fox jumps over the lazy dog',
            activityType: ActivityTypeEnum.Appointment,
            contacts: {
              nodes: [{ hidden: true, name: 'Smith, Sarah', id: '2' }],
              totalCount: 1,
            },
            startAt: null,
            completedAt: null,
          },
        ],
        totalCount: 1234,
      };
      const { getByTestId, queryByTestId, getByText } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<LoadConstantsQuery>
            mocks={{
              constant: {
                activities: [
                  { id: 'Prayer Request', value: 'Prayer Request' },
                  { id: 'Appointment', value: 'Appointment' },
                ],
              },
            }}
          >
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
      expect(task1Element.textContent).toEqual(
        'Smith, Roger — the quick brown fox jumps over the lazy dog',
      );
      userEvent.click(task1Element);
      expect(openTaskModal).toHaveBeenCalledWith({ taskId: 'task_1' });
      expect(
        getByTestId('TasksDueThisWeekListItem-task_2').textContent,
      ).toEqual('Smith, Sarah — the quick brown fox jumps over the lazy dog');
    });

    it('multiple contacts', async () => {
      const dueTasks: GetThisWeekQuery['dueTasks'] = {
        nodes: [
          {
            id: 'task_1',
            subject: 'subject_1',
            activityType: ActivityTypeEnum.PrayerRequest,
            contacts: {
              nodes: [
                { hidden: true, name: 'Smith, Roger', id: '1' },
                { hidden: true, name: 'Smith, Sarah', id: '2' },
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
          <GqlMockedProvider<LoadConstantsQuery>
            mocks={{
              constant: {
                activities: [
                  { id: 'Prayer Request', value: 'Prayer Request' },
                  { id: 'Appointment', value: 'Appointment' },
                ],
              },
            }}
          >
            <TasksDueThisWeek dueTasks={dueTasks} accountListId="abc" />
          </GqlMockedProvider>
        </ThemeProvider>,
      );
      expect(getByTestId('TasksDueThisWeekList')).toBeInTheDocument();
      expect(getByText('Smith, Roger, +1 more')).toBeInTheDocument();
    });
  });
});
