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

  describe('MHI labeling for Italian users', () => {
    const italianUser = {
      staffInfo: { country: 'IT' },
      mhaEit: { mhaEligibility: false },
      mhiEit: { mhiEligibility: true },
    };

    it('renders MHI field labels when user is from Italy', async () => {
      const { findByRole } = render(
        <TestComponent hcmUser={italianUser} hasSpouse={false} />,
      );

      expect(
        await findByRole('textbox', { name: 'Current MHI' }),
      ).toBeInTheDocument();
      expect(
        await findByRole('textbox', { name: 'New Requested MHI' }),
      ).toBeInTheDocument();
    });

    it('renders MHI-labeled submit message when Italian user has no approved amount', async () => {
      const { findByTestId } = render(
        <TestComponent
          hcmUser={{
            ...italianUser,
            mhaRequest: { currentApprovedOverallAmount: 0 },
          }}
          hasSpouse={false}
        />,
      );

      const message = await findByTestId('no-mha-submit-message');
      expect(message).toHaveTextContent(/have an MHI for the effective date/);
      expect(message).toHaveTextContent(
        /To apply for MHI, contact Personnel Records/,
      );
      expect(message).toHaveTextContent('MHA@cru.org');
    });

    // Covers the `showSpouseFields && !showUserFields ? spouseKind : userKind`
    // fallback at MhaRequestSection.tsx:75-76 — if only the Italian spouse's
    // field renders, the section copy should follow the spouse's (MHI) kind.
    it('uses MHI wording when only the Italian spouse field renders (mixed couple)', async () => {
      const { findByText, queryByText } = render(
        <TestComponent
          hcmUser={{ mhaEit: { mhaEligibility: false } }}
          hcmSpouse={italianUser}
        />,
      );

      expect(await findByText('MHI Request')).toBeInTheDocument();
      expect(queryByText('MHA Request')).not.toBeInTheDocument();
    });
  });
});
