import React, { ReactElement, useState, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import MUIDataTable, { MUIDataTableOptions, MUIDataTableColumn } from 'mui-datatables';
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
import { find, reduce } from 'lodash/fp';
import debounce from 'lodash/fp/debounce';
import { Skeleton } from '@material-ui/lab';
import { DatePicker } from '@material-ui/pickers';
import { useApp } from '../../App';
import { GetTasksForTaskListQuery } from '../../../../types/GetTasksForTaskListQuery';
import { dateFormat, dayMonthFormat } from '../../../lib/intlFormat/intlFormat';
import TaskStatus from '../Status';
import { ActivityTypeEnum } from '../../../../types/globalTypes';
import { GET_DATA_FOR_TASK_DRAWER_QUERY } from '../Drawer/Form/Form';
import { GetDataForTaskDrawerQuery } from '../../../../types/GetDataForTaskDrawerQuery';

export const GET_TASKS_FOR_TASK_LIST_QUERY = gql`
    query GetTasksForTaskListQuery(
        $accountListId: ID!
        $first: Int
        $before: String
        $after: String
        $activityType: [ActivityTypeEnum!]
        $contactIds: [ID!]
        $userIds: [ID!]
        $tags: [String!]
        $completed: Boolean
        $wildcardSearch: String
        $startAt: DateTimeRangeInput
    ) {
        tasks(
            accountListId: $accountListId
            first: $first
            before: $before
            after: $after
            activityType: $activityType
            contactIds: $contactIds
            userIds: $userIds
            tags: $tags
            completed: $completed
            wildcardSearch: $wildcardSearch
            startAt: $startAt
        ) {
            nodes {
                id
                activityType
                subject
                startAt
                completedAt
                tagList
                contacts {
                    nodes {
                        id
                        name
                    }
                }
                user {
                    id
                    firstName
                    lastName
                }
            }
            totalCount
            pageInfo {
                startCursor
                endCursor
            }
        }
    }
`;

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

export interface TaskFilter {
    userIds?: string[];
    tags?: string[];
    contactIds?: string[];
    activityType?: string[];
    completed?: boolean;
    wildcardSearch?: string;
    startAt?: { min?: string; max?: string };
    before?: string;
    after?: string;
}

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

    const {
        state: { accountListId },
        openTaskDrawer,
    } = useApp();

    const { data: filterData } = useQuery<GetDataForTaskDrawerQuery>(GET_DATA_FOR_TASK_DRAWER_QUERY, {
        variables: { accountListId },
    });

    const { loading, data } = useQuery<GetTasksForTaskListQuery>(GET_TASKS_FOR_TASK_LIST_QUERY, {
        variables: {
            accountListId,
            first: rowsPerPage,
            ...filter,
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
                filterList: initialFilter?.completed !== undefined && [initialFilter.completed.toString()],
                filterOptions: {
                    names: ['true', 'false'],
                    renderValue: (val): string => (val === 'true' ? t('Complete') : t('Incomplete')),
                    fullWidth: true,
                },
                customFilterListOptions: {
                    render: (val): string => (val === 'true' ? t('Complete') : t('Incomplete')),
                },
                customHeadLabelRender: (): string => '',
                customBodyRender: (completedAt, { rowIndex }): ReactElement => {
                    if (!loading) {
                        const { id, startAt } = data.tasks.nodes[rowIndex];
                        return <TaskStatus taskId={id} startAt={startAt} completedAt={completedAt} />;
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
                filterList: initialFilter?.activityType,
                filterOptions: {
                    names: Object.keys(ActivityTypeEnum).sort(),
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
                filterList: initialFilter?.contactIds,
                customFilterListOptions: {
                    render: (id): string => {
                        if (filterData?.contacts?.nodes) {
                            return find({ id }, filterData.contacts.nodes)?.name;
                        }
                        return t('Loading');
                    },
                },
                filterOptions: {
                    names: filterData?.contacts?.nodes?.map(({ id }) => id) || [],
                    renderValue: (id): string => {
                        if (filterData?.contacts?.nodes) {
                            return find({ id }, filterData.contacts.nodes)?.name;
                        }
                    },
                    fullWidth: true,
                },
                filterType: 'multiselect',
                customBodyRender: (contacts): string =>
                    contacts && contacts.nodes.map(({ name }) => name).join(t('List Separator')),
            },
        },
        {
            name: 'tagList',
            label: t('Tags'),
            options: {
                filter: true,
                sort: true,
                filterList: initialFilter?.tags,
                filterOptions: {
                    names: filterData?.accountList?.taskTagList || [],
                    fullWidth: true,
                },
                filterType: 'multiselect',
                customFilterListOptions: { render: (tag): string => t('Tag {{tag}}', { tag }) },
                customBodyRender: (tagList): ReactElement => {
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
                        return (
                            tagList &&
                            tagList.map((tag) => (
                                <Chip key={tag} size="small" label={tag} color="primary" className={classes.chip} />
                            ))
                        );
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
                filterList: initialFilter?.userIds,
                customFilterListOptions: {
                    render: (id): string => {
                        if (filterData?.accountListUsers?.nodes) {
                            const accountListUser = find({ user: { id } }, filterData.accountListUsers.nodes);
                            return `${accountListUser.user.firstName} ${accountListUser.user.lastName}`;
                        }
                        return t('Loading');
                    },
                },
                filterOptions: {
                    names: filterData?.accountListUsers?.nodes?.map(({ user: { id } }) => id) || [],
                    renderValue: (id): string => {
                        if (filterData?.accountListUsers?.nodes) {
                            const accountListUser = find({ user: { id } }, filterData.accountListUsers.nodes);
                            return `${accountListUser.user.firstName} ${accountListUser.user.lastName}`;
                        }
                    },
                    fullWidth: true,
                },
                filterType: 'multiselect',
                customBodyRender: (user): ReactElement => {
                    if (user) {
                        return (
                            <Tooltip title={`${user.firstName} ${user.lastName}`} placement="left">
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
                filterList:
                    initialFilter?.startAt &&
                    (([
                        initialFilter.startAt.min && new Date(initialFilter.startAt.min),
                        initialFilter.startAt.max && new Date(initialFilter.startAt.max),
                    ] as unknown) as string[]),
                customFilterListOptions: {
                    render: (v) => {
                        const returnable: string[] = [];
                        if (v[0]) {
                            returnable.push(t('Minimum Due Date {{ minimumDate }}', { minimumDate: dateFormat(v[0]) }));
                        }
                        if (v[1]) {
                            returnable.push(t('Maximum Due Date {{ maximumDate }}', { maximumDate: dateFormat(v[1]) }));
                        }
                        return returnable;
                    },
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
                                            labelFunc={dateFormat}
                                            autoOk
                                            label={t('Minimum')}
                                            value={filterList[index][0] || null}
                                            onChange={(date) => {
                                                ((filterList as unknown) as Date[])[index][0] = date;
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
                                            labelFunc={dateFormat}
                                            autoOk
                                            label={t('Maximum')}
                                            value={filterList[index][1] || null}
                                            onChange={(date) => {
                                                ((filterList as unknown) as Date[])[index][1] = date;
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
                customBodyRender: (startAt): string | ReactElement => {
                    if (startAt) {
                        const date = new Date(startAt);
                        if (new Date().getFullYear() == date.getFullYear()) {
                            return dayMonthFormat(date.getDate(), date.getMonth());
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
                setFilter({ ...filter, before: null, after: data.tasks.pageInfo.endCursor });
            } else {
                setFilter({ ...filter, before: data.tasks.pageInfo.startCursor, after: null });
            }
            setCurrentPage(newPage);
        },
        onRowClick: (_rowData, rowMeta) => {
            openTaskDrawer({ taskId: data.tasks.nodes[rowMeta.dataIndex].id });
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
                    if (value.length !== 0) {
                        const name = columns[counter].name;
                        switch (name) {
                            case 'completedAt':
                                result.completed = value[0] === 'true';
                                break;
                            case 'user':
                                result.userIds = value;
                                break;
                            case 'tagList':
                                result.tags = value;
                                break;
                            case 'contacts':
                                result.contactIds = value;
                                break;
                            case 'startAt':
                                if (value[0] && value[1]) {
                                    result.startAt = {
                                        min: value[0].toISOString(),
                                        max: value[1].toISOString(),
                                    };
                                } else if (value[0]) {
                                    result.startAt = { min: value[0].toISOString() };
                                } else if (value[1]) {
                                    result.startAt = { max: value[1].toISOString() };
                                }
                                break;
                            default:
                                result[name] = value;
                        }
                    }
                    counter++;
                    return result;
                },
                {
                    ...filter,
                    after: null,
                    before: null,
                },
                filterList,
            );
            setFilter(updatedFilter);
        },
        onSearchChange,
        searchText: initialFilter?.wildcardSearch,
        textLabels: {
            body: {
                noMatch: (
                    <Card className={classes.card}>
                        <img
                            src={require('../../../images/drawkit/grape/drawkit-grape-pack-illustration-15.svg')}
                            className={classes.img}
                            alt="empty"
                        />
                        {t('No tasks to show.')}
                    </Card>
                ),
            },
        },
    };

    return (
        <MUIDataTable
            title={loading && <CircularProgress size={24} />}
            data={loading ? [['', <Skeleton key={1} />]] : data.tasks.nodes}
            columns={columns}
            options={options}
        />
    );
};

export default TaskList;
