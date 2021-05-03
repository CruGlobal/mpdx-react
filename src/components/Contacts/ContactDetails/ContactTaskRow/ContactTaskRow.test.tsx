import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import React from 'react';
import {
  ActivityTypeEnum,
  ResultEnum,
} from '../../../../../graphql/types.generated';
import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { ContactTaskRow } from './ContactTaskRow';
import {
  ContactTaskRowFragment,
  ContactTaskRowFragmentDoc,
} from './ContactTaskRow.generated';

const startAt = '2021-04-12';

describe('ContactTaskRow', () => {
  it('should render not complete', async () => {
    const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
      mocks: {
        startAt,
        result: ResultEnum.None,
      },
    });

    const { findByText } = render(
      <MuiThemeProvider theme={theme}>
        <ContactTaskRow task={task} />
      </MuiThemeProvider>,
    );

    expect(findByText(task.subject)).toBeVisible();

    expect(findByText(task.contacts.nodes[0].name)).toBeVisible();
  });

  describe('activity type', () => {
    it('displays Appointment', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Appointment,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Appointment')).toBeVisible();
    });

    it('displays Call', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Call,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Call')).toBeVisible();
    });

    it('displays Email', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Email,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Email')).toBeVisible();
    });

    it('displays Facebook Message', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.FacebookMessage,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Facebook Message')).toBeVisible();
    });

    it('displays Letter', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Letter,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Letter')).toBeVisible();
    });

    it('displays Newslatter - Email', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.NewsletterEmail,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Newsletter - Email')).toBeVisible();
    });

    it('displays Newsletter - Physical', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.NewsletterPhysical,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Newsletter - Physical')).toBeVisible();
    });

    it('displays Prayer Request', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PrayerRequest,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Prayer Request')).toBeVisible();
    });

    it('displays Pre-Call Letter', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PreCallLetter,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Pre-Call Letter')).toBeVisible();
    });

    it('displays Reminder Letter', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.ReminderLetter,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Reminder Letter')).toBeVisible();
    });

    it('displays Support Letter', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.SupportLetter,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Support Letter')).toBeVisible();
    });

    it('displays Talk To In Person', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.TalkToInPerson,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Talk To In Person')).toBeVisible();
    });

    it('displays Text Message', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.TextMessage,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Text Message')).toBeVisible();
    });

    it('displays Thank', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Thank,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('Thank')).toBeVisible();
    });

    it('displays To Do', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.ToDo,
        },
      });

      const { findByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(findByText('To Do')).toBeVisible();
    });
  });
});
