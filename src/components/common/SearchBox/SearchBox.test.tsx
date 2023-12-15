import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from '../../../theme';
import { SearchBox } from './SearchBox';

it('starts without value', () => {
  const placeholderText = 'placeholder';

  const { getByRole } = render(
    <ThemeProvider theme={theme}>
      <SearchBox
        showContactSearchIcon={true}
        placeholder={placeholderText}
        onChange={() => {}}
      />
      ,
    </ThemeProvider>,
  );

  const textbox = getByRole('textbox');

  expect(textbox).toHaveValue('');
});

it('triggers onChange', async () => {
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
      ,
    </ThemeProvider>,
  );

  const textbox = getByRole('textbox');

  expect(textbox).toHaveValue('');

  userEvent.type(textbox, inputText);

  await new Promise((resolve) => setTimeout(resolve, 300));

  expect(onChange).toHaveBeenCalledWith(inputText);
});
