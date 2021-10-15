import React, { ReactElement } from 'react';
import {
  Box,
  Checkbox,
  styled,
  IconButton,
  Hidden,
  Theme,
} from '@material-ui/core';
import { FilterList } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { ContactFilterSetInput } from '../../../../../graphql/types.generated';
import { StarredItemIcon } from '../../../common/StarredItemIcon/StarredItemIcon';
import { SearchBox } from '../../../common/SearchBox/SearchBox';

export enum CheckBoxState {
  'unchecked',
  'checked',
  'partial',
}

interface Props {
  activeFilters: boolean;
  checkBoxState?: CheckBoxState;
  filterPanelOpen: boolean;
  starredFilter: ContactFilterSetInput;
  toggleStarredFilter: (filter: ContactFilterSetInput) => void;
  toggleFilterPanel: () => void;
  onCheckAll?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchTermChanged: (searchTerm: string) => void;
  totalCount?: number;
  viewMode?: ContactsTableViewMode;
  onViewChange?: (
    event: React.MouseEvent<HTMLElement>,
    viewMode: ContactsTableViewMode | null,
  ) => void;
  buttonGroup?: ReactElement;
}

type ContactsTableViewMode = 'list' | 'columns';

const HeaderWrap = styled(Box)(({ theme }) => ({
  height: 96,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  backgroundColor: theme.palette.common.white,
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
}));
const FilterButton = styled(
  ({ activeFilters: _activeFilters, panelOpen: _panelOpen, ...props }) => (
    <IconButton {...props} />
  ),
)(
  ({
    theme,
    activeFilters,
    panelOpen,
  }: {
    theme: Theme;
    activeFilters: boolean;
    panelOpen: boolean;
  }) => ({
    display: 'inline-block',
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: theme.spacing(1),
    backgroundColor: activeFilters
      ? theme.palette.cruYellow.main
      : panelOpen
      ? theme.palette.secondary.dark
      : 'transparent',
  }),
);
const FilterIcon = styled(FilterList)(({ theme }) => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));
const ContactsShowingText = styled('p')(({ theme }) => ({
  flexGrow: 4,
  flexBasis: 0,
  margin: theme.spacing(1),
  color: theme.palette.text.secondary,
}));
const PlaceholderActionsDropdown = styled(Box)(({ theme }) => ({
  display: 'inline-block',
  width: 114,
  height: 48,
  margin: theme.spacing(1),
  backgroundColor: 'red',
}));

const StarIconWrap = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  marginRight: theme.spacing(1),
}));

export const FilterListHeader: React.FC<Props> = ({
  activeFilters,
  checkBoxState,
  filterPanelOpen,
  toggleFilterPanel,
  onCheckAll,
  onSearchTermChanged,
  totalCount = 0,
  buttonGroup,
  starredFilter,
  toggleStarredFilter,
}) => {
  const { t } = useTranslation();

  return (
    <HeaderWrap>
      <Hidden smDown>
        <Checkbox
          checked={checkBoxState === CheckBoxState.checked}
          color="default"
          indeterminate={checkBoxState === CheckBoxState.partial}
          onChange={onCheckAll}
        />
      </Hidden>

      <FilterButton
        activeFilters={activeFilters}
        panelOpen={filterPanelOpen}
        onClick={toggleFilterPanel}
      >
        <FilterIcon titleAccess={t('Toggle Filter Panel')} />
      </FilterButton>

      <SearchBox
        onChange={onSearchTermChanged}
        placeholder={t('Search List')}
      />
      <ContactsShowingText>
        {t('Showing {{count}}', { count: totalCount })}
      </ContactsShowingText>

      <Hidden smDown>
        {/*TODO: Replace this with Actions Dropdown*/}
        <PlaceholderActionsDropdown />
      </Hidden>

      {buttonGroup}

      <Hidden smDown>
        <StarIconWrap>
          <IconButton
            onClick={() =>
              toggleStarredFilter(
                starredFilter.starred ? {} : { starred: true },
              )
            }
          >
            <StarredItemIcon isStarred={starredFilter.starred || false} />
          </IconButton>
        </StarIconWrap>
      </Hidden>
    </HeaderWrap>
  );
};
