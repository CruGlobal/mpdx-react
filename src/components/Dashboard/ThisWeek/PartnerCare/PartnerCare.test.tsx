import React from 'react';
import userEvent from '@testing-library/user-event';
import {
  render,
  fireEvent,
} from '../../../../../__tests__/util/testingLibraryReactMock';
import { ActivityTypeEnum } from '../../../../../types/globalTypes';
import { GetThisWeekQuery_prayerRequestTasks } from '../../../../../types/GetThisWeekQuery';
import { useApp } from '../../../App';
import PartnerCare from '.';

jest.mock('../../../App', () => ({
  useApp: jest.fn(),
}));

const openTaskDrawer = jest.fn();

beforeEach(() => {
  (useApp as jest.Mock).mockReturnValue({
    openTaskDrawer,
  });
});

describe('PartnerCare', () => {
  it('default', () => {
    const { getByTestId, queryByTestId } = render(
      <PartnerCare accountListId="abc" />,
    );
    expect(
      getByTestId('PartnerCarePrayerCardContentEmpty'),
    ).toBeInTheDocument();
    expect(
      queryByTestId('PartnerCareCelebrationCardContentEmpty'),
    ).not.toBeInTheDocument();
    expect(getByTestId('PartnerCareTabPrayer').textContent).toEqual(
      'Prayer (0)',
    );
    const CelebrationsTab = getByTestId('PartnerCareTabCelebrations');
    expect(CelebrationsTab.textContent).toEqual('Celebrations (0)');
    fireEvent.click(CelebrationsTab);
    expect(
      getByTestId('PartnerCareCelebrationCardContentEmpty'),
    ).toBeInTheDocument();
    expect(
      queryByTestId('PartnerCarePrayerCardContentEmpty'),
    ).not.toBeInTheDocument();
  });

  it('loading', () => {
    const { getByTestId, queryByTestId } = render(
      <PartnerCare accountListId="abc" loading />,
    );
    expect(getByTestId('PartnerCarePrayerListLoading')).toBeInTheDocument();
    expect(
      queryByTestId('PartnerCareCelebrationListLoading'),
    ).not.toBeInTheDocument();
    fireEvent.click(getByTestId('PartnerCareTabCelebrations'));
    expect(
      getByTestId('PartnerCareCelebrationListLoading'),
    ).toBeInTheDocument();
    expect(
      queryByTestId('PartnerCarePrayerListLoading'),
    ).not.toBeInTheDocument();
  });

  it('empty', () => {
    const prayerRequestTasks = {
      nodes: [],
      totalCount: 0,
    };
    const reportsPeopleWithBirthdays = {
      periods: [{ people: [] }],
      totalCount: 0,
    };
    const reportsPeopleWithAnniversaries = {
      periods: [{ people: [] }],
      totalCount: 0,
    };
    const { getByTestId, queryByTestId } = render(
      <PartnerCare
        accountListId="abc"
        prayerRequestTasks={prayerRequestTasks}
        reportsPeopleWithBirthdays={reportsPeopleWithBirthdays}
        reportsPeopleWithAnniversaries={reportsPeopleWithAnniversaries}
      />,
    );
    expect(
      getByTestId('PartnerCarePrayerCardContentEmpty'),
    ).toBeInTheDocument();
    expect(
      queryByTestId('PartnerCareCelebrationCardContentEmpty'),
    ).not.toBeInTheDocument();
    expect(getByTestId('PartnerCareTabPrayer').textContent).toEqual(
      'Prayer (0)',
    );
    const CelebrationsTab = getByTestId('PartnerCareTabCelebrations');
    expect(CelebrationsTab.textContent).toEqual('Celebrations (0)');
    fireEvent.click(CelebrationsTab);
    expect(
      getByTestId('PartnerCareCelebrationCardContentEmpty'),
    ).toBeInTheDocument();
    expect(
      queryByTestId('PartnerCarePrayerCardContentEmpty'),
    ).not.toBeInTheDocument();
  });

  it('props', () => {
    const prayerRequestTasks: GetThisWeekQuery_prayerRequestTasks = {
      nodes: [
        {
          id: 'task_1',
          subject: 'the quick brown fox jumps over the lazy dog',
          activityType: ActivityTypeEnum.PRAYER_REQUEST,
          contacts: {
            nodes: [{ name: 'Roger Smith' }, { name: 'Sarah Smith' }],
          },
          startAt: null,
          completedAt: null,
        },
        {
          id: 'task_2',
          subject: 'on the boat to see uncle johnny',
          activityType: ActivityTypeEnum.PRAYER_REQUEST,
          contacts: {
            nodes: [{ name: 'Roger Parker' }, { name: 'Sarah Parker' }],
          },
          startAt: null,
          completedAt: null,
        },
      ],
      totalCount: 2560,
    };
    const personWithBirthday = {
      birthdayDay: 1,
      birthdayMonth: 1,
      firstName: 'John',
      lastName: 'Doe',
      parentContact: {
        id: 'contact',
      },
    };
    const personWithAnniversary = {
      anniversaryDay: 5,
      anniversaryMonth: 10,
      parentContact: {
        id: 'contact',
        name: 'John and Sarah, Doe',
      },
    };
    const reportsPeopleWithBirthdays = {
      periods: [
        {
          people: [
            { ...personWithBirthday, id: 'person_1' },
            { ...personWithBirthday, id: 'person_2' },
          ],
        },
      ],
    };
    const reportsPeopleWithAnniversaries = {
      periods: [
        {
          people: [
            { ...personWithAnniversary, id: 'person_3' },
            { ...personWithAnniversary, id: 'person_4' },
          ],
        },
      ],
    };
    const { getByTestId, queryByTestId } = render(
      <PartnerCare
        accountListId="abc"
        prayerRequestTasks={prayerRequestTasks}
        reportsPeopleWithBirthdays={reportsPeopleWithBirthdays}
        reportsPeopleWithAnniversaries={reportsPeopleWithAnniversaries}
      />,
    );
    expect(
      queryByTestId('PartnerCarePrayerCardContentEmpty'),
    ).not.toBeInTheDocument();
    expect(getByTestId('PartnerCarePrayerList')).toBeInTheDocument();
    expect(getByTestId('PartnerCareTabPrayer').textContent).toEqual(
      'Prayer (2,560)',
    );
    const task1Element = getByTestId('PartnerCarePrayerListItem-task_1');
    expect(task1Element.textContent).toEqual(
      'Roger Smith, Sarah Smiththe quick brown fox jumps over the lazy dog',
    );
    userEvent.click(task1Element);
    expect(openTaskDrawer).toHaveBeenCalledWith({ taskId: 'task_1' });
    expect(getByTestId('PartnerCarePrayerListItem-task_2').textContent).toEqual(
      'Roger Parker, Sarah Parkeron the boat to see uncle johnny',
    );
    const CelebrationsTab = getByTestId('PartnerCareTabCelebrations');
    expect(CelebrationsTab.textContent).toEqual('Celebrations (4)');
    fireEvent.click(CelebrationsTab);
    expect(
      queryByTestId('PartnerCareCelebrationCardContentEmpty'),
    ).not.toBeInTheDocument();
    expect(getByTestId('PartnerCareCelebrationList')).toBeInTheDocument();
    expect(
      getByTestId('PartnerCareBirthdayListItem-person_1').textContent,
    ).toEqual('John DoeJan 1');
    expect(
      getByTestId('PartnerCareBirthdayListItem-person_2').textContent,
    ).toEqual('John DoeJan 1');
    expect(
      getByTestId('PartnerCareAnniversaryListItem-person_3').textContent,
    ).toEqual('John and Sarah, DoeOct 5');
    expect(
      queryByTestId('PartnerCareAnniversaryListItem-person_4'),
    ).not.toBeInTheDocument();
  });
});
