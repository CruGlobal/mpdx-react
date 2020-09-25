import React, { ReactElement } from 'react';
import {
    makeStyles,
    Theme,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
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
import { Formik } from 'formik';
import * as yup from 'yup';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { dateFormat } from '../../../../lib/intlFormat/intlFormat';
import { GetDataForTaskDrawerQuery } from '../../../../../types/GetDataForTaskDrawerQuery';
import { GetTaskForTaskDrawerQuery_task as Task } from '../../../../../types/GetTaskForTaskDrawerQuery';
import { GET_DATA_FOR_TASK_DRAWER_QUERY } from '../Form/Form';
import { ResultEnum, ActivityTypeEnum, TaskUpdateInput } from '../../../../../types/globalTypes';
import { CompleteTaskMutation } from '../../../../../types/CompleteTaskMutation';
import { useApp } from '../../../App';

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

export const COMPLETE_TASK_MUTATION = gql`
    mutation CompleteTaskMutation($accountListId: ID!, $attributes: TaskUpdateInput!) {
        updateTask(input: { accountListId: $accountListId, attributes: $attributes }) {
            task {
                id
                result
                nextAction
                tagList
                completedAt
            }
        }
    }
`;

const taskSchema: yup.ObjectSchema<Partial<TaskUpdateInput>> = yup.object({
    id: yup.string(),
    result: yup.mixed<ResultEnum>().required(),
    nextAction: yup.mixed<ActivityTypeEnum>(),
    tagList: yup.array().of(yup.string()),
    completedAt: yup.date(),
});

interface Props {
    accountListId: string;
    task: Task;
    onClose: () => void;
}

const TaskDrawerCompleteForm = ({ accountListId, task, onClose }: Props): ReactElement => {
    const initialTask: TaskUpdateInput = {
        id: task.id,
        completedAt: task.completedAt || new Date(),
        result: ResultEnum.NONE,
        tagList: task.tagList,
    };

    const classes = useStyles();
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const { openTaskDrawer } = useApp();
    const { data } = useQuery<GetDataForTaskDrawerQuery>(GET_DATA_FOR_TASK_DRAWER_QUERY, {
        variables: { accountListId },
    });
    const [updateTask, { loading: saving }] = useMutation<CompleteTaskMutation>(COMPLETE_TASK_MUTATION);
    const onSubmit = async (attributes: TaskUpdateInput): Promise<void> => {
        try {
            await updateTask({ variables: { accountListId, attributes } });
            enqueueSnackbar(t('Task saved successfully'), { variant: 'success' });
            onClose();
            if (attributes.nextAction && attributes.nextAction !== ActivityTypeEnum.NONE) {
                openTaskDrawer({
                    defaultValues: {
                        activityType: attributes.nextAction,
                        contacts: task.contacts,
                        user: task.user,
                    },
                });
            }
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    };

    const availableResults = ((): ResultEnum[] => {
        const common = [ResultEnum.NONE, ResultEnum.COMPLETED];
        switch (task.activityType) {
            case ActivityTypeEnum.CALL:
                return [...common, ResultEnum.ATTEMPTED, ResultEnum.ATTEMPTED_LEFT_MESSAGE, ResultEnum.RECEIVED];
            case ActivityTypeEnum.APPOINTMENT:
                return [...common, ResultEnum.ATTEMPTED];
            case ActivityTypeEnum.EMAIL:
            case ActivityTypeEnum.TEXT_MESSAGE:
            case ActivityTypeEnum.FACEBOOK_MESSAGE:
            case ActivityTypeEnum.TALK_TO_IN_PERSON:
            case ActivityTypeEnum.LETTER:
            case ActivityTypeEnum.PRE_CALL_LETTER:
            case ActivityTypeEnum.REMINDER_LETTER:
            case ActivityTypeEnum.SUPPORT_LETTER:
            case ActivityTypeEnum.THANK:
                return [...common, ResultEnum.RECEIVED];
            case ActivityTypeEnum.PRAYER_REQUEST:
                return common;
            default:
                return [];
        }
    })();

    const availableNextActions = ((): ActivityTypeEnum[] => {
        const common = [
            ActivityTypeEnum.NONE,
            ActivityTypeEnum.CALL,
            ActivityTypeEnum.EMAIL,
            ActivityTypeEnum.TEXT_MESSAGE,
            ActivityTypeEnum.FACEBOOK_MESSAGE,
            ActivityTypeEnum.TALK_TO_IN_PERSON,
        ];
        switch (task.activityType) {
            case ActivityTypeEnum.CALL:
            case ActivityTypeEnum.EMAIL:
            case ActivityTypeEnum.TEXT_MESSAGE:
            case ActivityTypeEnum.FACEBOOK_MESSAGE:
            case ActivityTypeEnum.TALK_TO_IN_PERSON:
            case ActivityTypeEnum.PRAYER_REQUEST:
                return [
                    ...common,
                    ActivityTypeEnum.APPOINTMENT,
                    ActivityTypeEnum.PRAYER_REQUEST,
                    ActivityTypeEnum.THANK,
                ];
            case ActivityTypeEnum.APPOINTMENT:
                return [...common, ActivityTypeEnum.PRAYER_REQUEST, ActivityTypeEnum.THANK];
            case ActivityTypeEnum.LETTER:
            case ActivityTypeEnum.PRE_CALL_LETTER:
            case ActivityTypeEnum.REMINDER_LETTER:
            case ActivityTypeEnum.SUPPORT_LETTER:
            case ActivityTypeEnum.THANK:
                return common;
            default:
                return [];
        }
    })();

    return (
        <Formik initialValues={initialTask} validationSchema={taskSchema} onSubmit={onSubmit}>
            {({
                values: { result, nextAction, completedAt, tagList },
                setFieldValue,
                handleChange,
                handleSubmit,
                isSubmitting,
                isValid,
            }): ReactElement => (
                <form onSubmit={handleSubmit} noValidate>
                    <Box m={2}>
                        <Grid container direction="column" spacing={2}>
                            {task.activityType && (
                                <>
                                    {availableResults.length > 0 && (
                                        <Grid item>
                                            <FormControl className={classes.formControl} required>
                                                <InputLabel id="result">{t('Result')}</InputLabel>
                                                <Select
                                                    labelId="result"
                                                    value={result}
                                                    onChange={handleChange('result')}
                                                >
                                                    {availableResults.map((val) => (
                                                        <MenuItem key={val} value={val}>
                                                            {t(val) /* manually added to translation file */}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    )}
                                    {availableNextActions.length > 0 && (
                                        <Grid item>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel id="nextAction">{t('Next Action')}</InputLabel>
                                                <Select
                                                    labelId="nextAction"
                                                    value={nextAction}
                                                    onChange={handleChange('nextAction')}
                                                >
                                                    {availableNextActions.map((val) => (
                                                        <MenuItem key={val} value={val}>
                                                            {t(val) /* manually added to translation file */}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    )}
                                </>
                            )}
                            <Grid item>
                                <FormControl className={classes.formControl}>
                                    <Grid container spacing={2}>
                                        <Grid xs={6} item>
                                            <DatePicker
                                                fullWidth
                                                labelFunc={dateFormat}
                                                autoOk
                                                label={t('Completed Date')}
                                                value={completedAt}
                                                onChange={(date): void => setFieldValue('completedAt', date)}
                                                okLabel={t('OK')}
                                                todayLabel={t('Today')}
                                                cancelLabel={t('Cancel')}
                                                clearLabel={t('Clear')}
                                            />
                                        </Grid>
                                        <Grid xs={6} item>
                                            <TimePicker
                                                fullWidth
                                                autoOk
                                                label={t('Completed Time')}
                                                value={completedAt}
                                                onChange={(date): void => setFieldValue('completedAt', date)}
                                                okLabel={t('OK')}
                                                todayLabel={t('Today')}
                                                cancelLabel={t('Cancel')}
                                                clearLabel={t('Clear')}
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
                                    {saving && (
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

export default TaskDrawerCompleteForm;
