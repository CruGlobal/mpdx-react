import { useEffect } from 'react';
import { Autocomplete, Grid, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  ActivityTypeEnum,
  DisplayResultEnum,
  Phase,
} from 'src/graphql/types.generated';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import {
  SetFieldValue,
  SetResultSelected,
  handleResultChange,
} from '../../TaskModalHelper';

export interface ResultAutocompleteProps {
  availableResults: DisplayResultEnum[];
  setFieldValue: SetFieldValue;
  setResultSelected: SetResultSelected;
  result?: DisplayResultEnum | null;
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
  const { getLocalizedResultString } = useLocalizedConstants();

  useEffect(() => {
    if (availableResults.length === 1 && completedAction) {
      handleResultChange({
        result: availableResults[0],
        setFieldValue,
        setResultSelected,
        phaseData,
        completedAction,
      });
    }
  }, [completedAction]);

  return !!availableResults.length ? (
    <Grid item>
      <Autocomplete
        openOnFocus
        autoHighlight
        autoSelect
        value={result}
        options={availableResults}
        getOptionLabel={(result) => getLocalizedResultString(result)}
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
