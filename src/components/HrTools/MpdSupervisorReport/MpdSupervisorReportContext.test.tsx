import React from 'react';
import { act, render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import {
  MpdSupervisorReportEmploymentTypeEnum,
  MpdSupervisorReportQuickFilterEnum,
  MpdSupervisorReportTeamsEnum,
} from './Filters/mpdSupervisorReportFilters';
import {
  MpdSupervisorReportProvider,
  Panel,
  useMpdSupervisorReport,
} from './MpdSupervisorReportContext';
import { EmployeeData, QuarterHealthEnum } from './mockData';

const sampleMember: EmployeeData = {
  user: {
    id: '1',
    preferredName: 'John',
    lastName: 'Smith',
    personNumber: '10000001',
    staffAccountID: '1000000001',
    userPersonType: 'Full time',
    team: 'Campus',
  },
  quarters: [
    { label: 'FQ4 25', health: QuarterHealthEnum.Green, payroll: 15000 },
    { label: 'FQ1 26', health: QuarterHealthEnum.Green, payroll: 15000 },
    { label: 'FQ2 26', health: QuarterHealthEnum.Green, payroll: 15000 },
    { label: 'FQ3 26', health: QuarterHealthEnum.Green, payroll: 15000 },
  ],
};

interface ConsumerResult {
  isOpen: boolean;
  selectedMember: EmployeeData | undefined;
  openMember: (member: EmployeeData) => void;
  closePanel: () => void;
  search: string;
  setSearch: (v: string) => void;
  team: MpdSupervisorReportTeamsEnum;
  setTeam: (v: MpdSupervisorReportTeamsEnum) => void;
  employmentType: MpdSupervisorReportEmploymentTypeEnum;
  setEmploymentType: (v: MpdSupervisorReportEmploymentTypeEnum) => void;
  activeQuickFilter: MpdSupervisorReportQuickFilterEnum;
  setActiveQuickFilter: (v: MpdSupervisorReportQuickFilterEnum) => void;
}

let consumerResult: ConsumerResult;

const Consumer: React.FC = () => {
  const ctx = useMpdSupervisorReport();
  consumerResult = ctx;
  return (
    <div>
      <span data-testid="isOpen">{String(ctx.isOpen)}</span>
      <span data-testid="memberName">
        {ctx.selectedMember?.user.lastName ?? 'none'}
      </span>
      <span data-testid="search">{ctx.search}</span>
      <span data-testid="team">{ctx.team}</span>
      <span data-testid="employmentType">{ctx.employmentType}</span>
      <span data-testid="activeQuickFilter">{ctx.activeQuickFilter}</span>
    </div>
  );
};

const renderConsumer = () =>
  render(
    <TestRouter>
      <MpdSupervisorReportProvider>
        <Consumer />
      </MpdSupervisorReportProvider>
    </TestRouter>,
  );

describe('MpdSupervisorReportContext', () => {
  it('starts with isOpen false and no selected member', () => {
    const { getByTestId } = renderConsumer();
    expect(getByTestId('isOpen').textContent).toBe('false');
    expect(getByTestId('memberName').textContent).toBe('none');
  });

  it('openMember sets the selected member and isOpen to true', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.openMember(sampleMember);
    });
    expect(getByTestId('isOpen').textContent).toBe('true');
    expect(getByTestId('memberName').textContent).toBe('Smith');
  });

  it('closePanel clears the selected member and sets isOpen to false', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.openMember(sampleMember);
    });
    expect(getByTestId('isOpen').textContent).toBe('true');
    act(() => {
      consumerResult.closePanel();
    });
    expect(getByTestId('isOpen').textContent).toBe('false');
    expect(getByTestId('memberName').textContent).toBe('none');
  });

  it('throws an error when used outside the provider', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    expect(() => render(<Consumer />)).toThrow(
      'useMpdSupervisorReport must be used within a MpdSupervisorReportProvider',
    );
    consoleError.mockRestore();
  });

  // New filter state tests
  it('starts with empty search', () => {
    const { getByTestId } = renderConsumer();
    expect(getByTestId('search').textContent).toBe('');
  });

  it('starts with team=all', () => {
    const { getByTestId } = renderConsumer();
    expect(getByTestId('team').textContent).toBe(
      MpdSupervisorReportTeamsEnum.All,
    );
  });

  it('starts with employmentType=all', () => {
    const { getByTestId } = renderConsumer();
    expect(getByTestId('employmentType').textContent).toBe(
      MpdSupervisorReportEmploymentTypeEnum.All,
    );
  });

  it('starts with activeQuickFilter=allPeople', () => {
    const { getByTestId } = renderConsumer();
    expect(getByTestId('activeQuickFilter').textContent).toBe(
      MpdSupervisorReportQuickFilterEnum.AllPeople,
    );
  });

  it('setSearch updates the search value', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.setSearch('John');
    });
    expect(getByTestId('search').textContent).toBe('John');
  });

  it('setTeam updates the team value', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.setTeam(MpdSupervisorReportTeamsEnum.TeamA);
    });
    expect(getByTestId('team').textContent).toBe(
      MpdSupervisorReportTeamsEnum.TeamA,
    );
  });

  it('setEmploymentType updates the employmentType value', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.setEmploymentType(
        MpdSupervisorReportEmploymentTypeEnum.FullTime,
      );
    });
    expect(getByTestId('employmentType').textContent).toBe(
      MpdSupervisorReportEmploymentTypeEnum.FullTime,
    );
  });

  it('setActiveQuickFilter updates the activeQuickFilter value', () => {
    const { getByTestId } = renderConsumer();
    act(() => {
      consumerResult.setActiveQuickFilter(
        MpdSupervisorReportQuickFilterEnum.TrendingDown,
      );
    });
    expect(getByTestId('activeQuickFilter').textContent).toBe(
      MpdSupervisorReportQuickFilterEnum.TrendingDown,
    );
  });
});

describe('Panel enum', () => {
  it('has correct Navigation and Filters values', () => {
    expect(Panel.Navigation).toBe('Navigation');
    expect(Panel.Filters).toBe('Filters');
  });
});
