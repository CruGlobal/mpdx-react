import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  ActivityTypeEnum,
  ResultEnum,
} from '../../../../../../graphql/types.generated';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../../../__tests__/util/graphqlMocking';
import useTaskModal from '../../../../../hooks/useTaskModal';
import theme from '../../../../../theme';
import {
  TaskRowFragment,
  TaskRowFragmentDoc,
} from '../../../../Task/TaskRow/TaskRow.generated';
import { ContactTaskRow } from './ContactTaskRow';

const accountListId = 'abc';
const startAt = '2021-04-12';

jest.mock('../../../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
  });
});

describe('ContactTaskRow', () => {
  it('should render loading', () => {
    const { getByTestId } = render(
      <GqlMockedProvider>
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={undefined} />
        </MuiThemeProvider>
      </GqlMockedProvider>,
    );

    expect(getByTestId('loadingRow')).toBeVisible();
  });

  it('should render not complete', async () => {
    const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
      },
    });

    const { findByText, queryByTestId } = render(
      <GqlMockedProvider>
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>
      </GqlMockedProvider>,
    );

    expect(await findByText(task.subject)).toBeVisible();

    expect(await findByText(task.contacts.nodes[0].name)).toBeVisible();

    expect(queryByTestId('loadingRow')).toBeNull();
  });

  describe('task interactions', () => {
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
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByRole('img', { hidden: true, name: 'Check Icon' }));
      expect(openTaskModal).toHaveBeenCalledWith({
        view: 'complete',
        taskId: task.id,
        showCompleteForm: true,
      });
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
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(await findByText(task.subject)).toBeVisible();
      userEvent.click(getByRole('img', { hidden: true, name: 'Comment Icon' }));
      expect(openTaskModal).toHaveBeenCalledWith({
        taskId: task.id,
        view: 'comments',
      });
    });
  });

  describe('activity type', () => {
    it('displays Appointment', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Appointment,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Appointment')).toBeVisible();
    });

    it('displays Call', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Call,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Call')).toBeVisible();
    });

    it('displays Email', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Email,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Email')).toBeVisible();
    });

    it('displays Facebook Message', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.FacebookMessage,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Facebook Message')).toBeVisible();
    });

    it('displays Letter', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Letter,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Letter')).toBeVisible();
    });

    it('displays Newslatter - Email', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.NewsletterEmail,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Newsletter - Email')).toBeVisible();
    });

    it('displays Newsletter - Physical', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.NewsletterPhysical,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Newsletter - Physical')).toBeVisible();
    });

    it('displays Prayer Request', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PrayerRequest,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Prayer Request')).toBeVisible();
    });

    it('displays Pre-Call Letter', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PreCallLetter,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Pre-Call Letter')).toBeVisible();
    });

    it('displays Reminder Letter', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.ReminderLetter,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Reminder Letter')).toBeVisible();
    });

    it('displays Support Letter', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.SupportLetter,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Support Letter')).toBeVisible();
    });

    it('displays Talk To In Person', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.TalkToInPerson,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Talk To In Person')).toBeVisible();
    });

    it('displays Text Message', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.TextMessage,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Text Message')).toBeVisible();
    });

    it('displays Thank', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Thank,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('Thank')).toBeVisible();
    });

    it('displays To Do', () => {
      const task = gqlMock<TaskRowFragment>(TaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.ToDo,
        },
      });

      const { getByText } = render(
        <GqlMockedProvider>
          <MuiThemeProvider theme={theme}>
            <ContactTaskRow accountListId={accountListId} task={task} />
          </MuiThemeProvider>
        </GqlMockedProvider>,
      );

      expect(getByText('To Do')).toBeVisible();
    });
  });
});
