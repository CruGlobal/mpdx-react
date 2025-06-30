import React, { useMemo, useRef, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import {
  CardContentInner,
  ColumnTitle,
  ContactFlowColumnProps,
  ContainerBox,
  StyledCardContent,
} from 'src/components/Contacts/ContactFlow/ContactFlowColumn/ContactFlowColumn';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from 'src/components/Tool/Appeal/AppealsContext/AppealsContext';
import { useUrlFilters } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { useGetIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { appealHeaderInfoHeight } from '../../AppealDetails/AppealHeaderInfo/AppealHeaderInfo';
import { useContactsQuery } from '../../AppealsContext/contacts.generated';
import {
  DynamicAddContactToAppealModal,
  preloadAddContactToAppealModal,
} from '../../Modals/AddContactToAppealModal/DynamicAddContactToAppealModal';
import { useExcludedAppealContactsQuery } from '../../Shared/AppealExcludedContacts.generated';
import { ContactFlowDropZone } from '../ContactFlowDropZone/ContactFlowDropZone';
import {
  ContactFlowRow,
  DraggedContact,
} from '../ContactFlowRow/ContactFlowRow';

const AddContactToAppealBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  height: '52px',
  background: '#fff',
}));

interface Props
  extends Omit<
    ContactFlowColumnProps,
    'statuses' | 'changeContactStatus' | 'selectedFilters'
  > {
  appealStatus: AppealStatusEnum;
  changeContactStatus: (
    contact: DraggedContact,
    newStatus: AppealStatusEnum,
  ) => Promise<void>;
}

export const ContactFlowColumn: React.FC<Props> = ({
  appealStatus,
  title,
  color,
  accountListId,
  changeContactStatus,
}) => {
  const { appealId, selectMultipleIds, deselectMultipleIds } = React.useContext(
    AppealsContext,
  ) as AppealsType;
  const { searchTerm, activeFilters } = useUrlFilters();
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [addContactsModalOpen, setAddContactsModalOpen] = useState(false);
  const open = Boolean(anchorEl);

  const contactsFilters = useMemo(
    () => ({
      ...activeFilters,
      appeal: [appealId ?? ''],
      appealStatus,
      wildcardSearch: searchTerm,
    }),
    [activeFilters, appealId, appealStatus, searchTerm],
  );

  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters,
    },
    skip: !accountListId || !appealStatus,
  });

  const { data: allContacts, previousData: allContactsPrevious } =
    useGetIdsForMassSelectionQuery({
      variables: {
        accountListId,
        contactsFilters,
      },
    });
  // When the next batch of contact ids is loading, use the previous batch of contact ids in the
  // meantime to avoid throwing out the selected contact ids.
  const allContactIds = useMemo(
    () =>
      (allContacts ?? allContactsPrevious)?.contacts.nodes.map(
        (contact) => contact.id,
      ) ?? [],
    [allContacts, allContactsPrevious],
  );

  const { data: excludedContacts } = useExcludedAppealContactsQuery({
    variables: {
      appealId: appealId ?? '',
      accountListId: accountListId ?? '',
    },
    skip: appealStatus !== AppealStatusEnum.Excluded,
  });

  const cardContentRef = useRef<HTMLDivElement>();

  const [{ canDrop }, drop] = useDrop(() => ({
    accept: 'contact',
    collect: (monitor) => ({
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const handleColumnHeaderClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectAll = () => {
    selectMultipleIds(allContactIds);
    setAnchorEl(null);
  };

  const handleDeselectAll = () => {
    deselectMultipleIds(allContactIds);
    setAnchorEl(null);
  };

  const handleAddContactToAppeal = () => {
    setAddContactsModalOpen(true);
  };

  const totalContacts = data?.contacts.totalCount || 0;

  return loading && !data ? (
    <CircularProgress />
  ) : (
    <Card>
      <ContainerBox p={2} data-testid="column-header" color={color}>
        <Box width="80%">
          {appealStatus === AppealStatusEnum.ReceivedNotProcessed ? (
            <Tooltip
              title={
                <>
                  <Typography>
                    {t(
                      'Do not move a contact into this column called "Received". Due to an outdated feature, contacts must first be moved to "Committed". If the gift has been recorded, you can then move the contact into the column called "Given".',
                    )}
                  </Typography>

                  <Typography>
                    {t(
                      'In a few cases, the contact may automatically move backward from "Given" to "Received" if the processing is not complete. This behavior is due to the current system design, which we plan to update, but the work will take time and needs to be scheduled.',
                    )}
                  </Typography>
                </>
              }
            >
              <ColumnTitle variant="h6">{title}</ColumnTitle>
            </Tooltip>
          ) : (
            <ColumnTitle variant="h6">{title}</ColumnTitle>
          )}
        </Box>
        <Box display="flex" alignItems="center">
          <Typography>{data?.contacts.totalCount || 0}</Typography>

          <IconButton
            aria-label={t('Column select')}
            id="demo-positioned-button"
            aria-controls={open ? 'demo-positioned-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleColumnHeaderClick}
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            id="demo-positioned-menu"
            aria-labelledby="demo-positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem onClick={handleSelectAll}>
              {totalContacts <= 1
                ? t('Select {{count}} contact', { count: totalContacts })
                : t('Select all {{count}} contacts', { count: totalContacts })}
            </MenuItem>
            <MenuItem onClick={handleDeselectAll}>{t('Deselect All')}</MenuItem>
          </Menu>
        </Box>
      </ContainerBox>
      <StyledCardContent
        style={{
          height: `calc(100vh - ${navBarHeight} - ${headerHeight} - ${appealHeaderInfoHeight} - 87px)`,
          padding: 0,
        }}
      >
        <CardContentInner
          canDrop={canDrop}
          gridTemplateRows={`repeat(1,auto)`}
          ref={drop}
        >
          <ContactFlowDropZone
            title={title}
            status={appealStatus}
            changeContactStatus={changeContactStatus}
          />
        </CardContentInner>
        <Box
          ref={cardContentRef}
          width="100%"
          height={
            appealStatus === AppealStatusEnum.Asked
              ? 'calc(100% - 52px)'
              : '100%'
          }
        >
          <InfiniteList
            loading={loading}
            data={data?.contacts.nodes}
            itemContent={(_index, contact) => (
              <ContactFlowRow
                accountListId={accountListId}
                contact={contact}
                appealStatus={appealStatus}
                columnWidth={cardContentRef.current?.offsetWidth}
                excludedContacts={
                  excludedContacts?.appeal?.excludedAppealContacts ?? []
                }
              />
            )}
            endReached={() =>
              data?.contacts.pageInfo.hasNextPage &&
              fetchMore({
                variables: { after: data.contacts.pageInfo.endCursor },
              })
            }
            EmptyPlaceholder={undefined}
          />
        </Box>
        {appealStatus === AppealStatusEnum.Asked && (
          <AddContactToAppealBox>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleAddContactToAppeal}
              onMouseEnter={preloadAddContactToAppealModal}
            >
              {t('Add Contact to Appeal')}
            </Button>
          </AddContactToAppealBox>
        )}
      </StyledCardContent>

      {addContactsModalOpen && (
        <DynamicAddContactToAppealModal
          handleClose={() => setAddContactsModalOpen(false)}
        />
      )}
    </Card>
  );
};
