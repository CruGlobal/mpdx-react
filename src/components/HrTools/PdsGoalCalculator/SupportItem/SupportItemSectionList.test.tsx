import { render, waitFor, within } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { SupportItemSectionList } from './SupportItemSectionList';

describe('SupportItemSectionList', () => {
  it('renders Salary and Other as complete when setup is complete', async () => {
    const { findAllByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <SupportItemSectionList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const items = await findAllByRole('listitem');
    expect(items).toHaveLength(2);

    const [salary, other] = items;
    expect(salary).toHaveTextContent('Salary');
    expect(other).toHaveTextContent('Other');

    await waitFor(() => {
      expect(within(salary).getByTestId('CircleIcon')).toBeInTheDocument();
      expect(within(other).getByTestId('CircleIcon')).toBeInTheDocument();
    });
  });

  it('renders Salary and Other as incomplete when setup is incomplete', async () => {
    const { findAllByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={{ name: '' }}>
        <SupportItemSectionList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const [salary, other] = await findAllByRole('listitem');
    await waitFor(() => {
      expect(
        within(salary).getByTestId('RadioButtonUncheckedIcon'),
      ).toBeInTheDocument();
      expect(
        within(other).getByTestId('RadioButtonUncheckedIcon'),
      ).toBeInTheDocument();
    });
  });
});
