import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Icon from '@mdi/react';
import { mdiAccountSearch } from '@mdi/js';

export interface SearchBoxProps {
  onChange: (searchTerm: string) => void;
  startText?: string;
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
  startText,
  placeholder,
}) => {
  const { t } = useTranslation();
  const classes = useStyle();

  return (
    <Input
      className={classes.searchWrapper}
      inputProps={{
        className: classes.input,
      }}
      disableUnderline={true}
      startAdornment={
        <Icon path={mdiAccountSearch} title="Search contacts" size="24px" />
      }
      value={startText}
      placeholder={placeholder ?? t('Search')}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
};
