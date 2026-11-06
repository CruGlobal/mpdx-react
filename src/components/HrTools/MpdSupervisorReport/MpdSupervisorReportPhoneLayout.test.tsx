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

// MPDX-10302: below md each row labels its own quarters, and the column
// headers no longer fit or line up with anything
describe('MpdSupervisorReport quarter column headers', () => {
  it.each([
    [phoneWidth, 'none'],
    [768, 'none'],
    [900, 'flex'],
    [desktopWidth, 'flex'],
  ])('at %ipx wide use display %s', async (width, display) => {
    const { findByText, getByTestId } = renderReport();
    await findByText('John Smith');

    expect(
      getStyleAtWidth(getByTestId('quarter-headers'), 'display', width),
    ).toBe(display);
  });
});
