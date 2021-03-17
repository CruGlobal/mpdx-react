import React from 'react';
import { useTranslation } from 'react-i18next';

export interface SearchBoxProps {
  searchTerm: string;
  onChange: (searchTerm: string) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  searchTerm,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <input
      value={searchTerm}
      placeholder={t('Search')}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
};
