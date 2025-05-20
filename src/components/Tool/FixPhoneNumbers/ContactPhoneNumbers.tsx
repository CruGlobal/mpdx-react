import React from 'react';
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
  Tooltip,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { Field, FieldProps } from 'formik';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { isEditableSource, sourceToStr } from 'src/utils/sourceHelper';
import theme from '../../../theme';
import { PhoneNumber } from './Contact';
import { PersonInvalidNumberFragment } from './GetInvalidPhoneNumbers.generated';

const useStyles = makeStyles()(() => ({
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
  paddingB2: {
    paddingBottom: theme.spacing(1),
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
  index: number;
  person: PersonInvalidNumberFragment;
  phoneNumber: PhoneNumber;
  handleChangePrimary: (phoneNumberId: string) => void;
  handleDeleteNumberOpen: (person: {
    personId: string;
    phoneNumber: PhoneNumber;
  }) => void;
  handleSingleConfirm: (
    person: PersonInvalidNumberFragment,
    numbers: PhoneNumber[],
  ) => void;
  errors: any;
}

export const ContactPhoneNumbers: React.FC<Props> = ({
  errors,
  index,
  person,
  phoneNumber,
  handleChangePrimary,
  handleDeleteNumberOpen,
}) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const locale = useLocale();
  const { id: personId } = person;

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
                    onClick={() => handleChangePrimary(phoneNumber.id)}
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
            <Field name={`numbers.${index}.number`}>
              {({ field }: FieldProps) => (
                <TextField
                  {...field}
                  style={{ width: '100%' }}
                  size="small"
                  inputProps={{
                    'data-testid': `textfield-${personId}-${phoneNumber.id}`,
                  }}
                  disabled={!isEditableSource(phoneNumber.source)}
                />
              )}
            </Field>
            <FormHelperText
              error={!!errors?.numbers?.[index]?.number}
              data-testid="statusSelectError"
            >
              {errors?.numbers?.[index]?.number}
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
