import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AssignmentCategoryEnum,
  PeopleGroupSupportTypeEnum,
} from 'src/graphql/types.generated';
import { LandingTestWrapper } from './LandingTestWrapper';
import { NewSalaryCalculatorLanding } from './NewSalaryCalculatorLanding';

const mutationSpy = jest.fn();

interface TestComponentProps {
  assignmentCategory?: AssignmentCategoryEnum;
  peopleGroupSupportType?: PeopleGroupSupportTypeEnum;
  hasInProgressCalculation?: boolean;
  hasApprovedCalculation?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  assignmentCategory,
  peopleGroupSupportType,
  hasInProgressCalculation = false,
  hasApprovedCalculation = false,
}) => (
  <LandingTestWrapper
    assignmentCategory={assignmentCategory}
    peopleGroupSupportType={peopleGroupSupportType}
    hasInProgressCalculation={hasInProgressCalculation}
    hasApprovedCalculation={hasApprovedCalculation}
    onCall={mutationSpy}
  >
    <NewSalaryCalculatorLanding />
  </LandingTestWrapper>
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
      await findByRole('heading', { name: 'Doe, John and Jane' }),
    ).toBeInTheDocument();

    expect(await findByTestId('person-numbers')).toHaveTextContent('111111111');
    expect(await findByTestId('amount-one')).toHaveTextContent('$55,000.00');
    expect(await findByTestId('amount-two')).toHaveTextContent('$10,000.00');
  });

  it('renders SalaryInformationCard with correct cell data', async () => {
    const { findByRole } = render(<TestComponent />);

    // Self
    expect(
      await findByRole('heading', { name: '$55,000.00' }),
    ).toBeInTheDocument();

    // Spouse
    expect(
      await findByRole('heading', { name: '$10,000.00' }),
    ).toBeInTheDocument();
  });

  it('renders action button for full time staff with SUPPORTED_RMO', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('button', { name: 'Calculate New Salary' }),
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

  it('shows "Continue Salary Calculation" when there is an in-progress calculation', async () => {
    const { findByRole } = render(<TestComponent hasInProgressCalculation />);

    expect(
      await findByRole('button', { name: 'Continue Salary Calculation' }),
    ).toBeInTheDocument();
  });

  it('shows "Calculate New Salary" when there is no in-progress calculation', async () => {
    const { findByRole } = render(<TestComponent hasApprovedCalculation />);

    expect(
      await findByRole('button', { name: 'Calculate New Salary' }),
    ).toBeInTheDocument();
  });

  it('does not create a new calculation when continuing an in-progress calculation', async () => {
    const mutationSpy = jest.fn();
    const { findByRole } = render(<TestComponent hasInProgressCalculation />);

    userEvent.click(
      await findByRole('button', {
        name: 'Continue Salary Calculation',
      }),
    );

    expect(mutationSpy).not.toHaveGraphqlOperation(
      'CreateSalaryCalculation',
      {},
    );
  });

  it('creates a new calculation when clicking "Calculate New Salary"', async () => {
    const { findByRole } = render(<TestComponent hasApprovedCalculation />);

    userEvent.click(
      await findByRole('button', {
        name: 'Calculate New Salary',
      }),
    );

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('CreateSalaryCalculation', {
        input: {
          attributes: {},
        },
      });
    });
  });

  it('disables button while mutation is in progress', async () => {
    const { findByRole } = render(<TestComponent hasApprovedCalculation />);

    const button = await findByRole('button', {
      name: 'Calculate New Salary',
    });

    userEvent.click(button);
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });
});
