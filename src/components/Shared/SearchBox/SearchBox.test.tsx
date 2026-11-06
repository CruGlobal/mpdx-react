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

  describe('sx', () => {
    it('keeps its own field height when no sx is passed', () => {
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <SearchBox showContactSearchIcon={false} onChange={() => {}} />
        </ThemeProvider>,
      );

      expect(getByRole('textbox').closest('.MuiInputBase-root')).toHaveStyle({
        height: '48px',
      });
    });

    it('applies a passed sx on top of its own styles', () => {
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <SearchBox
            showContactSearchIcon={false}
            onChange={() => {}}
            sx={{ order: 1, '& .MuiInputBase-root': { height: 40 } }}
          />
        </ThemeProvider>,
      );

      const textbox = getByRole('textbox');
      expect(textbox.closest('.MuiTextField-root')).toHaveStyle({
        order: '1',
      });
      expect(textbox.closest('.MuiInputBase-root')).toHaveStyle({
        height: '40px',
      });
    });

    it('applies every style in an sx array', () => {
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <SearchBox
            showContactSearchIcon={false}
            onChange={() => {}}
            sx={[{ order: 1 }, { flexGrow: 1 }]}
          />
        </ThemeProvider>,
      );

      expect(getByRole('textbox').closest('.MuiTextField-root')).toHaveStyle({
        order: '1',
        flexGrow: '1',
      });
    });

    it('still updates the search term when sx is passed', () => {
      const onChange = jest.fn();
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <SearchBox
            showContactSearchIcon={false}
            placeholder="Search Tasks"
            onChange={onChange}
            sx={{ order: 1 }}
          />
        </ThemeProvider>,
      );

      const textbox = getByRole('textbox');
      expect(textbox).toHaveAttribute('placeholder', 'Search Tasks');
      userEvent.type(textbox, 'call');
      expect(onChange).toHaveBeenLastCalledWith('call');
    });
  });
});
