import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { ActivityTypeEnum, ResultEnum } from 'src/graphql/types.generated';

type ComponentsProps = {
  mocks?: ApolloErgonoMockMap;
  taskOverrides?: object;
  props?: object;
};

type Components = ({
  mocks,
  taskOverrides,
  props,
}: ComponentsProps) => JSX.Element;

// eslint-disable-next-line jest/no-export
export const taskModalTests = (Components: Components) => {
  describe('Task Modal Results +Next Action', () => {
    const getOptions = async (
      activityType?: ActivityTypeEnum | null,
      resultToSelected?: string,
    ): Promise<{ results: ResultEnum[]; nextActions: ActivityTypeEnum[] }> => {
      const { getByRole, queryByRole } = render(
        <Components
          taskOverrides={{
            activityType,
          }}
        />,
      );
      let results: ResultEnum[] = [];
      const resultCombobox =
        activityType && activityType !== 'NONE'
          ? await waitFor(() => getByRole('combobox', { name: 'Result' }))
          : null;

      if (resultCombobox && resultToSelected) {
        userEvent.click(resultCombobox);

        await waitFor(() => {
          expect(
            getByRole('option', { name: resultToSelected }),
          ).toBeInTheDocument();
        });

        results = within(getByRole('listbox', { name: 'Result' }))
          .getAllByRole('option')
          .map((option) => option.textContent)
          .filter(Boolean) as ResultEnum[];
        userEvent.click(getByRole('option', { name: resultToSelected }));
      }
      let nextActions: ActivityTypeEnum[] = [];
      const nextActionCombobox = queryByRole('combobox', {
        name: 'Next Action',
      });
      if (nextActionCombobox) {
        userEvent.click(nextActionCombobox);
        nextActions = within(getByRole('listbox'))
          .getAllByRole('option')
          .map((option) => option[Object.keys(option)[0]]?.key)
          .filter(Boolean) as ActivityTypeEnum[];
      }
      return { results, nextActions };
    };

    it('has correct options for AppointmentInPerson', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.AppointmentInPerson,
        'Cancelled-Need to reschedule',
      );
      expect(results).toEqual([
        'Cancelled-Need to reschedule',
        'Follow up',
        'Partner-Financial',
        'Partner-Special',
        'Partner-Pray',
        'Not Interested',
      ]);
      expect(nextActions).toEqual([
        'None',
        'Phone Call',
        'Email',
        'Text Message',
        'Social Media',
        'Letter',
        'Special Gift Appeal',
        'In Person',
      ]);
    });

    it('has correct options for AppointmentVideoCall', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.AppointmentVideoCall,
        'Follow up',
      );
      expect(results).toEqual([
        'Cancelled-Need to reschedule',
        'Follow up',
        'Partner-Financial',
        'Partner-Special',
        'Partner-Pray',
        'Not Interested',
      ]);
      expect(nextActions).toEqual([
        'None',
        'Phone Call',
        'Email',
        'Text Message',
        'Social Media',
        'In Person',
      ]);
    });

    it('has correct options for InitiationPhoneCall', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.InitiationPhoneCall,
        'Appointment Scheduled',
      );
      expect(results).toEqual([
        'No Response Yet',
        "Can't meet right now - circle back",
        'Appointment Scheduled',
        'Not Interested',
      ]);
      expect(nextActions).toEqual([
        'None',
        'In Person',
        'Phone Call',
        'Video Call',
      ]);
    });

    it('as correct options for InitiationEmail', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.InitiationEmail,
        "Can't meet right now - circle back",
      );
      expect(results).toEqual([
        'No Response Yet',
        "Can't meet right now - circle back",
        'Appointment Scheduled',
        'Not Interested',
      ]);
      expect(nextActions).toEqual([
        'None',
        'Phone Call',
        'Email',
        'Text Message',
        'Social Media',
        'Letter',
        'Special Gift Appeal',
        'In Person',
      ]);
    });

    it('as correct options for InitiationLetter', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.InitiationLetter,
        'No Response Yet',
      );
      expect(results).toEqual([
        'No Response Yet',
        "Can't meet right now - circle back",
        'Appointment Scheduled',
        'Not Interested',
      ]);
      expect(nextActions).toEqual([
        'None',
        'Phone Call',
        'Email',
        'Text Message',
        'Social Media',
        'Letter',
        'Special Gift Appeal',
        'In Person',
      ]);
    });

    it('as correct options for InitiationTextMessage', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.InitiationTextMessage,
        'No Response Yet',
      );
      expect(results).toEqual([
        'No Response Yet',
        "Can't meet right now - circle back",
        'Appointment Scheduled',
        'Not Interested',
      ]);
      expect(nextActions).toEqual([
        'None',
        'Phone Call',
        'Email',
        'Text Message',
        'Social Media',
        'Letter',
        'Special Gift Appeal',
        'In Person',
      ]);
    });

    it('as correct options for InitiationInPerson', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.InitiationInPerson,
        'Appointment Scheduled',
      );
      expect(results).toEqual([
        'No Response Yet',
        "Can't meet right now - circle back",
        'Appointment Scheduled',
        'Not Interested',
      ]);
      expect(nextActions).toEqual([
        'None',
        'In Person',
        'Phone Call',
        'Video Call',
      ]);
    });

    it('as correct options for FollowUpSocialMedia', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.FollowUpSocialMedia,
        'Partner-Pray',
      );
      expect(results).toEqual([
        'No Response Yet',
        'Partner-Financial',
        'Partner-Special',
        'Partner-Pray',
        'Not Interested',
      ]);
      expect(nextActions).toEqual(['None', 'Thank You Note']);
    });

    it('as correct options for FollowUpTextMessage', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.FollowUpTextMessage,
        'Partner-Financial',
      );
      expect(results).toEqual([
        'No Response Yet',
        'Partner-Financial',
        'Partner-Special',
        'Partner-Pray',
        'Not Interested',
      ]);
      expect(nextActions).toEqual(['None', 'Thank You Note']);
    });

    it('as correct options for NULL', async () => {
      const { results, nextActions } = await getOptions(null);
      expect(results).toEqual([]);
      expect(nextActions).toEqual([]);
    });

    it('as correct options for PartnerCareEmail', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.PartnerCareEmail,
      );
      expect(results).toEqual([]);
      expect(nextActions).toEqual([]);
    });

    it('as correct options for PartnerCarePhysicalNewsletter', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.PartnerCarePhysicalNewsletter,
      );
      expect(results).toEqual([]);
      expect(nextActions).toEqual([]);
    });

    it('has correct options for NONE', async () => {
      const { results, nextActions } = await getOptions(ActivityTypeEnum.None);
      expect(results).toEqual([]);
      expect(nextActions).toEqual([]);
    });

    it('has correct options for PartnerCarePrayerRequest', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.PartnerCarePrayerRequest,
      );
      expect(results).toEqual([]);
      expect(nextActions).toEqual([]);
    });

    it('has correct options for PartnerCarePhoneCall', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.PartnerCarePhoneCall,
      );
      expect(results).toEqual([]);
      expect(nextActions).toEqual([]);
    });

    it('has correct options for InitiationLetter', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.InitiationLetter,
      );
      expect(results).toEqual([]);
      expect(nextActions).toEqual([]);
    });

    it('has correct options for PartnerCareThank', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.PartnerCareThank,
      );
      expect(results).toEqual([]);
      expect(nextActions).toEqual([]);
    });

    it('has correct options for PartnerCareToDo', async () => {
      const { results, nextActions } = await getOptions(
        ActivityTypeEnum.PartnerCareToDo,
      );
      expect(results).toEqual([]);
      expect(nextActions).toEqual([]);
    });
  });
};
