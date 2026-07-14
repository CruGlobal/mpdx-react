import { render, waitFor, within } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { SupportItemSectionList } from './SupportItemSectionList';

describe('SupportItemSectionList', () => {
  it('renders a single Support Items section as complete when setup is complete', async () => {
    const { findAllByRole } = render(
      <PdsGoalCalculatorTestWrapper>
        <SupportItemSectionList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const items = await findAllByRole('listitem');
    expect(items).toHaveLength(1);

    const [supportItems] = items;
    expect(supportItems).toHaveTextContent('Support Items');

    await waitFor(() => {
      expect(
        within(supportItems).getByTestId('CircleIcon'),
      ).toBeInTheDocument();
    });
  });

  it('renders the Support Items section as incomplete when setup is incomplete', async () => {
    const { findAllByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={{ name: '' }}>
        <SupportItemSectionList />
      </PdsGoalCalculatorTestWrapper>,
    );

    const [supportItems] = await findAllByRole('listitem');
    await waitFor(() => {
      expect(
        within(supportItems).getByTestId('RadioButtonUncheckedIcon'),
      ).toBeInTheDocument();
    });
  });
});
