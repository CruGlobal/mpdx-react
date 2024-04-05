import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from '../../../theme';
import { SearchBox } from './SearchBox';

describe('SearchBox', () => {
  it('starts without value', () => {
    const placeholderText = 'placeholder';

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <SearchBox
          showContactSearchIcon={true}
          placeholder={placeholderText}
          onChange={() => {}}
        />
      </ThemeProvider>,
    );

    const textbox = getByRole('textbox');
    expect(textbox).toHaveValue('');
  });

  it('triggers onChange', () => {
    const onChange = jest.fn();
    const inputText = 'name';
    const placeholderText = 'placeholder';

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <SearchBox
          showContactSearchIcon={false}
          placeholder={placeholderText}
          onChange={onChange}
        />
      </ThemeProvider>,
    );

    const textbox = getByRole('textbox');
    expect(textbox).toHaveValue('');
    userEvent.type(textbox, inputText);
    expect(onChange).toHaveBeenCalledWith(inputText);
  });

  it('Clears inputText on cleared activefilter', () => {
    const { getByRole, rerender } = render(
      <ThemeProvider theme={theme}>
        <SearchBox
          showContactSearchIcon={true}
          onChange={() => {}}
          searchTerm={'name'}
        />
      </ThemeProvider>,
    );

    const textbox = getByRole('textbox');
    expect(textbox).toHaveValue('name');

    rerender(
      <ThemeProvider theme={theme}>
        <SearchBox
          showContactSearchIcon={true}
          onChange={() => {}}
          searchTerm={''}
        />
      </ThemeProvider>,
    );

    expect(textbox).toHaveValue('');
  });
});
