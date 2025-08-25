import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsCategory } from './SettingsCategory';

describe('SettingsCategory', () => {
  it('renders goal title input field', () => {
    const { getByRole } = render(<SettingsCategory />);

    expect(getByRole('textbox', { name: 'Goal Title' })).toBeInTheDocument();
  });

  it('accepts valid input', () => {
    const { getByRole } = render(<SettingsCategory />);

    const input = getByRole('textbox', { name: 'Goal Title' });
    userEvent.type(input, 'My Goal');
    expect(input).toHaveValue('My Goal');
  });
});
