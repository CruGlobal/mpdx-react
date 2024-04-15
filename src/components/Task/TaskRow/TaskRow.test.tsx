import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultEnum } from 'src/graphql/types.generated';
import {
  GqlMockedProvider,
  gqlMock,
} from '../../../../__tests__/util/graphqlMocking';
import useTaskModal from '../../../hooks/useTaskModal';
import theme from '../../../theme';
import { TaskRow } from './TaskRow';
import { TaskRowFragment, TaskRowFragmentDoc } from './TaskRow.generated';

const getContactUrl = jest.fn().mockReturnValue({
  pathname: '/pathname/tasks/123456',
  query: { filter: 'filterOptions' },
});
const onTaskCheckSelected = jest.fn();
const accountListId = 'abc';
const startAt = '2021-10-12';
const lateStartAt = '2019-10-12';

jest.mock('../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

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

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
  });
});

describe('TaskRow', () => {
  beforeEach(() => {
    getContactUrl.mockClear();
  });
  it('should render not complete', async () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
      },
    });

    const { findByText } = render(
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <TaskRow
            accountListId={accountListId}
            task={task}
            onTaskCheckToggle={onTaskCheckSelected}
            getContactUrl={getContactUrl}
            isChecked={false}
          />
        </ThemeProvider>
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
        <ThemeProvider theme={theme}>
          <TaskRow
            accountListId={accountListId}
            task={task}
            onTaskCheckToggle={onTaskCheckSelected}
            getContactUrl={getContactUrl}
            isChecked={false}
          />
        </ThemeProvider>
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
        <ThemeProvider theme={theme}>
          <TaskRow
            accountListId={accountListId}
            task={task}
            onTaskCheckToggle={onTaskCheckSelected}
            getContactUrl={getContactUrl}
            isChecked={false}
          />
        </ThemeProvider>
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
        <ThemeProvider theme={theme}>
          <TaskRow
            accountListId={accountListId}
            task={task}
            onTaskCheckToggle={onTaskCheckSelected}
            getContactUrl={getContactUrl}
            isChecked={false}
          />
        </ThemeProvider>
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
          <ThemeProvider theme={theme}>
            <TaskRow
              accountListId={accountListId}
              task={task}
              onTaskCheckToggle={onTaskCheckSelected}
              getContactUrl={getContactUrl}
              isChecked={false}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );
      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByRole('checkbox', { hidden: true }));
      expect(onTaskCheckSelected).toHaveBeenCalledWith(task.id);
    });
    it('handles task row click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { findByText, getByTestId } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <TaskRow
              accountListId={accountListId}
              task={task}
              onTaskCheckToggle={onTaskCheckSelected}
              getContactUrl={getContactUrl}
              isChecked={false}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );
      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByTestId('task-row'));
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
          <ThemeProvider theme={theme}>
            <TaskRow
              accountListId={accountListId}
              task={task}
              onTaskCheckToggle={onTaskCheckSelected}
              getContactUrl={getContactUrl}
              isChecked={false}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByRole('img', { hidden: true, name: 'Check Icon' }));
      expect(openTaskModal).toHaveBeenCalledWith({
        taskId: task.id,
        view: 'complete',
      });
    });

    it('should render <a> tag and have correct attributes', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { findByText, getByRole } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <TaskRow
              accountListId={accountListId}
              task={task}
              onTaskCheckToggle={onTaskCheckSelected}
              getContactUrl={getContactUrl}
              isChecked={false}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(await findByText(task.subject)).toBeVisible();

      expect(getContactUrl).toHaveBeenCalledWith(task.contacts.nodes[0].id);

      const contactLink = getByRole('link', {
        name: task.contacts.nodes[0].name,
      });

      expect(contactLink).toHaveAttribute(
        'href',
        `/pathname/tasks/123456?filter=filterOptions`,
      );
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
          <ThemeProvider theme={theme}>
            <TaskRow
              accountListId={accountListId}
              task={task}
              onTaskCheckToggle={onTaskCheckSelected}
              getContactUrl={getContactUrl}
              isChecked={false}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByRole('img', { hidden: true, name: 'Comment Icon' }));
      expect(openTaskModal).toHaveBeenCalledWith({
        taskId: task.id,
        view: 'comments',
      });
    });

    it('handle subject click', async () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          startAt,
          result: ResultEnum.None,
        },
      });

      const { findByText, getByTestId } = render(
        <GqlMockedProvider>
          <ThemeProvider theme={theme}>
            <TaskRow
              accountListId={accountListId}
              task={task}
              onTaskCheckToggle={onTaskCheckSelected}
              getContactUrl={getContactUrl}
              isChecked={false}
            />
          </ThemeProvider>
        </GqlMockedProvider>,
      );

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByTestId('subject-wrap'));
      expect(openTaskModal).toHaveBeenCalledWith({
        taskId: task.id,
        view: 'edit',
      });
    });
  });

  it('handles renders multiple names separated by comma', async () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
        contacts: {
          nodes: [
            {
              id: 'contact1',
              name: 'Contact 1',
            },
            {
              id: 'contact2',
              name: 'Contact 2',
            },
          ],
        },
      },
    });

    const { findByText } = render(
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <TaskRow
            accountListId={accountListId}
            task={task}
            onTaskCheckToggle={onTaskCheckSelected}
            getContactUrl={getContactUrl}
            isChecked={false}
          />
        </ThemeProvider>
      </GqlMockedProvider>,
    );

    expect(await findByText(task.subject)).toBeVisible();
    expect(await findByText('Contact 1,')).toBeVisible();
    expect(await findByText('Contact 2')).toBeVisible();
  });
});
