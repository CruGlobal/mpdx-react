import React from 'react';
import { useTranslation } from 'react-i18next';
import { PersonAdd } from '@material-ui/icons';
import { Input } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';

export interface SearchBoxProps {
  searchTerm: string;
  onChange: (searchTerm: string) => void;
}

const useStyle = makeStyles((theme: Theme) => ({
  searchWrapper: {
    backgroundColor: '#EBECEC',
    color: theme.palette.text.secondary,
    borderRadius: '5px',
    padding: '16px',
  },
  input: {
    backgroundColor: 'cyan',
    lineHeight: '20px',
    padding: '0',
    marginLeft: '17px',
  }
}));

export const SearchBox: React.FC<SearchBoxProps> = ({
  searchTerm,
  onChange,
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
      startAdornment={<PersonAdd />}
      value={searchTerm}
      placeholder={t('Search')}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
};
