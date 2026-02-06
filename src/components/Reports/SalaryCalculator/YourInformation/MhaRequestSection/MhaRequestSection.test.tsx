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

  describe('no MHA messages', () => {
    it('should render messages when both user and spouse have no MHA', async () => {
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
      expect(await findByTestId('no-mha-pending-message')).toBeInTheDocument();
    });

    it('should render message when only user has no MHA', async () => {
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
      expect(await findByTestId('no-mha-pending-message')).toBeInTheDocument();
    });

    it('should render message when only spouse has no MHA', async () => {
      const { findByTestId } = render(
        <TestComponent
          hcmUser={{
            mhaRequest: { currentApprovedOverallAmount: 20000 },
          }}
          hcmSpouse={{
            mhaRequest: { currentApprovedOverallAmount: 0 },
          }}
        />,
      );

      expect(await findByTestId('no-mha-submit-message')).toBeInTheDocument();
      expect(await findByTestId('no-mha-pending-message')).toBeInTheDocument();
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
      expect(queryByTestId('no-mha-pending-message')).not.toBeInTheDocument();
    });
  });
});
