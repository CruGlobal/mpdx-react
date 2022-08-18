import { Box, Button, Hidden, styled } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import React, { useState } from 'react';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import { FormatListBulleted, Settings, ViewColumn } from '@material-ui/icons';
import Map from '@material-ui/icons/Map';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { StatusEnum } from '../../../../graphql/types.generated';
import {
  ContactsPageContext,
  ContactsPageType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { MassActionsEditFieldsModal } from '../MassActions/EditFields/MassActionsEditFieldsModal';
import { useMassActionsUpdateContactsMutation } from '../MassActions/MassActionsUpdateContacts.generated';
import {
  ListHeader,
  TableViewModeEnum,
} from 'src/components/Shared/Header/ListHeader';
import {
  ContactsDocument,
  useContactsQuery,
} from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { HideContactsModal } from 'src/components/Shared/HideContactsModal/HideConatctsModal';

const ViewSettingsButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  height: theme.spacing(6),
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(2),
}));
const MapIcon = styled(Map)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));
const ViewColumnIcon = styled(ViewColumn)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));
const BulletedListIcon = styled(FormatListBulleted)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));

export const ContactsMainPanelHeader: React.FC = () => {
  const { t } = useTranslation();

  const {
    accountListId,
    activeFilters,
    contactId,
    toggleFilterPanel,
    toggleSelectAll,
    setSearchTerm,
    searchTerm,
    starredFilter,
    setStarredFilter,
    selectionType,
    filterPanelOpen,
    contactDetailsOpen,
    viewMode,
    urlFilters,
    handleViewModeChange,
    selectedIds,
  } = React.useContext(ContactsPageContext) as ContactsPageType;

  const [editFieldsModalOpen, setEditFieldsModalOpen] = useState(false);
  const [hideContactsModalOpen, setHideContactsModalOpen] = useState(false);

  const { data } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: {
        ...activeFilters,
        wildcardSearch: searchTerm as string,
        ...starredFilter,
        ids:
          viewMode === TableViewModeEnum.Map && urlFilters
            ? urlFilters.ids
            : [],
      },
      first: contactId?.includes('map') ? 20000 : 25,
    },
    skip: !accountListId,
  });

  const { enqueueSnackbar } = useSnackbar();

  const [updateContacts] = useMassActionsUpdateContactsMutation();

  const hideContacts = async () => {
    await updateContacts({
      variables: {
        accountListId: accountListId ?? '',
        attributes: selectedIds.map((id) => ({
          id,
          status: StatusEnum.NeverAsk,
        })),
      },
      refetchQueries: [
        {
          query: ContactsDocument,
          variables: { accountListId },
        },
      ],
    });
    enqueueSnackbar(t('Contact(s) hidden successfully'), {
      variant: 'success',
    });
    setHideContactsModalOpen(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <>
      <ListHeader
        page="contact"
        activeFilters={Object.keys(activeFilters).length > 0}
        filterPanelOpen={filterPanelOpen}
        toggleFilterPanel={toggleFilterPanel}
        contactDetailsOpen={contactDetailsOpen}
        onCheckAllItems={toggleSelectAll}
        contactsView={viewMode}
        onSearchTermChanged={setSearchTerm}
        searchTerm={searchTerm}
        totalItems={data?.contacts?.totalCount}
        starredFilter={starredFilter}
        toggleStarredFilter={setStarredFilter}
        headerCheckboxState={selectionType}
        selectedIds={selectedIds}
        openEditFieldsModal={setEditFieldsModalOpen}
        openHideContactsModal={setHideContactsModalOpen}
        buttonGroup={
          <Hidden xsDown>
            <Box display="flex" alignItems="center">
              {viewMode === TableViewModeEnum.Flows && (
                <NextLink
                  href={`/accountLists/${accountListId}/contacts/flows/setup`}
                >
                  <ViewSettingsButton variant="outlined">
                    <Settings style={{ marginRight: 8 }} />
                    {t('View Settings')}
                  </ViewSettingsButton>
                </NextLink>
              )}
              <ToggleButtonGroup
                exclusive
                value={viewMode}
                onChange={handleViewModeChange}
              >
                <ToggleButton
                  value={TableViewModeEnum.List}
                  disabled={viewMode === TableViewModeEnum.List}
                >
                  <BulletedListIcon titleAccess={t('List View')} />
                </ToggleButton>
                <ToggleButton
                  value={TableViewModeEnum.Flows}
                  disabled={viewMode === TableViewModeEnum.Flows}
                >
                  <ViewColumnIcon titleAccess={t('Column Workflow View')} />
                </ToggleButton>
                <ToggleButton
                  value={TableViewModeEnum.Map}
                  disabled={viewMode === TableViewModeEnum.Map}
                >
                  <MapIcon titleAccess={t('Map View')} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Hidden>
        }
      />
      {editFieldsModalOpen ? (
        <MassActionsEditFieldsModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setEditFieldsModalOpen(false)}
        />
      ) : null}
      {hideContactsModalOpen && (
        <HideContactsModal
          open={hideContactsModalOpen}
          setOpen={setHideContactsModalOpen}
          onConfirm={hideContacts}
          multi={selectedIds.length > 1}
        />
      )}
    </>
  );
};
