import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { AccountListAutocomplete } from './AccountListAutocomplete';

const setFieldValue = jest.fn();

const mockAccounts = [
  { id: 'account-1', name: 'John Doe Ministry Account' },
  { id: 'account-2', name: 'Jane Smith Support Account' },
  { id: 'account-3', name: 'Global Missions Fund' },
  { id: 'account-4', name: 'Local Church Partnership' },
  { id: 'account-5', name: 'Student Ministry Account' },
];

describe('AccountListAutocomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the selected account', () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <AccountListAutocomplete
            options={mockAccounts}
            value={mockAccounts[0]}
            onChange={(_, value) => {
              setFieldValue(value);
            }}
          />
        </ThemeProvider>
      </LocalizationProvider>,
    );
    expect(getByRole('combobox')).toHaveDisplayValue(
      'John Doe Ministry Account',
    );
  });

  it('changes the selected account', async () => {
    const { getByRole, findByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <AccountListAutocomplete
            options={mockAccounts}
            value={mockAccounts[0]}
            onChange={(_, value) => {
              setFieldValue(value);
            }}
          />
        </ThemeProvider>
      </LocalizationProvider>,
    );

    expect(getByRole('combobox')).toHaveDisplayValue(
      'John Doe Ministry Account',
    );
    userEvent.click(getByRole('combobox'));
    userEvent.click(
      await findByRole('option', {
        name: 'Jane Smith Support Account',
      }),
    );
    expect(setFieldValue).toHaveBeenCalledWith(mockAccounts[1]);
  });

  it('filters accounts based on input', async () => {
    const { getByRole, findAllByRole, queryByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <AccountListAutocomplete
            options={mockAccounts}
            value={null}
            onChange={setFieldValue}
          />
        </ThemeProvider>
      </LocalizationProvider>,
    );

    const combobox = getByRole('combobox');
    userEvent.type(combobox, 'Ministry');

    const options = await findAllByRole('option');
    // "John Doe Ministry Account" and "Student Ministry Account"
    expect(options).toHaveLength(2);

    expect(
      getByRole('option', { name: 'John Doe Ministry Account' }),
    ).toBeInTheDocument();

    expect(
      getByRole('option', { name: 'Student Ministry Account' }),
    ).toBeInTheDocument();

    expect(
      queryByRole('option', { name: 'Global Missions Fund' }),
    ).not.toBeInTheDocument();
  });

  it('handles empty account list', () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <AccountListAutocomplete
            options={[]}
            value={null}
            onChange={setFieldValue}
          />
        </ThemeProvider>
      </LocalizationProvider>,
    );

    expect(getByRole('combobox')).toHaveValue('');
  });

  it('handles invalid account ID', () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <AccountListAutocomplete
            options={mockAccounts}
            value={{ id: '', name: '' }}
            onChange={setFieldValue}
          />
        </ThemeProvider>
      </LocalizationProvider>,
    );

    expect(getByRole('combobox')).toHaveValue('');
  });
});
