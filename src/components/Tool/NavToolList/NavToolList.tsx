import React, { Fragment, ReactElement } from 'react';
import Icon from '@mdi/react';
import Close from '@mui/icons-material/Close';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slide,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useGetToolNotificationsQuery } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/GetToolNotifcations.generated';
import { ToolName } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/NavMenu';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsList } from '../Home/ToolList';
import { Item } from './Item/Item';

const ToolNavListContainer = styled('div')(() => ({
  overflow: 'hidden',
}));

const NavListItem = styled(ListItem)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.cruGrayLight.main}`,
  borderBottom: `1px solid ${theme.palette.cruGrayLight.main}`,
  borderColor: theme.palette.cruGrayLight.main,
}));

const FilterHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottomColor: theme.palette.grey[200],
}));

const FilterList = styled(List)(({ theme }) => ({
  paddingTop: 0,
  '& .MuiListItemIcon-root': {
    minWidth: '37px',
  },
  '& .FilterListItemMultiselect-root': {
    marginBottom: theme.spacing(2),
  },
}));

export interface Props {
  selectedId?: string;
  isOpen?: boolean;
  toggle: (isOpen: boolean) => void;
}

const NavToolList = ({ selectedId, isOpen, toggle }: Props): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { data, loading } = useGetToolNotificationsQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });

  const toolDataTotalCount: { [key: string]: number } = {
    [ToolName.FixCommitmentInfo]: data?.fixCommitmentInfo.totalCount ?? 0,
    [ToolName.FixMailingAddresses]: data?.fixMailingAddresses.totalCount ?? 0,
    [ToolName.FixSendNewsletter]: data?.fixSendNewsletter.totalCount ?? 0,
    [ToolName.FixEmailAddresses]: data?.fixEmailAddresses.totalCount ?? 0,
    [ToolName.FixPhoneNumbers]: data?.fixPhoneNumbers.totalCount ?? 0,
    [ToolName.MergeContacts]: data?.mergeContacts.totalCount ?? 0,
    [ToolName.MergePeople]: data?.mergePeople.totalCount ?? 0,
  };

  return (
    <Box data-testid="ToolNavList">
      <ToolNavListContainer>
        <Slide in={isOpen} direction="right" mountOnEnter unmountOnExit>
          <Box>
            <FilterHeader>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{t('Tools')}</Typography>
                <IconButton
                  data-testid="ToolNavToggle"
                  onClick={() => toggle(!isOpen)}
                >
                  <Close titleAccess={t('Close')} />
                </IconButton>
              </Box>
            </FilterHeader>
            <FilterList dense>
              {ToolsList.map((group) => (
                <Fragment key={group.groupName}>
                  <NavListItem data-testid="ToolNavListItem">
                    <ListItemIcon>
                      <Icon path={group.groupIcon} size={1} />
                    </ListItemIcon>
                    <ListItemText primary={group.groupName} />
                  </NavListItem>
                  {group.items.map((tool) => {
                    return (
                      <Item
                        key={tool.id}
                        url={tool.url}
                        title={tool.tool}
                        isSelected={selectedId === tool.id}
                        loading={loading}
                        totalCount={toolDataTotalCount[tool.id] || 0}
                        toolId={tool.id}
                      />
                    );
                  })}
                </Fragment>
              ))}
            </FilterList>
          </Box>
        </Slide>
      </ToolNavListContainer>
    </Box>
  );
};

export default NavToolList;
