import { render } from '@testing-library/react';
import { SalaryCalculatorLayout } from './SalaryCalculatorLayout';
import { SalaryCalculatorTestWrapper } from './SalaryCalculatorTestWrapper';

const TestComponent: React.FC = () => (
  <SalaryCalculatorTestWrapper>
    <SalaryCalculatorLayout
      sectionListPanel={<div data-testid="section-list" />}
      mainContent={<div data-testid="main-content" />}
      isDrawerOpen={false}
      toggleDrawer={() => {}}
    />
  </SalaryCalculatorTestWrapper>
);

describe('SalaryCalculatorLayout', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('section-list')).toBeInTheDocument();
    expect(getByTestId('main-content')).toBeInTheDocument();
  });
});
