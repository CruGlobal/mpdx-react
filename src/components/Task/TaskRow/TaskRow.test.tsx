import React from 'react';
import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultEnum } from '../../../../graphql/types.generated';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../__tests__/util/graphqlMocking';
import theme from '../../../theme';
import useTaskDrawer from '../../../hooks/useTaskDrawer';
import { TaskDrawerTabsEnum } from '../Drawer/Drawer';
import { TaskRowFragment, TaskRowFragmentDoc } from './TaskRow.generated';
import { TaskRow } from './TaskRow';

const onContactSelected = jest.fn();
const onTaskCheckSelected = jest.fn();
const accountListId = 'abc';
const startAt = '2021-10-12';
const lateStartAt = '2019-10-12';

jest.mock('../../../hooks/useTaskDrawer');

const openTaskDrawer = jest.fn();

beforeEach(() => {
  (useTaskDrawer as jest.Mock).mockReturnValue({
    openTaskDrawer,
  });
});

describe('TaskRow', () => {
  it('should render not complete', async () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
      },
    });

    const { findByText } = render(
      <GqlMockedProvider>
        <MuiThemeProvider theme={theme}>
          <TaskRow
            accountListId={accountListId}
            task={task}
            onTaskCheckToggle={onTaskCheckSelected}
            onContactSelected={onContactSelected}
            isChecked={false}
          />
        </MuiThemeProvider>
      </GqlMockedProvider>,
    );

    expect(await findByText(task.subject)).toBeVisible();

    expect(await findByText(task.contacts.nodes[0].name)).toBeVisible();
  });

  it('should render complete', async () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
        completedAt: '2021-10-20',
      },
    });

    const { findByText } = render(
      <GqlMockedProvider>
        <MuiThemeProvider theme={theme}>
          <TaskRow
            accountListId={accountListId}
            task={task}
            onTaskCheckToggle={onTaskCheckSelected}
            onContactSelected={onContactSelected}
            isChecked={false}
          />
        </MuiThemeProvider>
      </GqlMockedProvider>,
    );

    expect(await findByText(task.subject)).toBeVisible();

    expect(await findByText(task.contacts.nodes[0].name)).toBeVisible();
  });
  it('should render late', async () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt: lateStartAt,
        result: ResultEnum.None,
      },
    });

    const { findByText } = render(
      <GqlMockedProvider>
        <MuiThemeProvider theme={theme}>
          <TaskRow
            accountListId={accountListId}
            task={task}
            onTaskCheckToggle={onTaskCheckSelected}
            onContactSelected={onContactSelected}
            isChecked={false}
          />
        </MuiThemeProvider>
      </GqlMockedProvider>,
    );

    expect(await findByText(task.subject)).toBeVisible();

    expect(await findByText(task.contacts.nodes[0].name)).toBeVisible();
  });

  it('should render with Assignee', async () => {
    const assignee = {
      firstName: 'Cool',
      lastName: 'Guy',
      id: 'cool123',
    };

    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
        user: assignee,
      },
    });

    const { findByText } = render(
      <GqlMockedProvider>
        <MuiThemeProvider theme={theme}>
          <TaskRow
            accountListId={accountListId}
            task={task}
            onTaskCheckToggle={onTaskCheckSelected}
            onContactSelected={onContactSelected}
            isChecked={false}
          />
        </MuiThemeProvider>
      </GqlMockedProvider>,
    );

    expect(await findByText(task.subject)).toBeVisible();

    expect(await findByText(task.contacts.nodes[0].name)).toBeVisible();

    expect(
      await findByText(`${assignee.firstName} ${assignee.lastName}`),
    ).toBeVisible();
  });

  describe('task interactions', () => {
    it('handles task checkbox click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { findByText, getByRole } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <TaskRow
              accountListId={accountListId}
              task={task}
              onTaskCheckToggle={onTaskCheckSelected}
              onContactSelected={onContactSelected}
              isChecked={false}
            />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByRole('checkbox', { hidden: true }));
      expect(onTaskCheckSelected).toHaveBeenCalledWith(task.id);
    });
    it('handles complete button click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { findByText, getByRole } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <TaskRow
              accountListId={accountListId}
              task={task}
              onTaskCheckToggle={onTaskCheckSelected}
              onContactSelected={onContactSelected}
              isChecked={false}
            />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByRole('img', { hidden: true, name: 'Check Icon' }));
      expect(openTaskDrawer).toHaveBeenCalledWith({
        taskId: task.id,
        showCompleteForm: true,
      });
    });

    it('handles contact name click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { findByText, getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <TaskRow
              accountListId={accountListId}
              task={task}
              onTaskCheckToggle={onTaskCheckSelected}
              onContactSelected={onContactSelected}
              isChecked={false}
            />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByText(task.contacts.nodes[0].name));
      expect(onContactSelected).toHaveBeenCalledWith(task.contacts.nodes[0].id);
    });

    it('handle comment button click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { findByText, getByRole } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <TaskRow
              accountListId={accountListId}
              task={task}
              onTaskCheckToggle={onTaskCheckSelected}
              onContactSelected={onContactSelected}
              isChecked={false}
            />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByRole('img', { hidden: true, name: 'Comment Icon' }));
      expect(openTaskDrawer).toHaveBeenCalledWith({
        taskId: task.id,
        specificTab: TaskDrawerTabsEnum.comments,
      });
    });
  });
});
