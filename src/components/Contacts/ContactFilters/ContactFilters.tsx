import {
  Box,
  BoxProps,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Slide,
  styled,
  Typography,
  useTheme,
} from '@material-ui/core';
import { ArrowBackIos, ArrowForwardIos, Close } from '@material-ui/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterGroup } from '../../../../graphql/types.generated';
import { FilterListItem } from '../../Shared/Filters/FilterListItem';
import { FilterListItemShowAll } from '../../Shared/Filters/FilterListItemShowAll';
import { useContactFiltersQuery } from './ContactFilters.generated';

const FilterHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.grey[200],
}));

const FilterList = styled(List)(({ theme }) => ({
  '& .MuiListItemIcon-root': {
    minWidth: '37px',
  },
  '& .FilterListItemMultiselect-root': {
    marginBottom: theme.spacing(4),
  },
}));

const LinkButton = styled(Button)(() => ({
  minWidth: 0,
  textTransform: 'none',
}));

interface Props {
  accountListId: string;
  onClose: () => void;
}

export const ContactFilters: React.FC<Props & BoxProps> = ({
  accountListId,
  onClose,
  ...boxProps
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { data, loading, error } = useContactFiltersQuery({
    variables: { accountListId },
  });

  const [selectedGroup, showGroup] = useState<FilterGroup>();
  const [selectedFilters, setSelectedFilters] = useState<{
    [name: string]: boolean | string | Array<string>;
  }>({});
  const [showAll, setShowAll] = useState(false);

  const updateSelectedFilter = (
    name: string,
    value?: boolean | string | Array<string>,
  ) => {
    if (value)
      setSelectedFilters((prev) => {
        return { ...prev, [name]: value };
      });
    else
      setSelectedFilters((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
  };

  const getSelectedFilters = (group: FilterGroup) =>
    group.filters.filter((value) => selectedFilters[value.title]);
  const isGroupVisible = (group: FilterGroup) =>
    getSelectedFilters(group).length > 0;

  return (
    <Box {...boxProps}>
      <div style={{ overflow: 'hidden' }}>
        <Slide
          in={!selectedGroup}
          direction="right"
          appear={false}
          mountOnEnter
          unmountOnExit
        >
          <div>
            <FilterHeader>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">
                  {Object.keys(selectedFilters).length > 0
                    ? t('Filter ({{count}})', {
                        count: Object.keys(selectedFilters).length,
                      })
                    : t('Filter')}
                </Typography>
                <IconButton onClick={onClose}>
                  <Close titleAccess={t('Close')} />
                </IconButton>
              </Box>
              <LinkButton
                color="primary"
                style={{ marginInlineStart: theme.spacing(-1) }}
                disabled={Object.keys(selectedFilters).length === 0}
                onClick={() => alert('TODO')}
              >
                {t('Save')}
              </LinkButton>
              <LinkButton
                color="primary"
                style={{ marginInlineStart: theme.spacing(2) }}
                disabled={Object.keys(selectedFilters).length === 0}
                onClick={() => setSelectedFilters({})}
              >
                {t('Clear All')}
              </LinkButton>
            </FilterHeader>
            <FilterList dense>
              {error && (
                <ListItem data-testid="ErrorState">
                  <ListItemText
                    primary={error.toString()}
                    primaryTypographyProps={{
                      variant: 'subtitle1',
                      color: 'error',
                    }}
                  />
                </ListItem>
              )}
              {loading ? (
                <ListItem data-testid="LoadingState">
                  <CircularProgress />
                </ListItem>
              ) : data?.accountList.contactFilterGroups.length === 0 ? (
                <ListItem data-testid="NoFiltersState">
                  <ListItemText
                    primary={t('No Contact Filters Found')}
                    primaryTypographyProps={{ variant: 'subtitle1' }}
                  />
                </ListItem>
              ) : (
                <>
                  {data?.accountList.contactFilterGroups.map((group) => (
                    <Collapse
                      key={group.name}
                      in={showAll || isGroupVisible(group)}
                      data-testid="FilterGroup"
                    >
                      <ListItem button onClick={() => showGroup(group)}>
                        <ListItemText
                          primary={group.name}
                          primaryTypographyProps={{ variant: 'subtitle1' }}
                        />
                        <ArrowForwardIos fontSize="small" color="disabled" />
                      </ListItem>
                    </Collapse>
                  ))}
                  {data?.accountList.contactFilterGroups.some(
                    (g) => !isGroupVisible(g),
                  ) ? (
                    <FilterListItemShowAll
                      showAll={showAll}
                      onToggle={() => setShowAll(!showAll)}
                    />
                  ) : null}
                </>
              )}
            </FilterList>
          </div>
        </Slide>
        <Slide in={!!selectedGroup} direction="left" mountOnEnter unmountOnExit>
          <div>
            <FilterHeader>
              <IconButton
                size="small"
                edge="start"
                onClick={() => showGroup(undefined)}
                style={{ verticalAlign: 'middle' }}
              >
                <ArrowBackIos fontSize="small" />
              </IconButton>
              <Typography
                variant="h6"
                component="span"
                style={{ verticalAlign: 'middle' }}
              >
                {selectedGroup?.name}
              </Typography>
            </FilterHeader>
            <FilterList dense>
              {selectedGroup?.filters?.map((filter) => (
                <FilterListItem
                  key={filter.filterKey}
                  filter={filter}
                  value={selectedFilters[filter.title]}
                  onUpdate={(value) =>
                    updateSelectedFilter(filter.title, value)
                  }
                />
              ))}
            </FilterList>
          </div>
        </Slide>
      </div>
    </Box>
  );
};
