import {
  Box,
  BoxProps,
  CircularProgress,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Slide,
  styled,
  Typography,
} from '@material-ui/core';
import { ArrowBackIos, ArrowForwardIos } from '@material-ui/icons';
import { isArray } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContactFilterGroup } from '../../../../graphql/types.generated';
import { Filter } from '../../Shared/Filters/Filter';
import { FilterListItem } from '../../Shared/Filters/FilterListItem';
import { FilterListItemShowAll } from '../../Shared/Filters/FilterListItemShowAll';
import { useContactFiltersQuery } from './ContactFilters.generated';

const FilterHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.grey[200],
}));

const FilterList = styled(List)(() => ({
  '& .MuiListItemIcon-root': {
    minWidth: '37px',
  },
  '& .FilterListItemMultiselect-root': {
    marginBottom: '32px',
  },
}));

interface Props {
  accountListId: string;
}

export const ContactFilters: React.FC<Props & BoxProps> = ({
  accountListId,
  ...boxProps
}) => {
  const { data, loading, error } = useContactFiltersQuery({
    variables: { accountListId },
  });
  const { t } = useTranslation();

  const [selectedGroup, showGroup] = useState<null | ContactFilterGroup>(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showAll, setShowAll] = useState(false);

  const updateSelectedFilter = (name: string, value) => {
    if (value && !(isArray(value) && value.length == 0))
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

  const getSelectedFilters = (group: ContactFilterGroup) =>
    group.filters.filter((value) => selectedFilters[value.name]);
  const isGroupVisible = (group: ContactFilterGroup) =>
    group.alwaysVisible || getSelectedFilters(group).length > 0;

  return (
    <Box {...boxProps}>
      <div style={{ overflow: 'hidden' }}>
        <Slide
          in={selectedGroup == null}
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
              ) : data?.contactFilters?.length == 0 ? (
                <ListItem data-testid="NoFiltersState">
                  <ListItemText
                    primary={t('No Contact Filters Found')}
                    primaryTypographyProps={{ variant: 'subtitle1' }}
                  />
                </ListItem>
              ) : (
                <>
                  {data?.contactFilters?.map((group: ContactFilterGroup) => (
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
                  {data?.contactFilters?.some(
                    (g: ContactFilterGroup) => !isGroupVisible(g),
                  ) == true ? (
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
        <Slide
          in={selectedGroup != null}
          direction="left"
          mountOnEnter
          unmountOnExit
        >
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
