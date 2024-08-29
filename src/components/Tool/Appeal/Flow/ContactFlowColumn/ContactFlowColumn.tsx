import React, { useRef, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Card,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
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
import { appealHeaderInfoHeight } from '../../AppealDetails/AppealHeaderInfo/AppealHeaderInfo';
import { useContactsQuery } from '../../AppealsContext/contacts.generated';
import { ContactFlowDropZone } from '../ContactFlowDropZone/ContactFlowDropZone';
import { ContactFlowRow } from '../ContactFlowRow/ContactFlowRow';

interface Props
  extends Omit<ContactFlowColumnProps, 'statuses' | 'changeContactStatus'> {
  appealStatus: AppealStatusEnum;
  changeContactStatus: (id: string, status: AppealStatusEnum) => Promise<void>;
}

export const ContactFlowColumn: React.FC<Props> = ({
  appealStatus,
  title,
  color,
  accountListId,
  searchTerm,
  onContactSelected,
  changeContactStatus,
}) => {
  const { appealId, sanitizedFilters } = React.useContext(
    AppealsContext,
  ) as AppealsType;
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: {
        ...sanitizedFilters,
        appeal: [appealId ?? ''],
        appealStatus,
        wildcardSearch: searchTerm as string,
      },
    },
    skip: !accountListId || !appealStatus,
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
    setAnchorEl(null);
    // TODO implement select all
  };

  const handleDeselectAll = () => {
    setAnchorEl(null);
    // TODO implement deselect all
  };

  const totalContacts = data?.contacts.totalCount || 0;

  return loading && !data ? (
    <CircularProgress />
  ) : (
    <Card>
      <ContainerBox p={2} data-testid="column-header" color={color}>
        <Box width="80%">
          <ColumnTitle variant="h6">{title}</ColumnTitle>
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
        }}
      >
        <CardContentInner
          canDrop={canDrop}
          gridTemplateRows={`repeat(1,auto)`}
          ref={drop}
        >
          <ContactFlowDropZone
            status={appealStatus}
            changeContactStatus={changeContactStatus}
          />
        </CardContentInner>
        <Box ref={cardContentRef} width="100%" height="100%">
          <InfiniteList
            loading={loading}
            data={data?.contacts.nodes}
            itemContent={(_index, contact) => (
              <ContactFlowRow
                accountListId={accountListId}
                contact={contact}
                appealStatus={appealStatus}
                contactStatus={contact.status}
                onContactSelected={onContactSelected}
                columnWidth={cardContentRef.current?.offsetWidth}
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
      </StyledCardContent>
    </Card>
  );
};
