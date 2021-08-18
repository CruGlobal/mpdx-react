import React from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import { render } from '../../../../../__tests__/util/testingLibraryReactMock';
import { GetThisWeekQuery } from '../GetThisWeek.generated';
import { ActivityTypeEnum } from '../../../../../graphql/types.generated';
import theme from '../../../../theme';
import useTaskDrawer from '../../../../hooks/useTaskDrawer';
import TasksDueThisWeek from '.';

jest.mock('../../../../hooks/useTaskDrawer');

const openTaskDrawer = jest.fn();

beforeEach(() => {
  (useTaskDrawer as jest.Mock).mockReturnValue({
    openTaskDrawer,
  });
});

describe('TasksDueThisWeek', () => {
  it('default', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TasksDueThisWeek accountListId="abc" />
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
        <TasksDueThisWeek loading accountListId="abc" />
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
        <TasksDueThisWeek dueTasks={dueTasks} accountListId="abc" />
      </ThemeProvider>,
    );
    expect(getByTestId('TasksDueThisWeekCardContentEmpty')).toBeInTheDocument();
    expect(queryByTestId('TasksDueThisWeekList')).not.toBeInTheDocument();
    expect(
      queryByTestId('TasksDueThisWeekListLoading'),
    ).not.toBeInTheDocument();
  });

  describe('MockDate', () => {
    it('props', () => {
      const dueTasks: GetThisWeekQuery['dueTasks'] = {
        nodes: [
          {
            id: 'task_1',
            subject: 'the quick brown fox jumps over the lazy dog',
            activityType: ActivityTypeEnum.PrayerRequest,
            contacts: { nodes: [{ hidden: true, name: 'Smith, Roger' }] },
            startAt: null,
            completedAt: null,
          },
          {
            id: 'task_2',
            subject: 'the quick brown fox jumps over the lazy dog',
            activityType: ActivityTypeEnum.Appointment,
            contacts: { nodes: [{ hidden: true, name: 'Smith, Sarah' }] },
            startAt: null,
            completedAt: null,
          },
        ],
        totalCount: 1234,
      };
      const { getByTestId, queryByTestId } = render(
        <ThemeProvider theme={theme}>
          <TasksDueThisWeek dueTasks={dueTasks} accountListId="abc" />
        </ThemeProvider>,
      );
      expect(getByTestId('TasksDueThisWeekList')).toBeInTheDocument();
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
        'Smith, RogerPrayer Request — the quick brown fox jumps over the lazy dog',
      );
      userEvent.click(task1Element);
      expect(openTaskDrawer).toHaveBeenCalledWith({ taskId: 'task_1' });
      expect(
        getByTestId('TasksDueThisWeekListItem-task_2').textContent,
      ).toEqual(
        'Smith, SarahAppointment — the quick brown fox jumps over the lazy dog',
      );
    });
  });
});
