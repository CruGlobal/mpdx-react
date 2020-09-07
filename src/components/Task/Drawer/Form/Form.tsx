import React, { ReactElement, useState } from 'react';
import {
    makeStyles,
    Theme,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    FormControlLabel,
    Switch,
    Chip,
    Grid,
    Box,
    CircularProgress,
    Button,
    Divider,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Autocomplete } from '@material-ui/lab';
import { DatePicker, TimePicker } from '@material-ui/pickers';
import { motion, AnimatePresence } from 'framer-motion';
import { Formik } from 'formik';
import * as yup from 'yup';
import { gql, useQuery, useMutation } from '@apollo/client';
import { omit, sortBy } from 'lodash/fp';
import { useSnackbar } from 'notistack';
import { startOfHour, addHours } from 'date-fns';
import {
    ActivityTypeEnum,
    NotificationTypeEnum,
    NotificationTimeUnitEnum,
    TaskInput,
} from '../../../../../types/globalTypes';
import { dateFormat } from '../../../../lib/intlFormat/intlFormat';
import {
    GetDataForTaskDrawerQuery,
    GetDataForTaskDrawerQuery_contacts_nodes,
} from '../../../../../types/GetDataForTaskDrawerQuery';
import { GetTaskForTaskDrawerQuery_task as Task } from '../../../../../types/GetTaskForTaskDrawerQuery';
import { CreateTaskMutation } from '../../../../../types/CreateTaskMutation';
import { UpdateTaskMutation } from '../../../../../types/UpdateTaskMutation';

const useStyles = makeStyles((theme: Theme) => ({
    formControl: {
        width: '100%',
    },
    select: {
        fontSize: theme.typography.h6.fontSize,
        minHeight: 'auto',
        '&:focus': {
            backgroundColor: 'transparent',
        },
    },
    container: {
        padding: theme.spacing(2, 2),
    },
    title: {
        flexGrow: 1,
    },
}));

export const GET_DATA_FOR_TASK_DRAWER_QUERY = gql`
    query GetDataForTaskDrawerQuery($accountListId: ID!) {
        accountList(id: $accountListId) {
            id
            taskTagList
        }
        accountListUsers(accountListId: $accountListId) {
            nodes {
                id
                user {
                    id
                    firstName
                    lastName
                }
            }
        }
        contacts(accountListId: $accountListId) {
            nodes {
                id
                name
            }
        }
    }
`;

export const CREATE_TASK_MUTATION = gql`
    mutation CreateTaskMutation($accountListId: ID!, $attributes: TaskInput!) {
        createTask(input: { accountListId: $accountListId, attributes: $attributes }) {
            task {
                id
                activityType
                subject
                startAt
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
                notificationTimeBefore
                notificationType
                notificationTimeUnit
            }
        }
    }
`;

export const UPDATE_TASK_MUTATION = gql`
    mutation UpdateTaskMutation($accountListId: ID!, $attributes: TaskInput!) {
        updateTask(input: { accountListId: $accountListId, attributes: $attributes }) {
            task {
                id
                activityType
                subject
                startAt
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
                notificationTimeBefore
                notificationType
                notificationTimeUnit
            }
        }
    }
`;

const taskSchema: yup.ObjectSchema<Task> = yup.object({
    id: yup.string().nullable(),
    activityType: yup.mixed<ActivityTypeEnum>(),
    subject: yup.string().required(),
    startAt: yup.date(),
    tagList: yup.array().of(yup.string()),
    contacts: yup.object({ nodes: yup.array().of(yup.object({ id: yup.string(), name: yup.string() })) }),
    user: yup.object({ id: yup.string(), firstName: yup.string(), lastName: yup.string() }).nullable(),
    notificationTimeBefore: yup.number().nullable(),
    notificationType: yup.mixed<NotificationTypeEnum>(),
    notificationTimeUnit: yup.mixed<NotificationTimeUnitEnum>(),
});

interface Props {
    accountListId: string;
    task?: Task;
    onClose: () => void;
    onChange: (task: Task) => void;
}

const TaskDrawerForm = ({ accountListId, task, onClose, onChange }: Props): ReactElement => {
    const initialTask: Task = task || {
        id: null,
        activityType: null,
        subject: '',
        startAt: startOfHour(addHours(new Date(), 1)),
        tagList: [],
        contacts: {
            nodes: [],
        },
        user: null,
        notificationTimeBefore: null,
        notificationType: null,
        notificationTimeUnit: null,
    };
    const classes = useStyles();
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [notification, setNotification] = useState(
        initialTask.notificationTimeBefore !== null ||
            initialTask.notificationType !== null ||
            initialTask.notificationTimeUnit !== null,
    );
    const [persisted, setPersisted] = useState(task && true);
    const handleNotificationChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        setFieldValue: (name: string, value: null) => void,
    ): void => {
        setNotification(event.target.checked);

        if (!event.target.checked) {
            setFieldValue('notificationTimeBefore', null);
            setFieldValue('notificationType', null);
            setFieldValue('notificationTimeUnit', null);
        }
    };
    const { data, loading } = useQuery<GetDataForTaskDrawerQuery>(GET_DATA_FOR_TASK_DRAWER_QUERY, {
        variables: { accountListId },
    });
    const [createTask, { loading: creating }] = useMutation<CreateTaskMutation>(CREATE_TASK_MUTATION);
    const [updateTask, { loading: saving }] = useMutation<UpdateTaskMutation>(UPDATE_TASK_MUTATION);
    const onSubmit = async (values: Task): Promise<void> => {
        const attributes: TaskInput = omit(['contacts', 'user', '__typename'], {
            ...values,
            userId: values.user?.id || null,
            contactIds: values.contacts.nodes.map(({ id }) => id),
        });
        try {
            if (persisted) {
                const mutation = await updateTask({ variables: { accountListId, attributes } });
                onChange(mutation.data.updateTask.task);
            } else {
                const mutation = await createTask({ variables: { accountListId, attributes: omit('id', attributes) } });
                onChange(mutation.data.createTask.task);
                setPersisted(true);
            }
            enqueueSnackbar(t('Task saved successfully'), { variant: 'success' });
            onClose();
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    };

    return (
        <Formik initialValues={initialTask} validationSchema={taskSchema} onSubmit={onSubmit}>
            {({
                values: {
                    activityType,
                    subject,
                    startAt,
                    tagList,
                    user,
                    contacts,
                    notificationTimeBefore,
                    notificationType,
                    notificationTimeUnit,
                },
                setFieldValue,
                handleChange,
                handleSubmit,
                isSubmitting,
                isValid,
                errors,
                touched,
            }): ReactElement => (
                <form onSubmit={handleSubmit} noValidate>
                    <Box m={2}>
                        <Grid container direction="column" spacing={2}>
                            <Grid item>
                                <TextField
                                    label={t('Subject')}
                                    value={subject}
                                    onChange={handleChange('subject')}
                                    fullWidth
                                    multiline
                                    inputProps={{ 'aria-label': 'Subject' }}
                                    error={errors.subject && touched.subject}
                                    helperText={errors.subject && touched.subject && t('Field is required')}
                                    required
                                />
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.formControl}>
                                    <InputLabel id="activityType">{t('Type')}</InputLabel>
                                    <Select
                                        labelId="activityType"
                                        value={activityType}
                                        onChange={handleChange('activityType')}
                                    >
                                        <MenuItem value={null}>{t('None')}</MenuItem>
                                        {Object.keys(ActivityTypeEnum).map((val) => (
                                            <MenuItem key={val} value={val}>
                                                {t(val) /* manually added to translation file */}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.formControl}>
                                    <Grid container spacing={2}>
                                        <Grid xs={6} item>
                                            <DatePicker
                                                fullWidth
                                                labelFunc={dateFormat}
                                                autoOk
                                                label={t('Due Date')}
                                                value={startAt}
                                                onChange={(date): void => setFieldValue('startAt', date)}
                                            />
                                        </Grid>
                                        <Grid xs={6} item>
                                            <TimePicker
                                                fullWidth
                                                autoOk
                                                label={t('Due Time')}
                                                value={startAt}
                                                onChange={(date): void => setFieldValue('startAt', date)}
                                            />
                                        </Grid>
                                    </Grid>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    renderTags={(value, getTagProps): ReactElement[] =>
                                        value.map((option, index) => (
                                            <Chip
                                                color="primary"
                                                size="small"
                                                key={index}
                                                label={option}
                                                {...getTagProps({ index })}
                                            />
                                        ))
                                    }
                                    renderInput={(params): ReactElement => <TextField {...params} label={t('Tags')} />}
                                    onChange={(_, tagList): void => setFieldValue('tagList', tagList)}
                                    value={tagList}
                                    options={data?.accountList?.taskTagList || []}
                                />
                            </Grid>
                            <Grid item>
                                <Autocomplete
                                    loading={loading}
                                    options={
                                        (data?.accountListUsers?.nodes &&
                                            data.accountListUsers.nodes.map(({ user }) => user)) ||
                                        []
                                    }
                                    getOptionLabel={({ firstName, lastName }): string => `${firstName} ${lastName}`}
                                    renderInput={(params): ReactElement => (
                                        <TextField
                                            {...params}
                                            label={t('Assignee')}
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {loading && <CircularProgress color="primary" size={20} />}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                    value={user}
                                    onChange={(_, user): void => setFieldValue('user', user)}
                                    getOptionSelected={(option, value): boolean => option.id === value.id}
                                />
                            </Grid>
                            <Grid item>
                                <Autocomplete
                                    multiple
                                    options={(data?.contacts?.nodes && sortBy('name', data.contacts.nodes)) || []}
                                    getOptionLabel={({ name }: GetDataForTaskDrawerQuery_contacts_nodes): string =>
                                        name
                                    }
                                    loading={loading}
                                    renderInput={(params): ReactElement => (
                                        <TextField
                                            {...params}
                                            label={t('Contacts')}
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {loading && <CircularProgress color="primary" size={20} />}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                    value={contacts.nodes}
                                    onChange={(_, contacts): void => setFieldValue('contacts', { nodes: contacts })}
                                    getOptionSelected={(option, value): boolean => option.id === value.id}
                                />
                            </Grid>
                            <Grid item>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notification}
                                            onChange={(event): void => handleNotificationChange(event, setFieldValue)}
                                        />
                                    }
                                    label={t('Notification')}
                                />
                                <AnimatePresence>
                                    {notification && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 64, opacity: 1 }}
                                            exit={{ height: 10, opacity: 0 }}
                                        >
                                            <Grid item container spacing={2}>
                                                <Grid xs={3} item>
                                                    <TextField
                                                        label={t('Period')}
                                                        fullWidth
                                                        value={notificationTimeBefore}
                                                        onChange={handleChange('notificationTimeBefore')}
                                                        inputProps={{ 'aria-label': 'Period', type: 'number' }}
                                                    />
                                                </Grid>
                                                <Grid xs={5} item>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel id="notificationTimeUnit">{t('Unit')}</InputLabel>
                                                        <Select
                                                            labelId="notificationTimeUnit"
                                                            value={notificationTimeUnit}
                                                            onChange={handleChange('notificationTimeUnit')}
                                                        >
                                                            <MenuItem value={null}>{t('None')}</MenuItem>
                                                            {Object.keys(NotificationTimeUnitEnum).map((val) => (
                                                                <MenuItem key={val} value={val}>
                                                                    {t(val) /* manually added to translation file */}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid xs={4} item>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel id="notificationType">{t('Platform')}</InputLabel>
                                                        <Select
                                                            labelId="notificationType"
                                                            value={notificationType}
                                                            onChange={handleChange('notificationType')}
                                                        >
                                                            <MenuItem value={null}>{t('None')}</MenuItem>
                                                            {Object.keys(NotificationTypeEnum).map((val) => (
                                                                <MenuItem key={val} value={val}>
                                                                    {t(val) /* manually added to translation file */}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Grid>
                        </Grid>
                    </Box>
                    <Divider />
                    <Box m={2}>
                        <Grid container spacing={1} justify="flex-end">
                            <Grid item>
                                <Button size="large" disabled={isSubmitting} onClick={onClose}>
                                    {t('Cancel')}
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    size="large"
                                    variant="contained"
                                    color="primary"
                                    disabled={!isValid || isSubmitting}
                                    type="submit"
                                >
                                    {(saving || creating) && (
                                        <>
                                            <CircularProgress color="primary" size={20} />
                                            &nbsp;
                                        </>
                                    )}
                                    {t('Save')}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </form>
            )}
        </Formik>
    );
};

export default TaskDrawerForm;
