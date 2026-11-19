import { render } from '@testing-library/react';
import { FundFieldsFragment } from '../../ReportsSavingsFund.generated';
import { FundInfoDisplay } from './FundInfoDisplay';

type Fund = Pick<
  FundFieldsFragment,
  'fundType' | 'endBalance' | 'availableBalance' | 'deficitLimit'
>;

const buildFund = (overrides: Partial<Fund> = {}): Fund => ({
  fundType: 'Staff Account',
  endBalance: 15000,
  deficitLimit: 0,
  availableBalance: null,
  ...overrides,
});

describe('FundInfoDisplay', () => {
  it('shows the API-computed available balance when present', () => {
    const { getByText } = render(
      <FundInfoDisplay fund={buildFund({ availableBalance: 400 })} />,
    );

    expect(getByText(/\$400\.00 available/)).toBeInTheDocument();
  });

  it('falls back to balance plus allowed deficit when the API value is null', () => {
    const { getByText } = render(
      <FundInfoDisplay fund={buildFund({ deficitLimit: 1000 })} />,
    );

    expect(getByText(/\$16,000\.00 available/)).toBeInTheDocument();
  });

  it('shows a negative available balance in parentheses', () => {
    const { getByText } = render(
      <FundInfoDisplay fund={buildFund({ availableBalance: -250 })} />,
    );

    expect(getByText(/\(\$250\.00\)/)).toBeInTheDocument();
  });

  it('renders nothing without a fund', () => {
    const { container } = render(<FundInfoDisplay />);

    expect(container).toBeEmptyDOMElement();
  });
});
