import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from '../../theme';
import { PledgeFrequencySelect } from './PledgeFrequencySelect';

const mockOnChange = jest.fn();
const label = '';
const value = '';

describe('PledgeFrequencySelect', () => {
  it('should render the select', () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <PledgeFrequencySelect
            label={label}
            value={value}
            onChange={mockOnChange}
          />
        </ThemeProvider>
      </LocalizationProvider>,
    );

    userEvent.click(getByRole('combobox'));
    userEvent.click(getByRole('option', { name: 'Annual' }));

    const mockValue = mockOnChange.mock.calls[0][0];
    expect(mockValue.target.value).toEqual('ANNUAL');
  });
});
