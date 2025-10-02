import React from 'react';
import { render } from '@testing-library/react';
import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import { CategoryCheckbox } from './CategoryCheckbox';

const TestComponent: React.FC<{
  category: StaffExpenseCategoryEnum;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ category, checked = false, onChange = () => {} }) => (
  <CategoryCheckbox category={category} checked={checked} onChange={onChange} />
);

describe('CategoryCheckbox', () => {
  it('renders the checkbox with the correct label', () => {
    const { getByRole } = render(
      <TestComponent category={StaffExpenseCategoryEnum.Assessment} />,
    );

    const checkbox = getByRole('checkbox', { name: 'Assessment' });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });
});
