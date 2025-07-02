import {
  Autocomplete,
  AutocompleteProps,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';

export enum PledgeCurrencyOptionFormatEnum {
  Long = 'long',
  Short = 'short',
}

interface CurrencyAutocompleteProps
  extends Partial<AutocompleteProps<string, boolean, boolean, boolean>> {
  textFieldProps?: Partial<TextFieldProps>;
  format?: PledgeCurrencyOptionFormatEnum;
}

export const CurrencyAutocomplete = ({
  textFieldProps,
  format = PledgeCurrencyOptionFormatEnum.Long,
  ...props
}: CurrencyAutocompleteProps) => {
  const constants = useApiConstants();
  const currencies = constants?.pledgeCurrency ?? [];

  return (
    <Autocomplete
      fullWidth
      autoHighlight
      {...props}
      options={currencies
        .map((cur) => cur.code)
        .filter((code): code is string => typeof code === 'string')}
      getOptionLabel={(currency): string => {
        const selectedCurrency = currencies.find(
          ({ code }) => code === currency,
        );
        if (!selectedCurrency) {
          return '';
        }

        if (format === PledgeCurrencyOptionFormatEnum.Long) {
          return (
            selectedCurrency.name + ' - ' + selectedCurrency.codeSymbolString
          );
        }
        return selectedCurrency.codeSymbolString ?? '';
      }}
      renderInput={(params) => <TextField {...params} {...textFieldProps} />}
    />
  );
};
