import {
  Autocomplete,
  AutocompleteProps,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { formatLanguage, languages } from 'src/lib/data/languages';

interface LanguageAutocompleteProps
  extends Partial<
    AutocompleteProps<string | undefined | null, false, boolean, false>
  > {
  TextFieldProps?: Partial<TextFieldProps>;
}

export const LanguageAutocomplete = ({
  TextFieldProps,
  ...props
}: LanguageAutocompleteProps) => {
  return (
    <Autocomplete
      fullWidth
      autoHighlight
      {...props}
      options={languages.map((language) => language.id) || []}
      getOptionLabel={(locale) => formatLanguage(locale)}
      renderInput={(params) => <TextField {...params} {...TextFieldProps} />}
    />
  );
};
