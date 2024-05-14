import { FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  DisplayResultEnum,
  Phase,
  ResultEnum,
} from 'src/graphql/types.generated';
import { getLocalizedResultString } from 'src/utils/functions/getLocalizedResultStrings';
import {
  SetFieldValue,
  SetResultSelected,
  handleResultChange,
} from '../../TaskModalHelper';

export interface ResultSelectProps {
  availableResults: ResultEnum[] | DisplayResultEnum[];
  setFieldValue: SetFieldValue;
  setResultSelected: SetResultSelected;
  result?: ResultEnum | DisplayResultEnum | null;
  phaseData: Phase | null;
}

export const ResultSelect: React.FC<ResultSelectProps> = ({
  availableResults,
  setFieldValue,
  setResultSelected,
  result,
  phaseData,
}) => {
  const { t } = useTranslation();

  return !!availableResults.length ? (
    <Grid item>
      <FormControl fullWidth required>
        <InputLabel id="result">{t('Result')}</InputLabel>
        <Select
          labelId="result"
          label={t('Result')}
          value={result}
          onChange={(e) => {
            handleResultChange({
              result: e.target.value,
              setFieldValue,
              setResultSelected,
              phaseData,
            });
          }}
        >
          {availableResults.map((result) => (
            <MenuItem key={result} value={result}>
              {getLocalizedResultString(t, result)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  ) : null;
};
