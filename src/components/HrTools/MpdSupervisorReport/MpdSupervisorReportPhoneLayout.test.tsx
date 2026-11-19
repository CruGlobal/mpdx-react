import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import theme from 'src/theme';
import { ManagedStaffQuery } from './ManagedStaff.generated';
import { ManagedStaffTeamSummaryQuery } from './ManagedStaffTeamSummary.generated';
import { ManagedStaffTeamsQuery } from './ManagedStaffTeams.generated';
import { MpdSupervisorReport } from './MpdSupervisorReport';
import { MpdSupervisorReportProvider } from './MpdSupervisorReportContext';
import {
  managedStaffMember,
  managedStaffMock,
  managedStaffTeamSummaryMock,
  managedStaffTeamsMock,
} from './mpdSupervisorReportMocks';

jest.mock('react-csv/lib/core', () => ({
  buildURI: jest.fn(() => 'blob:supervisor-report'),
}));

const renderReport = () =>
  render(
    <TestRouter>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 800, itemHeight: 80 }}
          >
            <GqlMockedProvider<{
              ManagedStaff: ManagedStaffQuery;
              ManagedStaffTeams: ManagedStaffTeamsQuery;
              ManagedStaffTeamSummary: ManagedStaffTeamSummaryQuery;
            }>
              mocks={{
                ManagedStaff: managedStaffMock([managedStaffMember()]),
                ManagedStaffTeams: managedStaffTeamsMock(),
                ManagedStaffTeamSummary: managedStaffTeamSummaryMock([]),
              }}
            >
              <MpdSupervisorReportProvider>
                <MpdSupervisorReport
                  panelOpen={null}
                  onNavListToggle={jest.fn()}
                  onFilterListToggle={jest.fn()}
                  title="MPD Supervisor Report"
                />
              </MpdSupervisorReportProvider>
            </GqlMockedProvider>
          </VirtuosoMockContext.Provider>
        </SnackbarProvider>
      </ThemeProvider>
    </TestRouter>,
  );

// MPDX-10302: below md each row labels its own months, and the column
// headers no longer fit or line up with anything
describe('MpdSupervisorReport month column headers', () => {
  it.each([
    [phoneWidth, 'none'],
    [768, 'none'],
    [900, 'flex'],
    [desktopWidth, 'flex'],
  ])('at %ipx wide use display %s', async (width, display) => {
    const { findByText, getByTestId } = renderReport();
    await findByText('John Smith');

    expect(
      getStyleAtWidth(getByTestId('month-headers'), 'display', width),
    ).toBe(display);
  });
});

describe('MpdSupervisorReport header', () => {
  it('offers the loaded rows as a CSV download', async () => {
    const { findByRole } = renderReport();

    expect(await findByRole('link', { name: 'Download CSV' })).toHaveAttribute(
      'href',
      'blob:supervisor-report',
    );
  });
});

// With the filter panel open the header is narrow on desktop, so the title
// must stay on one line
describe('MpdSupervisorReport desktop header', () => {
  it('keeps the title on one line with the summary under it', async () => {
    const { findByText, getByText, getByTestId } = renderReport();
    await findByText(/^Showing 1 of 1/);
    const title = getByText('MPD Supervisor Report');
    const titleBox = getByTestId('title-box');

    expect(getStyleAtWidth(title, 'white-space', desktopWidth)).toBe('nowrap');
    expect(getStyleAtWidth(title, 'white-space', phoneWidth)).toBe('');
    expect(getStyleAtWidth(titleBox, 'flex-direction', desktopWidth)).toBe(
      'column',
    );
  });
});
