import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime, Settings } from 'luxon';
import { SalaryCalculatorTestWrapper } from '../../SalaryCalculatorTestWrapper';
import { EffectiveDateBanner } from './EffectiveDateBanner';

const mutationSpy = jest.fn();

const TestComponent = () => (
  <SalaryCalculatorTestWrapper>
    <EffectiveDateBanner onClose={mutationSpy} />
  </SalaryCalculatorTestWrapper>
);

describe('EffectiveDateBanner', () => {
  beforeEach(() => {
    const now = DateTime.fromObject({
      year: DateTime.now().year,
      month: 12,
      day: 10,
    }).toMillis();

    // Mock Settings.now to return December 10th for tests
    Settings.now = () => now;
  });

  it('renders the banner message with this year and next year', async () => {
    const { findByTestId } = render(<TestComponent />);

    const thisYear = DateTime.fromMillis(Settings.now()).year;
    const nextYear = thisYear + 1;

    expect(await findByTestId('effective-date-banner-text')).toHaveTextContent(
      thisYear.toString(),
    );
    expect(await findByTestId('effective-date-banner-text')).toHaveTextContent(
      nextYear.toString(),
    );
  });

  it('calls onClose when the close button is clicked', async () => {
    const { findByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('button'));

    expect(mutationSpy).toHaveBeenCalled();
  });
});
