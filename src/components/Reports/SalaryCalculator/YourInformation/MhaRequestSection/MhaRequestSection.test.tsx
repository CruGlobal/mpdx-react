import { render } from '@testing-library/react';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../../SalaryCalculatorTestWrapper';
import { MhaRequestSection } from './MhaRequestSection';

const mutationSpy = jest.fn();

const TestComponent: React.FC<
  Omit<SalaryCalculatorTestWrapperProps, 'children'>
> = (props) => (
  <SalaryCalculatorTestWrapper onCall={mutationSpy} {...props}>
    <MhaRequestSection />
  </SalaryCalculatorTestWrapper>
);

describe('MhaRequestSection', () => {
  it('should render the effective paycheck note when payroll dates match', async () => {
    const { findByRole } = render(
      <TestComponent
        salaryRequestMock={{ effectiveDate: '2026-06-01' }}
        payrollDates={[
          { startDate: '2026-06-01', regularProcessDate: '2026-06-10' },
        ]}
      />,
    );

    expect(await findByRole('note')).toHaveTextContent(
      'Values shown reflect the paycheck dated 6/10/2026.',
    );
  });

  it('should display both spouse names as headers', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'John', level: 6 }),
    ).toBeInTheDocument();
    expect(
      await findByRole('heading', { name: 'Jane', level: 6 }),
    ).toBeInTheDocument();
  });

  it('should render current MHA fields for both spouses with correct values', async () => {
    const { findByTestId } = render(<TestComponent />);

    const staffField = await findByTestId('current-mha-staff');
    const spouseField = await findByTestId('current-mha-spouse');

    expect(staffField).toHaveValue('$7,200');
    expect(spouseField).toHaveValue('$12,000');
  });

  it('should render new requested MHA input fields for both spouses', async () => {
    const { findAllByRole } = render(<TestComponent />);

    const enabledTextbox = (await findAllByRole('textbox')).filter(
      (textbox) => !textbox.hasAttribute('disabled'),
    );

    expect(enabledTextbox).toHaveLength(2);
  });

  it('should display progress bar', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(await findByRole('progressbar')).toBeInTheDocument();
  });

  it('should render eligibility table when user is ineligible', async () => {
    const { findByText } = render(
      <TestComponent
        hcmUser={{
          mhaEit: { mhaEligibility: false },
        }}
      />,
    );

    expect(await findByText('Ineligible')).toBeInTheDocument();
  });

  describe('no MHA messages', () => {
    it('should render no-MHA message when both user and spouse have no MHA', async () => {
      const { findByTestId } = render(
        <TestComponent
          hcmUser={{
            mhaRequest: { currentApprovedOverallAmount: 0 },
          }}
          hcmSpouse={{
            mhaRequest: { currentApprovedOverallAmount: 0 },
          }}
        />,
      );

      expect(await findByTestId('no-mha-submit-message')).toBeInTheDocument();
    });

    it('should render no-MHA message when only user has no MHA', async () => {
      const { findByTestId } = render(
        <TestComponent
          hcmUser={{
            mhaRequest: { currentApprovedOverallAmount: 0 },
          }}
          hcmSpouse={{
            mhaRequest: { currentApprovedOverallAmount: 20000 },
          }}
        />,
      );

      expect(await findByTestId('no-mha-submit-message')).toBeInTheDocument();
    });

    it('should not render no MHA messages when both have MHA', async () => {
      const { queryByTestId, findByTestId } = render(
        <TestComponent
          hcmUser={{
            mhaRequest: { currentApprovedOverallAmount: 20000 },
          }}
          hcmSpouse={{
            mhaRequest: { currentApprovedOverallAmount: 20000 },
          }}
        />,
      );

      expect(await findByTestId('board-approved-amount')).toBeInTheDocument();
      expect(queryByTestId('no-mha-submit-message')).not.toBeInTheDocument();
    });
  });
});
