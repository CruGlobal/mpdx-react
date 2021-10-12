import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  InputAdornment,
  TextField,
  styled,
  InputBaseComponentProps,
} from '@material-ui/core';
import { DebounceInput } from 'react-debounce-input';
import Icon from '@mdi/react';
import { mdiAccountSearch } from '@mdi/js';

export interface SearchBoxProps {
  onChange: (searchTerm: string) => void;
  placeholder?: string;
}

export const AccountSearchIcon = styled(Icon)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const AccountSearchBox = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    height: 48,
  },
}));

const DebounceSearchBox: React.ElementType<InputBaseComponentProps> = ({
  onChange,
  ...other
}) => {
  const { t } = useTranslation();

  return (
    <DebounceInput
      {...other}
      debounceTimeout={300}
      placeholder={t('Search List')}
      onChange={(event) => onChange?.(event)}
    />
  );
};

export const SearchBox: React.FC<SearchBoxProps> = ({ onChange }) => {
  return (
    <AccountSearchBox
      onChange={(event) => onChange(event.target.value)}
      size="small"
      variant="outlined"
      InputProps={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inputComponent: DebounceSearchBox as any,
        startAdornment: (
          <InputAdornment position="start">
            <AccountSearchIcon path={mdiAccountSearch} size={1} />
          </InputAdornment>
        ),
      }}
    />
  );
};
