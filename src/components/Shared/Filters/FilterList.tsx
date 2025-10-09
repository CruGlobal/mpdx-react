import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, ListItem, ListItemText } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserOptionFragment } from './FilterPanel.generated';

interface FilterListProps {
  filters: UserOptionFragment[];
  showDeleteButton: boolean;
  onFilterSelect: (filter: UserOptionFragment) => void;
  onFilterDelete: (filter: UserOptionFragment) => void;
}

export const FilterList: React.FC<FilterListProps> = ({
  filters,
  showDeleteButton,
  onFilterSelect,
  onFilterDelete,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {filters.map((filter) => {
        const filterName = filter?.key
          ?.replace(/^(graphql_)?saved_(contacts|tasks|)_filter_/, '')
          .replaceAll('_', ' ');

        const isPrewrittenFilter =
          filter.id.startsWith('prewritten-filter-') ||
          filter.key?.includes('saved_contacts_filter_');

        return (
          <ListItem
            key={filter.id}
            button
            secondaryAction={
              showDeleteButton && !isPrewrittenFilter ? (
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
