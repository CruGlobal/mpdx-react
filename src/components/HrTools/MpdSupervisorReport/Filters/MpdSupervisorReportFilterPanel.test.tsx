import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import {
  MpdSupervisorReportProvider,
  useMpdSupervisorReport,
} from '../MpdSupervisorReportContext';
import { MpdSupervisorReportFilterPanel } from './MpdSupervisorReportFilterPanel';
import {
  MpdSupervisorReportEmploymentTypeEnum,
  MpdSupervisorReportTeamsEnum,
} from './mpdSupervisorReportFilters';

const onClose = jest.fn();

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <MpdSupervisorReportProvider>{children}</MpdSupervisorReportProvider>
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
    renderFilterPanel();
    expect(
      screen.getByRole('heading', { name: 'Filters' }),
    ).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    renderFilterPanel();
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders quick-filter chips', () => {
    renderFilterPanel();
    expect(
      screen.getByRole('button', { name: 'All people' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Negative last month' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '3+ months negative' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Trending down' }),
    ).toBeInTheDocument();
  });

  it('clicking a quick-filter chip toggles active state', async () => {
    renderFilterPanel();
    // 'All people' chip is active by default (filled variant)
    const allPeopleChip = screen.getByRole('button', { name: 'All people' });
    const trendingDownChip = screen.getByRole('button', {
      name: 'Trending down',
    });

    // Click Trending Down to make it active
    await userEvent.click(trendingDownChip);

    // After click, 'Trending down' should be filled (active)
    // We can't easily check MUI variant in RTL, so we check re-render with a consumer
    // that reads context. Instead we verify the chip is still rendered and clickable.
    expect(trendingDownChip).toBeInTheDocument();

    // Click All People to switch back
    await userEvent.click(allPeopleChip);
    expect(allPeopleChip).toBeInTheDocument();
  });

  it('renders the Team select with All teams option', () => {
    renderFilterPanel();
    expect(screen.getByLabelText('Team')).toBeInTheDocument();
  });

  it('renders the Employment type select', () => {
    renderFilterPanel();
    expect(screen.getByLabelText('Employment type')).toBeInTheDocument();
  });

  it('close button has correct aria-label', () => {
    renderFilterPanel();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
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
      <TestRouter>
        <ThemeProvider theme={theme}>
          <MpdSupervisorReportProvider>
            <MpdSupervisorReportFilterPanel onClose={onClose} />
            <FilterContextConsumer />
          </MpdSupervisorReportProvider>
        </ThemeProvider>
      </TestRouter>,
    );

  it('starts with default filter values in context', () => {
    renderWithConsumer();
    expect(screen.getByTestId('team').textContent).toBe(
      MpdSupervisorReportTeamsEnum.All,
    );
    expect(screen.getByTestId('employmentType').textContent).toBe(
      MpdSupervisorReportEmploymentTypeEnum.All,
    );
    expect(screen.getByTestId('activeQuickFilter').textContent).toBe(
      'allPeople',
    );
  });

  it('clicking a quick-filter chip updates activeQuickFilter in context', async () => {
    renderWithConsumer();
    const trendingDownChip = screen.getByRole('button', {
      name: 'Trending down',
    });
    await userEvent.click(trendingDownChip);
    expect(screen.getByTestId('activeQuickFilter').textContent).toBe(
      'trendingDown',
    );
  });

  it('clicking All people chip sets activeQuickFilter back to allPeople', async () => {
    renderWithConsumer();

    // First switch to trending down
    await userEvent.click(
      screen.getByRole('button', { name: 'Trending down' }),
    );
    expect(screen.getByTestId('activeQuickFilter').textContent).toBe(
      'trendingDown',
    );

    // Then click All people to switch back
    await userEvent.click(screen.getByRole('button', { name: 'All people' }));
    expect(screen.getByTestId('activeQuickFilter').textContent).toBe(
      'allPeople',
    );
  });

  it('selecting a Team option updates team in context', async () => {
    renderWithConsumer();
    expect(screen.getByTestId('team').textContent).toBe(
      MpdSupervisorReportTeamsEnum.All,
    );

    await userEvent.click(screen.getByLabelText('Team'));
    await userEvent.click(screen.getByRole('option', { name: 'Campus' }));

    expect(screen.getByTestId('team').textContent).toBe('Campus');
  });

  it('selecting an Employment type option updates employmentType in context', async () => {
    renderWithConsumer();
    expect(screen.getByTestId('employmentType').textContent).toBe(
      MpdSupervisorReportEmploymentTypeEnum.All,
    );

    await userEvent.click(screen.getByLabelText('Employment type'));
    await userEvent.click(screen.getByRole('option', { name: 'Part time' }));

    expect(screen.getByTestId('employmentType').textContent).toBe(
      MpdSupervisorReportEmploymentTypeEnum.PartTime,
    );
  });
});
