import React, { useState } from 'react';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Hidden from '@mui/material/Hidden';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import Map from '@mui/icons-material/Map';
import Settings from '@mui/icons-material/Settings';
import ViewColumn from '@mui/icons-material/ViewColumn';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { StatusEnum } from '../../../../graphql/types.generated';
import {
  ContactsPageContext,
  ContactsPageType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { MassActionsRemoveTagsModal } from '../MassActions/RemoveTags/MassActionsRemoveTagsModal';
import { MassActionsAddTagsModal } from '../MassActions/AddTags/MassActionsAddTagsModal';
import { MassActionsAddToAppealModal } from '../MassActions/AddToAppeal/MassActionsAddToAppealModal';
import { MassActionsEditFieldsModal } from '../MassActions/EditFields/MassActionsEditFieldsModal';
import { useMassActionsUpdateContactsMutation } from '../MassActions/MassActionsUpdateContacts.generated';
import { MassActionsCreateAppealModal } from '../MassActions/AddToAppeal/MassActionsCreateAppealModal';
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
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  marginLeft: theme.spacing(1),
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

  const [openRemoveTagsModal, setOpenRemoveTagsModal] = useState(false);
  const [openAddTagsModal, setOpenAddTagsModal] = useState(false);
  const [addToAppealModalOpen, setAddToAppealModalOpen] = useState(false);
  const [createAppealModalOpen, setCreateAppealModalOpen] = useState(false);
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
        openRemoveTagsModal={setOpenRemoveTagsModal}
        openAddTagsModal={setOpenAddTagsModal}
        openEditFieldsModal={setEditFieldsModalOpen}
        openAddToAppealModal={setAddToAppealModalOpen}
        openHideContactsModal={setHideContactsModalOpen}
        openCreateAppealModal={setCreateAppealModalOpen}
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
              <StyledToggleButtonGroup
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
              </StyledToggleButtonGroup>
            </Box>
          </Hidden>
        }
      />
      {openRemoveTagsModal && (
        <MassActionsRemoveTagsModal
          accountListId={accountListId ?? ''}
          ids={selectedIds}
          handleClose={() => setOpenRemoveTagsModal(false)}
        />
      )}
      {openAddTagsModal && (
        <MassActionsAddTagsModal
          accountListId={accountListId ?? ''}
          ids={selectedIds}
          handleClose={() => setOpenAddTagsModal(false)}
        />
      )}
      {addToAppealModalOpen && (
        <MassActionsAddToAppealModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setAddToAppealModalOpen(false)}
        />
      )}
      {createAppealModalOpen && (
        <MassActionsCreateAppealModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setCreateAppealModalOpen(false)}
        />
      )}
      {editFieldsModalOpen && (
        <MassActionsEditFieldsModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setEditFieldsModalOpen(false)}
        />
      )}

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
