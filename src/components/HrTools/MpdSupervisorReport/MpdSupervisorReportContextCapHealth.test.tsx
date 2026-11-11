import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MpdCapHealthEnum } from 'src/graphql/types.generated';
import { MpdSupervisorReportQuickFilterEnum } from './Filters/mpdSupervisorReportFilters';
import { ManagedStaffQuery } from './ManagedStaff.generated';
import {
  MpdSupervisorReportContextValue,
  MpdSupervisorReportProvider,
  useMpdSupervisorReport,
} from './MpdSupervisorReportContext';
import { managedStaffMock } from './mpdSupervisorReportMocks';

const mutationSpy = jest.fn();
let context: MpdSupervisorReportContextValue;

const Consumer: React.FC = () => {
  context = useMpdSupervisorReport();
  return null;
};

const renderConsumer = () =>
  render(
    <TestRouter>
      <GqlMockedProvider<{ ManagedStaff: ManagedStaffQuery }>
        mocks={{ ManagedStaff: managedStaffMock() }}
        onCall={mutationSpy}
      >
        <MpdSupervisorReportProvider>
          <Consumer />
        </MpdSupervisorReportProvider>
      </GqlMockedProvider>
    </TestRouter>,
  );

// MPDX-10323
describe('MpdSupervisorReportContext CAP health filter', () => {
  it('sends no grade while All people is selected', async () => {
    renderConsumer();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        capHealth: null,
      }),
    );
  });

  it.each([
    [MpdSupervisorReportQuickFilterEnum.CapHealthy, MpdCapHealthEnum.Healthy],
    [MpdSupervisorReportQuickFilterEnum.CapOnTrack, MpdCapHealthEnum.OnTrack],
    [
      MpdSupervisorReportQuickFilterEnum.CapNeedsAttention,
      MpdCapHealthEnum.NeedsAttention,
    ],
  ])('sends capHealth %s as %s and no balance flag', async (chip, grade) => {
    renderConsumer();
    act(() => context.setActiveQuickFilter(chip));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        capHealth: grade,
        negativeLastMonth: null,
        negativeThreeMonths: null,
        negativeThreeMonthsInPastYear: null,
        expensesOverIncomeThreeMonths: null,
        belowNewStaffMonthlySalary: null,
      }),
    );
    expect(context.queryVariables.capHealth).toBe(grade);
    expect(context.activeFilterCount).toBe(1);
  });

  it('sends no grade for a balance chip', async () => {
    renderConsumer();
    act(() =>
      context.setActiveQuickFilter(
        MpdSupervisorReportQuickFilterEnum.NegativeLastMonth,
      ),
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        negativeLastMonth: true,
        capHealth: null,
      }),
    );
  });
});
