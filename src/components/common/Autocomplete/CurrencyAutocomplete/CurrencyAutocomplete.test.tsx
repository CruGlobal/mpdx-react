import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from '../../../../theme';
import { CurrencyAutocomplete } from './CurrencyAutocomplete';

const setSelectedCurrency = jest.fn();

describe('OrganizationAutocomplete', () => {
  it('shows the selected organization', () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <CurrencyAutocomplete
            value={'USD'}
            onChange={(_, currency): void => {
              setSelectedCurrency(currency);
            }}
          />
        </ThemeProvider>
      </LocalizationProvider>,
    );
    expect(getByRole('combobox')).toHaveValue('US Dollar - USD ($)');
  });

  it('changes the selected organization', async () => {
    const { getByRole, findByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <CurrencyAutocomplete
            value={'USD'}
            onChange={(_, currency): void => {
              setSelectedCurrency(currency);
            }}
          />
        </ThemeProvider>
      </LocalizationProvider>,
    );

    expect(getByRole('combobox')).toHaveValue('US Dollar - USD ($)');
    userEvent.type(getByRole('combobox'), 'EUR');
    userEvent.click(
      await findByRole('option', {
        name: 'Euro - EUR (€)',
      }),
    );
    expect(setSelectedCurrency).toHaveBeenCalledWith(setSelectedCurrency);
    expect(getByRole('combobox')).toHaveValue('Euro - EUR (€)');
  });

  it('filters organizations based on input', async () => {
    const { getByRole, findByRole, findAllByRole, queryByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <CurrencyAutocomplete value={null} onChange={setSelectedCurrency} />
        </ThemeProvider>
      </LocalizationProvider>,
    );

    const combobox = getByRole('combobox');
    userEvent.type(combobox, 'WIR');
    expect(await findAllByRole('option')).toHaveLength(1);
    expect(
      await findByRole('option', { name: 'WIR Euro - CHE (CHE)' }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        queryByRole('option', { name: 'US Dollar - USD ($)' }),
      ).not.toBeInTheDocument();
    });
  });
});
