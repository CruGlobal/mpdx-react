import React, { useEffect, useState } from 'react';
import { render, waitFor } from '@testing-library/react';
import {
  AutosaveForm,
  useAutosaveForm,
} from 'src/components/Shared/Autosave/AutosaveForm';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../../SalaryCalculatorTestWrapper';
import { StepNavigation } from '../../StepNavigation/StepNavigation';
import { RequestSummaryStatus } from './RequestSummaryStatus';

// John is over his cap while Jane still has room, and the couple is under the combined cap
const blockedMock: SalaryCalculatorTestWrapperProps['salaryRequestMock'] = {
  splitCapRequired: false,
  manuallySplitCap: false,
  calculations: {
    requestedYtdGross: 80000,
    effectiveCap: 75000,
    combinedCap: 135000,
  },
  spouseCalculations: { requestedYtdGross: 40000, effectiveCap: 50000 },
};

const notBlockedMock: SalaryCalculatorTestWrapperProps['salaryRequestMock'] = {
  ...blockedMock,
  spouseCalculations: { requestedYtdGross: 50000, effectiveCap: 50000 },
};

// Stands in for the form's other fields, which are all valid. Its children wait until it has
// registered, so Continue is never disabled just because no field has reported yet.
const ValidFields: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { markValid } = useAutosaveForm();
  const [registered, setRegistered] = useState(false);
  useEffect(() => {
    markValid('valid-field');
    setRegistered(true);
  }, [markValid]);
  return registered ? <div>{children}</div> : null;
};

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = (props) => (
  <SalaryCalculatorTestWrapper {...props}>
    <AutosaveForm>
      <ValidFields>
        <RequestSummaryStatus>Division Head message</RequestSummaryStatus>
        <StepNavigation />
      </ValidFields>
    </AutosaveForm>
  </SalaryCalculatorTestWrapper>
);

describe('RequestSummaryStatus', () => {
  it('shows the alert in place of the status message and blocks continuing', async () => {
    const { findByTestId, findByRole, queryByText } = render(
      <TestComponent salaryRequestMock={blockedMock} />,
    );

    expect(await findByTestId('SpouseCapFirstAlert')).toHaveTextContent(
      "raise Jane's Gross Requested Salary up to their Maximum Allowable Salary of $50,000.00",
    );
    expect(queryByText('Division Head message')).not.toBeInTheDocument();
    await waitFor(async () =>
      expect(await findByRole('button', { name: 'Continue' })).toBeDisabled(),
    );
  });

  it('shows the status message and allows continuing otherwise', async () => {
    const { findByTestId, findByRole } = render(
      <TestComponent salaryRequestMock={notBlockedMock} />,
    );

    expect(await findByTestId('RequestSummaryCard-status')).toHaveTextContent(
      'Division Head message',
    );
    await waitFor(async () =>
      expect(await findByRole('button', { name: 'Continue' })).toBeEnabled(),
    );
  });

  it('shows the status message for a request that is only being viewed', async () => {
    const { findByTestId, queryByTestId } = render(
      <TestComponent salaryRequestMock={blockedMock} editing={false} />,
    );

    expect(await findByTestId('RequestSummaryCard-status')).toHaveTextContent(
      'Division Head message',
    );
    expect(queryByTestId('SpouseCapFirstAlert')).not.toBeInTheDocument();
  });
});
