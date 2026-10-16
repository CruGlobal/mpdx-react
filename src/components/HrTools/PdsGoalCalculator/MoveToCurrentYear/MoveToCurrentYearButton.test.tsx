import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MpdGoalMiscConstantCategoryEnum,
  MpdGoalMiscConstantLabelEnum,
} from 'src/graphql/types.generated';
import {
  GoalCalculatorConstantsMock,
  PdsGoalCalculatorTestWrapper,
  constantsDefault,
} from '../PdsGoalCalculatorTestWrapper';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { MovePdsGoalToCurrentYearMutation } from './MovePdsGoalToCurrentYear.generated';
import { MoveToCurrentYearButton } from './MoveToCurrentYearButton';

const mutationSpy = jest.fn();

// The test setup pins the current date to 2020
const constantsWithMaxes = (
  phone: number,
  internet: number,
): GoalCalculatorConstantsMock => ({
  mpdGoalMiscConstants: [
    ...(constantsDefault.mpdGoalMiscConstants ?? []),
    {
      category: MpdGoalMiscConstantCategoryEnum.ReimbursementsWithMaximum,
      label: MpdGoalMiscConstantLabelEnum.Phone,
      fee: phone,
    },
    {
      category: MpdGoalMiscConstantCategoryEnum.ReimbursementsWithMaximum,
      label: MpdGoalMiscConstantLabelEnum.Internet,
      fee: internet,
    },
  ],
});

interface TestComponentProps {
  currentYearConstantsMock?: GoalCalculatorConstantsMock;
  geographicLocation?: string | null;
  children?: React.ReactNode;
}

const TestComponent: React.FC<TestComponentProps> = ({
  currentYearConstantsMock = constantsWithMaxes(70, 60),
  geographicLocation = 'Orlando, FL',
  children,
}) => (
  <PdsGoalCalculatorTestWrapper<{
    MovePdsGoalToCurrentYear: MovePdsGoalToCurrentYearMutation;
  }>
    calculationMock={{
      calculationsYear: 2019,
      geographicLocation,
      ministryCellPhone: 80,
      ministryInternet: 50,
      // Keeps reimbursable expenses above the floor so the phone change shows in the total
      mpdNewsletter: 300,
    }}
    constantsMock={constantsWithMaxes(80, 50)}
    currentYearConstantsMock={currentYearConstantsMock}
    extraMocks={{
      MovePdsGoalToCurrentYear: {
        moveDesignationSupportCalculationToCurrentYear: {
          designationSupportCalculation: {
            id: 'goal-1',
            calculationsYear: 2020,
          },
        },
      },
    }}
    onCall={mutationSpy}
  >
    <MoveToCurrentYearButton />
    {children}
  </PdsGoalCalculatorTestWrapper>
);

const openDialog = async (
  findByRole: ReturnType<typeof render>['findByRole'],
) => {
  userEvent.click(await findByRole('button', { name: 'Update to 2020 rates' }));
  return findByRole('dialog');
};

describe('MoveToCurrentYearButton', () => {
  it('shows the monthly goal on both years', async () => {
    const { findByRole, getByTestId } = render(<TestComponent />);

    await openDialog(findByRole);

    await waitFor(() =>
      expect(getByTestId('old-year-total')).toHaveTextContent(
        '2019 rates$8,585.59',
      ),
    );
    expect(getByTestId('new-year-total')).toHaveTextContent(
      '2020 rates$8,572.78',
    );
  });

  it('lists the amounts that change', async () => {
    const { findByRole, findByText } = render(<TestComponent />);

    await openDialog(findByRole);

    expect(
      await findByText(
        'Ministry Cell Phone will be lowered from $80.00 to $70.00 (the 2020 max).',
      ),
    ).toBeInTheDocument();
    expect(
      await findByText(
        'Ministry Internet stays at $50.00. The 2020 max is now $60.00.',
      ),
    ).toBeInTheDocument();
    expect(
      await findByText('This change cannot be undone.'),
    ).toBeInTheDocument();
  });

  it('says nothing else changes when no amounts are affected', async () => {
    const { findByRole, findByText } = render(
      <TestComponent currentYearConstantsMock={constantsWithMaxes(80, 50)} />,
    );

    await openDialog(findByRole);

    expect(
      await findByText('None of your entered amounts will change.'),
    ).toBeInTheDocument();
  });

  it('warns when the location is not in the current year list', async () => {
    const { findByRole, findByText } = render(
      <TestComponent
        currentYearConstantsMock={{
          ...constantsWithMaxes(70, 60),
          mpdGoalGeographicConstants: [
            { location: 'None', percentageMultiplier: 0 },
            { location: 'New York, NY', percentageMultiplier: 0.12 },
          ],
        }}
      />,
    );

    await openDialog(findByRole);

    expect(
      await findByText(
        'Orlando, FL is not a 2020 location. After updating, choose a new location on the Setup step.',
      ),
    ).toBeInTheDocument();
  });

  it('does not warn about the location when it is still listed', async () => {
    const { findByRole, findByText, queryByText } = render(<TestComponent />);

    await openDialog(findByRole);

    await findByText('This change cannot be undone.');
    expect(queryByText(/is not a 2020 location/)).not.toBeInTheDocument();
  });

  it('moves the goal and closes when confirmed', async () => {
    const { findByRole, findByText, queryByRole } = render(<TestComponent />);

    await openDialog(findByRole);
    userEvent.click(await findByRole('button', { name: 'Update' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('MovePdsGoalToCurrentYear', {
        id: 'goal-1',
      }),
    );
    expect(await findByText('Goal updated to 2020 rates.')).toBeInTheDocument();
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes without saving when cancelled', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    await openDialog(findByRole);
    userEvent.click(await findByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
    expect(mutationSpy).not.toHaveGraphqlOperation('MovePdsGoalToCurrentYear');
  });

  it('is disabled while another save is in flight', async () => {
    const PendingSave: React.FC = () => {
      const { trackMutation } = usePdsGoalCalculator();
      useEffect(() => {
        trackMutation(new Promise(() => {}));
      }, [trackMutation]);
      return null;
    };

    const { findByRole } = render(
      <TestComponent>
        <PendingSave />
      </TestComponent>,
    );

    expect(
      await findByRole('button', { name: 'Update to 2020 rates' }),
    ).toBeDisabled();
  });
});
