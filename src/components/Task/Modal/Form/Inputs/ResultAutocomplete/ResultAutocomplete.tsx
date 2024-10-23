import { useEffect } from 'react';
import { Autocomplete, Grid, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  ActivityTypeEnum,
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

export interface ResultAutocompleteProps {
  availableResults: ResultEnum[] | DisplayResultEnum[];
  setFieldValue: SetFieldValue;
  setResultSelected: SetResultSelected;
  result?: ResultEnum | DisplayResultEnum | null;
  phaseData: Phase | null;
  completedAction: ActivityTypeEnum | null;
}

export const ResultAutocomplete: React.FC<ResultAutocompleteProps> = ({
  availableResults,
  setFieldValue,
  setResultSelected,
  result,
  phaseData,
  completedAction,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (availableResults.length === 1) {
      handleResultChange({
        result: availableResults[0],
        setFieldValue,
        setResultSelected,
        phaseData,
      });
    }
  }, [availableResults]);

  return !!availableResults.length ? (
    <Grid item>
      <Autocomplete
        openOnFocus
        autoHighlight
        autoSelect
        value={result}
        options={availableResults}
        getOptionLabel={(result) => getLocalizedResultString(t, result)}
        renderInput={(params) => <TextField {...params} label={t('Result')} />}
        onChange={(_, value) => {
          handleResultChange({
            result: value,
            setFieldValue,
            setResultSelected,
            phaseData,
            completedAction,
          });
        }}
      />
    </Grid>
  ) : null;
};
