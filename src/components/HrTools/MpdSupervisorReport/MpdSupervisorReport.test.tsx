import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { MpdSupervisorReport } from './MpdSupervisorReport';
import {
  MpdSupervisorReportProvider,
  Panel,
} from './MpdSupervisorReportContext';
import { StaffMemberDrawer } from './StaffMemberDrawer/StaffMemberDrawer';
import { EmployeeData, mockStaffMembers } from './mockData';

// useMockInfiniteStaff is a pagination wrapper around the filtered list.
// In tests we bypass pagination and return the full filtered array directly,
// so all items are visible without needing react-virtuoso to render them.
jest.mock('./useMockInfiniteStaff', () => ({
  useMockInfiniteStaff: (allItems: EmployeeData[]) => ({
    data: {
      nodes: allItems,
      pageInfo: { endCursor: String(allItems.length), hasNextPage: false },
    },
    loading: false,
    fetchMore: jest.fn(),
  }),
}));

// react-virtuoso requires ResizeObserver (unavailable in jsdom). Wrap
// InfiniteList so all items render synchronously without a layout engine.
jest.mock('src/components/InfiniteList/InfiniteList', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ReactLib = jest.requireActual<any>('react');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const InfiniteList = ({
    data,
    itemContent,
    loading,
    EmptyPlaceholder,
  }: any) => {
    if (loading) {
      return ReactLib.createElement('div', {
        'data-testid': 'infinite-list-skeleton-loading',
      });
    }
    if (!data || data.length === 0) {
      return EmptyPlaceholder ?? null;
    }
    return ReactLib.createElement(
      'div',
      { 'data-testid': 'infinite-list' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...data.map((item: any, index: number) =>
        ReactLib.createElement(
          ReactLib.Fragment,
          { key: index },
          itemContent(index, item),
        ),
      ),
    );
  };

  return { InfiniteList, ItemWithBorders: 'div' };
});

const onNavListToggle = jest.fn();
const onFilterListToggle = jest.fn();

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <VirtuosoMockContext.Provider
        value={{ viewportHeight: 800, itemHeight: 80 }}
      >
        <MpdSupervisorReportProvider>{children}</MpdSupervisorReportProvider>
      </VirtuosoMockContext.Provider>
    </ThemeProvider>
  </TestRouter>
);

const renderReport = (panelOpen: Panel | null = Panel.Filters) =>
  render(
    <Wrapper>
      <MpdSupervisorReport
        panelOpen={panelOpen}
        onNavListToggle={onNavListToggle}
        onFilterListToggle={onFilterListToggle}
        title="MPD Supervisor Report"
      />
      <StaffMemberDrawer />
    </Wrapper>,
  );

describe('MpdSupervisorReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders staff member rows', async () => {
    renderReport();
    const firstMember = mockStaffMembers[0];
    // The card displays the name as "{preferredName} {lastName}".
    const cardName = `${firstMember.user.preferredName} ${firstMember.user.lastName}`;
    expect(await screen.findByText(cardName)).toBeInTheDocument();
  });

  it('shows the correct "Showing X of Y" count initially', () => {
    renderReport();
    expect(
      screen.getByText(
        `Showing ${mockStaffMembers.length} of ${mockStaffMembers.length} · sorted by MPD health`,
      ),
    ).toBeInTheDocument();
  });

  it('filters the list when typing in the search box and updates the count', async () => {
    renderReport();
    const firstMember = mockStaffMembers[0];
    const searchInput = screen.getByRole('textbox', { name: 'Search name' });

    await userEvent.type(searchInput, firstMember.user.lastName);

    const matching = mockStaffMembers.filter((m) =>
      `${m.user.preferredName} ${m.user.lastName}`
        .toLowerCase()
        .includes(firstMember.user.lastName.toLowerCase()),
    );
    expect(
      await screen.findByText(
        `Showing ${matching.length} of ${mockStaffMembers.length} · sorted by MPD health`,
      ),
    ).toBeInTheDocument();
  });

  it('shows the empty state when the search matches nothing', async () => {
    renderReport();
    const searchInput = screen.getByRole('textbox', { name: 'Search name' });

    await userEvent.type(searchInput, 'zzzzzz_no_match_at_all');

    expect(
      await screen.findByText('No staff members found'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Showing 0 of ${mockStaffMembers.length} · sorted by MPD health`,
      ),
    ).toBeInTheDocument();
  });

  // The card and the drawer both display the same name, so the drawer is
  // identified by its unique Close button and the "Employment Type" detail label
  // (which appears only in the user section, not the spouse section).
  it('opens the drawer when a staff member card is clicked', async () => {
    renderReport();

    const cards = await screen.findAllByRole('button', {
      name: new RegExp('View details for'),
    });
    userEvent.click(cards[0]);

    expect(
      await screen.findByRole('button', { name: 'Close' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Employment Type')).toBeInTheDocument();
  });

  it('calls onFilterListToggle when the filter toggle button is clicked', async () => {
    renderReport();
    const filterButton = screen.getByRole('button', {
      name: 'Toggle Filters Panel',
    });
    userEvent.click(filterButton);
    expect(onFilterListToggle).toHaveBeenCalledTimes(1);
  });

  it('renders with panelOpen=null (no panel open)', () => {
    renderReport(null);
    expect(
      screen.getByText(
        `Showing ${mockStaffMembers.length} of ${mockStaffMembers.length} · sorted by MPD health`,
      ),
    ).toBeInTheDocument();
  });

  it('renders with panelOpen=Panel.Navigation', () => {
    renderReport(Panel.Navigation);
    expect(
      screen.getByText(
        `Showing ${mockStaffMembers.length} of ${mockStaffMembers.length} · sorted by MPD health`,
      ),
    ).toBeInTheDocument();
  });
});
