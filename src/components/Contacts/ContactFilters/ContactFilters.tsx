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
import { ArrowBackIos, ArrowForwardIos } from '@material-ui/icons';
import { isArray } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, FilterGroup } from '../../Shared/Filters/Filter';
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
}

export const ContactFilters: React.FC<Props & BoxProps> = ({
  accountListId,
  ...boxProps
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { data, loading, error } = useContactFiltersQuery({
    variables: { accountListId },
  });

  const [selectedGroup, showGroup] = useState<FilterGroup | null>();
  const [selectedFilters, setSelectedFilters] = useState<{
    [name: string]: any;
  }>({});
  const [showAll, setShowAll] = useState(false);

  const updateSelectedFilter = (name: string, value: any) => {
    if (value && !(isArray(value) && value.length === 0))
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
    group.filters.filter((value) => selectedFilters[value.name]);
  const isGroupVisible = (group: FilterGroup) =>
    group.alwaysVisible || getSelectedFilters(group).length > 0;

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
              <Typography variant="h6">
                {Object.keys(selectedFilters).length > 0
                  ? t('Filter ({{count}})', {
                      count: Object.keys(selectedFilters).length,
                    })
                  : t('Filter')}
              </Typography>
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
              ) : data?.contactFilters?.length === 0 ? (
                <ListItem data-testid="NoFiltersState">
                  <ListItemText
                    primary={t('No Contact Filters Found')}
                    primaryTypographyProps={{ variant: 'subtitle1' }}
                  />
                </ListItem>
              ) : (
                <>
                  {data?.contactFilters?.map((group) => (
                    <Collapse
                      key={group.id}
                      in={showAll || isGroupVisible(group)}
                      data-testid="FilterGroup"
                    >
                      <ListItem button onClick={() => showGroup(group)}>
                        <ListItemText
                          primary={group.title}
                          primaryTypographyProps={{ variant: 'subtitle1' }}
                        />
                        <ArrowForwardIos fontSize="small" color="disabled" />
                      </ListItem>
                    </Collapse>
                  ))}
                  {data?.contactFilters?.some((g) => !isGroupVisible(g)) ===
                  true ? (
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
                onClick={() => showGroup(null)}
                style={{ verticalAlign: 'middle' }}
              >
                <ArrowBackIos fontSize="small" />
              </IconButton>
              <Typography
                variant="h6"
                component="span"
                style={{ verticalAlign: 'middle' }}
              >
                {selectedGroup?.title}
              </Typography>
            </FilterHeader>
            <FilterList dense>
              {selectedGroup?.filters?.map((filter) => (
                <FilterListItem
                  key={filter.id}
                  filter={filter as Filter}
                  value={selectedFilters[filter.name]}
                  onUpdate={(value) => updateSelectedFilter(filter.name, value)}
                />
              ))}
            </FilterList>
          </div>
        </Slide>
      </div>
    </Box>
  );
};
