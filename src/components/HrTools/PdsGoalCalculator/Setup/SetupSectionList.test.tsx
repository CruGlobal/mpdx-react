import { render, waitFor, within } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { SetupSectionList } from './SetupSectionList';

describe('SetupSectionList', () => {
  it('renders the Setup section as complete when calculation has all required fields', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <SetupSectionList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const setupItem = await findByRole('listitem');
    expect(setupItem).toHaveTextContent('Setup');
    await waitFor(() =>
      expect(within(setupItem).getByTestId('CircleIcon')).toBeInTheDocument(),
    );
  });

  it('renders the Setup section as incomplete when calculation is missing required fields', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={{ name: '' }}>
        <SetupSectionList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const setupItem = await findByRole('listitem');
    expect(setupItem).toHaveTextContent('Setup');
    await waitFor(() =>
      expect(
        within(setupItem).getByTestId('RadioButtonUncheckedIcon'),
      ).toBeInTheDocument(),
    );
  });
});
