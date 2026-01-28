import React from 'react';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import { SalaryRequestStatusEnum } from 'src/graphql/types.generated';
import { dateFormat } from 'src/lib/intlFormat';
import { LandingTestWrapper } from '../../NewSalaryCalculationLanding/LandingTestWrapper';
import { PendingRequestTimeline } from './PendingRequestTimeline';
import type { LandingSalaryCalculationsQuery } from '../../NewSalaryCalculationLanding/LandingSalaryCalculations.generated';

type LatestCalculation = LandingSalaryCalculationsQuery['latestCalculation'];

const createCalculation = (
  status: SalaryRequestStatusEnum,
  feedback: string | null = null,
): LatestCalculation => ({
  id: '1',
  status,
  effectiveDate: '2025-02-01',
  location: 'US',
  mhaAmount: null,
  spouseMhaAmount: null,
  salaryCap: null,
  spouseSalaryCap: null,
  salary: null,
  spouseSalary: null,
  phoneNumber: null,
  emailAddress: null,
  submittedAt: '2025-01-15T10:00:00Z',
  changesRequestedAt: null,
  updatedAt: '2025-01-15T10:00:00Z',
  feedback,
});

interface TestComponentProps {
  calculation?: LatestCalculation;
  requestedOn?: string;
  processedOn?: string;
  feedback?: string | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  calculation = createCalculation(SalaryRequestStatusEnum.Pending),
  requestedOn = '2025-01-15',
  processedOn = '',
  feedback = null,
}) => (
  <LandingTestWrapper hasLatestCalculation>
    <PendingRequestTimeline
      calculation={calculation}
      requestedOn={requestedOn}
      processedOn={processedOn}
      feedback={feedback}
    />
  </LandingTestWrapper>
);

describe('PendingRequestTimeline', () => {
  it('renders timeline with pending status', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(await findByRole('list')).toBeInTheDocument();
  });

  it('renders status with processed date', async () => {
    const processedDate = DateTime.fromISO('2025-01-20');
    const formattedDate = dateFormat(processedDate, 'en-US');

    const { findByRole } = render(
      <TestComponent
        calculation={createCalculation(SalaryRequestStatusEnum.ActionRequired)}
        processedOn={formattedDate}
      />,
    );

    expect(
      await findByRole('heading', {
        name: `Request processed on: ${formattedDate}`,
      }),
    ).toBeInTheDocument();
  });

  it('renders action required status with feedback', async () => {
    const { getByText, findByRole } = render(
      <TestComponent
        calculation={createCalculation(
          SalaryRequestStatusEnum.ActionRequired,
          'Additional information needed',
        )}
        feedback="Additional information needed"
      />,
    );

    expect(
      await findByRole('heading', {
        name: 'Action Required: Approver Inquiry',
      }),
    ).toBeInTheDocument();

    expect(getByText('Additional information needed')).toBeInTheDocument();
  });

  it('handles null calculation', async () => {
    const { findByRole } = render(<TestComponent calculation={null} />);

    expect(await findByRole('list')).toBeInTheDocument();
  });
});
