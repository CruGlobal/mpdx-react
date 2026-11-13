import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ManagedStaffQuery } from '../ManagedStaff.generated';
import { MpdSupervisorReportProvider } from '../MpdSupervisorReportContext';
import { managedStaffMock } from '../mpdSupervisorReportMocks';
import { HeaderActions } from './HeaderActions';

describe('HeaderActions', () => {
  it('shows the row density toggle and the CSV download', () => {
    const { getByRole } = render(
      <TestRouter>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<{ ManagedStaff: ManagedStaffQuery }>
            mocks={{ ManagedStaff: managedStaffMock() }}
          >
            <MpdSupervisorReportProvider>
              <HeaderActions />
            </MpdSupervisorReportProvider>
          </GqlMockedProvider>
        </ThemeProvider>
      </TestRouter>,
    );

    expect(getByRole('group', { name: 'Row density' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Download CSV' })).toBeInTheDocument();
  });
});
