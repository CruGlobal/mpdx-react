import React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { DebounceInput } from 'react-debounce-input';

export interface SearchBoxProps {
  onChange: (searchTerm: string) => void;
  placeholder?: string;
}

const useStyle = makeStyles((theme: Theme) => ({
  searchWrapper: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.text.secondary,
    borderWidth: '2px',
    borderColor: theme.palette.cruGrayLight.main,
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px 16px',
    overflow: 'hidden',
  },
  input: {
    backgroundColor: 'transparent',
    lineHeight: '24px',
    padding: '0',
    marginLeft: '16px',
    fontSize: '16px',
    width: 'auto',
    height: 'auto',
    minWidth: '176px',
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 1,
    },
  },
}));

export const SearchBox: React.FC<SearchBoxProps> = ({
  onChange,
  placeholder,
}) => {
  const { t } = useTranslation();
  const classes = useStyle();

  return (
    <DebounceInput
      className={classes.searchWrapper}
      debounceTimeout={300}
      placeholder={placeholder ?? t('Search')}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
};
