import { ThemeProvider } from '@emotion/react';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from '../../theme';
import { AddressLocationSelect } from './AddressLocationSelect';

const mockOnChange = jest.fn();
const name = '';
const label = '';
const value = '';

describe('AddressLocationSelect', () => {
  it('should render the select', () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <AddressLocationSelect
            name={name}
            label={label}
            value={value}
            onChange={mockOnChange}
          />
        </ThemeProvider>
      </LocalizationProvider>,
    );

    userEvent.click(getByRole('combobox'));
    userEvent.click(getByRole('option', { name: 'Home' }));

    const mockValue = mockOnChange.mock.calls[0][0];
    expect(mockValue.target.value).toEqual('Home');
  });
});
