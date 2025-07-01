import {
  Autocomplete,
  AutocompleteProps,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';

interface CurrencyAutocompleteProps
  extends Partial<AutocompleteProps<string, boolean, boolean, boolean>> {
  textFieldProps?: Partial<TextFieldProps>;
}

export const CurrencyAutocomplete = ({
  textFieldProps,
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
        return `${selectedCurrency.name} - ${selectedCurrency.codeSymbolString}`;
      }}
      renderInput={(params) => <TextField {...params} {...textFieldProps} />}
    />
  );
};
