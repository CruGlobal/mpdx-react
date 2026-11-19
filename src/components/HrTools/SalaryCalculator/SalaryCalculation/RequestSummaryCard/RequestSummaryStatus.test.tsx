import React, { useEffect, useState } from 'react';
import { render, waitFor } from '@testing-library/react';
import {
  AutosaveForm,
  useAutosaveForm,
} from 'src/components/Shared/Autosave/AutosaveForm';
import {
  HcmLoaded,
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../../SalaryCalculatorTestWrapper';
import { StepNavigation } from '../../StepNavigation/StepNavigation';
import { RequestSummaryStatus } from './RequestSummaryStatus';

// John asks for a raise that takes him over his cap while Jane still has room, and the couple is
// under the combined cap
const blockedMock: SalaryCalculatorTestWrapperProps['salaryRequestMock'] = {
  splitCapRequired: false,
  manuallySplitCap: false,
  calculations: {
    requestedGross: 80000,
    requestedYtdGross: 80000,
    effectiveCap: 75000,
    combinedCap: 135000,
  },
  spouseCalculations: {
    requestedGross: 40000,
    requestedYtdGross: 40000,
    effectiveCap: 50000,
  },
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
  <SalaryCalculatorTestWrapper
    hcmUser={{ currentSalary: { grossSalaryAmount: 70000 } }}
    {...props}
  >
    <HcmLoaded />
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
    const { findByTestId, getByRole, queryByText } = render(
      <TestComponent salaryRequestMock={blockedMock} />,
    );

    expect(await findByTestId('SpouseCapFirstAlert')).toHaveTextContent(
      "raise Jane's Gross Requested Salary to $50,000.00, which brings them up to their Maximum Allowable Salary",
    );
    expect(queryByText('Division Head message')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(getByRole('button', { name: 'Continue' })).toBeDisabled(),
    );
  });

  it('shows the status message and allows continuing otherwise', async () => {
    const { findByText, findByTestId, getByRole } = render(
      <TestComponent salaryRequestMock={notBlockedMock} />,
    );

    // Not blocked is also what shows before the data loads, so wait for it first
    expect(await findByText('HCM loaded')).toBeInTheDocument();
    expect(await findByTestId('RequestSummaryCard-status')).toHaveTextContent(
      'Division Head message',
    );
    await waitFor(() =>
      expect(getByRole('button', { name: 'Continue' })).toBeEnabled(),
    );
  });

  it('shows the status message for a request that is only being viewed', async () => {
    const { findByText, findByTestId, queryByTestId } = render(
      <TestComponent salaryRequestMock={blockedMock} editing={false} />,
    );

    expect(await findByText('HCM loaded')).toBeInTheDocument();
    expect(await findByTestId('RequestSummaryCard-status')).toHaveTextContent(
      'Division Head message',
    );
    expect(queryByTestId('SpouseCapFirstAlert')).not.toBeInTheDocument();
  });
});
