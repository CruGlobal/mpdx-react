import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import React from 'react';
import {
  ActivityTypeEnum,
  ResultEnum,
} from '../../../../../../graphql/types.generated';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../theme';
import { ContactTaskRow } from './ContactTaskRow';
import {
  ContactTaskRowFragment,
  ContactTaskRowFragmentDoc,
} from './ContactTaskRow.generated';

const accountListId = 'abc';
const startAt = '2021-04-12';

describe('ContactTaskRow', () => {
  it('should render loading', () => {
    const { getByTestId } = render(
      <MuiThemeProvider theme={theme}>
        <ContactTaskRow accountListId={accountListId} task={undefined} />
      </MuiThemeProvider>,
    );

    expect(getByTestId('loadingRow')).toBeVisible();
  });

  it('should render not complete', async () => {
    const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
      },
    });

    const { findByText, queryByTestId } = render(
      <MuiThemeProvider theme={theme}>
        <ContactTaskRow accountListId={accountListId} task={task} />
      </MuiThemeProvider>,
    );

    expect(await findByText(task.subject)).toBeVisible();

    expect(await findByText(task.contacts.nodes[0].name)).toBeVisible();

    expect(queryByTestId('loadingRow')).toBeNull();
  });

  describe('activity type', () => {
    it('displays Appointment', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Appointment,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Appointment')).toBeVisible();
    });

    it('displays Call', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Call,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Call')).toBeVisible();
    });

    it('displays Email', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Email,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Email')).toBeVisible();
    });

    it('displays Facebook Message', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.FacebookMessage,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Facebook Message')).toBeVisible();
    });

    it('displays Letter', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Letter,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Letter')).toBeVisible();
    });

    it('displays Newslatter - Email', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.NewsletterEmail,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Newsletter - Email')).toBeVisible();
    });

    it('displays Newsletter - Physical', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.NewsletterPhysical,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Newsletter - Physical')).toBeVisible();
    });

    it('displays Prayer Request', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PrayerRequest,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Prayer Request')).toBeVisible();
    });

    it('displays Pre-Call Letter', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PreCallLetter,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Pre-Call Letter')).toBeVisible();
    });

    it('displays Reminder Letter', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.ReminderLetter,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Reminder Letter')).toBeVisible();
    });

    it('displays Support Letter', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.SupportLetter,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Support Letter')).toBeVisible();
    });

    it('displays Talk To In Person', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.TalkToInPerson,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Talk To In Person')).toBeVisible();
    });

    it('displays Text Message', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.TextMessage,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Text Message')).toBeVisible();
    });

    it('displays Thank', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Thank,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('Thank')).toBeVisible();
    });

    it('displays To Do', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.ToDo,
        },
      });

      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow accountListId={accountListId} task={task} />
        </MuiThemeProvider>,
      );

      expect(getByText('To Do')).toBeVisible();
    });
  });
});
