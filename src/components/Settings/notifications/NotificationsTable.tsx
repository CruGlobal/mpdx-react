import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  TableContainer,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  Button,
} from '@mui/material';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import EmailIcon from '@mui/icons-material/Email';
import TaskIcon from '@mui/icons-material/Task';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

export enum notificationsEnum {
  App = 'app',
  Email = 'email',
  Task = 'task',
}

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const StyledTableHeadSelectCell = styled(TableCell)(() => ({
  cursor: 'pointer',
  fontSize: 14,
  paddingTop: 8,
  paddingBottom: 8,
  top: 88,
}));

const StyledTableCell = styled(TableCell)(() => ({
  fontSize: 14,
  paddingTop: 8,
  paddingBottom: 8,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StyledSmartphoneIcon = styled(SmartphoneIcon)(() => ({
  marginRight: '8px',
}));
const StyledEmailIcon = styled(EmailIcon)(() => ({
  marginRight: '6px',
}));
const StyledTaskIcon = styled(TaskIcon)(() => ({
  marginRight: '3px',
}));

const SelectAllBox = styled(Box)(() => ({
  width: 120,
  margin: '0 0 0 auto',
}));
export const NotificationsTable: React.FC = () => {
  const { t } = useTranslation();
  const notificationsMockData = [
    {
      title: 'Partner gave a Special Gift',
      app: false,
      email: false,
      task: false,
    },
    {
      title: 'Partner missed a gift',
      app: false,
      email: false,
      task: false,
    },
    {
      title: 'Partner started giving',
      app: false,
      email: false,
      task: false,
    },
    {
      title: 'Partner gave a Special Gift',
      app: false,
      email: false,
      task: false,
    },
    {
      title: 'Partner missed a gift',
      app: false,
      email: false,
      task: false,
    },
    {
      title: 'Partner started giving',
      app: false,
      email: false,
      task: false,
    },
    {
      title: 'Partner gave a Special Gift',
      app: false,
      email: false,
      task: false,
    },
    {
      title: 'Partner missed a gift',
      app: false,
      email: false,
      task: false,
    },
    {
      title: 'Partner started giving',
      app: false,
      email: false,
      task: false,
    },
    {
      title: 'Partner gave a Special Gift',
      app: false,
      email: false,
      task: false,
    },
    {
      title: 'Partner missed a gift',
      app: false,
      email: false,
      task: false,
    },
    {
      title: 'Partner started giving',
      app: false,
      email: false,
      task: false,
    },
  ];

  const [notifications, setNotifications] = useState(notificationsMockData);
  const [appSelectAll, setAppSelectAll] = useState(false);
  const [emailSelectAll, setEmailSelectAll] = useState(false);
  const [taskSelectAll, setTaskSelectAll] = useState(false);

  const checkboxOnChange = (index, type) => {
    const notificationsCopy = [...notifications];
    notificationsCopy[index][type] = !notificationsCopy[index][type];
    setNotifications(notificationsCopy);
  };

  const selectAll = (type, selectAll, setSelectAll) => {
    setSelectAll(!selectAll);
    const notificationsCopy = notifications.map((item) => {
      item[type] = !selectAll;
      return item;
    });

    setNotifications(notificationsCopy);
  };

  const handleSaveNotifications = () => {
    // eslint-disable-next-line no-console
    console.log('handleSaveNotifications');
  };

  return (
    <Box component="section" marginTop={5}>
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table
          sx={{ minWidth: 700 }}
          stickyHeader
          aria-label="Notifications table"
        >
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>
                {t("Select the types of notifications you'd like to receive")}
              </StyledTableHeadCell>
              <StyledTableHeadCell align="right">
                <StyledSmartphoneIcon />
                <Box>{t('In App')}</Box>
              </StyledTableHeadCell>
              <StyledTableHeadCell align="right">
                <StyledEmailIcon />
                <Box>{t('Email')}</Box>
              </StyledTableHeadCell>
              <StyledTableHeadCell align="right">
                <StyledTaskIcon />
                <Box>{t('Task')}</Box>
              </StyledTableHeadCell>
            </TableRow>
            <TableRow>
              <StyledTableHeadSelectCell
                component="th"
                scope="row"
              ></StyledTableHeadSelectCell>
              <StyledTableHeadSelectCell
                align="right"
                onClick={() =>
                  selectAll(
                    notificationsEnum.App,
                    appSelectAll,
                    setAppSelectAll,
                  )
                }
              >
                <SelectAllBox>
                  {appSelectAll ? t('deselect all') : t('select all')}
                </SelectAllBox>
              </StyledTableHeadSelectCell>
              <StyledTableHeadSelectCell
                align="right"
                onClick={() =>
                  selectAll(
                    notificationsEnum.Email,
                    emailSelectAll,
                    setEmailSelectAll,
                  )
                }
              >
                <SelectAllBox>
                  {emailSelectAll ? t('deselect all') : t('select all')}
                </SelectAllBox>
              </StyledTableHeadSelectCell>
              <StyledTableHeadSelectCell
                align="right"
                onClick={() =>
                  selectAll(
                    notificationsEnum.Task,
                    taskSelectAll,
                    setTaskSelectAll,
                  )
                }
              >
                <SelectAllBox>
                  {taskSelectAll ? t('deselect all') : t('select all')}
                </SelectAllBox>
              </StyledTableHeadSelectCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.map((notification, idx) => (
              <StyledTableRow key={notification.title}>
                <StyledTableCell component="th" scope="row">
                  {notification.title}
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Checkbox
                    checked={notification.app}
                    onChange={() =>
                      checkboxOnChange(idx, notificationsEnum.App)
                    }
                  />
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Checkbox
                    checked={notification.email}
                    onChange={() =>
                      checkboxOnChange(idx, notificationsEnum.Email)
                    }
                  />
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Checkbox
                    checked={notification.task}
                    onChange={() =>
                      checkboxOnChange(idx, notificationsEnum.Task)
                    }
                  />
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box textAlign={'right'} padding={'10px'}>
        <Button variant={'contained'} onClick={handleSaveNotifications}>
          {t('Save')}
        </Button>
      </Box>
    </Box>
  );
};
