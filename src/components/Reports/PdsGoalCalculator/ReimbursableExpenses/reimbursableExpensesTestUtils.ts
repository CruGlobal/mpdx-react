import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export const editAmountCell = async (
  findByRole: ReturnType<typeof render>['findByRole'],
  rowLabel: string,
  newValue: string,
) => {
  const row = await findByRole('row', { name: new RegExp(rowLabel) });
  userEvent.dblClick(row.querySelector('[data-field="amount"]')!);
  const input = await findByRole('spinbutton');
  userEvent.clear(input);
  userEvent.type(input, newValue);
  userEvent.tab();
};
