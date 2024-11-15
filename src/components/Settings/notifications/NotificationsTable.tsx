import React, { ReactElement, useMemo, useState } from 'react';
import {
  Box,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { FieldArray, Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { NotificationTypeTypeEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import {
  NotificationsPreferencesQuery,
  useNotificationTypesQuery,
  useNotificationsPreferencesQuery,
} from './Notifications.generated';
import { NotificationsTableSkeleton } from './NotificationsTableSkeleton';
import {
  SelectAllBox,
  StyledEmail,
  StyledSmartphone,
  StyledTableCell,
  StyledTableHeadCell,
  StyledTableHeadSelectCell,
  StyledTableRow,
  StyledTask,
} from './StyledComponents';
import { useUpdateNotificationPreferencesMutation } from './UpdateNotifications.generated';

export enum NotificationsEnum {
  App = 'app',
  Email = 'email',
  Task = 'task',
}

type NotificationPreferenceNode =
  NotificationsPreferencesQuery['notificationPreferences']['nodes'][number];

type NotificationPreference = Pick<
  NotificationPreferenceNode,
  'app' | 'email' | 'task'
> & {
  notificationType: Omit<
    NotificationPreferenceNode['notificationType'],
    '__typename'
  >;
};

const notificationSchema: yup.ObjectSchema<{
  notifications: NotificationPreference[];
}> = yup.object({
  notifications: yup.array(
    yup.object({
      app: yup.boolean().required(),
      email: yup.boolean().required(),
      task: yup.boolean().required(),
      notificationType: yup.object({
        id: yup.string().required(),
        descriptionTemplate: yup.string().required(),
        type: yup
          .mixed<NotificationTypeTypeEnum>()
          .oneOf(Object.values(NotificationTypeTypeEnum))
          .required(),
      }),
    }),
  ),
});

interface NotificationsTableProps {
  handleSetupChange: () => Promise<void>;
}

export const NotificationsTable: React.FC<NotificationsTableProps> = ({
  handleSetupChange,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { enqueueSnackbar } = useSnackbar();
  const [appSelectAll, setAppSelectAll] = useState(false);
  const [emailSelectAll, setEmailSelectAll] = useState(false);
  const [isSetup, _] = useState(false);
  const [taskSelectAll, setTaskSelectAll] = useState(false);

  const [updateNotifications] = useUpdateNotificationPreferencesMutation();

  const { data: notificationsPreferences, loading } =
    useNotificationsPreferencesQuery({
      variables: {
        accountListId: accountListId ?? '',
      },
    });
  const { data: notificationTypes } = useNotificationTypesQuery({
    fetchPolicy: 'cache-first',
  });

  const defaultIfInSetup = (
    notificationPreference: NotificationPreference | undefined,
    type: 'app' | 'email' | 'task',
  ): boolean => {
    // If Setup, show preference or default to TRUE
    // If not setup, show preference or default to FALSE.
    return notificationPreference?.[type] || isSetup;
  };

  const notifications = useMemo(() => {
    const notificationsPreferencesData =
      notificationsPreferences?.notificationPreferences?.nodes || [];
    const notificationTypesData = notificationTypes?.notificationTypes || [];

    return notificationTypesData.map((notification): NotificationPreference => {
      const notificationPreference = notificationsPreferencesData.find(
        (object) => object.notificationType.id === notification.id,
      );
      return {
        notificationType: notification,
        app: defaultIfInSetup(notificationPreference, 'app'),
        email: defaultIfInSetup(notificationPreference, 'email'),
        task: defaultIfInSetup(notificationPreference, 'task'),
      };
    });
  }, [notificationsPreferences, notificationTypes]);

  const handleSelectAll = (
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
    notifications: NotificationPreference[];
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
    handleSetupChange();
  };

  return (
    <Box component="section" marginTop={5}>
      {loading ? (
        <NotificationsTableSkeleton />
      ) : (
        <Formik
          initialValues={{
            notifications: notifications,
          }}
          validationSchema={notificationSchema}
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
                  variant="contained"
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
                      aria-label={t('Notifications table')}
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
                              handleSelectAll(
                                NotificationsEnum.App,
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
                              handleSelectAll(
                                NotificationsEnum.Email,
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
                              handleSelectAll(
                                NotificationsEnum.Task,
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
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
