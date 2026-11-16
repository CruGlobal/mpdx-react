import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ManagedStaffQuery } from '../ManagedStaff.generated';
import {
  MpdSupervisorReportProvider,
  RowDensityEnum,
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

// GqlMockedProvider renders nothing on the server, so the hydration test uses
// Apollo's MockedProvider, which renders its children right away
const ServerRenderedToggle: React.FC = () => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <MockedProvider mocks={[]}>
        <MpdSupervisorReportProvider>
          <RowDensityToggle />
        </MpdSupervisorReportProvider>
      </MockedProvider>
    </ThemeProvider>
  </TestRouter>
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

  it('shows the saved density after the server-rendered page hydrates', async () => {
    // The server can't see local storage, so it renders the default density.
    // The markup is React's own output, not user input.
    const container = document.createElement('div');
    container.insertAdjacentHTML(
      'afterbegin',
      renderToString(<ServerRenderedToggle />),
    );
    document.body.appendChild(container);
    window.localStorage.setItem(
      rowDensityStorageKey,
      JSON.stringify(RowDensityEnum.Compact),
    );

    const { getByRole } = render(<ServerRenderedToggle />, {
      container,
      hydrate: true,
    });

    await waitFor(() =>
      expect(getByRole('button', { name: 'Compact rows' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );
    expect(getByRole('button', { name: 'Comfortable rows' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    // One click switches back
    userEvent.click(getByRole('button', { name: 'Comfortable rows' }));
    expect(getByRole('button', { name: 'Comfortable rows' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
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
