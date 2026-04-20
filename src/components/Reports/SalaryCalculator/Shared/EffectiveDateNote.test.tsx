import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SalaryRequestStatusEnum } from 'src/graphql/types.generated';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { EffectiveDateNote } from './EffectiveDateNote';

describe('EffectiveDateNote', () => {
  it('renders the note with the formatted paycheck date when available', async () => {
    const { findByRole } = render(
      <SalaryCalculatorTestWrapper
        salaryRequestMock={{
          status: SalaryRequestStatusEnum.InProgress,
          effectiveDate: '2026-06-01',
        }}
        payrollDates={[
          { startDate: '2026-06-01', regularProcessDate: '2026-06-10' },
        ]}
      >
        <EffectiveDateNote />
      </SalaryCalculatorTestWrapper>,
    );

    expect(await findByRole('note')).toHaveTextContent(
      'Values shown reflect the paycheck dated 6/10/2026.',
    );
  });

  it('renders nothing when the paycheck date cannot be resolved', async () => {
    const { queryByRole } = render(
      <SalaryCalculatorTestWrapper
        salaryRequestMock={{
          status: SalaryRequestStatusEnum.InProgress,
          effectiveDate: '2026-06-01',
        }}
        payrollDates={[]}
      >
        <EffectiveDateNote />
      </SalaryCalculatorTestWrapper>,
    );

    await waitFor(() => {
      expect(queryByRole('note')).not.toBeInTheDocument();
    });
  });
});
