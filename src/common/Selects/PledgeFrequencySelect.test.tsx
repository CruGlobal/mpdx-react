import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from '../../theme';
import { PledgeFrequencySelect } from './PledgeFrequencySelect';

const onChange = jest.fn();
const label = '';
const value = '';

describe('PledgeFrequencySelect', () => {
  it('should render the select', async () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <PledgeFrequencySelect
            label={label}
            value={value}
            onChange={onChange}
          />
        </ThemeProvider>
      </LocalizationProvider>,
    );

    const openDropdown = getByRole('combobox');
    expect(openDropdown).toBeInTheDocument();

    userEvent.click(openDropdown);
    userEvent.click(await getByRole('option', { name: 'Annual' }));
  });
});
