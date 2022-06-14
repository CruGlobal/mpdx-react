import React from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import {
  render,
  fireEvent,
} from '../../../../../__tests__/util/testingLibraryReactMock';
import { GetThisWeekQuery } from '../GetThisWeek.generated';
import { ActivityTypeEnum } from '../../../../../graphql/types.generated';
import theme from '../../../../theme';
import useTaskModal from '../../../../hooks/useTaskModal';
import PartnerCare from './PartnerCare';

jest.mock('../../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
  });
});
const prayerRequestTasks: GetThisWeekQuery['prayerRequestTasks'] = {
  nodes: [
    {
      id: 'task_1',
      subject: 'the quick brown fox jumps over the lazy dog',
      activityType: ActivityTypeEnum.PrayerRequest,
      contacts: {
        nodes: [
          { hidden: true, name: 'Roger Smith' },
          { hidden: true, name: 'Sarah Smith' },
        ],
      },
      startAt: null,
      completedAt: null,
    },
    {
      id: 'task_2',
      subject: 'on the boat to see uncle johnny',
      activityType: ActivityTypeEnum.PrayerRequest,
      contacts: {
        nodes: [
          { hidden: true, name: 'Roger Parker' },
          { hidden: true, name: 'Sarah Parker' },
        ],
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
    name: 'John and Sarah, Doe',
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
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PartnerCare
          accountListId="abc"
          prayerRequestTasks={prayerRequestTasks}
          reportsPeopleWithBirthdays={reportsPeopleWithBirthdays}
          reportsPeopleWithAnniversaries={reportsPeopleWithAnniversaries}
        />
      </ThemeProvider>,
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
    expect(openTaskModal).toHaveBeenCalledWith({
      taskId: 'task_1',
      view: 'edit',
    });
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
    expect(getByTestId('CelebrationItem-0').textContent).toEqual(
      'John DoeJan 1',
    );
    expect(getByTestId('CelebrationItem-1').textContent).toEqual(
      'John DoeJan 1',
    );
    expect(getByTestId('CelebrationItem-2').textContent).toEqual(
      'John and Sarah, DoeOct 5',
    );
    expect(queryByTestId('CelebrationItem-3')).toBeInTheDocument();
  });

  it('Opens complete task form for prayer request', () => {
    const { getByTestId, queryByTestId, queryAllByRole } = render(
      <ThemeProvider theme={theme}>
        <PartnerCare
          accountListId="abc"
          prayerRequestTasks={prayerRequestTasks}
        />
      </ThemeProvider>,
    );
    expect(
      queryByTestId('PartnerCarePrayerCardContentEmpty'),
    ).not.toBeInTheDocument();
    expect(getByTestId('PartnerCarePrayerList')).toBeInTheDocument();
    expect(getByTestId('PartnerCareTabPrayer').textContent).toEqual(
      'Prayer (2,560)',
    );
    userEvent.click(
      queryAllByRole('button', { hidden: true, name: 'Complete Button' })[0],
    );
    expect(openTaskModal).toHaveBeenCalledWith({
      taskId: 'task_1',
      showCompleteForm: true,
      view: 'complete',
    });
  });

  it('Opens task modal to create a new task for celebration | Birthday', () => {
    const { getByTestId, queryAllByRole } = render(
      <ThemeProvider theme={theme}>
        <PartnerCare
          accountListId="abc"
          reportsPeopleWithBirthdays={reportsPeopleWithBirthdays}
          reportsPeopleWithAnniversaries={reportsPeopleWithAnniversaries}
        />
      </ThemeProvider>,
    );

    const CelebrationsTab = getByTestId('PartnerCareTabCelebrations');
    expect(CelebrationsTab.textContent).toEqual('Celebrations (4)');
    fireEvent.click(CelebrationsTab);
    expect(getByTestId('CelebrationItem-0').textContent).toEqual(
      'John DoeJan 1',
    );
    expect(getByTestId('CelebrationItem-1').textContent).toEqual(
      'John DoeJan 1',
    );
    userEvent.click(
      queryAllByRole('button', { hidden: true, name: 'Complete Button' })[0],
    );
    expect(openTaskModal).toHaveBeenCalledWith({
      defaultValues: {
        contactIds: ['contact'],
        subject: "John Doe's Birthday",
      },
    });
  });

  it('Opens task modal to create a new task for celebration | Anniversary', () => {
    const { getByTestId, queryAllByRole, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PartnerCare
          accountListId="abc"
          reportsPeopleWithBirthdays={reportsPeopleWithBirthdays}
          reportsPeopleWithAnniversaries={reportsPeopleWithAnniversaries}
        />
      </ThemeProvider>,
    );

    const CelebrationsTab = getByTestId('PartnerCareTabCelebrations');
    expect(CelebrationsTab.textContent).toEqual('Celebrations (4)');
    fireEvent.click(CelebrationsTab);
    expect(getByTestId('CelebrationItem-2').textContent).toEqual(
      'John and Sarah, DoeOct 5',
    );
    expect(queryByTestId('CelebrationItem-3')).toBeInTheDocument();
    userEvent.click(
      queryAllByRole('button', { hidden: true, name: 'Complete Button' })[2],
    );
    expect(openTaskModal).toHaveBeenCalledWith({
      defaultValues: {
        contactIds: ['contact'],
        subject: "John and Sarah, Doe's Anniversary",
      },
    });
  });
});
