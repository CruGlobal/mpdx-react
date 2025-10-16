import { render } from '@testing-library/react';
import { GoalCalculatorTestWrapper } from '../GoalCalculatorTestWrapper';
import { SettingsSectionList } from './SettingsSectionList';

describe('SettingsSectionList', () => {
  it('renders correctly', async () => {
    const { getByText, findByText } = render(
      <GoalCalculatorTestWrapper>
        <SettingsSectionList />
      </GoalCalculatorTestWrapper>,
    );

    expect(getByText('Information')).toBeInTheDocument();
    expect(await findByText('Special Income')).toBeInTheDocument();
  });
});
