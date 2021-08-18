import React, { ReactElement, useState, useCallback } from 'react';
import MUIDataTable, {
  MUIDataTableOptions,
  MUIDataTableColumn,
} from 'mui-datatables';
import { useTranslation } from 'react-i18next';
import {
  Chip,
  CircularProgress,
  Avatar,
  Tooltip,
  makeStyles,
  Theme,
  Grid,
  Card,
  FormLabel,
  Box,
} from '@material-ui/core';
import { DateTime } from 'luxon';
import reduce from 'lodash/fp/reduce';
import debounce from 'lodash/fp/debounce';
import { Skeleton } from '@material-ui/lab';
import { DatePicker } from '@material-ui/pickers';
import { useSnackbar } from 'notistack';
import { dateFormat, dayMonthFormat } from '../../../lib/intlFormat/intlFormat';
import TaskStatus from '../Status';
import illustration15 from '../../../images/drawkit/grape/drawkit-grape-pack-illustration-15.svg';
import { ActivityTypeEnum } from '../../../../graphql/types.generated';
import { useGetDataForTaskDrawerQuery } from '../Drawer/Form/TaskDrawer.generated';
import useTaskDrawer from '../../../hooks/useTaskDrawer';
import { useAccountListId } from '../../../hooks/useAccountListId';
import {
  useGetTasksForTaskListQuery,
  GetTasksForTaskListQueryVariables,
  GetTasksForTaskListQuery,
} from './TaskList.generated';

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    marginRight: theme.spacing(0.5),
  },
  card: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(0),
    },
  },
  img: {
    height: '200px',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      height: '114px',
    },
  },
}));

export type TaskFilter = Omit<
  GetTasksForTaskListQueryVariables,
  'accountListId'
>;

interface Props {
  initialFilter?: TaskFilter;
}

const TaskList = ({ initialFilter }: Props): ReactElement => {
  const [filter, setFilter] = useState<TaskFilter>({
    userIds: [],
    tags: [],
    contactIds: [],
    activityType: [],
    completed: null,
    startAt: null,
    before: null,
    after: null,
    ...initialFilter,
  });
  const classes = useStyles();
  const { t } = useTranslation();
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  const accountListId = useAccountListId();

  const { openTaskDrawer } = useTaskDrawer();

  const { data: filterData } = useGetDataForTaskDrawerQuery({
    variables: { accountListId: accountListId ?? '' },
  });

  const { data, loading } = useGetTasksForTaskListQuery({
    variables: {
      accountListId: accountListId ?? '',
      first: rowsPerPage,
      ...filter,
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' });
    },
  });

  const columns: MUIDataTableColumn[] = [
    {
      name: 'completedAt',
      label: t('Completed'),
      options: {
        filter: true,
        sort: false,
        filterType: 'dropdown',
        filterList: initialFilter?.completed
          ? [initialFilter.completed.toString()]
          : undefined,
        filterOptions: {
          names: ['true', 'false'],
          renderValue: (val): string =>
            val === 'true' ? t('Complete') : t('Incomplete'),
          fullWidth: true,
        },
        customFilterListOptions: {
          render: (val): string =>
            val === 'true' ? t('Complete') : t('Incomplete'),
        },
        customHeadLabelRender: (): string => '',
        customBodyRender: (completedAt, { rowIndex }): ReactElement => {
          const task = data?.tasks.nodes[rowIndex];
          if (!loading && task) {
            const { id, startAt } = task;
            return (
              <TaskStatus
                taskId={id}
                startAt={startAt ?? undefined}
                completedAt={completedAt}
              />
            );
          } else {
            return <Skeleton variant="circle" width={40} height={40} />;
          }
        },
      },
    },
    {
      name: 'subject',
      label: t('Subject'),
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: 'activityType',
      label: t('Type'),
      options: {
        display: false,
        filter: true,
        sort: false,
        customBodyRender: t,
        filterList: initialFilter?.activityType
          ? Array.isArray(initialFilter.activityType)
            ? initialFilter.activityType
            : [initialFilter.activityType]
          : undefined,
        filterOptions: {
          names: Object.values(ActivityTypeEnum).sort(),
          renderValue: t,
          fullWidth: true,
        },
        customFilterListOptions: { render: t },
        filterType: 'multiselect',
      },
    },
    {
      name: 'contacts',
      label: t('Contacts'),
      options: {
        display: false,
        filter: true,
        sort: false,
        filterList: initialFilter?.contactIds
          ? Array.isArray(initialFilter.contactIds)
            ? initialFilter.contactIds
            : [initialFilter.contactIds]
          : undefined,
        customFilterListOptions: {
          render: (id): string => {
            if (filterData?.contacts) {
              return (
                filterData.contacts.nodes.find(
                  ({ id: contactId }) => contactId === id,
                )?.name ?? ''
              );
            }
            return t('Loading');
          },
        },
        filterOptions: {
          names: filterData?.contacts.nodes.map(({ id }) => id) || [],
          renderValue: (id): string => {
            return (
              filterData?.contacts.nodes.find(
                ({ id: contactId }) => contactId === id,
              )?.name ?? ''
            );
          },
          fullWidth: true,
        },
        filterType: 'multiselect',
        customBodyRender: (
          contacts:
            | GetTasksForTaskListQuery['tasks']['nodes'][0]['contacts']
            | null,
        ): string =>
          contacts?.nodes.map(({ name }) => name).join(t('List Separator')) ??
          '',
      },
    },
    {
      name: 'tagList',
      label: t('Tags'),
      options: {
        filter: true,
        sort: true,
        filterList: initialFilter?.tags
          ? Array.isArray(initialFilter.tags)
            ? initialFilter.tags
            : [initialFilter.tags]
          : undefined,
        filterOptions: {
          names: filterData?.accountList?.taskTagList || [],
          fullWidth: true,
        },
        filterType: 'multiselect',
        customFilterListOptions: {
          render: (tag): string => t('Tag {{tag}}', { tag }),
        },
        customBodyRender: (
          tagList:
            | GetTasksForTaskListQuery['tasks']['nodes'][0]['tagList']
            | undefined,
        ) => {
          if (loading) {
            return (
              <Grid container spacing={2}>
                <Grid item>
                  <Skeleton width={50} />
                </Grid>
                <Grid item>
                  <Skeleton width={50} />
                </Grid>
              </Grid>
            );
          } else {
            return tagList?.map((tag) => (
              <Chip
                key={tag}
                size="small"
                label={tag}
                color="primary"
                className={classes.chip}
              />
            ));
          }
        },
      },
    },
    {
      name: 'user',
      label: t('Assignee'),
      options: {
        filter: true,
        sort: true,
        display: false,
        filterList: initialFilter?.userIds
          ? Array.isArray(initialFilter.userIds)
            ? initialFilter.userIds
            : [initialFilter.userIds]
          : undefined,
        customFilterListOptions: {
          render: (id): string => {
            if (filterData?.accountListUsers?.nodes) {
              const accountListUser = filterData.accountListUsers.nodes.find(
                ({ user: { id: accountListUserId } }) =>
                  accountListUserId === id,
              );
              return `${accountListUser?.user.firstName} ${accountListUser?.user.lastName}`;
            }
            return t('Loading');
          },
        },
        filterOptions: {
          names:
            filterData?.accountListUsers.nodes.map(({ user: { id } }) => id) ||
            [],
          renderValue: (id) => {
            const accountListUser = filterData?.accountListUsers.nodes.find(
              ({ user: { id: accountListUserId } }) => accountListUserId === id,
            );
            return `${accountListUser?.user.firstName} ${accountListUser?.user.lastName}`;
          },
          fullWidth: true,
        },
        filterType: 'multiselect',
        customBodyRender: (user) => {
          if (user) {
            return (
              <Tooltip
                title={`${user.firstName} ${user.lastName}`}
                placement="left"
              >
                <Avatar>{user.firstName[0]}</Avatar>
              </Tooltip>
            );
          }
        },
      },
    },
    {
      name: 'startAt',
      label: t('Due Date'),
      options: {
        filter: true,
        filterType: 'custom',
        filterList: initialFilter?.startAt
          ? [
              ...(initialFilter.startAt.min ? [initialFilter.startAt.min] : []),
              ...(initialFilter.startAt.max ? [initialFilter.startAt.max] : []),
            ]
          : [],
        customFilterListOptions: {
          render: ([min, max]: [string | undefined, string | undefined]) => [
            ...(min
              ? [
                  t('Minimum Due Date {{ minimumDate }}', {
                    minimumDate: dateFormat(DateTime.fromISO(min)),
                  }),
                ]
              : []),
            ...(max
              ? [
                  t('Maximum Due Date {{ maximumDate }}', {
                    maximumDate: dateFormat(DateTime.fromISO(max)),
                  }),
                ]
              : []),
          ],
        },
        filterOptions: {
          display: (filterList, onChange, index, column) => {
            const StartAtFilter = (
              <Box>
                <FormLabel>{t('Due Date')}</FormLabel>
                <Grid container spacing={2}>
                  <Grid xs={6} item>
                    <DatePicker
                      clearable
                      fullWidth
                      labelFunc={(date, invalidLabel) =>
                        date ? dateFormat(date) : invalidLabel
                      }
                      autoOk
                      label={t('Minimum')}
                      value={filterList[index][0] || null}
                      onChange={(date) => {
                        filterList[index][0] = date?.toISO() ?? '';
                        onChange(filterList[index], index, column);
                      }}
                      okLabel={t('OK')}
                      todayLabel={t('Today')}
                      cancelLabel={t('Cancel')}
                      clearLabel={t('Clear')}
                    />
                  </Grid>
                  <Grid xs={6} item>
                    <DatePicker
                      clearable
                      fullWidth
                      labelFunc={(date, invalidLabel) =>
                        date ? dateFormat(date) : invalidLabel
                      }
                      autoOk
                      label={t('Maximum')}
                      value={filterList[index][1] || null}
                      onChange={(date) => {
                        filterList[index][1] = date?.toISO() ?? '';
                        onChange(filterList[index], index, column);
                      }}
                      okLabel={t('OK')}
                      todayLabel={t('Today')}
                      cancelLabel={t('Cancel')}
                      clearLabel={t('Clear')}
                    />
                  </Grid>
                </Grid>
              </Box>
            );

            return StartAtFilter;
          },
          fullWidth: true,
        },
        sort: true,
        customBodyRender: (startAt) => {
          if (startAt) {
            const date = DateTime.fromISO(startAt);
            if (date.hasSame(DateTime.local(), 'year')) {
              return dayMonthFormat(date.day, date.month);
            } else {
              return dateFormat(date);
            }
          } else if (loading) {
            return <Skeleton />;
          }
        },
      },
    },
  ];

  const onSearchChange = useCallback(
    debounce(1000, (wildcardSearch) => {
      setFilter((filter) => {
        return { ...filter, wildcardSearch, after: null, before: null };
      });
    }),
    [],
  );

  const options: MUIDataTableOptions = {
    serverSide: true,
    rowsPerPage,
    onChangeRowsPerPage: (rowsPerPage) => {
      setRowsPerPage(rowsPerPage);
    },
    onChangePage: (newPage) => {
      if (newPage > currentPage) {
        setFilter({
          ...filter,
          before: null,
          after: data?.tasks.pageInfo.endCursor,
        });
      } else {
        setFilter({
          ...filter,
          before: data?.tasks.pageInfo.startCursor,
          after: null,
        });
      }
      setCurrentPage(newPage);
    },
    onRowClick: (_rowData, rowMeta) => {
      openTaskDrawer({
        taskId: data?.tasks.nodes[rowMeta.dataIndex].id,
        filter,
        rowsPerPage,
      });
    },
    count: data?.tasks?.totalCount || 0,
    rowsPerPageOptions: [10, 25, 50, 100, 250, 500],
    fixedHeader: true,
    fixedSelectColumn: true,
    tableBodyMaxHeight: 'calc(100vh - 300px)',
    print: false,
    download: false,
    selectableRows: 'none',
    onFilterChange: (_changedColumn, filterList) => {
      let counter = 0;
      const updatedFilter = reduce(
        (result, value) => {
          const filterIsActive = value.length !== 0;
          const name = columns[counter].name;
          switch (name) {
            case 'completedAt':
              result.completed = filterIsActive ? value[0] === 'true' : null;
              break;
            case 'user':
              result.userIds = filterIsActive ? value : null;
              break;
            case 'tagList':
              result.tags = filterIsActive ? value : null;
              break;
            case 'contacts':
              result.contactIds = filterIsActive ? value : null;
              break;
            case 'startAt':
              if (filterIsActive) {
                if (value[0] && value[1]) {
                  result.startAt = {
                    min: DateTime.fromISO(value[0]).toISO(),
                    max: DateTime.fromISO(value[1]).toISO(),
                  };
                } else if (value[0]) {
                  result.startAt = { min: DateTime.fromISO(value[0]).toISO() };
                } else if (value[1]) {
                  result.startAt = { max: DateTime.fromISO(value[1]).toISO() };
                }
              } else {
                result.startAt = {
                  min: null,
                  max: null,
                };
              }
              break;
            default:
              result[name] = filterIsActive ? value : null;
          }
          counter++;
          return result;
        },
        {
          ...filter,
          after: null,
          before: null,
        } as typeof filter & {
          after: null;
          before: null;
          [key: string]: string[] | null;
        },
        filterList,
      );
      setFilter(updatedFilter);
    },
    onSearchChange,
    searchText: initialFilter?.wildcardSearch ?? undefined,
    textLabels: {
      body: {
        noMatch: (
          <Card className={classes.card}>
            <img src={illustration15} className={classes.img} alt="empty" />
            {t('No tasks to show.')}
          </Card>
        ),
      },
    },
  };

  return (
    <MUIDataTable
      title={loading && <CircularProgress size={24} />}
      data={loading || !data ? [['', <Skeleton key={1} />]] : data?.tasks.nodes}
      columns={columns}
      options={options}
    />
  );
};

export default TaskList;
