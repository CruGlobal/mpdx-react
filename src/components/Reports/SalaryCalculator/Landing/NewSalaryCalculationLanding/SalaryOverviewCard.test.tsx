import { render } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../../SalaryCalculatorTestWrapper';
import { SalaryOverviewCard } from './SalaryOverviewCard';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <SalaryOverviewCard />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryOverviewCard', () => {
  it('renders card component', () => {
    const { container } = render(<TestComponent />);
    const card = container.querySelector('[class*="MuiCard"]');
    expect(card).toBeInTheDocument();
  });

  it('renders grid layout with two columns', () => {
    const { container } = render(<TestComponent />);
    const gridItems = container.querySelectorAll('[class*="MuiGrid-item"]');
    expect(gridItems).toHaveLength(2);
  });

  it('renders card header', () => {
    const { container } = render(<TestComponent />);
    const cardHeader = container.querySelector('[class*="MuiCardHeader"]');
    expect(cardHeader).toBeInTheDocument();
  });

  it('renders card content', () => {
    const { container } = render(<TestComponent />);
    const cardContent = container.querySelector('[class*="MuiCardContent"]');
    expect(cardContent).toBeInTheDocument();
  });
});
