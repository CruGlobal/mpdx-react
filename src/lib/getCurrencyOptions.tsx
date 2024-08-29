import { MenuItem } from '@mui/material';
import { Currency } from 'src/graphql/types.generated';

export enum PledgeCurrencyOptionFormatEnum {
  Long = 'long',
  Short = 'short',
}

export const getPledgeCurrencyOptions = (
  pledgeCurrencies: Currency[] | undefined | null,
  format = PledgeCurrencyOptionFormatEnum.Long,
) => {
  return pledgeCurrencies?.map(
    ({ code, codeSymbolString, name }) =>
      name &&
      code &&
      codeSymbolString && (
        <MenuItem key={code} value={code}>
          {format === PledgeCurrencyOptionFormatEnum.Long
            ? name + ' - ' + codeSymbolString
            : codeSymbolString}
        </MenuItem>
      ),
  );
};
