import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MuiThemeProvider } from '@mui/material';
import theme from '../../../theme';
import { SearchBox } from './SearchBox';

it('starts without value', () => {
  const placeholderText = 'placeholder';

  const { getByRole } = render(
    <MuiThemeProvider theme={theme}>
      <SearchBox
        page="contact"
        placeholder={placeholderText}
        onChange={() => {}}
      />
      ,
    </MuiThemeProvider>,
  );

  const textbox = getByRole('textbox');

  expect(textbox).toHaveValue('');
});

it('triggers onChange', async () => {
  const onChange = jest.fn();
  const inputText = 'name';
  const placeholderText = 'placeholder';

  const { getByRole } = render(
    <MuiThemeProvider theme={theme}>
      <SearchBox
        page="task"
        placeholder={placeholderText}
        onChange={onChange}
      />
      ,
    </MuiThemeProvider>,
  );

  const textbox = getByRole('textbox');

  expect(textbox).toHaveValue('');

  userEvent.type(textbox, inputText);

  await new Promise((resolve) => setTimeout(resolve, 300));

  expect(onChange).toHaveBeenCalledWith(inputText);
});
