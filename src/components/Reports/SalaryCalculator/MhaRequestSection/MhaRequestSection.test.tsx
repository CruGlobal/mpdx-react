import { render, waitFor } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { MhaRequestSection } from './MhaRequestSection';

const mutationSpy = jest.fn();

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper onCall={mutationSpy}>
    <MhaRequestSection />
  </SalaryCalculatorTestWrapper>
);

describe('MhaRequestSection', () => {
  it('should render MHA request section with spouse fields', async () => {
    const { findByText } = render(<TestComponent />);

    expect(await findByText('MHA Request')).toBeInTheDocument();
    expect(await findByText('Current MHA')).toBeInTheDocument();
    expect(await findByText('New Requested MHA')).toBeInTheDocument();
  });

  it('should display both spouse names as column headers', async () => {
    const { findByText, getByText } = render(<TestComponent />);

    expect(await findByText('John')).toBeInTheDocument();
    expect(getByText('Jane')).toBeInTheDocument();
  });

  it('should display board approved amount in instructions', async () => {
    const { findByText } = render(<TestComponent />);

    expect(
      await findByText(
        'You may request up to your Board Approved MHA Amount of $0.',
        { exact: false },
      ),
    ).toBeInTheDocument();
  });

  it('should display "Combined MHA Requested" label', async () => {
    const { findByText } = render(<TestComponent />);

    expect(await findByText('Combined MHA Requested')).toBeInTheDocument();
  });

  it('should render current MHA fields for both spouses', async () => {
    const { findByText, getAllByDisplayValue } = render(<TestComponent />);

    expect(await findByText('Current MHA')).toBeInTheDocument();
    await waitFor(() => {
      const fields = getAllByDisplayValue('$0');
      expect(fields.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('should render new requested MHA input fields for both spouses', async () => {
    const { findByText } = render(<TestComponent />);

    expect(await findByText('New Requested MHA')).toBeInTheDocument();
    expect(await findByText('John')).toBeInTheDocument();
    expect(await findByText('Jane')).toBeInTheDocument();
  });

  it('should display progress bar and remaining amount', async () => {
    const { findByText, findByRole } = render(<TestComponent />);

    expect(await findByText('Combined MHA Requested')).toBeInTheDocument();
    expect(
      await findByText('Remaining in approved MHA Amount'),
    ).toBeInTheDocument();
    expect(await findByRole('progressbar')).toBeInTheDocument();
  });

  it('should show board approved amount formatted correctly', async () => {
    const { findByText } = render(<TestComponent />);

    expect(await findByText('Combined MHA Requested')).toBeInTheDocument();
    const progressText = await findByText('$22,000', { exact: false });
    expect(progressText).toBeInTheDocument();
  });
});
