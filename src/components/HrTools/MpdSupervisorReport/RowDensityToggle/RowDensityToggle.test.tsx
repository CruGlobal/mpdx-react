import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ManagedStaffQuery } from '../ManagedStaff.generated';
import {
  MpdSupervisorReportProvider,
  rowDensityStorageKey,
} from '../MpdSupervisorReportContext';
import { managedStaffMock } from '../mpdSupervisorReportMocks';
import { RowDensityToggle } from './RowDensityToggle';

const renderToggle = () =>
  render(
    <TestRouter>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ ManagedStaff: ManagedStaffQuery }>
          mocks={{ ManagedStaff: managedStaffMock() }}
        >
          <MpdSupervisorReportProvider>
            <RowDensityToggle />
          </MpdSupervisorReportProvider>
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>,
  );

describe('RowDensityToggle', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('starts on comfortable rows', () => {
    const { getByRole } = renderToggle();
    expect(getByRole('button', { name: 'Comfortable rows' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('switches to compact rows and remembers the choice', () => {
    const { getByRole } = renderToggle();

    userEvent.click(getByRole('button', { name: 'Compact rows' }));

    expect(getByRole('button', { name: 'Compact rows' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(window.localStorage.getItem(rowDensityStorageKey)).toBe('"compact"');
  });

  it('keeps the current density when its button is clicked again', () => {
    const { getByRole } = renderToggle();

    userEvent.click(getByRole('button', { name: 'Comfortable rows' }));

    expect(getByRole('button', { name: 'Comfortable rows' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
