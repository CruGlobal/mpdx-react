import { Autocomplete, AutocompleteProps, TextField } from '@mui/material';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';

interface CurrencyAutocompleteProps
  extends Partial<AutocompleteProps<any, boolean, boolean, boolean>> {
  textFieldLabel?: string;
  textFieldPlaceholder?: string;
  textFieldStyles?: React.CSSProperties;
  textFieldAutoFocus?: boolean;
  textFieldError?: boolean;
}

export const CurrencyAutocomplete = ({
  textFieldLabel,
  textFieldPlaceholder,
  textFieldStyles,
  textFieldError = false,
  textFieldAutoFocus = true,
  ...props
}: CurrencyAutocompleteProps) => {
  const constants = useApiConstants();
  const currencies = constants?.pledgeCurrency ?? [];

  return (
    <Autocomplete
      fullWidth
      autoHighlight
      {...props}
      options={currencies.map((cur) => cur.code) || []}
      getOptionLabel={(currency): string => {
        const selectedCurrency = currencies.find(
          ({ code }) => code === currency,
        );
        if (!selectedCurrency) {
          return '';
        }
        return `${selectedCurrency.name} - ${selectedCurrency.codeSymbolString}`;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={textFieldPlaceholder}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={textFieldAutoFocus}
          error={textFieldError}
          label={textFieldLabel}
          sx={textFieldStyles}
        />
      )}
    />
  );
};
