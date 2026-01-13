import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SalaryCalculatorTestWrapper } from '../../SalaryCalculatorTestWrapper';
import { PersonalInformationSection } from './PersonalInformationSection';

const TestComponent: React.FC<{ hasSpouse?: boolean }> = ({ hasSpouse }) => (
  <SalaryCalculatorTestWrapper hasSpouse={hasSpouse}>
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

  it('should display all category row headers', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('cell', { name: 'Location' })).toBeInTheDocument();
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
    waitFor(() => {
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

    // Self information
    expect(await findByRole('cell', { name: 'Tampa, FL' })).toBeInTheDocument();
    expect(await findByRole('cell', { name: '4 years' })).toBeInTheDocument();
    expect(await findByRole('cell', { name: '34' })).toBeInTheDocument();
    expect(await findByRole('cell', { name: '2' })).toBeInTheDocument();

    // Spouse information
    expect(
      await findByRole('cell', { name: '1000 years' }),
    ).toBeInTheDocument();
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
