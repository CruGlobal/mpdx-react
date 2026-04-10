import { render, waitFor } from '@testing-library/react';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { FourOhThreeBSection } from './403bSection';

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = (props) => (
  <SalaryCalculatorTestWrapper
    hcmUser={{
      fourOThreeB: { maximumContributionLimit: 10001 },
    }}
    hcmSpouse={{
      fourOThreeB: { maximumContributionLimit: 20001 },
    }}
    {...props}
  >
    <FourOhThreeBSection />
  </SalaryCalculatorTestWrapper>
);

describe('403bSection', () => {
  describe('married', () => {
    it('should render table headers', async () => {
      const { getAllByRole } = render(<TestComponent />);

      await waitFor(() =>
        expect(
          getAllByRole('columnheader').map((cell) => cell.textContent),
        ).toEqual(['Category', 'John', 'Jane']),
      );

      await waitFor(() =>
        expect(
          getAllByRole('rowheader').map((cell) => cell.textContent),
        ).toEqual([
          'Current Tax-Deferred Contribution Percent',
          'Current Roth 403(b) Contribution Percent',
          'Maximum Contribution Limit',
        ]),
      );
    });

    it('should render table cells with formatted values', async () => {
      const { getAllByRole } = render(<TestComponent />);

      const expectedCells = [
        ['5.00%', '8.00%'],
        ['12.00%', '10.00%'],
        ['$10,001.00', '$20,001.00'],
      ].flat();

      await waitFor(() =>
        expect(getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
          expectedCells,
        ),
      );
    });
  });

  describe('single', () => {
    it('should render table headers', async () => {
      const { getAllByRole } = render(<TestComponent hasSpouse={false} />);

      await waitFor(() =>
        expect(
          getAllByRole('columnheader').map((cell) => cell.textContent),
        ).toEqual(['Category', 'John']),
      );

      await waitFor(() =>
        expect(
          getAllByRole('rowheader').map((cell) => cell.textContent),
        ).toEqual([
          'Current Tax-Deferred Contribution Percent',
          'Current Roth 403(b) Contribution Percent',
          'Maximum Contribution Limit',
        ]),
      );
    });

    it('should render table cells with formatted values', async () => {
      const { getAllByRole } = render(<TestComponent hasSpouse={false} />);

      const expectedCells = ['5.00%', '12.00%', '$10,001.00'];

      await waitFor(() =>
        expect(getAllByRole('cell').map((cell) => cell.textContent)).toEqual(
          expectedCells,
        ),
      );
    });
  });
});
