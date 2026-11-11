import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { AppliedFilters } from '../ListStates/AppliedFilters';
import { MpdSupervisorReportProvider } from '../MpdSupervisorReportContext';
import { MpdSupervisorReportFilterPanel } from './MpdSupervisorReportFilterPanel';

const renderPanel = () =>
  render(
    <TestRouter>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <MpdSupervisorReportProvider>
            <AppliedFilters />
            <MpdSupervisorReportFilterPanel onClose={jest.fn()} />
          </MpdSupervisorReportProvider>
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>,
  );

// MPDX-10323: one chip per health grade
describe('CAP health filter chips', () => {
  it('offers a chip for each grade', () => {
    const { getByRole } = renderPanel();

    ['Healthy', 'On Track', 'Needs Attention'].forEach((name) =>
      expect(getByRole('button', { name })).toBeInTheDocument(),
    );
  });

  it('explains a chip in its tooltip', async () => {
    const { getByRole, findByRole } = renderPanel();

    userEvent.hover(getByRole('button', { name: 'On Track' }));

    expect(await findByRole('tooltip')).toHaveTextContent(
      'Staff whose payroll last month was 50% to under 65% of their Personal CAP.',
    );
  });

  it('shows the picked grade as an applied filter that removes it', async () => {
    const { getByRole, queryByRole, findByRole } = renderPanel();

    userEvent.click(getByRole('button', { name: 'Needs Attention' }));
    userEvent.click(
      await findByRole('button', { name: 'Remove Needs Attention' }),
    );

    await waitFor(() =>
      expect(
        queryByRole('button', { name: 'Remove Needs Attention' }),
      ).not.toBeInTheDocument(),
    );
  });
});
