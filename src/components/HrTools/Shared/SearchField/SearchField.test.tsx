import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchField } from './SearchField';

describe('SearchField', () => {
  it('renders the label and placeholder', () => {
    const { getByRole, getByPlaceholderText } = render(
      <SearchField value="" onChange={jest.fn()} />,
    );

    expect(getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
    expect(getByPlaceholderText('Name, email, etc...')).toBeInTheDocument();
  });

  it('calls onChange with the typed value', () => {
    const onChange = jest.fn();
    const { getByRole } = render(<SearchField value="" onChange={onChange} />);

    userEvent.type(getByRole('textbox', { name: 'Search' }), 'j');

    expect(onChange).toHaveBeenCalledWith('j');
  });
});
