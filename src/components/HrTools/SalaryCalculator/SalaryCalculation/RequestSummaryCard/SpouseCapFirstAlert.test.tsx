import { render, waitFor } from '@testing-library/react';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../../SalaryCalculatorTestWrapper';
import {
  RequestSummaryStatus,
  SpouseCapFirstAlert,
} from './SpouseCapFirstAlert';

const markValid = jest.fn();
const markInvalid = jest.fn();

jest.mock('src/components/Shared/Autosave/AutosaveForm', () => ({
  ...jest.requireActual('src/components/Shared/Autosave/AutosaveForm'),
  useOptionalAutosaveForm: () => ({ markValid, markInvalid, allValid: true }),
}));

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

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = (props) => (
  <SalaryCalculatorTestWrapper {...props}>
    <SpouseCapFirstAlert />
  </SalaryCalculatorTestWrapper>
);

describe('SpouseCapFirstAlert', () => {
  it('asks to raise the other spouse up to their cap first', async () => {
    const { findByTestId } = render(
      <TestComponent salaryRequestMock={blockedMock} />,
    );

    const alert = await findByTestId('SpouseCapFirstAlert');
    await waitFor(() =>
      expect(alert).toHaveTextContent(
        "John's Gross Requested Salary exceeds their individual Maximum Allowable Salary",
      ),
    );
    expect(alert).toHaveTextContent(
      "raise Jane's Requested Salary up to their Maximum Allowable Salary of $50,000.00",
    );
    expect(alert).not.toHaveTextContent('change how you split');
  });

  it('also suggests moving cap when the couple splits the combined cap by hand', async () => {
    const { findByTestId } = render(
      <TestComponent
        salaryRequestMock={{
          ...blockedMock,
          splitCapRequired: true,
          manuallySplitCap: true,
        }}
      />,
    );

    await waitFor(async () =>
      expect(await findByTestId('SpouseCapFirstAlert')).toHaveTextContent(
        'change how you split your Combined Maximum Allowable Salary',
      ),
    );
  });

  it('blocks continuing while shown', async () => {
    const { unmount } = render(
      <TestComponent salaryRequestMock={blockedMock} />,
    );

    await waitFor(() =>
      expect(markInvalid).toHaveBeenCalledWith('spouse-cap-first'),
    );
    unmount();
    expect(markValid).toHaveBeenCalledWith('spouse-cap-first');
  });
});

describe('RequestSummaryStatus', () => {
  it('shows the alert in place of the status message while blocked', async () => {
    const { findByTestId, queryByText } = render(
      <SalaryCalculatorTestWrapper salaryRequestMock={blockedMock}>
        <RequestSummaryStatus>Division Head message</RequestSummaryStatus>
      </SalaryCalculatorTestWrapper>,
    );

    expect(await findByTestId('SpouseCapFirstAlert')).toBeInTheDocument();
    expect(queryByText('Division Head message')).not.toBeInTheDocument();
  });

  it('shows the status message otherwise', async () => {
    const { findByTestId } = render(
      <SalaryCalculatorTestWrapper
        salaryRequestMock={{
          ...blockedMock,
          spouseCalculations: { requestedYtdGross: 50000, effectiveCap: 50000 },
        }}
      >
        <RequestSummaryStatus>Division Head message</RequestSummaryStatus>
      </SalaryCalculatorTestWrapper>,
    );

    expect(await findByTestId('RequestSummaryCard-status')).toHaveTextContent(
      'Division Head message',
    );
  });
});
