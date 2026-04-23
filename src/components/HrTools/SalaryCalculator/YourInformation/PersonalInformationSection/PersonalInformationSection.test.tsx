import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
  SalaryRequestMock,
} from '../../SalaryCalculatorTestWrapper';
import { PersonalInformationSection } from './PersonalInformationSection';

const TestComponent: React.FC<{
  hasSpouse?: boolean;
  requestMock?: SalaryRequestMock;
  payrollDates?: SalaryCalculatorTestWrapperProps['payrollDates'];
}> = ({ hasSpouse, requestMock, payrollDates }) => (
  <SalaryCalculatorTestWrapper
    hasSpouse={hasSpouse}
    salaryRequestMock={requestMock}
    payrollDates={payrollDates}
  >
    <PersonalInformationSection />
  </SalaryCalculatorTestWrapper>
);

describe('PersonalInformationSection', () => {
  it('should render personal information section with title', async () => {
    const { findByTestId } = render(<TestComponent />);

    expect(
      await findByTestId('personal-information-header'),
    ).toBeInTheDocument();
  });

  it('should display category row headers', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    expect(
      await findByRole('combobox', {
        name: 'Nearest Geographic Multiplier Location',
      }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Tenure' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Age' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Children' })).toBeInTheDocument();
  });

  it('only displays one staff name if single', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent hasSpouse={false} />,
    );

    expect(
      await findByRole('columnheader', { name: 'John' }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        queryByRole('columnheader', { name: 'Jane' }),
      ).not.toBeInTheDocument();
    });
  });

  it('should display table headers with staff and spouse names for married couple', async () => {
    const { findByRole } = render(<TestComponent hasSpouse={true} />);

    expect(
      await findByRole('columnheader', { name: 'Jane' }),
    ).toBeInTheDocument();
  });

  it('should display married personal information values correctly', async () => {
    const { findByRole } = render(<TestComponent />);

    const locationCombobox = await findByRole('combobox', {
      name: 'Nearest Geographic Multiplier Location',
    });
    await waitFor(() => {
      expect(locationCombobox).toHaveValue('');
    });

    expect(await findByRole('cell', { name: '4 years' })).toBeInTheDocument();
    expect(await findByRole('cell', { name: '34' })).toBeInTheDocument();
    expect(await findByRole('cell', { name: '2' })).toBeInTheDocument();

    // Spouse information
    expect(
      await findByRole('cell', { name: '1000 years' }),
    ).toBeInTheDocument();
  });

  it('should display saved location and show available options', async () => {
    const { findByRole, findAllByRole } = render(
      <TestComponent
        requestMock={{
          location: 'Miami, FL',
        }}
      />,
    );

    const locationCombobox = await findByRole('combobox', {
      name: 'Nearest Geographic Multiplier Location',
    });

    await waitFor(() => {
      expect(locationCombobox).toHaveValue('Miami, FL');
    });

    userEvent.click(await findByRole('button', { name: 'Open' }));

    expect(await findAllByRole('option')).toHaveLength(2);
  });

  it('should render the effective paycheck note when payroll dates match', async () => {
    const { findByRole } = render(
      <TestComponent
        requestMock={{ effectiveDate: '2026-06-01' }}
        payrollDates={[
          { startDate: '2026-06-01', regularProcessDate: '2026-06-10' },
        ]}
      />,
    );

    expect(await findByRole('note')).toHaveTextContent(
      'Values shown reflect the paycheck dated 6/10/2026.',
    );
  });

  it('should not display spouse information when no spouse exists', async () => {
    const { queryByRole } = render(<TestComponent hasSpouse={false} />);

    await waitFor(() => {
      expect(
        queryByRole('cell', { name: '1000 years' }),
      ).not.toBeInTheDocument();
    });
  });
});
