import React, { useMemo } from 'react';
import Close from '@mui/icons-material/Close';
import LocalOffer from '@mui/icons-material/LocalOffer';
import { Box, IconButton, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  FilterHeader,
  FilterList,
  LinkButton,
} from 'src/components/Shared/Filters/FilterPanel';
import theme from 'src/theme';

const FilterItemBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'defaultStyle',
})(({ defaultStyle = false }: { defaultStyle?: boolean }) => ({
  minHeight: '48px',
  padding: '0 16px',
  display: 'flex',
  gap: '10px',
  justifyContent: defaultStyle ? 'space-between' : 'left',
  flexDirection: defaultStyle ? 'initial' : 'row-reverse',
  alignItems: 'center',
  color: theme.palette.primary.dark,
  borderBottom: `1px solid ${theme.palette.cruGrayLight.main}`,
}));

export interface FilterPanelSkeletonProps {
  onClose?: () => void;
  filterTitle?: string;
  filterGroups?: string[];
  defaultStyle?: boolean;
}

export const FilterPanelSkeleton: React.FC<FilterPanelSkeletonProps> = ({
  onClose,
  filterTitle,
  filterGroups,
  defaultStyle = true,
}) => {
  const { t } = useTranslation();

  const contactListFilterGroups = useMemo(
    () => [
      t('Saved Filters'),
      t('Status'),
      t('Contact Location'),
      t('Gift Details'),
    ],
    [],
  );

  const filterItems = filterGroups || contactListFilterGroups;
  const title = filterTitle || t('Filter');

  return (
    <div>
      <FilterHeader>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} aria-label={t('Close')}>
            <Close titleAccess={t('Close')} />
          </IconButton>
        </Box>
        {defaultStyle && (
          <>
            <LinkButton
              style={{ marginInlineStart: theme.spacing(-1) }}
              disabled={true}
            >
              {t('Save')}
            </LinkButton>
            <LinkButton
              style={{ marginInlineStart: theme.spacing(2) }}
              disabled={true}
            >
              {t('Clear All')}
            </LinkButton>
          </>
        )}
      </FilterHeader>

      {defaultStyle && (
        <FilterItemBox>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <LocalOffer />
            <Typography style={{ marginLeft: 8 }}>{t('Tags')}</Typography>
          </Box>
          <Skeleton width="100px" height={50} />
        </FilterItemBox>
      )}

      <FilterList dense sx={{ paddingY: 0 }}>
        {filterItems.map((item, index) => (
          <FilterItemBox
            key={`skeleton-filter-${index}`}
            defaultStyle={defaultStyle}
          >
            <Typography>{item}</Typography>
            <Skeleton width={defaultStyle ? '100px' : '40px'} height={50} />
          </FilterItemBox>
        ))}

        {defaultStyle && (
          <FilterItemBox>
            <Skeleton width="100%" height={50} />
          </FilterItemBox>
        )}
      </FilterList>
    </div>
  );
};
