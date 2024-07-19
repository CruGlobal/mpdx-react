import { MenuItem } from '@mui/material';
import { Currency } from 'src/graphql/types.generated';

export const getPledgeCurrencyOptions = (
  pledgeCurrencies: Currency[] | undefined | null,
  format = 'long',
) => {
  return pledgeCurrencies?.map(
    ({ code, codeSymbolString, name }) =>
      name &&
      code &&
      codeSymbolString && (
        <MenuItem key={code} value={code}>
          {format === 'long'
            ? name + ' - ' + codeSymbolString
            : codeSymbolString}
        </MenuItem>
      ),
  );
};
