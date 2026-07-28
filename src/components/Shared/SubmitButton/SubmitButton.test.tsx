import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmitButton } from './SubmitButton';

describe('SubmitButton', () => {
  it('calls onSubmit when clicked', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByRole } = render(
      <SubmitButton onSubmit={onSubmit}>Submit</SubmitButton>,
    );

    await userEvent.click(getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
