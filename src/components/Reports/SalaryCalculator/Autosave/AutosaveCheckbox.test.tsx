import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SalaryCalculatorTestWrapper } from '../SalaryCalculatorTestWrapper';
import { AutosaveCheckbox } from './AutosaveCheckbox';

const mutationSpy = jest.fn();

interface TestComponentProps {
  manuallySplitCap?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  manuallySplitCap = false,
}) => (
  <SalaryCalculatorTestWrapper
    salaryRequestMock={{ manuallySplitCap }}
    onCall={mutationSpy}
  >
    <AutosaveCheckbox fieldName="manuallySplitCap" aria-label="Split cap" />
  </SalaryCalculatorTestWrapper>
);

describe('AutosaveCheckbox', () => {
  it('initializes unchecked', async () => {
    const { findByRole } = render(<TestComponent manuallySplitCap={false} />);

    expect(await findByRole('checkbox')).not.toBeChecked();
  });

  it('initializes checked', async () => {
    const { findByRole } = render(<TestComponent manuallySplitCap={true} />);

    expect(await findByRole('checkbox')).toBeChecked();
  });

  it('saves true when checked', async () => {
    const { findByRole } = render(<TestComponent manuallySplitCap={false} />);

    userEvent.click(await findByRole('checkbox'));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSalaryCalculation', {
        input: {
          attributes: {
            manuallySplitCap: true,
          },
        },
      }),
    );
  });

  it('saves false when unchecked', async () => {
    const { findByRole } = render(<TestComponent manuallySplitCap={true} />);

    const checkbox = await findByRole('checkbox');
    userEvent.click(checkbox);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateSalaryCalculation', {
        input: {
          attributes: {
            manuallySplitCap: false,
          },
        },
      }),
    );
  });
});
