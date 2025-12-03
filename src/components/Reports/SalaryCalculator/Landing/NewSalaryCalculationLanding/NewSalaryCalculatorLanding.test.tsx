import { render, waitFor } from '@testing-library/react';
import {
  AssignmentCategoryEnum,
  PeopleGroupSupportTypeEnum,
} from 'src/graphql/types.generated';
import { SalaryCalculatorTestWrapper } from '../../SalaryCalculatorTestWrapper';
import { NewSalaryCalculatorLanding } from './NewSalaryCalculatorLanding';

interface TestComponentProps {
  assignmentCategory?: AssignmentCategoryEnum;
  peopleGroupSupportType?: PeopleGroupSupportTypeEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  assignmentCategory,
  peopleGroupSupportType,
}) => (
  <SalaryCalculatorTestWrapper
    assignmentCategory={assignmentCategory}
    peopleGroupSupportType={peopleGroupSupportType}
  >
    <NewSalaryCalculatorLanding />
  </SalaryCalculatorTestWrapper>
);

describe('NewSalaryCalculatorLanding', () => {
  it('renders main heading', async () => {
    const { findByRole } = render(<TestComponent />);
    expect(
      await findByRole('heading', { name: 'Salary Calculation Form' }),
    ).toBeInTheDocument();
  });

  it('renders NameDisplay contents', async () => {
    const { findByRole, findByTestId } = render(<TestComponent />);
    expect(
      await findByRole('heading', { name: 'Doe, John' }),
    ).toBeInTheDocument();

    expect(await findByTestId('person-numbers')).toHaveTextContent('staff-123');
    expect(await findByTestId('amount-one')).toHaveTextContent('$55,000.00');
    expect(await findByTestId('amount-two')).toHaveTextContent('$10,000.00');
  });

  it('renders SalaryInformationCard with table', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(await findByRole('table')).toBeInTheDocument();
  });

  it('renders action button for full time staff with SUPPORTED_RMO', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('button', { name: 'Continue Salary Calculation' }),
    ).toBeInTheDocument();
  });

  it('does not render action button for part time staff with SUPPORTED_RMO', async () => {
    const { queryByRole } = render(
      <TestComponent
        assignmentCategory={AssignmentCategoryEnum.PartTimeRegular}
        peopleGroupSupportType={PeopleGroupSupportTypeEnum.SupportedRmo}
      />,
    );

    await waitFor(() => {
      expect(
        queryByRole('button', { name: 'Continue Salary Calculation' }),
      ).not.toBeInTheDocument();
    });
  });

  it('does not render action button for part-time staff without SUPPORTED_RMO', async () => {
    const { queryByRole } = render(
      <TestComponent
        assignmentCategory={AssignmentCategoryEnum.PartTimeRegular}
        peopleGroupSupportType={PeopleGroupSupportTypeEnum.Designation}
      />,
    );

    expect(
      queryByRole('button', { name: 'Continue Salary Calculation' }),
    ).not.toBeInTheDocument();
  });

  it('does not render action button for full-time staff without SUPPORTED_RMO', async () => {
    const { queryByRole } = render(
      <TestComponent
        assignmentCategory={AssignmentCategoryEnum.FullTimeRegular}
        peopleGroupSupportType={PeopleGroupSupportTypeEnum.None}
      />,
    );

    await waitFor(() => {
      expect(
        queryByRole('button', { name: 'Continue Salary Calculation' }),
      ).not.toBeInTheDocument();
    });
  });
});
