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

    const { queryByText } = render(
      <MuiThemeProvider theme={theme}>
        <ContactTaskRow task={task} />
      </MuiThemeProvider>,
    );

    expect(queryByText(task.subject)).toBeInTheDocument();

    expect(queryByText(task.contacts.nodes[0].name)).toBeInTheDocument();
  });

  describe('activity type', () => {
    it('displays Appointment', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Appointment,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Appointment')).toBeInTheDocument();
    });

    it('displays Call', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Call,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Call')).toBeInTheDocument();
    });

    it('displays Email', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Email,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Email')).toBeInTheDocument();
    });

    it('displays Facebook Message', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.FacebookMessage,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Facebook Message')).toBeInTheDocument();
    });

    it('displays Letter', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Letter,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Letter')).toBeInTheDocument();
    });

    it('displays Newslatter - Email', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.NewsletterEmail,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Newsletter - Email')).toBeInTheDocument();
    });

    it('displays Newsletter - Physical', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.NewsletterPhysical,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Newsletter - Physical')).toBeInTheDocument();
    });

    it('displays Prayer Request', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PrayerRequest,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Prayer Request')).toBeInTheDocument();
    });

    it('displays Pre-Call Letter', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.PreCallLetter,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Pre-Call Letter')).toBeInTheDocument();
    });

    it('displays Reminder Letter', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.ReminderLetter,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Reminder Letter')).toBeInTheDocument();
    });

    it('displays Support Letter', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.SupportLetter,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Support Letter')).toBeInTheDocument();
    });

    it('displays Talk To In Person', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.TalkToInPerson,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Talk To In Person')).toBeInTheDocument();
    });

    it('displays Text Message', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.TextMessage,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Text Message')).toBeInTheDocument();
    });

    it('displays Thank', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.Thank,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('Thank')).toBeInTheDocument();
    });

    it('displays To Do', () => {
      const task = gqlMock<ContactTaskRowFragment>(ContactTaskRowFragmentDoc, {
        mocks: {
          activityType: ActivityTypeEnum.ToDo,
        },
      });

      const { queryByText } = render(
        <MuiThemeProvider theme={theme}>
          <ContactTaskRow task={task} />
        </MuiThemeProvider>,
      );

      expect(queryByText('To Do')).toBeInTheDocument();
    });
  });
});
