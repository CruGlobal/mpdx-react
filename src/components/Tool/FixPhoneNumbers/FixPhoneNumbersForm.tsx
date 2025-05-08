import React, { useEffect } from 'react';
import { mdiDelete, mdiLock } from '@mdi/js';
import { Icon } from '@mdi/react';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import {
  Box,
  FormControl,
  FormHelperText,
  Grid,
  Hidden,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { useFormik } from 'formik';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { isEditableSource, sourceToStr } from 'src/utils/sourceHelper';
import theme from '../../../theme';
import { PhoneNumber } from './Contact';
import { PersonInvalidNumberFragment } from './GetInvalidPhoneNumbers.generated';

const useStyles = makeStyles()((theme: Theme) => ({
  left: {},
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  boxBottom: {
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      paddingTop: theme.spacing(2),
    },
  },
  contactCard: {
    marginBottom: theme.spacing(2),
  },
  buttonTop: {
    marginLeft: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(2),
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    '& .MuiButton-root': {
      backgroundColor: theme.palette.mpdxBlue.main,
      color: 'white',
    },
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
  rowChangeResponsive: {
    flexDirection: 'column',
    [theme.breakpoints.down('xs')]: {
      marginTop: -20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  responsiveBorder: {
    [theme.breakpoints.down('xs')]: {
      paddingBottom: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  paddingX: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  paddingY: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  paddingB2: {
    paddingBottom: theme.spacing(1),
  },
  phoneNumberContainer: {
    width: '100%',
  },
  hoverHighlight: {
    '&:hover': {
      color: theme.palette.mpdxBlue.main,
      cursor: 'pointer',
    },
  },
  ContactIconContainer: {
    margin: theme.spacing(0, 1),
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
}));

interface Props {
  key: string;
  index: number;
  person: PersonInvalidNumberFragment;
  phoneNumber: PhoneNumber;
  handleChangePrimary: (personId: string, index: number) => void;
  handleDeleteNumberOpen: (person: {
    personId: string;
    phoneNumber: PhoneNumber;
  }) => void;
  submitAll: boolean;
  handleSingleConfirm: (
    person: PersonInvalidNumberFragment,
    numbers: PhoneNumber[],
  ) => void;
  numbers: PhoneNumber[];
}

export const FixPhoneNumbersForm: React.FC<Props> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  key,
  index,
  person,
  phoneNumber,
  handleChangePrimary,
  handleDeleteNumberOpen,
  submitAll,
  handleSingleConfirm,
  numbers,
}) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const locale = useLocale();
  const { id: personId } = person;

  const validationSchema = yup.object({
    newPhone: yup
      .string()
      .test(
        'is-phone-number',
        t('This field is not a valid phone number'),
        (val) => typeof val === 'string' && /\d/.test(val),
      )
      .required(t('This field is required')),
  });

  const { values, setFieldValue, handleSubmit, errors } = useFormik({
    initialValues: {
      newPhone: phoneNumber.number,
    },
    validationSchema: validationSchema,

    onSubmit: (values) => {
      numbers[index] = {
        ...phoneNumber,
        number: values.newPhone,
      };

      handleSingleConfirm(person, numbers);
    },
  });

  useEffect(() => {
    if (submitAll) {
      handleSubmit();
    }
  }, [submitAll]);

  return (
    <>
      <Grid
        data-testid="phoneNumbers"
        item
        xs={6}
        sm={4}
        className={classes.paddingB2}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          className={classes.paddingX}
        >
          <Box>
            <Hidden smUp>
              <Typography display="inline" variant="body2" fontWeight="bold">
                {t('Source')}:
              </Typography>
            </Hidden>
            <Typography display="inline" variant="body2">
              {`${sourceToStr(t, phoneNumber.source)} (${dateFormatShort(
                DateTime.fromISO(phoneNumber.updatedAt),
                locale,
              )})`}
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={6} sm={2} className={classes.paddingB2}>
        <Box
          display="flex"
          justifyContent="center"
          className={classes.paddingX}
        >
          <Typography display="flex" alignItems="center">
            {phoneNumber.primary ? (
              <>
                <Hidden smUp>
                  <Typography
                    display="inline"
                    variant="body2"
                    fontWeight="bold"
                  >
                    {t('Source')}:
                  </Typography>
                </Hidden>
                <StarIcon
                  data-testid={`starIcon-${personId}-${phoneNumber.id}`}
                  className={classes.hoverHighlight}
                />
              </>
            ) : (
              <>
                <Hidden smUp>
                  <Typography
                    display="inline"
                    variant="body2"
                    fontWeight="bold"
                  >
                    {t('Source')}:
                  </Typography>
                </Hidden>
                <Tooltip title={t('Set as Primary')} placement="left">
                  <StarOutlineIcon
                    data-testid={`starOutlineIcon-${personId}-${phoneNumber.id}`}
                    className={classes.hoverHighlight}
                    onClick={() => handleChangePrimary(personId, index)}
                  />
                </Tooltip>
              </>
            )}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} className={classes.paddingB2}>
        <Box
          display="flex"
          justifyContent="flex-start"
          className={clsx(classes.responsiveBorder, classes.paddingX)}
        >
          <FormControl fullWidth>
            <TextField
              style={{ width: '100%' }}
              size="small"
              inputProps={{
                'data-testid': `textfield-${personId}-${phoneNumber.id}`,
              }}
              name="newPhone"
              value={values.newPhone}
              onChange={(e) => {
                setFieldValue('newPhone', e.target.value);
              }}
              disabled={!isEditableSource(phoneNumber.source)}
            />
            <FormHelperText error={true} data-testid="statusSelectError">
              {errors.newPhone}
            </FormHelperText>
          </FormControl>
          {isEditableSource(phoneNumber.source) ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <Box
                display="flex"
                alignItems="center"
                data-testid={`delete-${personId}-${phoneNumber.id}`}
                onClick={() =>
                  handleDeleteNumberOpen({
                    personId,
                    phoneNumber,
                  })
                }
                className={classes.ContactIconContainer}
              >
                <Tooltip title={t('Delete Number')} placement="left">
                  <Icon
                    path={mdiDelete}
                    size={1}
                    className={classes.hoverHighlight}
                  />
                </Tooltip>
              </Box>
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center">
              <Box
                display="flex"
                alignItems="center"
                data-testid={`lock-${personId}-${index}`}
                className={classes.paddingX}
              >
                <Icon
                  path={mdiLock}
                  size={1}
                  style={{
                    color: theme.palette.cruGrayMedium.main,
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Grid>
    </>
  );
};
