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
  Theme,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useGetToolNotificationsQuery } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/GetToolNotifcations.generated';
import { ToolName } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/NavMenu';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsList } from '../Home/ToolList';
import { Item } from './Item/Item';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    overflow: 'hidden',
  },
  li: {
    borderTop: `1px solid ${theme.palette.cruGrayLight.main}`,
    borderBottom: `1px solid ${theme.palette.cruGrayLight.main}`,
    borderColor: theme.palette.cruGrayLight.main,
  },
  notificationBox: {
    backgroundColor: theme.palette.progressBarYellow.main,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    borderRadius: '25%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing(2),
  },
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
  const { classes } = useStyles();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { data, loading } = useGetToolNotificationsQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });

  const toolData: { [key: string]: { totalCount: number } } = {
    [ToolName.FixCommitmentInfo]: data?.[ToolName.FixCommitmentInfo] ?? {
      totalCount: 0,
    },
    [ToolName.FixMailingAddresses]: data?.[ToolName.FixMailingAddresses] ?? {
      totalCount: 0,
    },
    [ToolName.FixSendNewsletter]: data?.[ToolName.FixSendNewsletter] ?? {
      totalCount: 0,
    },
    [ToolName.FixEmailAddresses]: data?.[ToolName.FixEmailAddresses] ?? {
      totalCount: 0,
    },
    [ToolName.FixPhoneNumbers]: data?.[ToolName.FixPhoneNumbers] ?? {
      totalCount: 0,
    },
    [ToolName.MergeContacts]: data?.[ToolName.MergeContacts] ?? {
      totalCount: 0,
    },
    [ToolName.MergePeople]: data?.[ToolName.MergePeople] ?? { totalCount: 0 },
  };

  return (
    <Box data-testid="ToolNavList">
      <div className={classes.root}>
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
                  <ListItem
                    data-testid="ToolNavListItem"
                    className={classes.li}
                  >
                    <ListItemIcon>
                      <Icon path={group.groupIcon} size={1} />
                    </ListItemIcon>
                    <ListItemText primary={t(group.groupName)} />
                  </ListItem>
                  {group.items.map((tool) => {
                    return (
                      <Item
                        key={tool.id}
                        url={tool.url}
                        title={tool.tool}
                        isSelected={selectedId === tool.id}
                        loading={loading}
                        needsAttention={
                          toolData[tool.id]?.totalCount > 0 || false
                        }
                        totalCount={toolData[tool.id]?.totalCount || 0}
                      />
                    );
                  })}
                </Fragment>
              ))}
            </FilterList>
          </Box>
        </Slide>
      </div>
    </Box>
  );
};

export default NavToolList;
