import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MuiThemeProvider } from '@material-ui/core';
import theme from '../../../theme';
import { SearchBox } from './SearchBox';

it('starts without value', () => {
  const placeholderText = 'placeholder';

  const { getByRole } = render(
    <MuiThemeProvider theme={theme}>
      <SearchBox placeholder={placeholderText} onChange={() => {}} />,
    </MuiThemeProvider>,
  );

  const textbox = getByRole('textbox');

  expect(textbox).toHaveValue('');
});

it('triggers onChange', () => {
  const onChange = jest.fn();
  const inputText = 'name';
  const placeholderText = 'placeholder';

  const { getByRole } = render(
    <MuiThemeProvider theme={theme}>
      <SearchBox placeholder={placeholderText} onChange={onChange} />,
    </MuiThemeProvider>,
  );

  const textbox = getByRole('textbox');

  expect(textbox).toHaveValue('');

  userEvent.type(textbox, inputText);

  expect(textbox).toHaveValue(inputText);
  expect(onChange).toHaveBeenCalledWith(inputText);
});
