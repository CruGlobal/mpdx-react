import React from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@material-ui/core/styles';
import { DebounceInput } from 'react-debounce-input';
import Icon from '@mdi/react';
import { mdiAccountSearch } from '@mdi/js';
import { InputAdornment, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

export interface SearchBoxProps {
  onChange: (searchTerm: string) => void;
  placeholder?: string;
  page: 'task' | 'contact';
}

const SearchInput = styled(TextField)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
    color: theme.palette.text.secondary,
  borderWidth: '2px',
  borderColor: theme.palette.cruGrayLight.main,
  borderStyle: 'solid',
  borderRadius: '5px',
  padding: '0',
  overflow: 'hidden',
  lineHeight: '24px',
  marginLeft: '16px',
  fontSize: '16px',
  width: 'auto',
  height: 'auto',
  minWidth: '176px',
  '&::placeholder': {
    color: theme.palette.text.secondary,
    opacity: 1,
  },
}));

const DebounceSearchBox: React.ElementType<InputBaseComponentProps> = ({
  onChange,
  placeholder,
  page,
}) => {
  const { t } = useTranslation();

  return (
    <DebounceInput
      element={(e) => {
        return (
          <SearchInput
            size="small"
            onChange={e.onChange}
            value={e.value}
            variant="outlined"
            placeholder={placeholder ?? t('Search')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {/* TODO Use PersonSearch icon that is avaiable in MUIv5 */}
                  {page === 'contact' ? <SearchIcon /> : <SearchIcon />}
                </InputAdornment>
              ),
            }}
          />
        );
      }}
      debounceTimeout={300}
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
