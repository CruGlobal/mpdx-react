import { render } from '@testing-library/react';
import { MinistersHousingIneligibilityReasonEnum } from 'src/graphql/types.generated';
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
          mhaSalaryEit: { mhaEligibility: false },
        }}
      />,
    );

    expect(await findByText('Ineligible')).toBeInTheDocument();
  });

  describe('board approval rule', () => {
    it('shows the fields when the board approval passes but the IBS-based MHA eligibility fails', async () => {
      const { findByTestId, queryByText } = render(
        <TestComponent
          hasSpouse={false}
          hcmUser={{
            mhaEit: {
              mhaEligibility: false,
              ineligibilityReasonCode:
                MinistersHousingIneligibilityReasonEnum.IbsCertificationExpired,
            },
            mhaSalaryEit: {
              mhaEligibility: true,
              ineligibilityReasonCode: null,
            },
            mhaRequest: {
              currentApprovedOverallAmount: 0,
              salaryApprovedOverallAmount: 18000,
            },
          }}
        />,
      );

      expect(await findByTestId('board-approved-amount')).toHaveTextContent(
        'You may request up to your Board Approved MHA Amount of $18,000.',
      );
      expect(await findByTestId('current-mha-staff')).toHaveValue('$7,200');
      expect(queryByText('Ineligible')).not.toBeInTheDocument();
    });

    it('hides the fields and shows the reason when there is no board approval date', async () => {
      const { findByRole, queryByTestId } = render(
        <TestComponent
          hasSpouse={false}
          hcmUser={{
            mhaEit: { mhaEligibility: true, ineligibilityReasonCode: null },
            mhaSalaryEit: {
              mhaEligibility: false,
              ineligibilityReasonCode:
                MinistersHousingIneligibilityReasonEnum.MissingBoardApprovedOnDate,
            },
            mhaRequest: {
              currentApprovedOverallAmount: 20000,
              salaryApprovedOverallAmount: 0,
            },
          }}
        />,
      );

      expect(
        await findByRole('cell', {
          name: 'Board approval date is missing from your records',
        }),
      ).toBeInTheDocument();
      expect(queryByTestId('current-mha-staff')).not.toBeInTheDocument();
      expect(queryByTestId('board-approved-amount')).not.toBeInTheDocument();
    });
  });

  it('describes eligibility by the Board approval when IBS has expired', async () => {
    const { findByRole, queryByRole, getByTestId } = render(
      <TestComponent
        hcmUser={{
          mhaEit: {
            mhaEligibility: false,
            ineligibilityReasonCode:
              MinistersHousingIneligibilityReasonEnum.IbsCertificationExpired,
          },
          mhaSalaryEit: { mhaEligibility: true, ineligibilityReasonCode: null },
        }}
        hcmSpouse={{
          mhaSalaryEit: {
            mhaEligibility: false,
            ineligibilityReasonCode:
              MinistersHousingIneligibilityReasonEnum.MissingBoardApprovedOnDate,
          },
        }}
      />,
    );

    expect(
      await findByRole('cell', {
        name: 'MHA has been Board approved',
      }),
    ).toBeInTheDocument();
    expect(
      queryByRole('cell', { name: 'Completed the required IBS courses' }),
    ).not.toBeInTheDocument();
    expect(getByTestId('eligibility-contact-info')).not.toHaveTextContent(
      /IBS/,
    );
  });

  describe('no MHA messages', () => {
    it('should render no-MHA message when both user and spouse have no MHA', async () => {
      const { findByTestId } = render(
        <TestComponent
          hcmUser={{
            mhaRequest: { salaryApprovedOverallAmount: 0 },
          }}
          hcmSpouse={{
            mhaRequest: { salaryApprovedOverallAmount: 0 },
          }}
        />,
      );

      expect(await findByTestId('no-mha-submit-message')).toBeInTheDocument();
    });

    it('should render no-MHA message when only user has no MHA', async () => {
      const { findByTestId } = render(
        <TestComponent
          hcmUser={{
            mhaRequest: { salaryApprovedOverallAmount: 0 },
          }}
          hcmSpouse={{
            mhaRequest: { salaryApprovedOverallAmount: 20000 },
          }}
        />,
      );

      expect(await findByTestId('no-mha-submit-message')).toBeInTheDocument();
    });

    it('should not render no MHA messages when both have MHA', async () => {
      const { queryByTestId, findByTestId } = render(
        <TestComponent
          hcmUser={{
            mhaRequest: { salaryApprovedOverallAmount: 20000 },
          }}
          hcmSpouse={{
            mhaRequest: { salaryApprovedOverallAmount: 20000 },
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
      mhaSalaryEit: {
        mhaEligibility: false,
        ineligibilityReasonCode:
          MinistersHousingIneligibilityReasonEnum.ItalyMhi,
      },
      mhiEit: { mhiEligibility: true, ineligibilityReasonCode: null },
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
            mhaRequest: { salaryApprovedOverallAmount: 0 },
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
          hcmUser={{ mhaSalaryEit: { mhaEligibility: false } }}
          hcmSpouse={italianUser}
        />,
      );

      expect(await findByText('MHI Request')).toBeInTheDocument();
      expect(queryByText('MHA Request')).not.toBeInTheDocument();
    });
  });
});
