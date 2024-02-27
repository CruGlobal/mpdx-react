import { MenuItem } from '@mui/material';
import { Currency } from 'src/graphql/types.generated';

export const getPledgeCurrencyOptions = (
  pledgeCurrencies: Currency[] | undefined | null,
) => {
  return pledgeCurrencies?.map(
    ({ code, codeSymbolString, name }) =>
      name &&
      code &&
      codeSymbolString && (
        <MenuItem key={code} value={code}>
          {name + ' - ' + codeSymbolString}
        </MenuItem>
      ),
  );
};
