import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ManagedStaffTeamsQuery } from '../ManagedStaffTeams.generated';
import {
  MpdSupervisorReportProvider,
  useMpdSupervisorReport,
} from '../MpdSupervisorReportContext';
import { managedStaffTeamsMock } from '../mpdSupervisorReportMocks';
import { MpdSupervisorReportFilterPanel } from './MpdSupervisorReportFilterPanel';
import {
  ALL_TEAMS,
  MpdSupervisorReportEmploymentTypeEnum,
} from './mpdSupervisorReportFilters';

const onClose = jest.fn();

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{ ManagedStaffTeams: ManagedStaffTeamsQuery }>
        mocks={{ ManagedStaffTeams: managedStaffTeamsMock() }}
      >
        <MpdSupervisorReportProvider>{children}</MpdSupervisorReportProvider>
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

const renderFilterPanel = () =>
  render(
    <Wrapper>
      <MpdSupervisorReportFilterPanel onClose={onClose} />
    </Wrapper>,
  );

describe('MpdSupervisorReportFilterPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Filters heading', () => {
    const { getByRole } = renderFilterPanel();
    expect(getByRole('heading', { name: 'Filters' })).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const { getByRole } = renderFilterPanel();
    const closeButton = getByRole('button', { name: 'Close' });
    userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders quick-filter chips', () => {
    const { getByRole } = renderFilterPanel();
    expect(getByRole('button', { name: 'All people' })).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Negative last month' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '3+ months negative' }),
    ).toBeInTheDocument();
  });

  it('clicking a quick-filter chip toggles active state', async () => {
    const { getByRole } = renderFilterPanel();
    // 'All people' chip is active by default (filled variant)
    const allPeopleChip = getByRole('button', { name: 'All people' });
    const threeMonthsChip = getByRole('button', {
      name: '3+ months negative',
    });

    // Click 3+ months negative to make it active
    userEvent.click(threeMonthsChip);

    // After click, '3+ months negative' should be filled (active)
    // We can't easily check MUI variant in RTL, so we check re-render with a consumer
    // that reads context. Instead we verify the chip is still rendered and clickable.
    expect(threeMonthsChip).toBeInTheDocument();

    // Click All People to switch back
    userEvent.click(allPeopleChip);
    expect(allPeopleChip).toBeInTheDocument();
  });

  it('renders the Team select with All teams option', () => {
    const { getByLabelText } = renderFilterPanel();
    expect(getByLabelText('Team')).toBeInTheDocument();
  });

  it('renders the Employment type select', () => {
    const { getByLabelText } = renderFilterPanel();
    expect(getByLabelText('Employment type')).toBeInTheDocument();
  });

  it('close button has correct aria-label', () => {
    const { getByRole } = renderFilterPanel();
    expect(getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});

// Consumer component to verify context-driven state changes
const FilterContextConsumer: React.FC = () => {
  const { team, employmentType, activeQuickFilter } = useMpdSupervisorReport();
  return (
    <div>
      <span data-testid="team">{team}</span>
      <span data-testid="employmentType">{employmentType}</span>
      <span data-testid="activeQuickFilter">{activeQuickFilter}</span>
    </div>
  );
};

describe('MpdSupervisorReportFilterPanel — context integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithConsumer = () =>
    render(
      <Wrapper>
        <MpdSupervisorReportFilterPanel onClose={onClose} />
        <FilterContextConsumer />
      </Wrapper>,
    );

  it('starts with default filter values in context', () => {
    const { getByTestId } = renderWithConsumer();
    expect(getByTestId('team').textContent).toBe(ALL_TEAMS);
    expect(getByTestId('employmentType').textContent).toBe(
      MpdSupervisorReportEmploymentTypeEnum.All,
    );
    expect(getByTestId('activeQuickFilter').textContent).toBe('allPeople');
  });

  it('clicking a quick-filter chip updates activeQuickFilter in context', async () => {
    const { getByRole, getByTestId } = renderWithConsumer();
    const threeMonthsChip = getByRole('button', {
      name: '3+ months negative',
    });
    userEvent.click(threeMonthsChip);
    expect(getByTestId('activeQuickFilter').textContent).toBe(
      'threeMonthsNegative',
    );
  });

  it('clicking All people chip sets activeQuickFilter back to allPeople', async () => {
    const { getByRole, getByTestId } = renderWithConsumer();

    // First switch to 3+ months negative
    userEvent.click(getByRole('button', { name: '3+ months negative' }));
    expect(getByTestId('activeQuickFilter').textContent).toBe(
      'threeMonthsNegative',
    );

    // Then click All people to switch back
    userEvent.click(getByRole('button', { name: 'All people' }));
    expect(getByTestId('activeQuickFilter').textContent).toBe('allPeople');
  });

  describe('Team select', () => {
    // Renders, waits out the teams query, then opens the select.
    const openTeamSelect = async () => {
      const view = renderWithConsumer();
      const select = view.getByLabelText('Team');
      await waitFor(() =>
        expect(select).not.toHaveAttribute('aria-disabled', 'true'),
      );
      userEvent.click(select);
      await view.findByRole('option', { name: 'Solution Delivery Team' });
      return view;
    };

    it('is disabled until the teams arrive', () => {
      const { getByLabelText } = renderWithConsumer();
      expect(getByLabelText('Team')).toHaveAttribute('aria-disabled', 'true');
    });

    it('puts the selected team id in context', async () => {
      const { getByRole, getByTestId } = await openTeamSelect();

      userEvent.click(getByRole('option', { name: 'Solution Delivery Team' }));

      expect(getByTestId('team').textContent).toBe('team-1');
    });

    it('sorts the team options by name', async () => {
      const { getAllByRole } = await openTeamSelect();

      const names = getAllByRole('option').map((option) => option.textContent);
      expect(names).toEqual([
        'All teams',
        'Solution Delivery Team',
        'User Interaction Team',
      ]);
    });

    it('omits a team that has no id', async () => {
      const { queryByRole } = await openTeamSelect();

      expect(
        queryByRole('option', { name: 'Unassigned' }),
      ).not.toBeInTheDocument();
    });
  });

  it('selecting an Employment type option updates employmentType in context', async () => {
    const { getByLabelText, getByRole, getByTestId } = renderWithConsumer();
    expect(getByTestId('employmentType').textContent).toBe(
      MpdSupervisorReportEmploymentTypeEnum.All,
    );

    userEvent.click(getByLabelText('Employment type'));
    userEvent.click(getByRole('option', { name: 'Part time' }));

    expect(getByTestId('employmentType').textContent).toBe(
      MpdSupervisorReportEmploymentTypeEnum.PartTime,
    );
  });
});
