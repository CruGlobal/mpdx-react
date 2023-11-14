import React, { useState, useEffect, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, FieldArray } from 'formik';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import { useSnackbar } from 'notistack';
import { styled } from '@mui/material/styles';
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
} from '@mui/material';
import { Email, Smartphone, Task } from '@mui/icons-material';
import { useAccountListId } from 'src/hooks/useAccountListId';
import {
  useGetPreferencesNotificationsQuery,
  useGetNotificationConstantsQuery,
} from './GetNotifications.generated';
import { useUpdateNotificationPreferencesMutation } from './UpdateNotifications.generated';
import * as Types from '../../../../graphql/types.generated';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { NotificationsTableSkeleton } from './NotificationsTableSkeleton';

export enum notificationsEnum {
  App = 'app',
  Email = 'email',
  Task = 'task',
}

export const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

export const StyledTableHeadSelectCell = styled(TableCell)(() => ({
  cursor: 'pointer',
  fontSize: 14,
  paddingTop: 8,
  paddingBottom: 8,
  top: 88,
}));

export const StyledTableCell = styled(TableCell)(() => ({
  fontSize: 14,
  paddingTop: 8,
  paddingBottom: 8,
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export const StyledSmartphone = styled(Smartphone)(() => ({
  marginRight: '8px',
}));
export const StyledEmail = styled(Email)(() => ({
  marginRight: '6px',
}));
export const StyledTask = styled(Task)(() => ({
  marginRight: '3px',
}));

export const SelectAllBox = styled(Box)(() => ({
  width: 120,
  margin: '0 0 0 auto',
}));

type notificationType = Array<
  Pick<Types.NotificationPreference, 'app' | 'email' | 'task'> & {
    notificationType: Pick<
      Types.NotificationType,
      'descriptionTemplate' | 'type'
    >;
  }
>;

export const NotificationsTable: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const [notifications, setNotifications] = useState([]);
  const [appSelectAll, setAppSelectAll] = useState(false);
  const [emailSelectAll, setEmailSelectAll] = useState(false);
  const [isSetup, _] = useState(false);
  const [taskSelectAll, setTaskSelectAll] = useState(false);

  const [updateNotifications] = useUpdateNotificationPreferencesMutation();

  const NotificationSchema: yup.SchemaOf<{
    notifications: notificationType;
  }> = yup.object({
    notifications: yup.array(
      yup.object({
        app: yup.boolean().required(),
        email: yup.boolean().required(),
        task: yup.boolean().required(),
        notificationType: yup.object({
          descriptionTemplate: yup.string().required(),
          type: yup
            .mixed<Types.NotificationTypeTypeEnum>()
            .oneOf(Object.values(Types.NotificationTypeTypeEnum))
            .required(),
        }),
      }),
    ),
  });

  const { data, loading } = useGetPreferencesNotificationsQuery({
    variables: {
      accountListId: accountListId ?? '',
    },
  });
  const { data: notificationConstants } = useGetNotificationConstantsQuery();

  const defaultIfInSetup = (
    notificationPreference: any,
    type: string,
  ): boolean => {
    // If Setup, show preference or default to TRUE
    // If not setup, show preference or default to FALSE.
    return notificationPreference[type] || isSetup;
  };

  useEffect(() => {
    const notificationsData = data?.notificationPreferences?.nodes || [];
    const notificationsOrder =
      notificationConstants?.constant?.notificationTranslatedHashes || [];

    if (!notificationsData.length || !notificationsOrder.length) return;

    const notifications = notificationsOrder.reduce((result, notification) => {
      const notificationPreference = notificationsData.find(
        (object) => object.notificationType.id === notification.key,
      );
      return [
        ...result,
        {
          id: notificationPreference.id || uuidv4(),
          notificationType: notificationPreference.notificationType,
          app: defaultIfInSetup(notificationPreference, 'app'),
          email: defaultIfInSetup(notificationPreference, 'email'),
          task: defaultIfInSetup(notificationPreference, 'task'),
        },
      ];
    }, []);

    setNotifications(notifications);
  }, [data, notificationConstants]);

  const selectAll = (
    type,
    notifications,
    setFieldValue,
    selectAll,
    setSelectAll,
  ) => {
    setSelectAll(!selectAll);
    notifications.forEach((_, idx) => {
      setFieldValue(`notifications.${idx}.${type}`, !selectAll);
    });
  };

  const onSubmit = async ({
    notifications,
  }: {
    notifications: Array<
      Pick<Types.NotificationPreference, 'app' | 'email' | 'task'> & {
        notificationType: Pick<
          Types.NotificationType,
          'descriptionTemplate' | 'type'
        >;
      }
    >;
  }) => {
    const attributes = notifications.map((notification) => {
      return {
        app: notification.app,
        email: notification.email,
        task: notification.task,
        notificationType: notification.notificationType.type,
      };
    });

    await updateNotifications({
      variables: {
        input: {
          accountListId: accountListId ?? '',
          attributes,
        },
      },
    });

    enqueueSnackbar(t('Notifications updated successfully'), {
      variant: 'success',
    });
  };

  return (
    <Box component="section" marginTop={5}>
      {loading && <NotificationsTableSkeleton />}
      {!loading && (
        <Formik
          initialValues={{
            notifications: notifications,
          }}
          validationSchema={NotificationSchema}
          onSubmit={onSubmit}
        >
          {({
            values: { notifications },
            handleSubmit,
            setFieldValue,
            isSubmitting,
            isValid,
          }): ReactElement => (
            <form onSubmit={handleSubmit}>
              <Box textAlign={'right'} padding={'10px'}>
                <SubmitButton
                  disabled={!isValid || isSubmitting}
                  variant={'contained'}
                >
                  {t('Save Changes')}
                </SubmitButton>
              </Box>
              <TableContainer component={Paper}>
                <FieldArray
                  name="notifications"
                  render={() => (
                    <Table
                      sx={{ minWidth: 700 }}
                      stickyHeader
                      aria-label="Notifications table"
                    >
                      <TableHead>
                        <TableRow>
                          <StyledTableHeadCell>
                            {t(
                              "Select the types of notifications you'd like to receive",
                            )}
                          </StyledTableHeadCell>
                          <StyledTableHeadCell align="right">
                            <StyledSmartphone />
                            <Box>{t('In App')}</Box>
                          </StyledTableHeadCell>
                          <StyledTableHeadCell align="right">
                            <StyledEmail />
                            <Box>{t('Email')}</Box>
                          </StyledTableHeadCell>
                          <StyledTableHeadCell align="right">
                            <StyledTask />
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
                            data-testid="select-all-app"
                            onClick={() =>
                              selectAll(
                                notificationsEnum.App,
                                notifications,
                                setFieldValue,
                                appSelectAll,
                                setAppSelectAll,
                              )
                            }
                          >
                            <SelectAllBox>
                              {appSelectAll
                                ? t('deselect all')
                                : t('select all')}
                            </SelectAllBox>
                          </StyledTableHeadSelectCell>
                          <StyledTableHeadSelectCell
                            align="right"
                            data-testid="select-all-email"
                            onClick={() =>
                              selectAll(
                                notificationsEnum.Email,
                                notifications,
                                setFieldValue,
                                emailSelectAll,
                                setEmailSelectAll,
                              )
                            }
                          >
                            <SelectAllBox>
                              {emailSelectAll
                                ? t('deselect all')
                                : t('select all')}
                            </SelectAllBox>
                          </StyledTableHeadSelectCell>
                          <StyledTableHeadSelectCell
                            align="right"
                            data-testid="select-all-task"
                            onClick={() =>
                              selectAll(
                                notificationsEnum.Task,
                                notifications,
                                setFieldValue,
                                taskSelectAll,
                                setTaskSelectAll,
                              )
                            }
                          >
                            <SelectAllBox>
                              {taskSelectAll
                                ? t('deselect all')
                                : t('select all')}
                            </SelectAllBox>
                          </StyledTableHeadSelectCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        <>
                          {notifications.map((notification, idx) => {
                            const { type, descriptionTemplate } =
                              notification.notificationType;
                            return (
                              <StyledTableRow key={type}>
                                <StyledTableCell component="th" scope="row">
                                  {descriptionTemplate}
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                  <Checkbox
                                    data-testid={`${type}-app-checkbox`}
                                    checked={notification.app}
                                    disabled={isSubmitting}
                                    onChange={(_, value) => {
                                      setFieldValue(
                                        `notifications.${idx}.app`,
                                        value,
                                      );
                                    }}
                                  />
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                  <Checkbox
                                    data-testid={`${type}-email-checkbox`}
                                    checked={notification.email}
                                    onChange={(_, value) => {
                                      setFieldValue(
                                        `notifications.${idx}.email`,
                                        value,
                                      );
                                    }}
                                  />
                                </StyledTableCell>
                                <StyledTableCell align="right">
                                  <Checkbox
                                    data-testid={`${type}-task-checkbox`}
                                    checked={notification.task}
                                    onChange={(_, value) => {
                                      setFieldValue(
                                        `notifications.${idx}.task`,
                                        value,
                                      );
                                    }}
                                  />
                                </StyledTableCell>
                              </StyledTableRow>
                            );
                          })}
                        </>
                      </TableBody>
                    </Table>
                  )}
                />
              </TableContainer>
              <Box textAlign={'right'} padding={'10px'}>
                <SubmitButton
                  disabled={!isValid || isSubmitting}
                  variant={'contained'}
                >
                  {t('Save Changes')}
                </SubmitButton>
              </Box>
            </form>
          )}
        </Formik>
      )}
    </Box>
  );
};
