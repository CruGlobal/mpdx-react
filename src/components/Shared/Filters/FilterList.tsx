import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, ListItem, ListItemText } from '@mui/material';
import { TFunction, useTranslation } from 'react-i18next';
import { UserOptionFragment } from './FilterPanel.generated';
import { isPredefinedFilter } from './helpers';

interface FilterListProps {
  filters: UserOptionFragment[];
  onFilterSelect: (filter: UserOptionFragment) => void;
  onFilterDelete: (filter: UserOptionFragment) => void;
}

const getPredefinedFilterLabel = (id: string, t: TFunction): string | null => {
  switch (id) {
    case 'pre-defined-filter-one-or-more-gifts':
      return t('Gave One or More Gifts');
    case 'pre-defined-filter-given-in-last-2-years':
      return t('Gave in the Last 2 Years');
    case 'pre-defined-filter-lost-partners':
      return t('Lost Partners');
    case 'pre-defined-filter-last-full-12-months':
      return t('Last Full 12 Months');
    case 'pre-defined-filter-last-full-month':
      return t('Last Full Month');
    case 'pre-defined-filter-month-to-date':
      return t('Month to Date');
    case 'pre-defined-filter-year-to-date':
      return t('Year to Date');
    default:
      return null;
  }
};

export const FilterList: React.FC<FilterListProps> = ({
  filters,
  onFilterSelect,
  onFilterDelete,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {filters.map((filter) => {
        const isPredefined = isPredefinedFilter(filter);
        const filterName =
          (isPredefined ? getPredefinedFilterLabel(filter.id, t) : null) ??
          filter.key
            .replace(/^(graphql_)?saved_(contacts|tasks|)_filter_/, '')
            .replaceAll('_', ' ');

        return (
          <ListItem
            key={filter.id}
            button
            secondaryAction={
              !isPredefined ? (
                <IconButton
                  edge="end"
                  aria-label={t('Delete')}
                  data-testid="deleteSavedFilter"
                  onClick={() => onFilterDelete(filter)}
                >
                  <DeleteIcon />
                </IconButton>
              ) : undefined
            }
          >
            <ListItemText
              onClick={() => onFilterSelect(filter)}
              primary={filterName}
              primaryTypographyProps={{
                variant: 'subtitle1',
              }}
            />
          </ListItem>
        );
      })}
    </>
  );
};
