import React, { ReactElement, useState, useEffect } from 'react';
import {
    makeStyles,
    Theme,
    IconButton,
    Box,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    FormControlLabel,
    Switch,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';
import { Autocomplete } from '@material-ui/lab';
import { DateTimePicker, DatePicker, TimePicker } from '@material-ui/pickers';
import { motion, AnimatePresence } from 'framer-motion';
import { Formik } from 'formik';
import * as yup from 'yup';
import { ActivityTypeEnum } from '../../../../types/globalTypes';
import { dateFormat } from '../../../lib/intlFormat/intlFormat';

const useStyles = makeStyles((theme: Theme) => ({
    formControl: {
        width: '100%',
    },
    container: {
        width: '600px',
    },
    primary: {
        width: '350px',
    },
    drawer: {
        backgroundColor: '#F1F1F1',
        width: '250px',
    },
    select: {
        fontSize: theme.typography.h6.fontSize,
        minHeight: 'auto',
        '&:focus': {
            backgroundColor: 'transparent',
        },
    },
    dialogTitle: {
        display: 'flex',
        height: '69px',
        padding: theme.spacing(0, 3),
        alignItems: 'center',
    },
    drawerDialogTitle: {
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 2),
    },
    dialogContent: {
        borderBottom: 0,
    },
    dialogScrollPaper: {
        alignItems: 'flex-start',
    },
}));

interface Task {
    activityType: '' | ActivityTypeEnum;
    description: string;
    dueDate: Date;
    tags: string[];
}

const taskSchema: yup.ObjectSchema<Task> = yup.object({
    activityType: yup.mixed<ActivityTypeEnum>(),
    description: yup.string(),
    dueDate: yup.date(),
    tags: yup.array(),
});

const TaskDialog = (): ReactElement => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();
    const [notification, setNotification] = useState(false);

    const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setNotification(event.target.checked);
    };

    useEffect(() => {
        setOpen(true);
    }, []);

    const initialTask: Task = {
        activityType: '',
        description: '',
        dueDate: new Date(),
        tags: [],
    };

    return (
        <Box>
            <Dialog
                open={open}
                onClose={(): void => setOpen(false)}
                classes={{ scrollPaper: classes.dialogScrollPaper }}
            >
                <Formik
                    initialValues={initialTask}
                    validationSchema={taskSchema}
                    onSubmit={(values): void => {
                        // same shape as initial values
                        console.log(values);
                    }}
                >
                    {({
                        values: { activityType, description, dueDate, tags },
                        setFieldValue,
                        handleChange,
                    }): ReactElement => (
                        <Grid container className={classes.container}>
                            <Grid item className={classes.primary}>
                                <DialogTitle className={classes.dialogTitle} disableTypography>
                                    <FormControl className={classes.formControl}>
                                        <Select
                                            disableUnderline
                                            displayEmpty
                                            classes={{ select: classes.select }}
                                            value={activityType}
                                            onChange={handleChange('activityType')}
                                        >
                                            <MenuItem value="">{t('Task')}</MenuItem>
                                            {Object.keys(ActivityTypeEnum).map((val) => (
                                                <MenuItem key={val} value={val}>
                                                    {t(val) /* ActivityTypeEnum manually added to translation file */}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </DialogTitle>
                                <DialogContent dividers className={classes.dialogContent}>
                                    <Grid container direction="column" spacing={2}>
                                        <Grid item>
                                            <TextField
                                                label={t('Description')}
                                                value={description}
                                                onChange={handleChange('description')}
                                                fullWidth
                                                multiline
                                            />
                                        </Grid>
                                        <Grid item>
                                            <FormControl className={classes.formControl}>
                                                <Grid container>
                                                    <Grid item>
                                                        <DatePicker
                                                            labelFunc={dateFormat}
                                                            disablePast
                                                            autoOk
                                                            clearable
                                                            label={t('Due Date')}
                                                            value={dueDate}
                                                            onChange={(date): void => setFieldValue('dueDate', date)}
                                                        />
                                                    </Grid>
                                                    <Grid item>
                                                        <TimePicker
                                                            autoOk
                                                            clearable
                                                            label={t('Due Time')}
                                                            value={dueDate}
                                                            onChange={(date): void => setFieldValue('dueDate', date)}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <Autocomplete
                                                multiple
                                                options={[]}
                                                freeSolo
                                                renderTags={(value, getTagProps): ReactElement[] =>
                                                    value.map((option, index) => (
                                                        <Chip
                                                            size="small"
                                                            key={index}
                                                            label={option}
                                                            {...getTagProps({ index })}
                                                        />
                                                    ))
                                                }
                                                renderInput={(params): ReactElement => (
                                                    <TextField {...params} label={t('Tags')} />
                                                )}
                                                onChange={(_, tags): void => setFieldValue('tags', tags)}
                                                value={tags}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={notification}
                                                        onChange={handleNotificationChange}
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
                                                                <TextField label={t('Period')} fullWidth />
                                                            </Grid>
                                                            <Grid xs={5} item>
                                                                <FormControl className={classes.formControl}>
                                                                    <InputLabel id="unit">{t('Unit')}</InputLabel>
                                                                    <Select labelId="unit">
                                                                        <MenuItem value={'MINUTES'}>
                                                                            {t('Minutes Before')}
                                                                        </MenuItem>
                                                                        <MenuItem value={'HOURS'}>
                                                                            {t('Hours Before')}
                                                                        </MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid>
                                                            <Grid xs={4} item>
                                                                <FormControl className={classes.formControl}>
                                                                    <InputLabel id="platform">
                                                                        {t('Platform')}
                                                                    </InputLabel>
                                                                    <Select labelId="platform">
                                                                        <MenuItem value={'BOTH'}>{t('Both')}</MenuItem>
                                                                        <MenuItem value={'EMAIL'}>
                                                                            {t('Email')}
                                                                        </MenuItem>
                                                                        <MenuItem value={'MOBILE'}>
                                                                            {t('Mobile')}
                                                                        </MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid>
                                                        </Grid>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Grid>
                                    </Grid>
                                </DialogContent>
                            </Grid>
                            <Grid item className={classes.drawer}>
                                <DialogTitle
                                    className={[classes.dialogTitle, classes.drawerDialogTitle].join(' ')}
                                    disableTypography
                                >
                                    <IconButton onClick={(): void => setOpen(false)}>
                                        <CloseIcon />
                                    </IconButton>
                                </DialogTitle>
                                <DialogContent dividers className={classes.dialogContent}>
                                    <Grid container direction="column" spacing={2}>
                                        <Grid item>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel id="assignee">{t('Assignee')}</InputLabel>
                                                <Select labelId="assignee">
                                                    {Object.keys(ActivityTypeEnum).map((val) => (
                                                        <MenuItem key={val} value={val}>
                                                            {t(val)}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <Autocomplete
                                                multiple
                                                options={[]}
                                                renderTags={(value: string[], getTagProps): ReactElement[] =>
                                                    value.map((option: string, index: number) => (
                                                        <Chip key={index} label={option} {...getTagProps({ index })} />
                                                    ))
                                                }
                                                renderInput={(params): ReactElement => (
                                                    <TextField {...params} label={t('Contacts')} />
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                </DialogContent>
                            </Grid>
                        </Grid>
                    )}
                </Formik>
            </Dialog>
        </Box>
    );
};

export default TaskDialog;
