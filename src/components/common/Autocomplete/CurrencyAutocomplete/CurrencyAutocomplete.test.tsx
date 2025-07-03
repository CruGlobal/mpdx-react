import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from '../../../../theme';
import {
  CurrencyAutocomplete,
  PledgeCurrencyOptionFormatEnum,
} from './CurrencyAutocomplete';

const setSelectedCurrency = jest.fn();

describe('CurrencyAutocomplete', () => {
  it('shows the selected currency', () => {
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

  it('changes the selected currency', async () => {
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
    expect(setSelectedCurrency).toHaveBeenCalledWith('EUR');
    expect(getByRole('combobox')).toHaveValue('Euro - EUR (€)');
  });

  it('filters currency based on input', async () => {
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

  it('should show currency in short format', async () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <CurrencyAutocomplete
            value={'USD'}
            format={PledgeCurrencyOptionFormatEnum.Short}
            onChange={(_, currency): void => {
              setSelectedCurrency(currency);
            }}
          />
        </ThemeProvider>
      </LocalizationProvider>,
    );

    expect(getByRole('combobox')).toHaveValue('USD ($)');
  });
});
