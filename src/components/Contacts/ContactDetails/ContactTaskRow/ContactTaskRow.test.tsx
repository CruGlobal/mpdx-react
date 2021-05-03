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

    expect(await findByText(task.subject)).toBeVisible();

    expect(await findByText(task.contacts.nodes[0].name)).toBeVisible();
  });

  describe('activity type', () => {
    it('displays Appointment', async () => {
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

      expect(await findByText('Appointment')).toBeVisible();
    });

    it('displays Call', async () => {
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

      expect(await findByText('Call')).toBeVisible();
    });

    it('displays Email', async () => {
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

      expect(await findByText('Email')).toBeVisible();
    });

    it('displays Facebook Message', async () => {
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

      expect(await findByText('Facebook Message')).toBeVisible();
    });

    it('displays Letter', async () => {
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

      expect(await findByText('Letter')).toBeVisible();
    });

    it('displays Newslatter - Email', async () => {
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

      expect(await findByText('Newsletter - Email')).toBeVisible();
    });

    it('displays Newsletter - Physical', async () => {
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

      expect(await findByText('Newsletter - Physical')).toBeVisible();
    });

    it('displays Prayer Request', async () => {
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

      expect(await findByText('Prayer Request')).toBeVisible();
    });

    it('displays Pre-Call Letter', async () => {
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

      expect(await findByText('Pre-Call Letter')).toBeVisible();
    });

    it('displays Reminder Letter', async () => {
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

      expect(await findByText('Reminder Letter')).toBeVisible();
    });

    it('displays Support Letter', async () => {
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

      expect(await findByText('Support Letter')).toBeVisible();
    });

    it('displays Talk To In Person', async () => {
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

      expect(await findByText('Talk To In Person')).toBeVisible();
    });

    it('displays Text Message', async () => {
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

      expect(await findByText('Text Message')).toBeVisible();
    });

    it('displays Thank', async () => {
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

      expect(await findByText('Thank')).toBeVisible();
    });

    it('displays To Do', async () => {
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

      expect(await findByText('To Do')).toBeVisible();
    });
  });
});
